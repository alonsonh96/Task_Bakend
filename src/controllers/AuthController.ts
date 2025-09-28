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
import { AppError, DuplicateError, ForbiddenError, NotFoundError, UnauthorizedError, UnprocessableEntityError, ValidationError } from '../utils/errors';
import { sendSuccess } from '../utils/responses';


export class AuthController {

    static createAccount = asyncHandler(async(req : Request, res: Response) => {
            const { name, email, password } : CreateAccountDTO = req.body;
            if(!name.trim() || !email.trim() || !password.trim()) throw new ValidationError('VALIDATION_REQUIRED_FIELDS')

            // Normalize email
            const normalizedEmail = email.toLowerCase().trim();

            // Check for existing user
            const userExists = await User.findOne({ email: normalizedEmail });
            if (userExists) {
                throw new DuplicateError('EMAIL_ALREADY_REGISTERED')
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

                return sendSuccess(res, 'USER_CREATED', 
                    { user: user._id, name: user.name, email: user.email }, 201) 

            } catch (error) {
                throw new AppError(500, 'ACCOUNT_CREATION_FAILED')
            } finally {
                await session.endSession();
            }
    })


    static confirmAccount = asyncHandler(async(req: Request, res: Response) => {
            const { token } = req.body

            // Validation: token is required
            if (!token?.trim()) {
                throw new ValidationError('VALIDATION_REQUIRED_TOKEN')
            }
            
            // Find token in database
            const tokenExists = await Token.findOne({token : token.trim()})
            if(!tokenExists) {
                throw new UnauthorizedError('INVALID_OR_EXPIRED_TOKEN')
            }

            // Find user by token
            const user = await User.findById(tokenExists.user)
            if(!user){
                throw new NotFoundError('CONFIRMATION_USER_NOT_FOUND')
            }

            // Check if user is already confirmed
            if (user.confirmed) {
                // Clean up the token anyway
                await Token.deleteOne({ _id: tokenExists._id });
                return sendSuccess(res, 'ACCOUNT_ALREADY_CONFIRMED');
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

                return sendSuccess(res, 'ACCOUNT_CONFIRMED', {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        confirmed: true
                    }
                });
            } catch (error) {
                throw new AppError(500, 'CONFIRMATION_FAILED');
            } finally {
                await session.endSession();
            }
    })


    static loginAccount = asyncHandler(async(req: Request, res: Response) => {
            const { email, password } = req.body
            
            if(!email.trim() || !password) throw new ValidationError('LOGIN_REQUIRED_FIELDS')

            // Normalize email and find user (include password field)
            const user = await User.findOne({email: email.toLowerCase().trim()})
            if(!user) throw new NotFoundError('USER_NOT_FOUND')

            // Validate password first
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect) throw new UnauthorizedError('INVALID_CREDENTIALS')

            // Check if account is confirmed
            if (!user.confirmed) {
                await this.checkConfirmationRateLimit(user.id)
                await this.generateAndSendConfirmationToken(user, AuthEmail.sendConfirmationEmail)
                
                throw new AppError(403,'ACCOUNT_NOT_CONFIRMED');
            }

            const accessToken = generateAccessToken({ id: user.id.toString() })
            const refreshToken = generateRefreshToken({ id: user.id.toString() })
            setAuthCookie(res, accessToken)
            setRefreshCookie(res, refreshToken)

            return sendSuccess(res, 'LOGIN_SUCCESS',
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
            if(!email?.trim()) throw new ValidationError('VALIDATION_REQUIRED_EMAIL')

            // Normalize email and find user
            const normalizedEmail = email.toLowerCase().trim();
            const user = await User.findOne({email : normalizedEmail});
            if(!user) throw new NotFoundError('USER_NOT_REGISTERED')
            
            // Check if user is already confirmed
            if(user.confirmed) throw new AppError(409, 'ALREADY_CONFIRMED')

            // Check for existing recent token to prevent spam
            await this.checkConfirmationRateLimit(user.id)

            // Clean up old tokens for this user
            await this.generateAndSendConfirmationToken(user, AuthEmail.sendConfirmationEmail)

            return sendSuccess(res, 'CONFIRMATION_CODE_SENT')
    })


    static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
            const { email } = req.body

            if(!email?.trim()) throw new ValidationError('FORGOT_REQUIRED_EMAIL')

            // Normalize email and find user
            const normalizedEmail = email.toLowerCase().trim();
            const user = await User.findOne({ email: normalizedEmail });
            if (!user) return sendSuccess(res, 'PASSWORD_RESET_GENERIC');

            // Check for existing recent token to prevent spam
            await this.checkConfirmationRateLimit(user.id)
            await this.generateAndSendConfirmationToken(user, AuthEmail.sendPasswordResetToken)
 
            return sendSuccess(res, 'PASSWORD_RESET_GENERIC');
    })


    static validateToken = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.body
        // Validation: token is required
        if(!token.trim()) throw new ValidationError('VALIDATION_REQUIRED_FIELDS')

        // Find token in BD
        const tokenExists = await Token.findOne({ token })
        if (!tokenExists) throw new AppError(401, 'INVALID_OR_EXPIRED_TOKEN');

        return sendSuccess(res, 'VALID_TOKEN', {
            tokenValid: true,
            user: tokenExists.user
        })
    })


    static updatePasswordWithToken = asyncHandler(async (req: Request, res: Response) => {
            const { token } = req.params
            const { password } = req.body

            if(!token.trim()) throw new ValidationError('RESET_REQUIRED_TOKEN')
            if(!password.trim()) throw new ValidationError('VALIDATION_REQUIRED_FIELDS')

            // Find token in BD
            const tokenExists = await Token.findOne({token})
            if(!tokenExists) throw new AppError(401, 'INVALID_OR_EXPIRED_TOKEN')

            // Find user associated with the token
            const user = await User.findById({ _id: tokenExists.user })
            if(!user) throw new NotFoundError('RESET_USER_NOT_FOUND')
            // Hash the new password
            const hashedPassword = await hashPassword(password)

            const session = await User.startSession()
            try {
                await session.withTransaction(async () => {
                    // Update user password
                    await User.findByIdAndUpdate(user.id, {password: hashedPassword}, { session, runValidators: true })
                    // Delete ALL password reset tokens for this user (security)
                    await Token.deleteMany({ user: user._id }, { session })
                })

                return sendSuccess(res, 
                    'PASSWORD_UPDATED', {
                        user: {
                            id: user._id,
                            email: user.email,
                            name: user.name
                        }
                    })
            } catch (error) {
                console.error('Error updating password:', error);
                throw new AppError(500, 'PASSWORD_UPDATE_FAILED');
            } finally {
                await session.endSession()
            }
    })


    static refreshToken = asyncHandler(async(req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if(!refreshToken) throw new UnauthorizedError('REFRESH_TOKEN_REQUIRED')
            
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string }
            if (!decoded.id) throw new ForbiddenError('INVALID_REFRESH_TOKEN')

            // Verify that the user still exists
            const user = await User.findById(decoded.id).select('_id name email').lean();
            if (!user) throw new NotFoundError('USER_NOT_FOUND');

            // Generate BOTH new tokens (token rotation)
            const newAccessToken = generateAccessToken({ id: decoded.id });
            const newRefreshToken = generateRefreshToken({ id: decoded.id });

            // Set both cookies
            setAuthCookie(res, newAccessToken);
            setRefreshCookie(res, newRefreshToken);

            return sendSuccess(res, 'TOKEN_REFRESH_SUCCESS', {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            })
        } catch (error) {
            //Clean invalid cookies
            clearAuthCookie(res)
            clearRefreshCookie(res)
            throw error;
        }
    })


    static getUser = asyncHandler(async(req: Request, res: Response) => {
        return sendSuccess(res, 'USER_FETCH_SUCCESS', req.user)
    })


    static logoutUser = asyncHandler(async(req: Request, res: Response) => {
        clearAuthCookie(res)
        clearRefreshCookie(res)

        return sendSuccess(res, 'LOGOUT_SUCCESS')
    })


    private static generateAndSendConfirmationToken = async (
        user: any,
        emailFn: (params: { email: string, name: string, token: string }) => Promise<void>
    ) => {
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
            await emailFn({
                email: user.email,
                name: user.name,
                token: token.token
            });
        } catch (emailError) {
            console.error(`Failed to send confirmation email to ${user.email}:`, emailError);
            // Don't fail the request, but maybe add to a retry queue
            throw new AppError(
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
            429,
            'RATE_LIMITED')
    }


    static updateProfile = asyncHandler(async(req: Request, res: Response) => {
        const { name, email } = req.body
        // Normalize email
            const normalizedEmail = email.toLowerCase().trim();

        // Check who changed the email, whether it is the same user or another
        const userExists = await User.findOne({ email: normalizedEmail });  
        if(userExists && userExists._id.toString() !== req.user._id.toString()) throw new DuplicateError('EMAIL_ALREADY_IN_USE')

        req.user.name = name
        req.user.email = normalizedEmail
        await req.user.save()

        return sendSuccess(res, 'PROFILE_UPDATED')
    })

    static updateCurrentUserPassword = asyncHandler(async(req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user._id)
        if (!user) throw new NotFoundError('USER_NOT_FOUND')

        // Verify current password
        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect) throw new UnauthorizedError('INCORRECT_CURRENT_PASSWORD')

        // Verify that the new password is different
        const isSamePassword = await checkPassword(password, user.password)
        if (isSamePassword) throw new UnprocessableEntityError('PASSWORD_MUST_BE_DIFFERENT');

        // Update password
        user.password = await hashPassword(password)
        await user.save()

        clearAuthCookie(res);
        clearRefreshCookie(res);

        sendSuccess(res, 'PASSWORD_CHANGED')
    })
    
}