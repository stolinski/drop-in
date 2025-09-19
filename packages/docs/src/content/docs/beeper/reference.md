---
title: Beeper Reference
description: A reference page for Beeper
---

## What is it?

Beeper is a lightweight wrapper around NodeMailer for Node.js environments. **As of the latest version, @drop-in/pass no longer depends on beeper**, making the auth package runtime-agnostic and compatible with Cloudflare Workers, Deno, Bun, and other environments.

## When to use Beeper

Use `@drop-in/beeper` if you:
- 🖥️ Are deploying to Node.js environments  
- 📧 Want to use SMTP for email sending  
- 🎯 Prefer a simple, pre-configured email solution  

## Installation

```bash
npm install @drop-in/beeper
```

## Configuration

Configure beeper in your `drop-in.config.js`:

```js
import { beeper } from '@drop-in/beeper';

const sendEmail = async (options) => {
  await beeper.send(options);
};

export default {
  email: {
    host: 'smtp.example.com',
    port: 587,
    secure: true,
    from: 'noreply@example.com',
    sendEmail, // Use beeper as your email callback
  },
  // ...
};
```

Set your SMTP credentials in environment variables:
```bash
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
```

## Methods

### `beeper.send(options)`

Send an email using the configured SMTP settings.

**Parameters:**
- `to` (string): Recipient email address
- `subject` (string): Email subject
- `html` (string): HTML email content  
- `from` (string, optional): Sender email address

**Example:**
```js
await beeper.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<p>Thanks for signing up!</p>',
  from: 'noreply@example.com'
});
```

## Alternative Email Providers

For modern deployment environments like Cloudflare Workers, consider these alternatives:

- **[Resend](https://resend.com)**: Modern email API with excellent developer experience
- **[MailChannels](https://mailchannels.com)**: Free email sending for Cloudflare Workers
- **[SendGrid](https://sendgrid.com)**: Reliable email delivery service

See the [Email Configuration Guide](/pass/email-setup) for examples of configuring different providers.
