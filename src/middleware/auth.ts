import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import { IUser, User } from "../models/User";


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
            message: 'Token de acceso requerido'
        });
        return
    }

    // Verify that JWT_SECRET exists
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET no está configurado en las variables de entorno');
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
        return;
    }

    // Verify and decode token
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        if (!decoded.id) {
            res.status(403).json({
                success: false,
                message: 'Token inválido: falta información del usuario',
                error: 'INVALID_TOKEN_PAYLOAD'
            });
            return;
        }

        // Find user in the database
        const user = await User.findById(decoded.id).select('_id name email').lean();
        if (!user) {
            res.status(403).json({
                success: false,
                message: 'Usuario no encontrado',
                error: 'USER_NOT_FOUND'
            });
            return;
        }

        req.user = user

        next()
    } catch (error) {
        // Clean invalid cookie
        clearAuthCookie(res)

        res.status(403).json({
            success: false,
            message: 'Token inválido o expirado'
        });
        return
    }
}


// Función helper para establecer cookies de autenticación
export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', token, {
    httpOnly: true,           // Previene acceso desde JavaScript
    secure: isProduction,     // Solo HTTPS en producción
    sameSite: 'strict',       // Protección CSRF
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/'                 // Disponible en toda la app
  });
};


// Función helper para limpiar cookies de autenticación
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};


// Middleware adicional para refresh tokens (opcional)
export const setRefreshCookie = (res: Response, refreshToken: string): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    path: '/auth/refresh' // Solo disponible en endpoint de refresh
  });
};