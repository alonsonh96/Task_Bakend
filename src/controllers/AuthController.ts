import type { Request, Response } from 'express';
import Token from '../models/Token';
import { User } from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { CreateAccountDTO } from '../dtos/user.dto';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { clearAuthCookie, clearRefreshCookie, generateAccessToken, generateRefreshToken, setAuthCookie, setRefreshCookie } from '../utils/jwt';
import jwt from "jsonwebtoken"


export class AuthController {

    static createAccount = async (req : Request, res: Response) => {
        try {
            const { name, email, password } : CreateAccountDTO = req.body;

            // Check for existing user
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(409).json({ message: 'User already registered' });
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
                return res.status(400).json({ message: 'Token is required' });
            } 
            
            // Find token in BD
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }

            // Confirm user
            const user = await User.findById(tokenExists.user)
            if(!user){
               return res.status(404).json({ message: 'User not found' });
            }
            user.confirmed = true

            await Promise.allSettled([user.save(), Token.deleteOne({_id:tokenExists.id})])

            return res.status(200).json({ message: 'Account confirmed successfully' });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }



    static loginAccount = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            
            const user = await User.findOne({email})
            if(!user) return res.status(404).json({ message : 'User not found' });

            // Verify if the account is confirmed
            if (!user.confirmed) {
                let token = await Token.findOne({ user: user.id });

                if (!token) {
                    token = new Token({
                        user: user.id,
                        token: generateToken(),
                        createdAt: Date.now()
                    });
                    await token.save()
                }

                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                }).catch(error => {console.error(`Error sending confirmation email to ${user.email}`, error)})

                return res.status(403).json({ message: 'Account not confirmed. We have sent a confirmation email' })
            }

            // Validate the password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) return res.status(401).json({ error: 'Password incorrect'})

            const accessToken = generateAccessToken({ id: user.id.toString() })
            const refreshToken = generateRefreshToken({ id: user.id.toString() })
            setAuthCookie(res, accessToken)
            setRefreshCookie(res, refreshToken)

            return res.status(201).json({
                success: true,
                message: 'User autenticated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            clearAuthCookie(res)
            return res.status(500).json({ message: 'Internal server error' });
        }
    }


    static requestConfirmationCode = async(req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Email exists
            if (!email) return res.status(404).json({ message: 'Email is required'});

            // Check if user exists
            const user = await User.findOne({email});
            if(!user) return res.status(404).json({message: 'User is not registered'})
            
            // Check if user is already confirmed
            if(user.confirmed) return res.status(409).json({message: 'The user is already confirmed'}) 

            // Check for existing recent token to prevent spam
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existingToken = await Token.findOne({ 
                user: user.id,
                createdAt: { $gt: fiveMinutesAgo }
            });

            if (existingToken) return res.status(429).json({ message : 
                'A confirmation code was already sent recently. Please check your email or try again later.'}
            );

            // Clean up old tokens for this user
            await Token.deleteMany({ user: user.id });

            // Generate token
            const token = new Token({
                token: generateToken(),
                user: user.id
            })

            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            return res.status(200).json({ message: 'A new token has been sent' });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }



    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Email exists
            if (!email) return res.status(404).json({ message: 'Email is required' });

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User is not registered' })

            // Check for existing recent token to prevent spam
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const existingToken = await Token.findOne({ 
                user: user.id,
                createdAt: { $gt: fiveMinutesAgo }
            });

            if (existingToken) return res.status(429).json({ message : 
                'A confirmation code was already sent recently. Please check your email or try again later.'}
            );

            // Clean up old tokens for this user
            await Token.deleteMany({ user: user.id });

            // Generate token
            const token = new Token({
                token: generateToken(),
                user: user.id
            })

            await token.save()

            // Send password reset email (handle errors gracefully)
            try {
                await AuthEmail.sendPasswordResetToken({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });
            } catch (emailError) {
                console.error('Failed to send password reset email:', emailError);
                return res.status(500).json({
                    error: 'Failed to send password reset email'
                });
            }   

            return res.status(200).json({ message: 'Check your email for instructions' });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }



    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            // Validation: token is required
            if (!token) {
                return res.status(400).json({ message: 'Token is required' });
            } 
            
            // Find token in BD
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) {
                return res.status(404).json({ message: 'Invalid or expired token' });
            }

            return res.status(200).json({ message: 'Valid token, set your new password' });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body

            // Validation: token is required
            if (!token) return res.status(400).json({ message: 'Token is required' });

            // Find token in BD
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) return res.status(404).json({ message: 'Invalid or expired token' });

            const user = await User.findById({ _id: tokenExists.user })
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            return res.status(200).json({ message: 'Password update successfully' });

        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    static refreshToken = async(req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if(!refreshToken) return res.status(401).json({ message: 'Refresh token required'})
            
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string }
            if (!decoded.id) {
                clearAuthCookie(res);
                clearRefreshCookie(res);

                return res.status(403).json({
                    success: false,
                    message: 'Update invalid token: missing user information',
                    error: 'INVALID_REFRESH_PAYLOAD'
                });
            }

            // Verify that the user still exists
            const user = await User.findById(decoded.id).select('_id name email').lean();
            if (!user) {
                // Clean invalid cookies
                clearAuthCookie(res);
                clearRefreshCookie(res);

                res.status(403).json({
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                });
                return;
            }

            // 🔄 IMPORTANT: Generate BOTH new tokens (token rotation)
            const newAccessToken = generateAccessToken({ id: decoded.id });
            const newRefreshToken = generateRefreshToken({ id: decoded.id });

            // Set both cookies
            setAuthCookie(res, newAccessToken);
            setRefreshCookie(res, newRefreshToken);

            return res.status(200).json({
                success: true,
                message: 'Access token refreshed',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            //Clean invalid cookies
            clearAuthCookie(res)
            clearRefreshCookie(res)

            // Diferent error types of JWT
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid refresh token',
                    error: 'INVALID_TOKEN'
                });
            }

            if (error instanceof jwt.TokenExpiredError) {
                return res.status(403).json({
                    success: false,
                    message: 'Refresh token expired',
                    error: 'TOKEN_EXPIRED'
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR'
            });
        }
    }

    
}