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
            statusCode: error.statusCode,
            messageCode: error.messageCode,   
        });
    }

    // Handle MongoDB specific errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            statusCode: error.statusCode,
            messageCode: 'VALIDATION_ERROR'
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            statusCode: error.statusCode,
            messageCode: 'DUPLICATE_EMAIL'
        });
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            statusCode: error.statusCode,
            messageCode: 'INVALID_TOKEN'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            statusCode: error.statusCode,
            messageCode: 'TOKEN_EXPIRED'
        });
    }

    // Handle bcrypt errors
    if (error.message?.includes('bcrypt')) {
        return res.status(500).json({
            success: false,
            statusCode: error.statusCode,
            messageCode: 'Error processing account data',
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        statusCode: error.statusCode,
        messageCode: 'INTERNAL_ERROR',
    });
}