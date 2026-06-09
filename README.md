# Antdpro6

Antdpro6 is the frontend for the TS full-stack enterprise admin baseline. It is paired with the `NestWeb` backend.

Last updated: 2026-06-09

The current target is a single-tenant enterprise admin template with:

- productized dashboard and layout
- NestWeb OpenAPI-generated client
- dynamic backend menus
- RBAC-aware pages for users, roles, permissions, and menus
- centralized session refresh
- HttpOnly-cookie refresh token flow with access-token-only client storage
- message center, approval lite, and current-page CSV exports
- Playwright E2E coverage for auth, session refresh, operations pages, S8/S9 workflows, current-page export, and restricted access

## Documentation

- [Frontend deployment](docs/deployment.md)
- [Frontend environment variables](docs/env-vars.md)
- [Internationalization](docs/i18n.md)
- [Playwright E2E](e2e/README.md)

Backend handoff and system-level docs live in the `NestWeb` repository. Use the NestWeb v2 handoff, page inventory, permission inventory, operations runbook, and release checklist for delivery acceptance.

S9 secondary-development docs also live in `NestWeb/docs/development`:

- business module guide
- message center integration
- Approval Lite integration
- table export guide
- OpenAPI workflow
- E2E guide
- demo script

## Common Commands

```bash
pnpm install
pnpm run tsc
pnpm run lint:js
pnpm run i18n:check
pnpm run openapi:nest:check
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

CI runs `pnpm run openapi:nest:check` to regenerate the client and fail if `src/services/nest-web` has uncommitted drift.

## Delivery Boundaries

- S4 knowledge base and S6 AI assistant remain paused.
- Approval Lite is single-step approval support, not BPMN or a complex workflow engine.
- Table export is current-page CSV export. Full asynchronous export is a future backend feature.
- Department, Position, Tenant, import, announcements, and concrete business pages are not part of the current frontend delivery.
