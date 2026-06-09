# Antdpro6

Antdpro6 is the frontend for the TS full-stack enterprise admin baseline. It is paired with the `NestWeb` backend.

The current target is a single-tenant enterprise admin template with:

- productized dashboard and layout
- NestWeb OpenAPI-generated client
- dynamic backend menus
- RBAC-aware pages for users, roles, permissions, and menus
- centralized session refresh
- Playwright E2E coverage for auth, session refresh, operations pages, and restricted access

## Documentation

- [Frontend deployment](docs/deployment.md)
- [Frontend environment variables](docs/env-vars.md)
- [Playwright E2E](e2e/README.md)

Backend handoff and system-level docs live in the `NestWeb` repository. Use the NestWeb v2 handoff, page inventory, permission inventory, operations runbook, and release checklist for delivery acceptance.

## Common Commands

```bash
pnpm install
pnpm run tsc
pnpm run lint:js
pnpm test -- --runInBand
pnpm run build
pnpm run e2e
```

## Local Development

Start NestWeb first, then run:

```bash
pnpm run start:dev
```

The local dev server uses `MOCK=none` and proxies API requests according to `config/proxy.ts`.

## Docker Deployment

```bash
docker compose up -d --build
```

The frontend listens on `http://localhost:8000` and proxies `/api/*` to the `nestweb-api` service on the shared `nestweb_default` Docker network.

## OpenAPI Client

Regenerate the NestWeb client after backend API contract changes. Generate the schema from the sibling `NestWeb` source tree first, then run the frontend generator:

```bash
(cd ../NestWeb && pnpm run openapi:generate)
pnpm run openapi:nest
```

By default, `pnpm run openapi:nest` reads `../NestWeb/docs/openapi/nestweb.openapi.json`. Override `OPENAPI_SCHEMA_URL` only when you intentionally want to test another schema source. Review generated files under `src/services/nest-web` before committing.
