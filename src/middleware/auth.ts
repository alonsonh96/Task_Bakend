import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { IUser, User } from "../models/User";
import { clearAuthCookie } from "../utils/jwt";
import { AppError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/errors";


declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
    id: string;
    // You can add more properties that your token
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) : Promise <void> => {
    try {
        const token = req.cookies?.accessToken
        if (!token) throw new UnauthorizedError('ACCESS_TOKEN_REQUIRED')

        // Verify that JWT_SECRET exists
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not set in environment variables');
            throw new AppError(500, 'MISSING_JWT_SECRET');
        }

        // Verify and decode token
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        if(!decoded.id) throw new UnauthorizedError('INVALID_TOKEN_PAYLOAD')
        
        // Find user in the database
        const user = await User.findById(decoded.id).select('_id name email');
        if(!user) throw new NotFoundError('USER_NOT_FOUND');

        req.user = user
        next()
    } catch (error) {
        // Clean invalid cookie
        clearAuthCookie(res);
        return next(error);
    }
}