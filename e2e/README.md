# Playwright E2E

This suite verifies the production-facing auth and dashboard flow against a running Antdpro6 + NestWeb environment.

## Local Run

```bash
E2E_BASE_URL=http://127.0.0.1:8000 pnpm run e2e
```

Local runs may use the seeded admin account by default. CI requires explicit secrets unless `E2E_ALLOW_DEFAULT_ADMIN=true` is set.

## Environment

- `E2E_BASE_URL`: frontend base URL, default `http://127.0.0.1:8000`.
- `E2E_ADMIN_EMAIL`: admin test account email.
- `E2E_ADMIN_PASSWORD`: admin test account password.
- `E2E_ALLOW_DEFAULT_ADMIN`: set to `true` to allow `admin@example.com / admin123`.

## GitHub Actions

`.github/workflows/e2e.yml` runs on:

- `workflow_dispatch`
- `push` to `main`
- `pull_request` to `main`

The workflow skips safely when `E2E_BASE_URL` or credentials are missing. To run against a deployed environment, configure:

- repository variable `E2E_BASE_URL`
- repository secrets `E2E_ADMIN_EMAIL`
- repository secrets `E2E_ADMIN_PASSWORD`

Only set `E2E_ALLOW_DEFAULT_ADMIN=true` for seeded non-production environments.

## Coverage

- Login page loads with enterprise branding.
- Admin can log in and land on `/dashboard`.
- Dynamic menus are loaded.
- Page refresh keeps the session.
- Expired access token refreshes through the refresh token.
- Logout returns to `/user/login`.
