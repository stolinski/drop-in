# @drop-in/pass

## Unreleased

### Breaking Changes

- Server helpers now require a `db` parameter. Update usages to `authenticate_user(db, cookies)`, `populate_user_session(db, event)`, and similar helpers.
  - This aligns with DI-only design via `create_session_handle(db)` and `create_pass_routes(db)`.

### Docs

- Clarify DI-only database usage; all server APIs require injecting your Drizzle instance via `create_session_handle(db)` and `create_pass_routes(db)`.
- Update README, LOCALS-SETUP-GUIDE, and SECURITY-UPGRADE to use factory names consistently.

### Internal

- Remove unused global DB proxy pattern from docs and comments; DI-only design confirmed across codebase.

## 0.3.0

### Minor Changes

- 44d0db6: feat(pass): add forgot/reset password flow + client API

  - Add routes: `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`
  - Client: `requestPasswordReset(email)` and `resetPassword(email, token, expire, password)`
  - Signup auto-sends verification email (non-blocking); failures do not block
  - Gate noisy logs behind `DEBUG`
  - Remove unused `postgres` dependency
  - Update docs, tests, and build config (exclude tests from tsc; simplify vitest config)

  BREAKING: `client.resetPassword` now requires `email` and `expire`.

## 0.1.2

### Patch Changes

- Include JWT in login and signup response JSON for client-side access

## 0.1.1

### Patch Changes

- Fix workspace dependency reference to use published version of @drop-in/beeper

## 0.1.0

### Minor Changes

- Add comprehensive testing suite and complete documentation

## 0.0.36

### Patch Changes

- 9ea23b5: Fixes early logout issues
