import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error occurred', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Handle custom application errors
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            error: error.errorCode
        });
    }

    // Handle MongoDB specific errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data provided',
            error: 'VALIDATION_ERROR'
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'User already registered with this email',
            error: 'DUPLICATE_EMAIL'
        });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: 'INVALID_TOKEN'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            error: 'TOKEN_EXPIRED'
        });
    }

    // Handle bcrypt errors
    if (error.message?.includes('bcrypt')) {
        return res.status(500).json({
            success: false,
            message: 'Error processing account data',
            error: 'PASSWORD_HASH_ERROR'
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
    });
}