import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string
    name: string
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async ( user : IEmail ) => {
        const info = await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email, 
            subject: 'UpTask - Account confirm',
            text: 'UpTask - Confirm your account',
            html: `<p>Hola: ${user.name}, has creado en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
                   <p>Visita el siguiente enlance :</p>
                   <a href="">Confirmar cuenta</a>
                   <p>Ingresa el codigo : <b>${user.token}</b> </p>
                   <p>Este token expira en 10 minutos</p>`
        })
        console.log('Mensaje enviado', info.messageId)
    }

}