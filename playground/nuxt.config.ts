export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2025-03-30',

  arpixEmailSender: {
    transport: process.env.EMAIL_SENDER_TRANSPORT as 'smtp' || 'smtp',
    defaultFrom: process.env.EMAIL_SENDER_DEFAULT_FROM,
    smtp: {
      host: process.env.EMAIL_SENDER_SMTP_HOST,
      port: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
      auth: {
        user: process.env.EMAIL_SENDER_SMTP_USER,
        pass: process.env.EMAIL_SENDER_SMTP_PASS,
      },
    },
  },
})
