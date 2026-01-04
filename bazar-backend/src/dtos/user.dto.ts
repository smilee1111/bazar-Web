import z from 'zod';
import { userSchema } from "../types/user.type";
export const CreateUserDto = userSchema.pick(
    {
        fullName: true,
        email: true,
        phoneNumber: true,
        username: true,
        password: true,
        role: true,
    }
).extend(//add new attribute to schema
    {
        confirmPassword: z.string().min(6)
    }
).refine(//extra validation from existing attributes
    (data) => data.password === data.confirmPassword,
    {
        message: "Password and Confirm Password must match",
        path: ["ConfirmPassword"] //throws error on confirmPassword field
    }
)

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const LoginUserDto = z.object({
    email: z.email(),
    password: z.string().min(6)
})

export type LoginUserDto = z.infer<typeof LoginUserDto>;