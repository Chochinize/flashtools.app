// Flashtools first-party analytics: anonymous event counters.
// Zero dependencies. Stores newline-delimited JSON on a PVC.
// By design: no cookies, no IP addresses, no user agents, no identifiers.
import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = process.env.PORT || 5100;
const DATA_DIR = process.env.DATA_DIR || '/data';
const EVENTS_FILE = join(DATA_DIR, 'events.ndjson');

const ALLOWED_EVENTS = new Set(['view', 'file', 'download']);
const MAX_BODY = 512;

// Transient in-memory rate limit. Keys are salted SHA-256 hashes of the client
// address — the readable address never enters the map, and the salt is ephemeral
// (regenerated on every process start, never persisted), so keys cannot be
// correlated across restarts or reversed to an address.
const RATE_SALT = randomBytes(32);
const buckets = new Map();
const RATE_LIMIT = 60; // events per minute per client

function clientKey(req) {
	const addr = String(req.headers['cf-connecting-ip'] || req.socket.remoteAddress || 'unknown');
	return createHash('sha256').update(RATE_SALT).update(addr).digest('base64');
}
function rateLimited(key) {
	const now = Date.now();
	const bucket = buckets.get(key);
	if (!bucket || now - bucket.start > 60_000) {
		buckets.set(key, { start: now, count: 1 });
		return false;
	}
	bucket.count += 1;
	return bucket.count > RATE_LIMIT;
}
setInterval(() => {
	const now = Date.now();
	for (const [k, b] of buckets) if (now - b.start > 120_000) buckets.delete(k);
}, 60_000).unref();

async function handleEvent(req, res) {
	let body = '';
	let size = 0;
	for await (const chunk of req) {
		size += chunk.length;
		if (size > MAX_BODY) {
			res.writeHead(413).end();
			return;
		}
		body += chunk;
	}

	let parsed;
	try {
		parsed = JSON.parse(body);
	} catch {
		res.writeHead(400).end();
		return;
	}

	const event = String(parsed.e || '');
	const variant = String(parsed.v || 'default').slice(0, 16).replace(/[^a-z0-9-]/gi, '');
	if (!ALLOWED_EVENTS.has(event)) {
		res.writeHead(400).end();
		return;
	}

	if (rateLimited(clientKey(req))) {
		res.writeHead(429).end();
		return;
	}

	// Timestamp truncated to the hour: enough for trends, useless for tracking
	const t = new Date().toISOString().slice(0, 13);
	await appendFile(EVENTS_FILE, JSON.stringify({ t, e: event, v: variant }) + '\n');
	res.writeHead(204).end();
}

async function handleStats(res) {
	let lines = [];
	try {
		lines = (await readFile(EVENTS_FILE, 'utf8')).split('\n').filter(Boolean);
	} catch {
		// no events yet
	}

	const byDay = {};
	const totals = {};
	for (const line of lines) {
		try {
			const { t, e, v } = JSON.parse(line);
			const day = t.slice(0, 10);
			byDay[day] ??= {};
			byDay[day][v] ??= {};
			byDay[day][v][e] = (byDay[day][v][e] || 0) + 1;
			totals[v] ??= {};
			totals[v][e] = (totals[v][e] || 0) + 1;
		} catch {
			// skip malformed line
		}
	}

	res.writeHead(200, { 'content-type': 'application/json' });
	res.end(JSON.stringify({ totals, byDay }, null, 2));
}

const server = createServer(async (req, res) => {
	try {
		if (req.method === 'POST' && req.url === '/api/e') return await handleEvent(req, res);
		if (req.method === 'GET' && req.url === '/api/stats') return await handleStats(res);
		if (req.method === 'GET' && req.url === '/healthz') return res.writeHead(200).end('ok');
		res.writeHead(404).end();
	} catch (err) {
		console.error(err);
		res.writeHead(500).end();
	}
});

await mkdir(DATA_DIR, { recursive: true });
server.listen(PORT, () => console.log(`analytics listening on :${PORT}, data at ${EVENTS_FILE}`));
