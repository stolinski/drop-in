# @drop-in/pass

> Your drop-in season pass. aka Auth

A secure, modern authentication library for SvelteKit applications with HttpOnly JWT cookies, refresh token rotation, and comprehensive session management. **Runtime agnostic** - works in Node.js, Cloudflare Workers, Deno, Bun, and other environments.

## ✨ Features

- 🔒 **Secure by default** - HttpOnly cookies, CSRF protection, bcrypt password hashing
- 🔄 **Automatic token refresh** - Transparent JWT renewal with refresh token rotation
- 📧 **Email verification** - Built-in email verification workflow with flexible provider configuration
- 🌐 **Runtime agnostic** - Works in Node.js, Cloudflare Workers, Deno, Bun, and other environments
- 🏗️ **SvelteKit optimized** - Native hooks integration and SSR support
- 📊 **Session management** - Server-side user context and authentication state
- 🧪 **Well tested** - 66+ tests covering all core functionality
- 📝 **TypeScript first** - Full type safety throughout

## 🚀 Quick Start

### Installation

```bash
npm install @drop-in/pass
```

### Database Setup

Set up your PostgreSQL database and add the connection string to your environment:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-secret-key-here"
```

### Email Configuration

Configure your email provider in `drop-in.config.js`:

```javascript
// For Cloudflare Workers with Resend
const sendEmail = async ({ to, subject, html, from }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, subject, html, from }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }
};

export default {
  email: {
    from: 'noreply@yourdomain.com',
    sendEmail,
  },
  app: {
    url: 'https://yourdomain.com',
    name: 'Your App',
    route: '/dashboard'
  }
};
```

**Supported email providers:**
- **Resend** - Modern email API, perfect for Cloudflare Workers
- **MailChannels** - Free email sending for Cloudflare Workers  
- **SendGrid** - Reliable email delivery service
- **SMTP** - Traditional email with `@drop-in/beeper` for Node.js

See [Email Configuration Guide](https://your-docs-url/pass/email-setup) for detailed examples.

### Basic Setup

1. **Configure your hooks** (`src/hooks.server.ts`):

```typescript
import { pass_routes, session_handle } from '@drop-in/pass';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  session_handle,  // Populates event.locals.user automatically
  pass_routes      // Handles auth routes (/api/auth/*)
);
```

2. **Configure global settings** (`drop-in.config.js`):

```typescript
export default {
  email: {
    from: 'noreply@yourdomain.com',
    sendEmail: yourEmailFunction, // Your email implementation
  },
  app: {
    url: 'https://yourdomain.com',
    name: 'Your App Name',
    route: '/dashboard'
  }
};
```

### Usage

#### Client-Side Authentication

```typescript
import { pass } from '@drop-in/pass/client';

// Sign up
try {
  const result = await pass.signup('user@example.com', 'securepassword');
  console.log('Signed up successfully!', result.user);
} catch (error) {
  console.error('Signup failed:', error.message);
}

// Login
try {
  const result = await pass.login('user@example.com', 'securepassword');
  console.log('Logged in successfully!', result.user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Get current user
try {
  const { user } = await pass.me();
  console.log('Current user:', user);
} catch (error) {
  console.log('Not authenticated');
}

// Logout
await pass.logout();
```

#### Server-Side Usage

```typescript
// In load functions, API routes, or hooks
export async function load({ locals }) {
  if (locals.user) {
    console.log('User is authenticated:', locals.user.id);
    return {
      user: locals.user
    };
  }
  
  // User is not authenticated
  return {};
}
```

```typescript
// Manual authentication in API routes
import { authenticate_user } from '@drop-in/pass';

export async function GET({ cookies }) {
  const auth = await authenticate_user(cookies);
  
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // User is authenticated
  console.log('User ID:', auth.user_id);
  return new Response('Hello authenticated user!');
}
```

## 🛡️ Security Features

### HttpOnly Cookies
- **Access tokens** are HttpOnly, secure, and short-lived (15 minutes)
- **Refresh tokens** are HttpOnly, secure, and long-lived (30 days)
- **SameSite=strict** protection against CSRF attacks
- **Automatic token refresh** happens transparently

### Password Security
- **bcrypt hashing** with salt rounds (configurable, default: 10)
- **Backward compatibility** for password hash migration
- **Minimum password requirements** (6+ characters, configurable)

### Session Management
- **Database-stored refresh tokens** with automatic cleanup
- **Token rotation** on each refresh
- **Secure logout** that invalidates all tokens
- **Protection against token reuse**

## 📖 API Reference

### Client API (`@drop-in/pass/client`)

#### `pass.signup(email: string, password: string)`
Creates a new user account.

**Returns:** `Promise<{ user: User }>`

**Throws:** Error with validation or server error messages

#### `pass.login(email: string, password: string)`
Authenticates a user.

**Returns:** `Promise<{ user: User }>`

**Throws:** Error with authentication failure details

#### `pass.logout()`
Logs out the current user.

**Returns:** `Promise<Response>`

#### `pass.me()`
Gets current authenticated user information.

**Returns:** `Promise<{ user: User }>`

**Throws:** Error if not authenticated

### Server API

#### `authenticate_user(cookies: Cookies)`
Manually authenticate a user from cookies.

```typescript
const auth = await authenticate_user(cookies);
if (auth) {
  console.log('User ID:', auth.user_id);
}
```

#### `populate_user_session(event: RequestEvent)`
Manually populate `event.locals.user` with authenticated user data.

```typescript
await populate_user_session(event);
console.log(event.locals.user); // User object or undefined
```

### Built-in Routes

The library automatically handles these routes when using `pass_routes`:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/send-verify-email` - Send verification email

## 🔧 Configuration

### Cookie Settings

```typescript
// Refresh token settings (src/cookies.ts)
export const cookie_options = {
  httpOnly: true,
  secure: true,
  path: '/',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

// JWT settings
export const jwt_cookie_options = {
  path: '/',
  maxAge: 60 * 15, // 15 minutes
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: true,
};
```

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="your-jwt-secret"

# Optional email API keys (choose one based on your provider)
RESEND_API_KEY="re_your_api_key"           # For Resend
SENDGRID_API_KEY="SG.your_api_key"         # For SendGrid
# MailChannels requires no API key for Cloudflare Workers

# Legacy SMTP settings (if using @drop-in/beeper)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="true"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

## 🧪 Testing

The library includes comprehensive test coverage:

```bash
npm test  # Run all tests
npm run test:watch  # Watch mode
```

**Test Coverage:**
- ✅ Password hashing and verification
- ✅ JWT creation and validation
- ✅ Token refresh flow
- ✅ Authentication middleware
- ✅ Login/signup flows
- ✅ Utility functions
- ✅ Client API calls

## 🔄 Migration from Non-HttpOnly Setup

If you're upgrading from a version that used readable JWTs:

1. **Update hooks.server.ts** to include `session_handle`
2. **Replace client-side JWT reading** with server-side `locals.user` or `pass.me()`
3. **Remove manual cookie handling** - all cookie management is now automatic

See [SECURITY-UPGRADE.md](./SECURITY-UPGRADE.md) for detailed migration instructions.

## 🤝 TypeScript Support

Full TypeScript support with type definitions for:

```typescript
import type { User } from '@drop-in/pass/schema';

// Event locals typing is automatic
declare global {
  namespace App {
    interface Locals {
      user?: Partial<User>;
    }
  }
}
```

## 🚨 Security Considerations

1. **Always use HTTPS in production** - cookies won't work properly over HTTP
2. **Set secure environment variables** - never commit secrets to version control
3. **Configure CSP headers** - additional XSS protection
4. **Monitor for suspicious activity** - implement rate limiting for auth endpoints
5. **Regular security updates** - keep dependencies updated

## 📋 Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Development mode
npm run dev
```

## 🐛 Troubleshooting

### Common Issues

**"Not authenticated" errors in production**
- Ensure HTTPS is properly configured
- Check that cookies are being set with correct domain
- Verify SameSite settings for your deployment

**Database connection errors**
- Verify `DATABASE_URL` environment variable
- Ensure PostgreSQL is running and accessible
- Check database schema is properly set up

**Email verification not working**
- Configure email provider in `drop-in.config.js` with your `sendEmail` callback
- Set up email service credentials (API keys) in environment variables
- Check spam/junk folders
- Verify your email provider configuration is correct

**Runtime compatibility issues**
- Ensure your email implementation uses only Web APIs (fetch, etc.) for Cloudflare Workers
- For Node.js SMTP, use `@drop-in/beeper` as your email callback
- Avoid Node.js-specific modules in Cloudflare Workers environments

### Debug Mode

Enable debug logging:

```bash
DEBUG=drop-in:* npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and:

1. **Add tests** for any new features
2. **Update documentation** for API changes
3. **Follow TypeScript best practices**
4. **Ensure security review** for auth-related changes

## 📄 License

ISC License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with:
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) - Password hashing
- [jose](https://www.npmjs.com/package/jose) - JWT handling
- [drizzle-orm](https://www.npmjs.com/package/drizzle-orm) - Database ORM
- [nanoid](https://www.npmjs.com/package/nanoid) - ID generation

---

**Made with ❤️ for the SvelteKit community**