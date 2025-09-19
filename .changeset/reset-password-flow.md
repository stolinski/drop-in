---
"@drop-in/pass": minor
---

feat(pass): add forgot/reset password flow + client API

- Add routes: `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`
- Client: `requestPasswordReset(email)` and `resetPassword(email, token, expire, password)`
- Signup auto-sends verification email (non-blocking); failures do not block
- Gate noisy logs behind `DEBUG`
- Remove unused `postgres` dependency
- Update docs, tests, and build config (exclude tests from tsc; simplify vitest config)

BREAKING: `client.resetPassword` now requires `email` and `expire`.
