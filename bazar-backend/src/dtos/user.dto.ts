import z from 'zod';
import { userSchema } from "../types/user.type";

const allowedRoles = z.enum(['user', 'seller', 'admin'], {
    message: "Role must be either 'user', 'seller' or 'admin'"
});

// Register DTO - allows users to choose between 'user' or 'seller' role
export const CreateUserDto = userSchema.extend({
    role: allowedRoles,
    confirmPassword: z.string().min(6)
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Password and Confirm Password must match",
        path: ["ConfirmPassword"]
    }
);

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDto = z.object({
    email: z.email(),
    password: z.string().min(6)
})

export type LoginUserDto = z.infer<typeof LoginUserDto>;


export const UpdateUserDto = userSchema.partial().extend({
    role: allowedRoles.optional()
});//all optional

export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

