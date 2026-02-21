// Rate Limiting Configuration Guide for Bazar Backend

/**
 * RATE LIMITING STRATEGY
 * 
 * This backend implements a multi-tier rate limiting approach to protect against:
 * - Brute force attacks on login/register
 * - Spam and abuse attacks
 * - OTP/Password reset enumeration and brute force
 */

/**
 * RATE LIMITS APPLIED
 * 
 * 1. GENERAL RATE LIMITER (All Routes)
 *    - Limit: 100 requests per 15 minutes per IP
 *    - Purpose: Prevent general abuse and DoS attacks
 *    - Applied globally via app.use(generalLimiter)
 * 
 * 2. AUTH LIMITER (Login & Register)
 *    - Limit: 5 attempts per 15 minutes per IP
 *    - Purpose: Prevent brute force login/registration attacks
 *    - Endpoints: POST /api/auth/login, POST /api/auth/register
 * 
 * 3. PASSWORD RESET REQUEST LIMITER
 *    - Limit: 3 requests per hour per email + IP
 *    - Key: email:ip combination
 *    - Purpose: Prevent spam and email enumeration
 *    - Endpoint: POST /api/auth/request-password-reset
 * 
 * 4. OTP VERIFICATION LIMITER
 *    - Limit: 5 attempts per 15 minutes per email
 *    - Key: email address
 *    - Purpose: Prevent OTP brute force attacks (max 900k attempts per hour)
 *    - Endpoint: POST /api/auth/verify-reset-otp
 * 
 * 5. TOKEN RESET LIMITER
 *    - Limit: 5 attempts per 30 minutes per IP
 *    - Purpose: Prevent reset token abuse
 *    - Endpoint: POST /api/auth/reset-password/:token
 * 
 * 6. CREATE RESOURCE LIMITER
 *    - Limit: 10 requests per minute per IP
 *    - Purpose: Prevent spam/bulk resource creation
 *    - Available for: POST endpoints (product creation, review creation, etc.)
 */

/**
 * SECURITY FEATURES
 * 
 * - IP Detection: Uses X-Forwarded-For header for proxy setups
 * - Standardized Headers: Includes RateLimit-* headers in responses
 * - Custom Messages: User-friendly error messages for rate limited requests
 * - HTTP 429 Status: Proper HTTP status code for rate limiting
 * - Combination Keys: Uses email+IP for password reset to prevent enumeration
 */

/**
 * PROXY CONFIGURATION
 * 
 * If behind a proxy (nginx, CloudFlare, etc.), ensure:
 * - app.set('trust proxy', 1) is set in your Express app
 * - X-Forwarded-For header is properly forwarded by the proxy
 * 
 * Already handled in rateLimiter.middleware.ts by checking X-Forwarded-For header
 */

/**
 * MONITORING & ALERTS
 * 
 * Recommended: Add logging for rate limit hits
 * Example: Log when users hit rate limits to detect attack patterns
 */

/**
 * TESTING RATE LIMITS
 * 
 * Test login throttling:
 * for i in {1..6}; do curl -X POST http://localhost:5050/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@test.com","password":"wrong"}'; done
 * 
 * Expected: 6th request returns 429 Too Many Requests
 */

export {};
