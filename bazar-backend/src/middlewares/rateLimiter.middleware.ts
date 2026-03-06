import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Request, Response, NextFunction } from 'express';

const isTestEnv = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

type LimiterOptions = {
  points: number;
  duration: number;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  onLimit?: (req: Request, res: Response) => void;
};

function createRateLimiter(options: LimiterOptions) {
  const limiter = new RateLimiterMemory({
    points: options.points,
    duration: options.duration,
  });

  return (req: Request, res: Response, next: NextFunction) => {
    if (options.skip && options.skip(req)) return next();
    const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || 'unknown');
    limiter.consume(key)
      .then(() => next())
      .catch(() => {
        if (options.onLimit) return options.onLimit(req, res);
        res.status(429).json({ success: false, message: 'Too many requests.' });
      });
  };
}

// General rate limiter - 500 requests per 15 minutes per IP
export const generalLimiter = createRateLimiter({
  points: 500,
  duration: 15 * 60,
  skip: (req) => isTestEnv || req.path === '/',
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes.',
    });
  },
});

// Read-only limiter for GET requests - more generous for browsing
export const readLimiter = createRateLimiter({
  points: 300,
  duration: 5 * 60,
  skip: (req) => isTestEnv || req.method !== 'GET' || req.path === '/',
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

// Write operations limiter - stricter for POST/PUT/DELETE/PATCH
export const writeLimiter = createRateLimiter({
  points: 50,
  duration: 15 * 60,
  skip: (req) => {
    const writeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    return isTestEnv || !writeMethods.includes(req.method) || req.path === '/';
  },
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

// Auth limiter - 5 attempts per 15 minutes per IP (login, register)
export const authLimiter = createRateLimiter({
  points: 5,
  duration: 15 * 60,
  skip: () => isTestEnv,
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login/registration attempts. Please try again after 15 minutes.',
    });
  },
});

// Password reset request limiter - 3 requests per hour per email
export const passwordResetRequestLimiter = createRateLimiter({
  points: 3,
  duration: 60 * 60,
  keyGenerator: (req) => `pwd-reset:${(req.body?.email || 'no-email').toLowerCase()}`,
  skip: () => isTestEnv,
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests. Please try again after 1 hour.',
    });
  },
});

// OTP verification limiter - 5 attempts per 15 minutes per email
export const otpVerificationLimiter = createRateLimiter({
  points: 5,
  duration: 15 * 60,
  keyGenerator: (req) => (req.body?.email || '').toLowerCase(),
  skip: () => isTestEnv,
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many OTP verification attempts. Please request a new OTP after 15 minutes.',
    });
  },
});

// Token-based reset limiter - 5 attempts per 30 minutes (by IP)
export const tokenResetLimiter = createRateLimiter({
  points: 5,
  duration: 30 * 60,
  skip: () => isTestEnv,
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again after 30 minutes.',
    });
  },
});

// Strict limiter for creating resources (prevents spam creation)
export const createResourceLimiter = createRateLimiter({
  points: 10,
  duration: 60,
  skip: () => isTestEnv,
  onLimit: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});