# Playwright E2E

This suite verifies the production-facing auth and dashboard flow against a running Antdpro6 + NestWeb environment.

Last updated: 2026-06-09

## Local Run

```bash
E2E_BASE_URL=http://127.0.0.1:8000 \
E2E_ADMIN_EMAIL=e2e-admin@example.com \
E2E_ADMIN_PASSWORD=replace-with-test-password \
pnpm run e2e
```

E2E always requires an explicit test account. Do not rely on the bootstrap admin defaults. The suite runs with one worker because it targets a shared backend, shared admin account, auth rate limits, and mutable message / approval state.

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
- Expired access token refreshes through the HttpOnly refresh cookie.
- Logout returns to `/user/login`.
- Accessing a protected page after logout redirects to `/user/login`.
- Dashboard, system status, system version, system queues, and login logs pages load for an admin.
- Message center and approval request pages load for an admin.
- S8/S9 acceptance creates an approval request, verifies the generated approval todo, completes a todo, approves the request, marks notifications read, marks all notifications read, and checks message/approval CSV exports.
- Message center tabs for todos, notifications, and processed items load.
- Empty table export gives a clear no-data warning.
- Message center and approval pages redirect to login after logout.
- A restricted user cannot see unauthorized operations menus and receives the 403 result when visiting those routes directly.
