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

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

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
        res.status(403).json({
            success: false,
            message: 'Token inválido o expirado'
        });
        return
    }
}