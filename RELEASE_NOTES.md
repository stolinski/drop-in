# Release Notes

## @drop-in/pass v0.2.0 - Runtime Agnostic Authentication 🚀

### 🚨 BREAKING CHANGES

- **Removed hard dependency on `@drop-in/beeper`** - Pass is now email provider agnostic
- **New email configuration required** - You must configure an email provider via callback in `drop-in.config.js`
- **Runtime agnostic** - Now works in Node.js, Cloudflare Workers, Deno, Bun, and other environments

### ✨ New Features

- **Email Provider Flexibility**: Configure any email service (Resend, SendGrid, MailChannels, SMTP, etc.)
- **Cloudflare Workers Support**: Uses only Web APIs, works in serverless environments
- **Development Mode**: Graceful fallback to console logging when no email provider is configured
- **Type-Safe Email Callbacks**: Full TypeScript support for email provider configuration

### 🔄 Migration Guide

**Before (old configuration):**
```js
// This no longer works
export default {
  email: {
    host: 'smtp.example.com',
    port: 587,
    secure: true,
    from: 'noreply@example.com'
  }
};
```

**After (new configuration):**
```js
// Option 1: Continue using beeper (Node.js)
import { beeper } from '@drop-in/beeper';
export default {
  email: {
    from: 'noreply@example.com',
    sendEmail: async (options) => await beeper.send(options),
  }
};

// Option 2: Use Resend (Cloudflare Workers)
export default {
  email: {
    from: 'noreply@example.com',
    sendEmail: async ({ to, subject, html, from }) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, html, from }),
      });
      if (!response.ok) throw new Error(`Failed to send email: ${response.statusText}`);
    },
  }
};
```

### 📚 Documentation

- **New Email Configuration Guide**: Comprehensive examples for all major email providers
- **Updated API Reference**: Runtime compatibility information  
- **Migration Instructions**: Step-by-step upgrade guide

### 🛠️ For Existing Users

1. **No immediate action required** - emails will log to console until you configure a provider
2. **To continue using SMTP**: Install `@drop-in/beeper` separately and configure as shown above
3. **To use modern providers**: Follow the email configuration guide for your chosen provider

---

## @drop-in/beeper v0.0.14 - Optional Email Provider

### ✨ New Features

- **Optional dependency** - No longer required by @drop-in/pass
- **Better documentation** - Clear usage examples and configuration
- **Runtime guidance** - When to use beeper vs alternatives

### 📚 Documentation

- **Updated README** - Clarified when and how to use beeper
- **Provider alternatives** - Examples of modern email services
- **Integration examples** - How to use beeper as an email callback

---

## Breaking Change Summary

This release makes @drop-in/pass **runtime agnostic** by removing platform-specific dependencies. The core functionality remains the same, but **email configuration is now required**.

**Who is affected:**
- Users upgrading @drop-in/pass who use email features (verification, password reset)

**Who is NOT affected:**
- Users only using authentication without email features
- New installations (email config is part of setup)

**Benefits:**
- ✅ Works in Cloudflare Workers, Deno, Bun, and other runtimes
- ✅ Choose any email provider that fits your needs
- ✅ Lighter package without Node.js dependencies
- ✅ Better testing experience with console fallback

See the [Email Configuration Guide](https://your-docs-url/pass/email-setup) for detailed setup instructions.