import { Response } from 'express';

export const sendSuccess = (
    res: Response, 
    message: string, 
    data: any = null, 
    statusCode: number = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data && { data })
    });
};