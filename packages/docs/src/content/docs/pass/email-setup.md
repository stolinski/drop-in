---
title: Email Configuration
description: How to configure email sending for authentication
---

## Overview

Drop In's authentication system needs to send emails for:
- 📧 **Email verification** after user signup
- 🔐 **Password reset** links  

As of the latest version, **@drop-in/pass is email provider agnostic**. This means you can use any email service that works in your deployment environment.

## Quick Setup

Add an email callback to your `drop-in.config.js`:

```js
// drop-in.config.js
export default {
  email: {
    from: 'noreply@yourdomain.com',
    sendEmail: async ({ to, subject, html, from }) => {
      // Your email implementation here
    },
  },
  app: {
    url: 'https://yourdomain.com',
    name: 'Your App',
    route: '/dashboard'
  }
};
```

## Email Provider Examples

### Node.js with SMTP (Beeper)

For traditional Node.js deployments with SMTP:

```js
// drop-in.config.js
import { beeper } from '@drop-in/beeper';

const sendEmail = async (options) => {
  await beeper.send(options);
};

export default {
  email: {
    host: 'smtp.yourdomain.com',
    port: 587,
    secure: true,
    from: 'noreply@yourdomain.com',
    sendEmail,
  },
  // ...
};
```

Don't forget your environment variables:
```bash
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
```

### Cloudflare Workers with Resend

Perfect for modern serverless deployments:

```js
// drop-in.config.js
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
  // ...
};
```

Environment variable:
```bash
RESEND_API_KEY=re_your_api_key_here
```

### Cloudflare Workers with MailChannels (Free)

Free email sending for Cloudflare Workers:

```js
// drop-in.config.js
const sendEmail = async ({ to, subject, html, from }) => {
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
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
  // ...
};
```

### SendGrid

Reliable email delivery service:

```js
// drop-in.config.js
const sendEmail = async ({ to, subject, html, from }) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
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
  // ...
};
```

Environment variable:
```bash
SENDGRID_API_KEY=SG.your_api_key_here
```

## Development Mode

When no `sendEmail` callback is provided, emails are logged to the console:

```
📧 Email would be sent (no email callback configured):
To: user@example.com
Subject: Your App Verify Email
From: noreply@yourdomain.com
Body: <p>Please click the following link...</p>
```

This makes development and testing easier without requiring email setup.

## Email Callback API

Your `sendEmail` function will receive an object with these properties:

```typescript
interface EmailOptions {
  to: string;      // Recipient email address
  subject: string; // Email subject line
  html: string;    // HTML email content
  from?: string;   // Sender email (optional, uses config default)
}
```

The function should:
- ✅ Send the email using your chosen provider
- ✅ Return a Promise that resolves on success
- ✅ Throw an error if sending fails

## Migration from Beeper

If you're upgrading from an older version that used `@drop-in/beeper` directly:

### Before
```js
// Old configuration
export default {
  email: {
    host: 'smtp.example.com',
    port: 587,
    secure: true,
    from: 'noreply@example.com'
  },
};
```

### After
```js
// New configuration
import { beeper } from '@drop-in/beeper';

export default {
  email: {
    from: 'noreply@example.com',
    sendEmail: async (options) => {
      await beeper.send(options);
    },
  },
};
```

This maintains the same functionality while giving you the flexibility to switch providers later.

## Troubleshooting

**Q: Emails aren't being sent**  
A: Check that your `sendEmail` callback is configured and your API keys are set correctly.

**Q: Getting runtime errors in Cloudflare Workers**  
A: Ensure your email implementation only uses Web APIs (fetch, etc.) and not Node.js-specific modules.

**Q: Want to test without sending real emails**  
A: Simply don't configure a `sendEmail` callback - emails will be logged to the console instead.

## Best Practices

1. **Environment Variables**: Store API keys in environment variables, never in code
2. **Error Handling**: Your `sendEmail` function should throw descriptive errors
3. **Rate Limiting**: Be aware of your email provider's rate limits
4. **Testing**: Use the console fallback during development
5. **Provider Choice**: Choose based on your deployment environment and needs