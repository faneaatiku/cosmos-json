# Deploy

## Requirements

- Node >= 20.19 or >= 22.12 (Vite 7)

## Build

```sh
npm ci
npm run build
```

Output goes to `dist/`. It's a static SPA — no server runtime needed.

## Serve

Point any static file server at `dist/` and serve `index.html` as the fallback for all routes.

Examples:

```sh
# Node (preview)
npm run preview

# nginx
# root /path/to/dist;
# try_files $uri $uri/ /index.html;

# caddy
# root * /path/to/dist
# try_files {path} /index.html
# file_server
```

## Dev

```sh
npm run dev
```

Runs on port **5173** by default.

## Notes

- App expects to be served at `/`. For a subdirectory, set `base` in `vite.config.ts`.
- All state is client-side (localStorage). No backend or database.
- Assets are hash-busted by Vite — safe to cache aggressively.
