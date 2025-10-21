export const passwordResetTemplate = (name: string, token: string, resetUrl: string) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablece tu contraseña - UpTask</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
            
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                  UpTask
                </h1>
              </td>
            </tr>
            
            <!-- Body -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">
                  Restablece tu contraseña
                </h2>
                
                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Hola <strong style="color: #111827;">${name}</strong>,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                  Introduce el siguiente código de verificación cuando se te solicite y haz clic en el botón de abajo para continuar con el proceso.

                  Si no realizaste esta solicitud, puedes ignorar este mensaje.
                </p>
                
                <!-- CTA Button -->
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <a href="${resetUrl}" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);">
                        Restablecer contraseña
                      </a>
                    </td>
                  </tr>
                </table>
                
                <!-- Divider -->
                <table role="presentation" style="width: 100%; margin: 20px 0;">
                  <tr>
                    <td style="border-bottom: 1px solid #e5e7eb;"></td>
                  </tr>
                </table>
                
                <p style="text-align:center; font-weight: 700; font-bold:700; margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Código de verificación
                </p>
                
                <!-- Token Box -->
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #d1d5db;">
                      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'Courier New', monospace;">
                        ${token}
                      </span>
                    </td>
                  </tr>
                </table>
                
                <!-- Warning -->
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                        <strong>⏱️ Importante:</strong> Este código es válido por <strong>10 minutos</strong>.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Security notice -->
                <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                  <tr>
                    <td style="padding: 16px;">
                      <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                        <strong>🔒 Nota de seguridad:</strong> Si no solicitaste restablecer tu contraseña, ignora este correo. Tu contraseña permanecerá sin cambios.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Si tienes problemas, contacta nuestro equipo de soporte.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                  © ${new Date().getFullYear()} UpTask. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;