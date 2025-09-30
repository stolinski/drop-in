# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@drop-in/pass` is a secure, runtime-agnostic authentication library for SvelteKit applications. It provides HttpOnly JWT cookies, refresh token rotation, and comprehensive session management.

**Key Features:**
- JWT-based authentication with HttpOnly cookies
- Automatic token refresh with refresh token rotation
- Email verification workflow
- Password reset functionality
- Runtime agnostic (Node.js, Cloudflare Workers, Deno, Bun)
- Database dependency injection via Drizzle ORM

## Development Commands

### Testing
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
```

### Building
```bash
npm run build         # Compile TypeScript to dist/
npm run dev           # Watch mode compilation
npm run package       # Alias for build
```

### Publishing
```bash
npm run prepublish    # Automatically runs tsc before publishing
```

## Architecture

### Dependency Injection Pattern

**Critical:** The library uses dependency injection for database instances. The database is NEVER imported or instantiated internally. Instead:

1. Consumers create their own Drizzle instance
2. Drizzle instances are passed to factory functions:
   - `create_session_handle(db)` - Populates `event.locals.user`
   - `create_pass_routes(db)` - Handles auth routes (`/api/auth/*`)
3. Factory functions return SvelteKit `Handle` functions that close over the `db` instance

This pattern enables runtime-agnostic operation since consumers control how/where Drizzle is instantiated.

### Module Organization

#### Entry Points (package.json exports)
- `.` (main) - Server-side auth functions and factories
- `./client` - Client-side auth API (`pass.login`, `pass.signup`, etc.)
- `./schema` - Drizzle schema definitions (user, refresh_tokens tables)
- `./routes` - Route handlers (exported via main, but available separately)

#### Core Authentication Flow

**Token System:**
1. **JWT (access token)** - Long-lived (90 days), HttpOnly, contains user_id in `sub` claim
2. **Refresh token** - Long-lived (90 days), HttpOnly, stored in database with SHA-256 hash
3. **Token format:** `{token_id}:{token_secret}` where token_id is nanoid, secret is random bytes

**Authentication Priority (src/authenticate.ts):**
1. Verify JWT access token first
2. If JWT invalid/expired, verify refresh token
3. If refresh valid, rotate refresh token and issue new JWT
4. Update cookies with new tokens automatically

**Session Population (src/session.ts):**
- `create_session_handle(db)` runs authentication flow on every request
- Populates `event.locals.user` with user data from database
- Handles cookie updates transparently during refresh flow

### Route Handlers (src/routes.ts)

The `create_pass_routes(db)` factory returns a SvelteKit `Handle` that matches these routes:

- `POST /api/auth/login` - Authenticates user, returns JWT + refresh token
- `POST /api/auth/register` - Creates user, auto-sends verification email (fire-and-forget)
- `POST /api/auth/logout` - Invalidates tokens, clears cookies
- `GET /api/auth/me` - Returns current user data (requires authentication)
- `POST /api/auth/verify-email` - Verifies email with token
- `POST /api/auth/send-verify-email` - Manually trigger verification email
- `POST /api/auth/forgot-password` - Initiates password reset (always returns success)
- `POST /api/auth/reset-password` - Completes password reset, signs user in

**Important:** All route functions accept `db` as first parameter. They are called by the factory-created handle.

### Database Schema (src/schema.ts)

**Tables:**
1. `user` - User accounts
   - `id` (varchar, PK) - nanoid
   - `email` (unique, not null)
   - `password_hash` (bcrypt hash)
   - `verified` (boolean, default false)
   - `verification_token` (nullable)
   - `created_at`, `updated_at`

2. `refresh_token` - Refresh token storage
   - `id` (varchar, PK) - nanoid
   - `user_id` (FK to user, cascade delete)
   - `token` (SHA-256 hash of token secret)
   - `expires_at` (timestamp)
   - `created_at`

### Email Configuration

Email sending is configured in `drop-in.config.js` (in consuming app):

```javascript
export default {
  email: {
    from: 'noreply@example.com',
    sendEmail: async ({ to, subject, html, from }) => {
      // Custom implementation using fetch, Resend, SendGrid, etc.
    }
  },
  app: {
    url: 'https://example.com',
    name: 'App Name',
    route: '/dashboard'  // Post-login redirect
  }
}
```

**Verification emails** are sent automatically on signup (fire-and-forget, non-blocking).

### Security Considerations

**Cookie Settings (src/cookies.ts):**
- `httpOnly: true` - Not accessible via JavaScript
- `secure: true` - HTTPS only in production
- `sameSite: 'strict'` - CSRF protection
- `maxAge: 90 days` - Long-lived sessions

**Password Security:**
- bcrypt hashing with configurable salt rounds (default: 10)
- Minimum 6 characters (configurable)

**Token Security:**
- Refresh tokens stored as SHA-256 hash
- Token format prevents exposure of raw secrets
- Automatic token rotation on refresh
- Database-backed revocation via deletion

### Testing Patterns

Tests are co-located with source files (`*.test.ts`). All test files are excluded from build (tsconfig.json).

**Test Environment:**
- Vitest with Node environment
- Globals enabled for test utilities
- Mock database instances for unit tests
- Mock cookies for route handler tests

**Coverage Areas:**
- JWT creation/verification (jwt.test.ts)
- Token creation/rotation (token.test.ts)
- Password hashing (password.test.ts)
- Authentication flow (authenticate.test.ts)
- Route handlers (routes.*.test.ts)
- Utilities (utils.test.ts)
- Client API calls (client/api_calls.test.ts)

### Environment Variables

**Required:**
- `JWT_SECRET` - Secret for JWT signing/verification

**Database:**
- `DATABASE_URL` - PostgreSQL connection string (provided by consumer)

**Email (optional, chosen by provider):**
- `RESEND_API_KEY` - For Resend
- `SENDGRID_API_KEY` - For SendGrid
- Other provider-specific keys as needed

**Debug:**
- `PASS_DEBUG` - Enable debug logging
- `DEBUG` - General debug flag
- `NODE_ENV` - Enables debug when not "production"

## TypeScript Configuration

- Target: ESNext
- Module: NodeNext (allows Node.js resolution)
- Strict mode enabled
- Declaration files generated with source maps
- Tests excluded from compilation

## Known Patterns

### Creating Auth Functions

When adding new auth-related functions, follow these patterns:

1. **Accept `db` as first parameter** if database access is needed
2. **Export from index.ts** to make available to consumers
3. **Add corresponding route handler** in routes.ts if HTTP endpoint is needed
4. **Update factory function** if new route added
5. **Write tests** in co-located `*.test.ts` file

### Adding Routes

Route handlers follow this signature:
```typescript
export async function my_route(db: any, event: RequestEvent, data?: FormData) {
  // Return Response with proper status/headers
}
```

Then add to `create_pass_routes(db)` switch statement.

### Client-Server Communication

- Client (`@drop-in/pass/client`) makes fetch requests to `/api/auth/*`
- Server handles auth via `create_pass_routes(db)` in hooks.server.ts
- Session data flows via `event.locals.user` populated by `create_session_handle(db)`
- Cookies are managed entirely server-side (HttpOnly)

## Important Notes

- **Never instantiate database connections** within this library
- **Never export direct database instance setters** - only factory functions
- **Always use dependency injection** for runtime agnostic code
- **Fire-and-forget email sends** to avoid blocking auth responses
- **Password reset always returns success** to prevent user enumeration
- **Refresh tokens are rotated** on every use for security
