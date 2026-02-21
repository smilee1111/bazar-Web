import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General rate limiter - 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req: Request) => {
        // Skip rate limiting for health check endpoint
        return req.path === '/';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});

// Auth limiter - 5 attempts per 15 minutes per IP (login, register)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 attempts per windowMs
    message: 'Too many login/registration attempts, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count successful requests too
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many login/registration attempts. Please try again after 15 minutes.'
        });
    }
});

// Password reset request limiter - 3 requests per hour per email + IP
export const passwordResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: 'Too many password reset requests, please try again after 1 hour.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use email + IP as the key to prevent abuse per email address
        const email = (req.body?.email || '').toLowerCase();
        const forwarded = req.headers['x-forwarded-for'];
        const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.ip || 'unknown';
        return `${email}:${ip}`;
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many password reset requests. Please try again after 1 hour.'
        });
    }
});

// OTP verification limiter - 5 attempts per 15 minutes per email
export const otpVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each email to 5 OTP verification attempts
    message: 'Too many OTP verification attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use email as the key for OTP attempts
        return (req.body?.email || '').toLowerCase();
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many OTP verification attempts. Please request a new OTP after 15 minutes.'
        });
    }
});

// Token-based reset limiter - 5 attempts per 30 minutes (by IP)
export const tokenResetLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // limit each IP to 5 token reset attempts
    message: 'Too many password reset attempts. Please try again after 30 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many password reset attempts. Please try again after 30 minutes.'
        });
    }
});

// Strict limiter for creating resources (prevents spam creation)
export const createResourceLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per minute
    message: 'Too many requests to create resources, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.'
        });
    }
});
