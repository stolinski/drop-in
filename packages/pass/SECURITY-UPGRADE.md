# Security Upgrade: HttpOnly JWT Implementation

This upgrade implements a more secure authentication pattern using HttpOnly cookies for both JWT access tokens and refresh tokens.

## What Changed

### 🔒 **Security Improvements**
- **JWT is now HttpOnly**: Access tokens can no longer be read by client-side JavaScript, preventing XSS token theft
- **Extended JWT expiry**: Access tokens now expire in 90 days (was 15 minutes previously) 
- **Longer refresh tokens**: Refresh tokens now last 90 days (was 30 days)
- **Fixed logout cookie clearing**: Now properly sets separate Set-Cookie headers

### 📡 **API Changes**
- **New endpoint**: `GET /api/auth/me` - Returns current user information
- **Updated login/signup**: Now sets JWT cookies server-side instead of returning JWT in response
- **Session management**: New `populate_user_session()` and `create_session_handle(db)` for server-side user context

### 🚫 **Deprecated Client-Side JWT Functions**
These functions now show warnings and return undefined:
- `get_jwt()` 
- `get_raw_jwt()`
- `clear_jwt()`
- `get_login()`

## Migration Guide

### For Existing Applications

#### 1. Update Hooks (Required)
Add session population to your `hooks.server.ts`:

```typescript
import { create_pass_routes, create_session_handle } from '@drop-in/pass';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  create_session_handle(db),  // NEW: Populates event.locals.user
  create_pass_routes(db)
);
```

#### 2. Update Client Code
Replace client-side JWT reading with server-side session or API calls:

**Before:**
```typescript
import { get_login } from '@drop-in/pass';
const { sub } = get_login();
```

**After (Server-side):**
```typescript
// In load functions, hooks, or API routes
if (event.locals.user) {
  const userId = event.locals.user.id;
}
```

**After (Client-side):**
```typescript
import { pass } from '@drop-in/pass';
const { user } = await pass.me();
const userId = user.id;
```

#### 3. Update Authentication Checks
**Before:**
```typescript
import { get_jwt } from '@drop-in/pass';
const isLoggedIn = !!get_jwt();
```

**After (Server-side):**
```typescript
const isLoggedIn = !!event.locals.user;
```

**After (Client-side):**
```typescript
try {
  await pass.me();
  const isLoggedIn = true;
} catch {
  const isLoggedIn = false;
}
```

### For New Applications

1. **Set up hooks** as shown above
2. **Use server-side session**: Access `event.locals.user` in load functions and API routes
3. **Use `/api/auth/me`**: For client-side user data fetching when needed

## Benefits of This Change

### 🛡️ **Security**
- **XSS Protection**: JWT cannot be stolen via client-side code injection
- **Reduced Attack Surface**: Shorter access token lifetime limits exposure window
- **Defense in Depth**: Even if XSS exists, tokens remain protected

### 🚀 **Performance** 
- **Automatic Refresh**: Server handles token refresh transparently
- **Fewer Client Requests**: User data available immediately in server context
- **Better SSR**: User data available during server-side rendering

### 🔄 **Reliability**
- **Consistent Sessions**: No client/server state synchronization issues
- **Proper Cookie Handling**: Fixed logout route cookie clearing
- **Production Ready**: Addresses common production environment issues

## Production Considerations

This change specifically addresses the production logout issue mentioned by:

1. **Fixed cookie clearing**: Logout now sends separate Set-Cookie headers
2. **HttpOnly security**: Prevents cookie manipulation client-side
3. **Proper credentials**: All auth requests include `credentials: 'include'`
4. **Shorter token window**: Reduces impact of any potential token exposure

## Session Analysis

Your existing session/token management code is solid:
- ✅ Proper token hashing and verification
- ✅ Secure refresh token rotation
- ✅ Database cleanup on logout
- ✅ Expiration handling
- ✅ Error handling

The production logout issue was likely due to the cookie header concatenation issue, which is now fixed.

## API Reference

### New Endpoint: `/api/auth/me`
```typescript
GET /api/auth/me

Response (200):
{
  "user": {
    "id": "user_123",
    "email": "user@example.com", 
    "verified": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}

Response (401):
{
  "error": "Not authenticated"
}
```

### New Client Method: `pass.me()`
```typescript
import { pass } from '@drop-in/pass';

try {
  const { user } = await pass.me();
  console.log('Logged in as:', user.email);
} catch (error) {
  console.log('Not authenticated');
}
```

### Session Helper
```typescript
import { populate_user_session } from '@drop-in/pass';

// Manual session population (if not using create_session_handle)
await populate_user_session(db, event);
console.log(event.locals.user); // User data or undefined
```