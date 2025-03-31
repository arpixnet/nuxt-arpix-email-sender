// Node built-ins first
import { promises as fsp } from 'node:fs'
// External packages
import { fileURLToPath } from 'node:url'
import * as nodemailer from 'nodemailer'
import type { Transporter, SendMailOptions as NodemailerSendOptions } from 'nodemailer'
import type { Options as SMTPTransportOptions } from 'nodemailer/lib/smtp-transport'
import handlebars from 'handlebars'
import { join, dirname, resolve } from 'pathe'
import { createError } from 'h3'
// Internal imports
import type { ModuleOptions, SendMailOptions, SenderInstance } from '../../../types'
import { getModuleOptions } from './index'

const CONFIG_KEY = 'arpixEmailSender'

// Singleton for transporter
let transporterInstance: Transporter | null = null
let moduleOptions: ModuleOptions | null = null

function getModuleOptionsFromConfig(): ModuleOptions {
  if (!moduleOptions) {
    moduleOptions = getModuleOptions()
    if (!moduleOptions) {
      throw createError({ statusCode: 500, message: `[nuxt-arpix-email-sender] Configuration key '${CONFIG_KEY}' not found.` })
    }
  }
  return moduleOptions
}

function createTransporter(): Transporter {
  const options = getModuleOptionsFromConfig()

  if (options.transport === 'smtp') {
    if (!options.smtp) {
      throw createError({ statusCode: 500, message: '[nuxt-arpix-email-sender] Configuration SMTP required but not found.' })
    }
    // Ensure auth is an object if provided
    const smtpOptions: SMTPTransportOptions = {
      ...options.smtp,
      auth: options.smtp.auth ? { ...options.smtp.auth } : undefined,
    }
    return nodemailer.createTransport(smtpOptions)
  }
  else {
    throw createError({ statusCode: 500, message: `[nuxt-arpix-email-sender] Invalid mail transport: ${options.transport}` })
  }
}

function getTransporter(): Transporter {
  if (!transporterInstance) {
    transporterInstance = createTransporter()
  }
  return transporterInstance
}

async function renderTemplate(templateName: string, context: Record<string, unknown>): Promise<string> {
  const options = getModuleOptionsFromConfig()
  const templateDir = options.templates?.dir || 'server/emails/templates'
  const rootDir = dirname(fileURLToPath(import.meta.url)).split('/.nuxt/')[0]
  const templatePath = resolve(join(rootDir, templateDir, `${templateName}.hbs`))

  try {
    const templateContent = await fsp.readFile(templatePath, 'utf-8')
    const compiledTemplate = handlebars.compile(templateContent)
    return compiledTemplate(context)
  }
  catch (error: unknown) {
    console.error(`[nuxt-arpix-email-sender] Error reading or compiling template ${templatePath}:`, error)
    throw createError({
      statusCode: 500,
      message: `Error processing mail template: ${templateName}`,
      cause: error as Error,
    })
  }
}

async function send(options: SendMailOptions): Promise<nodemailer.SentMessageInfo> {
  const transporter = getTransporter()
  const config = getModuleOptionsFromConfig()

  const mailOptions: NodemailerSendOptions = {
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
    from: options.from || config.defaultFrom,
  }

  // Render template if specified
  if (options.template && options.context) {
    mailOptions.html = await renderTemplate(options.template, options.context)
  }
  else if (options.template && !options.context) {
    console.warn(`[nuxt-arpix-email-sender] Template '${options.template}' specified but 'context' not provided.`)
  }

  // Validate we have content (text or html)
  if (!mailOptions.text && !mailOptions.html) {
    throw createError({ statusCode: 400, message: '[nuxt-arpix-email-sender] Mail content required (text, html or template with context).' })
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[nuxt-arpix-email-sender] Mail sent: ${info.messageId}`)
    return info
  }
  catch (error: unknown) {
    console.error('[nuxt-arpix-email-sender] Error sending mail:', error)
    throw createError({
      statusCode: 500,
      message: 'Error sending email.',
      cause: error as Error,
    })
  }
}

/**
 * Composable for accessing the mail sender instance on the server side. (server/api, server/routes, etc.)
 * @returns {SenderInstance} An instance of the mail sending service.
 */
export function useMailSender(): SenderInstance {
  // Initialize transporter if not already initialized (can happen on first use)
  getTransporter()

  return {
    send,
  }
}
