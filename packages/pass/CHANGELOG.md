# @drop-in/pass

## 0.5.0

### Minor Changes

- Improve session stability by invoking the full auth/refresh flow in the session handle and extend default token lifetimes.

  - Fix: `create_session_handle(db)` now uses the full authentication flow (via `authenticate_user`) so SSR requests seamlessly refresh tokens and populate `event.locals.user`. This prevents users from appearing “logged out” when the access token expires.
  - Change: Increase default lifetimes to prioritize “stay signed in” behavior while keeping HttpOnly security and refresh rotation:
    - Access token JWT cookie: 90 days (was 15 minutes)
    - Refresh token cookie: 90 days (was 30 days)
  - Docs: Update README and SECURITY-UPGRADE to reflect the new defaults and clarify handle order and credentials requirements.

  Notes:

  - Keep `create_session_handle(db)` before `create_pass_routes(db)` in `sequence(...)`.
  - Ensure client requests include `credentials: 'include'` and that production uses HTTPS for secure cookies.

## 0.4.1

### Patch Changes

- Fix sourcemap warnings by embedding sources in maps and publishing `src/` so debuggers can resolve original TypeScript in production.

## 0.4.0

### Minor Changes

- 933cef1: Adopt DI-only server helper signatures and update docs/examples.

  - Server helpers now require a `db` parameter (e.g., `authenticate_user(db, cookies)`, `populate_user_session(db, event)`).
  - Prefer factory-based integration via `create_session_handle(db)` and `create_pass_routes(db)`.
  - Documentation updated across README, LOCALS-SETUP-GUIDE, and SECURITY-UPGRADE.

  This clarifies and standardizes dependency injection usage across the package.

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
