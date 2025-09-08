import rateLimit, { ipKeyGenerator } from 'express-rate-limit';


const RATE_LIMIT_CONFIG = {
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        message: { error: 'Too many authentication attempts. Try again in 15 minutes.' }
    },
    password: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3,
        message: { error: 'Too many password change attempts. Try again in an hour.' }
    },
    profile: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5,
        message: { error: 'Too many profile updates. Try again in an hour.' }
    }
}


// Factory function to create consistent limits
function createRateLimiter(name: string, options: any){
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        keyGenerator: (req, res) => ipKeyGenerator(req.ip),
        message: options.message,
        standardHeaders: true,
        legacyHeaders: false,
    })
}

export const authLimiter = createRateLimiter('auth', RATE_LIMIT_CONFIG.auth)
export const passwordChangeLimiter = createRateLimiter('password', RATE_LIMIT_CONFIG.password);
export const profileUpdateLimiter = createRateLimiter('profile', RATE_LIMIT_CONFIG.profile);