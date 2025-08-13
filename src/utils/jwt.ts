import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";

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


// Helper function to set authentication cookies
export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', token, {
    httpOnly: true,           // Prevents access from JavaScript
    secure: isProduction,     // Use HTTPS only in production
    sameSite: 'strict',       // Protection CSRF
    maxAge: 24 * 60 * 60 * 1000, // 24h
    path: '/'                 
  });
};


// Helper function to clear authentication cookies
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};


// Helper function to refresh cookies
export const setRefreshCookie = (res: Response, refreshToken: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh' 
  });
};


// Helper function to clear cookies
export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh'
  })
}