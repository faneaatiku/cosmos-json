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
```

### Nginx vhost

```nginx
server {
    listen 80;
    server_name json.example.com;

    root /var/www/cosmos-json/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(?:js|css|woff2?|svg|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html application/javascript text/css application/json image/svg+xml;
}
```

### Caddy

```
json.example.com {
    root * /var/www/cosmos-json/dist
    try_files {path} /index.html
    file_server
}
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
