// Rate Limiting Configuration Guide for HaatKhoj Backend

/**
 * RATE LIMITING STRATEGY
 * 
 * This backend implements a multi-tier rate limiting approach to protect against:
 * - Brute force attacks on login/register
 * - Spam and abuse attacks
 * - OTP/Password reset enumeration and brute force
 * - DDoS and automated scraping
 * 
 * The system uses TIERED rate limiting:
 * - Generous limits for read operations (browsing)
 * - Moderate limits for write operations
 * - Strict limits for authentication endpoints
 */

/**
 * RATE LIMITS APPLIED
 * 
 * TIER 1: BASE PROTECTION (Applied to all routes)
 * 
 * 1. GENERAL RATE LIMITER
 *    - Limit: 500 requests per 15 minutes per IP
 *    - Purpose: Overall traffic cap, prevents aggressive abuse
 *    - Applied globally via app.use(generalLimiter)
 * 
 * 2. READ LIMITER (GET requests only)
 *    - Limit: 300 requests per 5 minutes per IP (~60 per minute)
 *    - Purpose: Allow normal browsing while preventing scraping
 *    - Applied to: All GET requests
 *    - Note: Skips non-GET methods
 * 
 * 3. WRITE LIMITER (POST/PUT/DELETE/PATCH)
 *    - Limit: 50 requests per 15 minutes per IP
 *    - Purpose: Prevent spam and resource abuse
 *    - Applied to: All write operations
 *    - Note: Skips GET requests
 * 
 * TIER 2: AUTHENTICATION PROTECTION
 * 
 * 4. AUTH LIMITER (Login & Register)
 *    - Limit: 5 attempts per 15 minutes per IP
 *    - Purpose: Prevent brute force login/registration attacks
 *    - Endpoints: POST /api/auth/login, POST /api/auth/register
 * 
 * 5. PASSWORD RESET REQUEST LIMITER
 *    - Limit: 3 requests per hour per email + IP
 *    - Key: email:ip combination
 *    - Purpose: Prevent spam and email enumeration
 *    - Endpoint: POST /api/auth/request-password-reset
 * 
 * 6. OTP VERIFICATION LIMITER
 *    - Limit: 5 attempts per 15 minutes per email
 *    - Key: email address
 *    - Purpose: Prevent OTP brute force attacks
 *    - Endpoint: POST /api/auth/verify-reset-otp
 * 
 * 7. TOKEN RESET LIMITER
 *    - Limit: 5 attempts per 30 minutes per IP
 *    - Purpose: Prevent reset token abuse
 *    - Endpoint: POST /api/auth/reset-password/:token
 * 
 * TIER 3: RESOURCE CREATION PROTECTION
 * 
 * 8. CREATE RESOURCE LIMITER
 *    - Limit: 10 requests per minute per IP
 *    - Purpose: Prevent spam/bulk resource creation
 *    - Available for: POST endpoints (reviews, shops, etc.)
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
 * Test auth limiter (should hit limit on 6th request):
 * for i in {1..6}; do curl -X POST http://localhost:5050/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@test.com","password":"wrong"}'; done
 * 
 * Test read limiter (should allow normal browsing):
 * for i in {1..50}; do curl http://localhost:5050/api/shops/public; done
 * 
 * Expected results:
 * - Auth: 6th request returns 429 Too Many Requests
 * - Read: All 50 requests succeed (well within 300/5min limit)
 */

export {};
