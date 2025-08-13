import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { IUser, User } from "../models/User";
import { clearAuthCookie } from "../utils/jwt";


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

    const token = req.cookies?.accessToken;
    
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
        return
    }

    // Verify that JWT_SECRET exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET is not set in environment variables');
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        return;
    }

    // Verify and decode token
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        if (!decoded.id) {
            res.status(401).json({
                success: false,
                message: 'Invalid token: missing user information',
                error: 'INVALID_TOKEN_PAYLOAD'
            });
            return;
        }

        // Find user in the database
        const user = await User.findById(decoded.id).select('_id name email').lean();
        if (!user) {
            res.status(403).json({
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            });
            return;
        }

        req.user = user

        next()
    } catch (error) {
        // Clean invalid cookie
        clearAuthCookie(res)

        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
        return
    }
}