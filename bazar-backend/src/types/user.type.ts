import z from "zod";

export const userSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email,
    username: z.string().min(3).max(20),
    passsword: z.string().min(6)
});

export type UserType = z.infer<typeof userSchema>;

