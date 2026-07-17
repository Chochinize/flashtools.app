# ⚡ Flashtools — flashtools.app

Free, privacy-first **PNG → WebP converter** that runs entirely in the browser. Images are drawn onto an HTML5 Canvas and re-encoded to WebP client-side — no uploads, no servers, no tracking.

Built with [Astro](https://astro.build) as a fully static site. No UI frameworks, no backend.

## Features

- Drag & drop, file browser, or **clipboard paste** a PNG
- Adjustable WebP quality (10–100%) with live re-compression
- Interactive before/after comparison slider
- File size stats, savings badge, and conversion timing
- 100% client-side — files never leave the device
- First-party anonymous analytics (`analytics/` service): three event counters
  (view / file / download) with a variant field for future A/B tests — no cookies,
  no IPs, honors Do Not Track; aggregates at `/api/stats`

## Development

```sh
npm install
npm run dev        # dev server at localhost:4321
npm run build      # static build to ./dist/
npm run preview    # preview the production build
```

## Project structure

```text
src/
├── layouts/Layout.astro          # SEO meta, OG/Twitter tags, global theme
├── pages/
│   ├── index.astro               # main converter page (+ JSON-LD schema)
│   ├── privacy.astro             # privacy policy
│   └── terms.astro               # terms of service
└── components/
    ├── Header.astro              # logo + trust badges
    ├── DropZone.astro            # file input (drop / browse / paste)
    ├── ImageConverter.astro      # workspace UI + Canvas WebP encoding
    └── CompareSlider.astro       # before/after clip-path slider
base/                             # Kubernetes manifests (kustomize, synced by ArgoCD)
```

Components communicate via document-level custom events: `png-file-selected`, `image-converted`, `image-cleared`.

## Deployment

GitOps pipeline, same as the other homelab apps:

1. **Push to `main`** → GitHub Actions builds the Docker image (Astro build → nginx)
2. Image is pushed to Docker Hub as `chochinize/flashtools:<git-sha>`
3. The workflow commits the new tag into `base/kustomization.yaml`
4. **ArgoCD** (watching `base/`) syncs the change to the k3s cluster
5. Ingress: nginx + cert-manager (`letsencrypt-dns01`) serving `flashtools.app`

One-time setup:

```sh
# register the app with ArgoCD
kubectl apply -f argo-app.yaml
```

Required GitHub repo secrets: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`.

### Local container build

```sh
docker build -t chochinize/flashtools:dev .
docker run --rm -p 8080:80 chochinize/flashtools:dev
```

## Self-hosting

The whole app is a static site plus an optional ~150-line analytics counter —
`docker build` this repo and serve it anywhere (nginx config included), or reuse
the `base/` kustomize manifests on your own cluster. No external services required.

## License

[MIT](LICENSE) — do what you like; keep the notice.
