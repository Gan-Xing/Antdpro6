# Antdpro6 Environment Variables

Antdpro6 is a static frontend after build. Most variables are build-time values. Changing them requires rebuilding the app.

## Build And Development

| Variable             | Purpose                    | Notes                               |
| -------------------- | -------------------------- | ----------------------------------- |
| `REACT_APP_ENV`      | Selects proxy/env branch   | Common values: `dev`, `test`, `pre` |
| `UMI_ENV`            | Umi environment selector   | `dev` for local development         |
| `MOCK`               | Mock switch                | Use `none` for real NestWeb API     |
| `OPENAPI_SCHEMA_URL` | NestWeb OpenAPI schema URL | Used by `pnpm run openapi:nest`     |
| `ANALYZE`            | Bundle analysis switch     | Used by `pnpm run analyze`          |

## API Access

Production Docker serves the app through Nginx and proxies:

```text
/api/* -> http://nestweb-api:3030
```

The browser should call relative `/api` paths. CORS is mainly needed when the frontend and backend are accessed through different origins during development or direct API testing.

## Optional Crypto Helper

| Variable    | Purpose                               |
| ----------- | ------------------------------------- |
| `SecretKey` | Optional legacy client encryption key |
| `SecretIV`  | Optional legacy client encryption IV  |

Do not put durable production secrets in frontend build variables. Anything compiled into the frontend can be read by users.

## Playwright E2E

| Variable | Purpose | CI behavior |
| --- | --- | --- |
| `E2E_BASE_URL` | Frontend URL under test | Required for CI E2E to run |
| `E2E_ADMIN_EMAIL` | Admin test account email | Required unless default admin is explicitly allowed |
| `E2E_ADMIN_PASSWORD` | Admin test account password | Required unless default admin is explicitly allowed |
| `E2E_ALLOW_DEFAULT_ADMIN` | Allows `admin@example.com / admin123` | Local default, CI must set `true` explicitly |

In GitHub Actions, configure:

- repository variable `E2E_BASE_URL`
- repository secrets `E2E_ADMIN_EMAIL`
- repository secrets `E2E_ADMIN_PASSWORD`

If these values are missing, the E2E workflow skips safely instead of failing unrelated PRs.
