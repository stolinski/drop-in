---
"@drop-in/pass": minor
---

Adopt DI-only server helper signatures and update docs/examples.

- Server helpers now require a `db` parameter (e.g., `authenticate_user(db, cookies)`, `populate_user_session(db, event)`).
- Prefer factory-based integration via `create_session_handle(db)` and `create_pass_routes(db)`.
- Documentation updated across README, LOCALS-SETUP-GUIDE, and SECURITY-UPGRADE.

This clarifies and standardizes dependency injection usage across the package.
