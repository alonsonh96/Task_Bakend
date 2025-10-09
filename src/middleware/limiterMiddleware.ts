import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/errors';


const RATE_LIMIT_CONFIG = {
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        messageCode: 'AUTH_RATE_LIMITED'
    },
    password: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3,
        messageCode: 'PASSWORD_RATE_LIMITED'
    },
    profile: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5,
        messageCode: 'PROFILE_RATE_LIMITED'
    }
}


// Factory function to create consistent limits
function createRateLimiter(name: string, options: any){
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        keyGenerator: (req, res) => ipKeyGenerator(req.ip),
        message: options.messageCode,
        standardHeaders: true,
        legacyHeaders: false,

        handler: (req, res, next) => {
            next(new TooManyRequestsError(options.messageCode))
        },
    })
}

export const authLimiter = createRateLimiter('auth', RATE_LIMIT_CONFIG.auth)
export const passwordChangeLimiter = createRateLimiter('password', RATE_LIMIT_CONFIG.password);
export const profileUpdateLimiter = createRateLimiter('profile', RATE_LIMIT_CONFIG.profile);