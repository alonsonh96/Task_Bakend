import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';


export const handleInputErrors = (req:Request, res:Response, next:NextFunction) => {
    let errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        throw new ValidationError('VALIDATION_ERROR', errors.array())
    }
    next();
}