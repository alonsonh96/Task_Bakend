import type { Request, Response } from 'express';
import Token from '../models/Token';
import { User } from '../models/User';
import { checkPassword, hashPassword } from '../utils/auth';
import { CreateAccountDTO } from '../dtos/user.dto';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { clearAuthCookie, clearRefreshCookie, generateAccessToken, generateRefreshToken, setAuthCookie, setRefreshCookie } from '../utils/jwt';
import jwt from "jsonwebtoken"
import { asyncHandler } from '../utils/asyncHandler';
import { AppError, DuplicateError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { sendSuccess } from '../utils/responses';


export class AuthController {

    static createAccount = asyncHandler(async(req : Request, res: Response) => {
            const { name, email, password } : CreateAccountDTO = req.body;

            // Normalize email
            const normalizedEmail = email.toLowerCase().trim();

            // Check for existing user
            const userExists = await User.findOne({ email: normalizedEmail });
            if (userExists) {
                throw new DuplicateError('User already registered with this email')
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Create user instance
            const user = new User({
                name,
                email : normalizedEmail,
                password: hashedPassword,
            });

            // Generate token
            const token = new Token({
                token: generateToken(),
                user: user.id
            })

            // Execute database operations in transaction
            const session = await User.startSession();

            try {
                await session.withTransaction(async () => {
                    await user.save({ session });
                    await token.save({ session });
                })

                // Send confirmation email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                }).catch(error => {
                    // Log error but don't fail the registration
                    console.error('Failed to send confirmation email:', error);
                });

                return sendSuccess(res, 'Account created successfully. Please check your email to confirm your account', 
                    { user: user._id, name: user.name, email: user.email }, 201) 

            } catch (error) {
                throw new AppError('Failed to create account', 500, 'ACCOUNT_CREATION_FAILED')
            } finally {
                await session.endSession();
            }
    })


    static confirmAccount = asyncHandler(async(req: Request, res: Response) => {
            const { token } = req.body

            // Validation: token is required
            if (!token?.trim()) {
                throw new ValidationError('Token is required')
            }
            
            // Find token in database
            const tokenExists = await Token.findOne({token : token.trim()})
            if(!tokenExists) {
                throw new UnauthorizedError('Invalid or expired token')
            }

            // Find user by token
            const user = await User.findById(tokenExists.user)
            if(!user){
                throw new NotFoundError('User not found')
            }

            // Check if user is already confirmed
            if (user.confirmed) {
                // Clean up the token anyway
                await Token.deleteOne({ _id: tokenExists._id });
                return sendSuccess(res, 'Account is already confirmed');
            }

            // Confirm user account using transaction
            const session = await User.startSession();
            try {
                await session.withTransaction(async () => {
                    // Update user confirmation status
                    await User.findByIdAndUpdate(
                        user._id, { confirmed: true }, { session }
                    );

                    // Delete the confirmation token
                    await Token.deleteOne({ _id: tokenExists._id }, { session });
                })

                return sendSuccess(res, 'Account confirmed successfully', {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        confirmed: true
                    }
                });
            } catch (error) {
                throw new AppError('Failed to confirm account', 500, 'CONFIRMATION_FAILED');
            } finally {
                await session.endSession();
            }
    })


    static loginAccount = asyncHandler(async(req: Request, res: Response) => {
            const { email, password } = req.body
            
            if(!email.trim() || !password) throw new ValidationError('Email and password are required')

            // Normalize email and find user (include password field)
            const user = await User.findOne({email: email.toLowerCase().trim()})
            if(!user) throw new NotFoundError('User not found')

            // Validate password first
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) throw new UnauthorizedError('Invalid credentials')

            // Check if account is confirmed
            if (!user.confirmed) {
                await this.checkConfirmationRateLimit(user.id)
                await this.generateAndSendConfirmationToken(user)
                throw new AppError(
                    'Account not confirmed. We have sent a confirmation email',
                    403,
                    'ACCOUNT_NOT_CONFIRMED'
                );
            }

            const accessToken = generateAccessToken({ id: user.id.toString() })
            const refreshToken = generateRefreshToken({ id: user.id.toString() })
            setAuthCookie(res, accessToken)
            setRefreshCookie(res, refreshToken)

            return sendSuccess(res, 'User authenticated successfully',
                {user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        confirmed: user.confirmed
                }}
            )
    })


    static requestConfirmationCode = asyncHandler(async(req: Request, res: Response) => {
            const { email } = req.body

            // Validate email is provided
            if(!email?.trim()) throw new ValidationError('Email is required')

            // Normalize email and find user
            const normalizedEmail = email.toLowerCase().trim();
            const user = await User.findOne({email : normalizedEmail});
            if(!user) throw new NotFoundError('User is not registered')
            
            // Check if user is already confirmed
            if(user.confirmed) throw new AppError('The user is already confirmed', 409, 'ALREADY_CONFIRMED')

            // Check for existing recent token to prevent spam
            await this.checkConfirmationRateLimit(user.id)

            // Clean up old tokens for this user
            await this.generateAndSendConfirmationToken(user)

            return sendSuccess(res, 'A new confirmation code has been sent to your email')
    })


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


    private static generateAndSendConfirmationToken = async (user: any) => {
        // Clean up old tokens for this user
        await Token.deleteMany({ user: user._id });

        // Generate new confirmation token
        const token = new Token({
            user: user._id,
            token: generateToken(),
            createdAt: Date.now()
        });

        await token.save();

        // Send confirmation email (handle errors gracefully)
        try {
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
        } catch (emailError) {
            console.error(`Failed to send confirmation email to ${user.email}:`, emailError);
            // Don't fail the request, but maybe add to a retry queue
            throw new AppError(
                'Token generated but failed to send email. Please try again.',
                500,
                'EMAIL_SEND_FAILED'
            );
        }
    }


    private static checkConfirmationRateLimit = async(userId: any) => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentToken  = await Token.findOne({
            user: userId,
            createdAt: { $gt: fiveMinutesAgo }
        });

        if (recentToken ) throw new AppError(
            'A confirmation code was already sent recently. Please check your email or try again later',
            429,
            'RATE_LIMITED')
    }

    
}