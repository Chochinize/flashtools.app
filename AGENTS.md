# Flashtools — flashtools.app

Free client-side PNG→WebP converter, live at https://flashtools.app.
Astro static site, zero JS frameworks — conversion happens in the browser via the
Canvas API (`canvas.toBlob('image/webp', quality)`). Nothing is ever uploaded.

> **Note:** private operational documentation (infrastructure maps, secrets
> inventories, runbooks, credentials metadata) must NOT be committed to this
> repository — it is public. Keep such material outside the repo.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.
`npm run build` → static site in `dist/`. No test suite — verify with a build plus a manual check.

## Architecture

- `src/pages/`: `index.astro` (converter + FAQ + JSON-LD), `privacy.astro`, `terms.astro`,
  `stats.astro` (live analytics dashboard, noindex)
- `src/components/`: `Header`, `DropZone` (file input: drop/browse/paste),
  `ImageConverter` (core conversion logic + workspace UI), `CompareSlider` (before/after)
- Components communicate via document-level CustomEvents:
  `png-file-selected`, `image-converted`, `image-cleared`
- `analytics/server.js`: zero-dependency Node event counter (`view`/`file`/`download`
  + a `variant` field reserved for A/B tests), served under `/api` on the same domain
- Fonts are self-hosted (`@fontsource/space-grotesk`). The site makes **zero third-party
  requests** — this is the core brand promise and is stated in the privacy policy.
  Never add external scripts, fonts, CDNs, or trackers.

## Brand: "High Voltage"

Electric yellow `#ffd400` on warm near-black `#0a0a08`; danger orange `#ff3d00` used
sparingly; ink `#f5f2e9`; Space Grotesk + system mono for numbers; **sharp corners**
(no border-radius except the spinner), 2px borders, hazard-stripe accents
(`--hazard-stripes` CSS var), blueprint-grid backdrop. Chart series colors in
`stats.astro` are separate darker steps (gold/blue/orange) validated for
colorblind-safety on the dark surface — do not swap them for the raw brand palette.

## Deployment (GitOps — never deploy manually)

Push to `main` → GitHub Actions builds the site and analytics container images and
pushes them to the registry → the workflow commits the image SHA into
`base/kustomization.yaml` with `[skip ci]` → the cluster's GitOps controller
auto-syncs the `base/` manifests.

- **Always `git pull --rebase` before pushing** — CI's tag-bump commit races you.
- Verify production through the live site (`/api/stats`, homepage), not local tooling.

## Documentation

Full Astro documentation: https://docs.astro.build
