// import { transporter } from "../config/nodemailer"
import { resend, emailConfig, isValidEmail } from "../config/resend";
import { EmailError, ValidationError } from "../utils/errors";
import { confirmationEmailTemplate } from "./templates/confirmationEmailTemplate";
import { passwordResetTemplate } from "./templates/passwordResetTemplate";

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {

    // Helper to retry failed submissions
    private static async retryEmail(
        sendFunction: () => Promise<any>,
        userEmail: string,
        maxRetries = emailConfig.maxRetries
    ): Promise<string> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const messageId = await sendFunction();
                return messageId.id;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Error desconocido');
                console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, lastError.message);

                if (attempt === maxRetries) {
                    throw new EmailError('EMAIL_SEND_FAILED', userEmail, attempt);
                }

                // Esperar antes del siguiente reintento (exponential backoff)
                const delay = emailConfig.retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new EmailError('EMAIL_SEND_FAILED', userEmail, maxRetries);
    }


    static sendConfirmationEmail = async ( user : IEmail ) : Promise<void> => {
        if (!isValidEmail(user.email)) {
            console.error('❌ Email inválido:', user.email);
            throw new ValidationError('INVALID_EMAIL_FORMAT');
        }

        if (!user.name?.trim() || !user.token?.trim()) {
            console.error('❌ Faltan campos requeridos');
            throw new ValidationError('EMAIL_MISSING_REQUIRED_FIELDS');
        }

        const confirmUrl = `${process.env.FRONTEND_URL}/auth/confirm-account`;

        const messageId = await this.retryEmail(
            async () => {
            const { data, error } = await resend.emails.send({
                from: emailConfig.from,
                to: user.email,
                subject: 'UpTask - Confirma tu cuenta',
                html: confirmationEmailTemplate(user.name, user.token, confirmUrl),
                tags: [
                    { name: 'type', value: 'confirmation' },
                    { name: 'environment', value: process.env.NODE_ENV || 'development' }
                ]
            })

            if (error) {
                throw new Error(error.message || 'Error al enviar email');
            }

            return data;
        }, 
        user.email
    );
        console.log(`✅ Email de confirmación enviado a ${user.email} (ID: ${messageId})`);
    }


    static sendPasswordResetToken = async (user: IEmail) : Promise<void> => {
        if (!isValidEmail(user.email)) {
            console.error('Email inválido:', user.email);
            throw new ValidationError('INVALID_EMAIL_FORMAT');
        }

        if (!user.name || !user.token) {
            console.error('Faltan campos requeridos');
            throw new ValidationError('EMAIL_MISSING_REQUIRED_FIELDS');
        }

        const resetUrl = `${process.env.FRONTEND_URL}/auth/new-password`;

        const messageId = await this.retryEmail(
        async () => {
                const { data, error } = await resend.emails.send({
                    from: emailConfig.from,
                    to: user.email,
                    subject: 'UpTask - Restablece tu contraseña',
                    html: passwordResetTemplate(user.name, user.token, resetUrl),
                    tags: [
                        { name: 'type', value: 'password-reset' },
                        { name: 'environment', value: process.env.NODE_ENV || 'development' }
                    ]
                });

                if (error) {
                    throw new Error(error.message || 'Error al enviar email');
                }

                return data;
            },
            user.email
        );
        console.log(`✅ Email de reset enviado a ${user.email} (ID: ${messageId})`);
    };
}