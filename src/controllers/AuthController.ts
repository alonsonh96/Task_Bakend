import type { Request, Response } from 'express';
import { User } from '../models/User';
import { hashPassword } from '../utils/auth';
import { CreateAccountDTO } from '../dtos/user.dto';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';



export class AuthController {

    static createAccount = async (req : Request, res: Response) => {
        try {
            const { name, email, password } : CreateAccountDTO = req.body;

            // Check for existing user
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(409).json({ error: 'User already registered' });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create user
            const user = new User({
                name,
                email,
                password: hashedPassword,
            });

            // Generate token
            const token = new Token({
                token: generateToken(),
                user: user.id
            })

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save() ])

            res.status(201).json({ message: 'User created successfully, review email to confirm your account.' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            // Validation: token is required
            if (!token) {
                return res.status(400).json({ error: 'Token is required' });
            }
            
            // Find token in BD
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            // Confirm user
            const user = await User.findById(tokenExists.user)
            if(!user){
               return res.status(404).json({ error: 'User not found' });
            }
            user.confirmed = true

            await Promise.allSettled([user.save(), Token.deleteOne({_id:tokenExists.id})])

            return res.status(200).json({ message: 'Account confirmed successfully' });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }

}