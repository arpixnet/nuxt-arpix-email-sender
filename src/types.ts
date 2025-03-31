import type { SentMessageInfo } from 'nodemailer'
import type { Attachment } from 'nodemailer/lib/mailer'
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport'

// Opciones de configuración del módulo que irán en nuxt.config.ts -> runtimeConfig.sender
export interface ModuleOptions {
  /**
   * Tipo de transporte a usar: 'smtp' o 'ses'.
   */
  transport: 'smtp' | 'ses'

  /**
   * Dirección de remitente por defecto para todos los correos.
   * Puede ser sobreescrita al llamar a send().
   * Ejemplo: 'Tu Nombre <noreply@example.com>'
   */
  defaultFrom?: string

  /**
   * Configuración para el transporte SMTP.
   * Requerido si transport es 'smtp'.
   */
  smtp?: SMTPOptions

  /**
   * Configuración para el transporte AWS SES.
   * Requerido si transport es 'ses'.
   */
  ses?: {
    /**
     * Región de AWS donde se encuentra el servicio SES.
     */
    region: string

    /**
     * Credenciales de AWS (accessKeyId y secretAccessKey).
     */
    credentials?: {
      accessKeyId: string
      secretAccessKey: string
    }

    /**
     * Tasa máxima de envío de correos por segundo.
     */
    sendingRate?: number

    /**
     * Número máximo de conexiones simultáneas.
     */
    maxConnections?: number
  }

  /**
   * Configuración de plantillas Handlebars.
   */
  templates?: {
    /**
     * Directorio donde se encuentran las plantillas .hbs.
     * Ruta relativa al directorio raíz del proyecto Nuxt.
     * @default 'server/emails/templates'
     */
    dir?: string
  }
}

// Opciones para la función send()
export interface SendMailOptions {
  /** Destinatario o lista de destinatarios */
  to: string | string[]
  /** Asunto del correo */
  subject: string
  /** Contenido en texto plano (opcional si se usa html o template) */
  text?: string
  /** Contenido en formato HTML (opcional si se usa template) */
  html?: string
  /** Nombre de la plantilla Handlebars a usar (sin extensión .hbs) */
  template?: string
  /** Objeto con variables para la plantilla Handlebars */
  context?: Record<string, unknown>
  /** Adjuntos (formato nodemailer) */
  attachments?: Attachment[]
  /** Remitente (sobrescribe defaultFrom de la configuración) */
  from?: string
  /** Otras opciones válidas para nodemailer.sendMail */
  [key: string]: unknown
}

// Interfaz para la utilidad expuesta por el módulo
export interface SenderInstance {
  send: (options: SendMailOptions) => Promise<SentMessageInfo>
}
