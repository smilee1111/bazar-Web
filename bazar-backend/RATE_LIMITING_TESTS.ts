/**
 * RATE LIMITING TEST GUIDE
 * 
 * This file shows how to test the rate limiting implementation
 * Run these commands from your terminal to verify rate limiting is working
 */

/**
 * ========== TEST 1: LOGIN RATE LIMITING ==========
 * Test: Attempt to login 6 times (limit is 5 per 15 minutes)
 * Expected: 6th request should return 429 Too Many Requests
 */

// PowerShell script to test login rate limiting
/*
for ($i=1; $i -le 6; $i++) {
    Write-Host "Attempt $i..."
    $body = @{
        email = "test@example.com"
        password = "wrongpassword"
    } | ConvertTo-Json
    
    Invoke-WebRequest -Uri "http://localhost:5050/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body | Select-Object StatusCode
    
    Start-Sleep -Milliseconds 500
}
*/

// Curl equivalent (bash/git bash)
/*
for i in {1..6}; do
    echo "Attempt $i..."
    curl -X POST http://localhost:5050/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"wrong"}' \
        -w "\nStatus: %{http_code}\n\n"
    sleep 0.5
done
*/

/**
 * ========== TEST 2: REGISTER RATE LIMITING ==========
 * Test: Same 5/15min limit as login
 */

/*
for i in {1..6}; do
    echo "Attempt $i..."
    curl -X POST http://localhost:5050/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "fullName":"Test User",
            "email":"test'$i'@example.com",
            "phoneNumber":"123456789'$i'",
            "username":"testuser'$i'",
            "password":"password123",
            "confirmPassword":"password123",
            "role":"user"
        }' \
        -w "\nStatus: %{http_code}\n\n"
    sleep 0.5
done
*/

/**
 * ========== TEST 3: PASSWORD RESET REQUEST RATE LIMITING ==========
 * Test: Limit is 3 requests per hour per email+IP combination
 */

/*
for i in {1..4}; do
    echo "Attempt $i..."
    curl -X POST http://localhost:5050/api/auth/request-password-reset \
        -H "Content-Type: application/json" \
        -d '{"email":"user@example.com","clientType":"web"}' \
        -w "\nStatus: %{http_code}\n\n"
    sleep 0.5
done
*/

/**
 * ========== TEST 4: OTP VERIFICATION RATE LIMITING ==========
 * Test: Limit is 5 attempts per 15 minutes per email
 */

/*
for i in {1..6}; do
    echo "Attempt $i..."
    curl -X POST http://localhost:5050/api/auth/verify-reset-otp \
        -H "Content-Type: application/json" \
        -d '{"email":"user@example.com","otp":"123456","newPassword":"newpass123","confirmPassword":"newpass123"}' \
        -w "\nStatus: %{http_code}\n\n"
    sleep 0.5
done
*/

/**
 * ========== TEST 5: VERIFY RATE LIMIT HEADERS ==========
 * Check that the response includes rate limit headers
 */

/*
curl -X POST http://localhost:5050/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -i  # Shows all headers

# Look for response headers like:
# RateLimit-Limit: 5
# RateLimit-Remaining: 4
# RateLimit-Reset: 1234567890
*/

/**
 * ========== EXPECTED RESPONSES ==========
 * 
 * When rate limit is hit (429 Too Many Requests):
 * {
 *   "success": false,
 *   "message": "Too many login/registration attempts. Please try again after 15 minutes."
 * }
 * 
 * With rate limit headers:
 * RateLimit-Limit: 5
 * RateLimit-Remaining: 0
 * RateLimit-Reset: 1613923200
 */

/**
 * ========== MONITORING RATE LIMITS ==========
 * 
 * To monitor rate limit hits in your logs:
 * 1. Check req.rateLimit object for current limits
 * 2. Log when status is 429
 * 3. Alert if same IP hits limits multiple times
 */

export {};
