import z from 'zod';

export const loginSchema = z.object({
    email: z.email({message: "Enter a valid email"}),
    password: z.string().min(8, {message: "Minimum 8 characters"}),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Enter your full name"}),
    email: z.email({message: "Enter a valid email"}),
    phoneNumber: z.number().min(10,{ message: "Invalid phone number"}),
    password: z.string().min(8, { message: "Minimum 8 characters"}),
    confirmPassword: z.string().min(6, { message: "Minimum 8 characters"}),
}).refine((v)  => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords donot match",
});

export type ReisterData = z.infer<typeof registerSchema>;