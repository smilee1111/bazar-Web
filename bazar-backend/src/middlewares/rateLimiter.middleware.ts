import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General rate limiter - 500 requests per 15 minutes per IP
// This allows normal browsing (GET requests) while still protecting against abuse
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
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

// Read-only limiter for GET requests - more generous for browsing
export const readLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 300, // 300 GET requests per 5 minutes (60 per minute avg)
    message: 'Too many requests, please slow down.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        // Only apply to GET requests, skip others
        return req.method !== 'GET' || req.path === '/';
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});

// Write operations limiter - stricter for POST/PUT/DELETE/PATCH
export const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 write operations per 15 minutes
    message: 'Too many write requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
        // Only apply to write operations
        const writeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        return !writeMethods.includes(req.method) || req.path === '/';
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

// Password reset request limiter - 3 requests per hour per email
export const passwordResetRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each email to 3 password reset requests per hour
    message: 'Too many password reset requests, please try again after 1 hour.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        // Use email as the key to prevent abuse per email address
        // IP-based limiting is already handled by generalLimiter
        const email = (req.body?.email || 'no-email').toLowerCase();
        return `pwd-reset:${email}`;
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
