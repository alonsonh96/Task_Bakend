import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config()

const config = () => {
    return {
        host: process.env.SMTP_HOST!, // o "live.smtp.mailtrap.io" para producción
        port: Number(process.env.SMTP_PORT!), // También puedes usar 587, 465, o 25
        auth: {
            user: process.env.SMTP_USER!, // Tu username de Mailtrap
            pass: process.env.SMTP_PASSWORD!  // Tu password de Mailtrap
        }
    }
}


// Configuración del transportador de Mailtrap
export const transporter = nodemailer.createTransport(config());