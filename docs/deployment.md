# Antdpro6 Deployment Guide

This guide covers the frontend deployment flow for the single-tenant enterprise admin baseline.

Last updated: 2026-06-09

## Runtime Model

Antdpro6 builds to static assets and is served by Nginx.

The Nginx config:

- serves the SPA from `/usr/share/nginx/html`
- rewrites frontend routes to `index.html`
- proxies `/api/*` to `http://nestweb-api:3030`

Because the app is static after build, frontend environment variables are build-time values. Changing them requires rebuilding the image.

## Local Development

Start NestWeb first. Then run:

```bash
pnpm install --frozen-lockfile
pnpm run start:dev
```

The development server uses `MOCK=none` and `UMI_ENV=dev`.

## Docker Deployment

Antdpro6 expects the backend Compose network to exist:

```bash
cd ../NestWeb
docker compose up -d --build api
```

Then start the frontend:

```bash
cd ../Antdpro6
docker compose up -d --build
```

Verify:

```bash
curl -I http://localhost:8000/user/login
curl http://localhost:3030/api/health/ready
```

## Public Access

Expose the frontend port, not the API port, when possible. Browser API traffic should normally go through the frontend Nginx `/api` proxy.

If the API is also public, keep `CORS_ORIGINS` in NestWeb restricted to the frontend origins.

## OpenAPI Regeneration

After NestWeb DTO/controller changes:

```bash
cd ../NestWeb
pnpm run openapi:generate
pnpm run openapi:check

cd ../Antdpro6
pnpm run openapi:nest
pnpm run openapi:nest:check
```

Then run:

```bash
pnpm run tsc
pnpm test -- --runInBand
pnpm run build
```

Do not hand-edit generated files in `src/services/nest-web` unless fixing a temporary generator issue that is documented in the commit.

Do not default to a running environment `/openapi.json`; use the sibling `../NestWeb/docs/openapi/nestweb.openapi.json` contract unless the task explicitly requires validating another schema source.

## E2E Verification

With NestWeb and Antdpro6 deployed:

```bash
E2E_BASE_URL=http://localhost:8000 \
E2E_ADMIN_EMAIL=e2e-admin@example.com \
E2E_ADMIN_PASSWORD=replace-with-test-password \
pnpm run e2e
```

For shared or production-like environments, use a dedicated E2E account instead of the seeded bootstrap account.
