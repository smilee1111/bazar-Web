import { AdminUserService } from '../../services/admin/user.service';
import z from 'zod';
import { Request, Response } from 'express';
import { CreateUserDto } from "../../dtos/user.dto";

let userService = new AdminUserService();

export class AdminUserController{
    async createUser(req:Request, res: Response){
        try{
            const parsedData = CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            const newUser = await userService.adminCreateUser(parsedData.data);
            return res.status(201).json(
                    {success: true, data: newUser, message: "User Created Successfully."}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                    {success: false, message: error.message || "Internal Server Error."}
            )
        }
    }

      async getAllUsers(req: Request, res: Response){
        //to be implemented
    }

    async getUserById(req: Request, res: Response){
        //to be implemented
    }

    async updateUser(req: Request, res: Response){
        //to be implemented
    }

    async deleteUser(req: Request, res: Response){
        //to be implemented
    }
}