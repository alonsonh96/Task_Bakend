import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";
import { get } from "node:http";

type UserPayload = {
    id: string
}


export const generateAccessToken = ( payload : UserPayload ) => {
    return jwt.sign(
        payload, 
        process.env.JWT_SECRET!, 
        { expiresIn: '24h', algorithm: 'HS256' })
}

export const generateRefreshToken = ( payload : UserPayload ) => {
    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d', algorithm: 'HS256' }
    )
}

// Cookie configuration for cross-domain setup
const getCookieConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        httpOnly: true,
        secure: isProduction, // Must be true in production for sameSite: 'none'
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    }
}


// Helper function to set authentication cookies
export const setAuthCookie = (res: Response, token: string): void => {  
  res.cookie('accessToken', token, {
    ...getCookieConfig(),
    maxAge: 24 * 60 * 60 * 1000, // 24h
    path: '/'                 
  });
};


// Helper function to clear authentication cookies
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie('accessToken', {
    ...getCookieConfig(),
    path: '/'
  });
};


// Helper function to refresh cookies
export const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie('refreshToken', refreshToken, {
    ...getCookieConfig(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh' 
  });
};


// Helper function to clear cookies
export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    ...getCookieConfig(),
    path: '/api/auth/refresh'
  })
}