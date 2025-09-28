import { Response } from 'express';

export const sendSuccess = (
    res: Response, 
    messageCode:string,
    data: any = null, 
    statusCode: number = 200
) => {
    return res.status(statusCode).json({
        success: true,
        messageCode,
        statusCode,
        ...(data && { data })
    });
};