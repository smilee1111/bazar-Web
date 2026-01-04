import z from 'zod';

export const loginSchema = z.object({
    email: z.email({message: "Enter a valid email"}),
    password: z.string().min(8, {message: "Minimum 8 characters"}),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Enter your full name"}),
    email: z.email({message: "Enter a valid email"}),
    phoneNumber: z.string()
        .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits"}),
    username: z.string()
        .min(3, { message: "Username must be at least 3 characters"})
        .max(20, { message: "Username must be at most 20 characters"})
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores"}),
    password: z.string().min(8, { message: "Minimum 8 characters"}),
    confirmPassword: z.string().min(6, { message: "Minimum 8 characters"}),
}).refine((v)  => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords donot match",
});

export type RegisterData = z.infer<typeof registerSchema>;