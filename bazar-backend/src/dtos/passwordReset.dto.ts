import z from 'zod';

export const RequestPasswordResetDto = z.object({
    email: z.email('Invalid email address'),
    clientType: z.enum(['web', 'mobile'], {
        message: "clientType must be either 'web' or 'mobile'"
    }).default('web'),
});

export type RequestPasswordResetDto = z.infer<typeof RequestPasswordResetDto>;

export const ResetPasswordWithTokenDto = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
    token: z.string().min(1, 'Token is required'),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords must match",
        path: ["confirmPassword"]
    }
);

export type ResetPasswordWithTokenDto = z.infer<typeof ResetPasswordWithTokenDto>;

export const VerifyResetOtpDto = z.object({
    email: z.email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords must match",
        path: ["confirmPassword"]
    }
);

export type VerifyResetOtpDto = z.infer<typeof VerifyResetOtpDto>;
