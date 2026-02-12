import z from "zod";

export const userSchema = z.object({
    fullName: z.string(),
    email: z.email(),
    phoneNumber: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => /^\d{10}$/.test(val), {
    message: "Phone number must be exactly 10 digits",
    }),
        username: z.string().min(3).max(20),
    password: z.string().min(6),
    profilePic: z
    .string()
    .nullable()
    .optional(),
    sellerStatus: z.enum(['none','pending','approved','rejected']).default('none')
});

export type UserType = z.infer<typeof userSchema>;

