import { AuthService } from "../../services/auth/auth.service";
import z, { success } from 'zod';
import { Request, Response} from 'express';
import { CreateUserDto, LoginUserDto,UpdateUserDto } from "../../dtos/user.dto";
import { RequestPasswordResetDto, ResetPasswordWithTokenDto, VerifyResetOtpDto } from "../../dtos/passwordReset.dto";


//initialize the auth service
let authService = new AuthService();

export class AuthController{
    async registerUser(req: Request, res: Response){
        try{
            //get the data from the user 
            const parsedData = CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error)}
                )
            }

            //call the registerUser function from the auth service
            const newUser = await authService.registerUser(parsedData.data);
            return res.status(201).json(
                    { success: true, data: newUser, message: "Registered successfully." }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                    {success: false, message: error.message || "Internal Server Error."}
            )
        }
    }


    async loginUser(req: Request, res: Response){
        try{
            //get the user input emial and password
            const parsedData = LoginUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)},
                )
            }

            //logging the user in with the jwt token 
            const {token, user} = await authService.loginUser(parsedData.data);
            return res.status(200).json(
                    {success: true, data: user, token, message: "Login Successful"}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                    {success: false, message: error.message || "Internal Server Error."}
            )
        }
    }

async getUserProfile(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId){
                return res.status(401).json(
                    { success: false, message: "Unauthorized" }
                )
            }
            const user = await authService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User profile fetched successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }

    async updateUser(req: Request, res: Response){
        try{    
            const userId = req.user?._id;
            if(!userId){
                return res.status(401).json(
                    { success: false, message: "Unauthorized" }
                )
            }
            const parsedData = UpdateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            if(req.file){
                parsedData.data.profilePic = `/uploads/${req.file.filename}`;
            }
            const updatedUser = await authService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User updated successfully" }
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )   
        }
    }


    async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const parsedData = RequestPasswordResetDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }

            const result = await authService.sendResetPasswordEmail(
                parsedData.data.email,
                parsedData.data.clientType
            );
            return res.status(200).json(
                { success: true, data: result, message: result.message }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const token = req.params.token;
            const parsedData = ResetPasswordWithTokenDto.safeParse({
                ...req.body,
                token
            });

            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }

            const result = await authService.resetPassword(
                parsedData.data.token,
                parsedData.data.newPassword
            );
            return res.status(200).json(
                { success: true, message: result.message }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async verifyResetOtp(req: Request, res: Response) {
        try {
            const parsedData = VerifyResetOtpDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }

            const result = await authService.verifyResetOtp(
                parsedData.data.email,
                parsedData.data.otp,
                parsedData.data.newPassword
            );
            return res.status(200).json(
                { success: true, message: result.message }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}