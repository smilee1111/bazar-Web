/**
 * API REFERENCE FOR PASSWORD RESET - MOBILE (FLUTTER)
 * 
 * This file documents the exact API endpoints and request/response formats
 * that the Flutter mobile app should use for password reset functionality.
 */

// ============================================
// ENDPOINT 1: REQUEST PASSWORD RESET (OTP)
// ============================================
/*
REQUEST:
POST https://your-backend.com/api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "clientType": "mobile"    <-- IMPORTANT: This tells backend to send OTP, not link
}

RESPONSE (Success - 200):
{
  "success": true,
  "data": {
    "message": "If the email is registered, a reset link/OTP has been sent."
  },
  "message": "If the email is registered, a reset link/OTP has been sent."
}

RESPONSE (Error - 400):
{
  "success": false,
  "message": "Email is required"
}

RESPONSE (Rate Limited - 429):
{
  "success": false,
  "message": "Too many password reset requests. Please try again after 1 hour."
}
*/

// ============================================
// ENDPOINT 2: VERIFY OTP & RESET PASSWORD
// ============================================
/*
REQUEST:
POST https://your-backend.com/api/auth/verify-reset-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",                    <-- 6 digit OTP from email
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}

RESPONSE (Success - 200):
{
  "success": true,
  "message": "Password has been reset successfully."
}

RESPONSE (Error - Invalid OTP - 400):
{
  "success": false,
  "message": "Invalid OTP"
}

RESPONSE (Error - OTP Expired - 400):
{
  "success": false,
  "message": "Invalid OTP"  // Generic message for security
}

RESPONSE (Error - Attempts Exceeded - 400):
{
  "success": false,
  "message": "OTP attempts exceeded"
}

RESPONSE (Rate Limited - 429):
{
  "success": false,
  "message": "Too many OTP verification attempts. Please request a new OTP after 15 minutes."
}
*/

// ============================================
// FLUTTER IMPLEMENTATION EXAMPLE
// ============================================
/*
Example using http package in Flutter:

import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> requestPasswordResetOTP(String email) async {
  final response = await http.post(
    Uri.parse('https://your-backend.com/api/auth/request-password-reset'),
    headers: {
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'email': email,
      'clientType': 'mobile',  // <-- THIS IS THE KEY LINE
    }),
  );

  if (response.statusCode == 200) {
    print('OTP sent to email');
  } else if (response.statusCode == 429) {
    print('Too many requests. Try again after 1 hour.');
  } else {
    print('Error: ${response.body}');
  }
}

Future<void> verifyOtpAndResetPassword({
  required String email,
  required String otp,
  required String newPassword,
}) async {
  final response = await http.post(
    Uri.parse('https://your-backend.com/api/auth/verify-reset-otp'),
    headers: {
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'email': email,
      'otp': otp,
      'newPassword': newPassword,
      'confirmPassword': newPassword,
    }),
  );

  if (response.statusCode == 200) {
    print('Password reset successful');
  } else if (response.statusCode == 429) {
    print('Too many attempts. Try again after 15 minutes.');
  } else {
    final error = jsonDecode(response.body);
    print('Error: ${error['message']}');
  }
}
*/

// ============================================
// COMPARISON: WEB VS MOBILE FLOWS
// ============================================
/*
WEB FLOW:
1. User submits forgot password form with email
2. POST to /api/auth/request-password-reset with clientType: "web"
3. Backend sends email with reset LINK containing token
4. User clicks link in email
5. Browser navigates to /reset-password?token=xxxxx
6. POST to /api/auth/reset-password/:token with new password
7. Password reset complete

MOBILE FLOW:
1. User opens forgot password screen in Flutter app
2. POST to /api/auth/request-password-reset with clientType: "mobile"  <-- IMPORTANT
3. Backend sends email with 6-digit OTP
4. User enters OTP in app (6 digit input field)
5. POST to /api/auth/verify-reset-otp with email, otp, and new password
6. Password reset complete
*/

// ============================================
// IMPORTANT NOTES FOR FLUTTER DEVELOPERS
// ============================================
/*
1. ALWAYS send "clientType": "mobile" for mobile reset requests
2. OTP is sent via EMAIL (not SMS) - user checks their email for the code
3. OTP is 6 digits (e.g., "123456")
4. OTP expires in 15 minutes
5. Max 5 attempts per 15 minutes per email
6. Include error handling for 429 (rate limit) responses
7. Show user-friendly messages for errors
*/

export {};
