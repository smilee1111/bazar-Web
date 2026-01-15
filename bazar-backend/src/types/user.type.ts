import z from "zod";

export const userSchema = z.object({
    fullName: z.string(),
    email: z.email(),
    phoneNumber: z.string().regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits"}),
    username: z.string().min(3).max(20),
    password: z.string().min(6),
    role: z.enum(['user','admin',"seller"]).default('user')
});

export type UserType = z.infer<typeof userSchema>;

