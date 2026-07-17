# Flashtools — Launch & Marketing Playbook

Working funnel metric: `curl https://flashtools.app/api/stats` → watch `view → file → download`.

## 1. Search engines (do first, ~15 min)

**Google Search Console**
1. https://search.google.com/search-console → Add property → **Domain** → `flashtools.app`
2. Google gives you a TXT record → add it in Cloudflare DNS (flashtools.app zone) → Verify
3. Sitemaps → submit `https://flashtools.app/sitemap.xml`
4. URL Inspection → paste `https://flashtools.app/` → **Request Indexing**

**Bing Webmaster Tools**
1. https://www.bing.com/webmasters → Sign in → **Import from Google Search Console** (one click, inherits verification + sitemap)

**Cloudflare hygiene**
- Rules → Redirect Rules → add `www.flashtools.app/*` → `301` → `https://flashtools.app/$1`
  (consolidates SEO signals onto the apex; the canonical tag already points there)

## 2. Launch venues (highest leverage first)

### Show HN (Hacker News)
Best time: weekday morning US Eastern. One shot — don't repost for weeks if it flops.

> **Title:** Show HN: Flashtools – PNG to WebP converter that never uploads your files
>
> **URL:** https://flashtools.app
>
> **First comment (post immediately after submitting):**
> I built this because every "free online converter" quietly uploads your
> images to someone's server. Flashtools does the entire PNG→WebP encode
> in the browser with the Canvas API — you can disconnect from the
> internet after the page loads and it still works.
>
> Stack: Astro static site, zero JS frameworks, self-hosted fonts, no
> third-party requests at all. Runs on my homelab k3s cluster behind a
> Cloudflare tunnel, deployed via GitHub Actions → Docker Hub → ArgoCD.
> The only analytics is a 100-line first-party counter (view/convert/
> download, no cookies, no IPs, honors DNT).
>
> Happy to answer questions about the Canvas WebP encoding quirks
> (Safari still can't do it) or the GitOps setup.

### Product Hunt
Schedule for 12:01 AM PT, Tuesday–Thursday.

> **Name:** Flashtools
> **Tagline:** Convert PNG to WebP — 100% in your browser, zero uploads
> **Description:** Drag & drop (or paste) a PNG, tune the quality with a
> live before/after slider, download the WebP. Everything runs client-side
> via the Canvas API — your files never touch a server. Free, no sign-up,
> no watermarks, no tracking.
> **First comment:** the Show HN comment above works here too, slightly warmed up.

### Reddit
- r/SideProject, r/webdev (check each sub's self-promo rules; webdev has Showoff Saturdays)

> **Title:** I made a PNG→WebP converter that works entirely in your browser — files never leave your device
>
> **Body:** Got tired of "free converters" that upload your screenshots to
> who-knows-where. Flashtools does the whole encode client-side with the
> Canvas API — disconnect after page load and it still works. Live quality
> slider with a before/after comparison. Free, no signup, no ads, no
> tracking (the privacy policy is honest about the three anonymous
> counters I keep). Feedback very welcome — especially on the industrial
> yellow/black design, it's a deliberate departure from the usual
> dark-SaaS-with-purple-gradients look.

### X / Twitter / Bluesky

> Every "free PNG converter" uploads your files to a server. Mine doesn't.
>
> ⚡ flashtools.app — PNG→WebP entirely in your browser. Canvas API, zero
> uploads, works offline after load. Free, no signup.

### Listings (slow burn, free backlinks)
- AlternativeTo — list as alternative to CloudConvert, Convertio, Squoosh
- dev.to / Hashnode — write the build story: "Shipping a zero-upload image converter on a homelab k3s cluster"
- GitHub — make the repo public later? A public repo + "self-hostable" angle is a strong HN/dev audience hook (decide: it currently contains the k8s manifests, which is fine — secrets are not in the repo)

## 3. SEO content roadmap (after launch)
- The FAQ section targets long-tail queries ("does webp support transparency", "how much smaller is webp")
- Future pages if traffic justifies: /webp-vs-png (comparison article), /batch (batch conversion feature + page), JPG→WebP support (new tool page = new keyword surface)
- Watch Search Console → Performance for actual queries; write content matching them

## 4. What NOT to do
- Don't buy backlinks or spam directories — one HN/PH launch outperforms 100 junk listings
- Don't add third-party analytics for "better data" — the zero-tracking claim IS the marketing differentiator
- Don't launch on all channels the same day — space them out to stretch the traffic and iterate on feedback between launches
