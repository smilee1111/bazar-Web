import z from "zod";

export const userSchema = z.object({
    fullName: z.string(),
    email: z.email(),
    phoneNumber: z.number().refine((val) => /^\d{10}$/.test(val.toString()), {
        message: "Phone number must be exactly 10 digits"
    }),
    username: z.string().min(3).max(20),
    password: z.string().min(6),
});

export type UserType = z.infer<typeof userSchema>;

