export const confirmationEmailTemplate = (name: string, token: string, confirmUrl: string) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu cuenta - UpTask</title>
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
                  ¡Bienvenido a UpTask!
                </h2>

                <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                  Hola <strong style="color: #111827;">${name}</strong>,
                </p>
                
                <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: justify;">
                  Gracias por registrarte. Ya casi está todo listo, solo necesitas confirmar tu dirección de correo electrónico. 
                  Introduce el siguiente código de verificación cuando se te solicite. Si no deseas crear una cuenta, puedes ignorar este mensaje.
                </p>
                
                <!-- CTA Button -->
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <a href="${confirmUrl}" 
                         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                        Confirmar mi cuenta
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
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
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