# Nuxt Arpix Email Sender

[![npm version](https://img.shields.io/npm/v/nuxt-arpix-email-sender/latest.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmjs.com/package/nuxt-arpix-email-sender)
[![npm downloads](https://img.shields.io/npm/dm/nuxt-arpix-email-sender.svg?style=flat&colorA=020420&colorB=00DC82)](https://npm.chart.dev/nuxt-arpix-email-sender)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Nuxt](https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js)](https://nuxt.com)

A Nuxt module for sending emails using various transport methods with Handlebars template support.

## Features

- Send emails with Handlebars templates
- Support for multiple transport methods (SMTP, Other coming soon)
- Easy configuration through Nuxt config
- Built-in support for development and production environments
- File attachments support

## Installation

Install the module to your Nuxt application with one command (requires Nuxi):

```bash
npx nuxi module add nuxt-arpix-email-sender
```

This command will:
- Install the module as a dependency
- Add it to your package.json
- Update your `nuxt.config.ts` file automatically

## Configuration

Configure the module in your `nuxt.config.ts` file:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  arpixEmailSender: {
    transport: 'smtp', // other options coming soon
    defaultFrom: 'Your Name <noreply@example.com>',
    
    // SMTP configuration (required if transport is 'smtp')
    smtp: {
      host: process.env.EMAIL_SENDER_SMTP_HOST,
      port: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
      secure: false, // or true if using SSL/TLS
      auth: {
        user: process.env.EMAIL_SENDER_SMTP_USER,
        pass: process.env.EMAIL_SENDER_SMTP_PASS,
      }
    },
    
    // Templates configuration (optional)
    templates: {
      dir: 'server/emails/templates', // Directory for Handlebars templates
    },
  },
});
```

## Usage

### In Server Routes

Use the `useMailSender()` utility in your server routes:

```typescript
// server/api/send-email.post.ts
export default defineEventHandler(async (event) => {
  const sender = useMailSender()
  
  try {
    const info = await sender.send({
      to: 'user@example.com',
      subject: 'Welcome to our platform!',
      template: 'welcome', // Uses welcome.hbs from your templates directory
      context: {
        userName: 'John Doe',
        activationLink: 'https://example.com/activate',
      },
      attachments: [
        {
          filename: 'welcome-guide.pdf',
          content: fs.readFileSync('/path/to/welcome-guide.pdf'),
          // path: '/path/to/welcome-guide.pdf', // Alternatively, you can use a path
        },
      ],
    })
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error.message }
  }
})
```

### Creating Templates

Create Handlebars templates in your templates directory:

```handlebars
<!-- server/emails/templates/welcome.hbs -->
<h1>Welcome, {{userName}}!</h1>
<p>Thank you for joining our platform.</p>
<p>Please <a href="{{activationLink}}">click here</a> to activate your account.</p>
```

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  npm install

  # Generate type stubs
  npm run dev:prepare

  # Develop with the playground
  npm run dev

  # Build the playground
  npm run dev:build

  # Run ESLint
  npm run lint

  # Run Vitest
  npm run test
  npm run test:watch

  # Release new version
  npm run release
  ```

</details>

## License

[GPL-3.0 License](LICENSE)
