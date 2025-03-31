import fs from 'node:fs'
import * as nodemailer from 'nodemailer'
import { defineEventHandler } from 'h3'
import { useMailSender } from '../../../src/runtime/server/utils/mailer'
import { createError } from '#imports'

export default defineEventHandler(async () => {
  const sender = useMailSender()

  try {
    const info = await sender.send({
      to: 'test@example.com',
      subject: 'Correo de prueba desde nuxt-arpix-email-sender',
      template: 'welcome',
      context: {
        userName: 'Usuario de Prueba',
        activationLink: 'https://example.com/activate',
      },
      attachments: [
        {
          filename: 'imagen.png',
          content: fs.readFileSync('/Users/user/Downloads/11.png'),
          // path: '/Users/user/Downloads/11.png',
        },
      ],
    })

    console.log('Vista previa del correo (Ethereal URL): %s', nodemailer.getTestMessageUrl(info))

    return {
      success: true,
      message: 'Correo enviado (o preparado para Ethereal).',
      info,
      previewUrl: nodemailer.getTestMessageUrl(info) || 'No disponible (solo para Ethereal)',
    }
  }
  catch (error: unknown) {
    console.error('Error al llamar a la API test-email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error interno al intentar enviar el correo.',
    })
  }
})
