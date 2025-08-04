import type { Request, Response } from 'express';
import { User } from '../models/User';
import { hashPassword } from '../utils/auth';
import { CreateAccountDTO } from '../dtos/user.dto';


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

            await user.save();
            res.status(201).json({ message: 'User created successfully, review email to confirm your account.' });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}