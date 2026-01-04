import { AuthService } from "../../services/auth/auth.service";
import z, { success } from 'zod';
import { Request, Response} from 'express';
import { CreateUserDto, LoginUserDto } from "../../dtos/user.dto";


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
                    {success: false, data: user, token, message: "Login Successful"}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                    {success: false, message: error.message || "Internal Server Error."}
            )
        }
    }

}