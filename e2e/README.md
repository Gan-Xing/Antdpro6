# Playwright E2E

This suite verifies the production-facing auth and dashboard flow against a running Antdpro6 + NestWeb environment.

## Local Run

```bash
E2E_BASE_URL=http://127.0.0.1:8000 \
E2E_ADMIN_EMAIL=e2e-admin@example.com \
E2E_ADMIN_PASSWORD=replace-with-test-password \
pnpm run e2e
```

E2E always requires an explicit test account. Do not rely on the bootstrap admin defaults.

## Environment

- `E2E_BASE_URL`: frontend base URL, default `http://127.0.0.1:8000`.
- `E2E_ADMIN_EMAIL`: admin test account email.
- `E2E_ADMIN_PASSWORD`: admin test account password.

## GitHub Actions

`.github/workflows/e2e.yml` runs on:

- `workflow_dispatch`
- `push` to `main`
- `pull_request` to `main`

The workflow skips safely when `E2E_BASE_URL` or credentials are missing. To run against a deployed environment, configure:

- repository variable `E2E_BASE_URL`
- repository secrets `E2E_ADMIN_EMAIL`
- repository secrets `E2E_ADMIN_PASSWORD`

Use a dedicated non-production admin test account for E2E.

## Coverage

- Login page loads with enterprise branding.
- Invalid credentials stay on the login page and show a failure message.
- Admin can log in and land on `/dashboard`.
- Dynamic menus are loaded.
- Page refresh keeps the session.
- Expired access token refreshes through the refresh token.
- Logout returns to `/user/login`.
- Accessing a protected page after logout redirects to `/user/login`.
- Dashboard, system status, system version, system queues, and login logs pages load for an admin.
- Message center and approval request pages load for an admin.
- A restricted user cannot see unauthorized operations menus and receives the 403 result when visiting those routes directly.
