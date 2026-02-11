import { AdminUserService } from '../../services/admin/user.service';
import z from 'zod';
import { Request, Response } from 'express';
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { QueryParams } from '../../types/query.type';

let userService = new AdminUserService();

export class AdminUserController{
    async createUser(req: Request, res: Response) {
    try {
        console.log("BODY TYPE:", typeof req.body);
        console.log("BODY VALUE:", req.body);
        console.log("FILE:", req.file);

        const parsedData = CreateUserDto.safeParse(req.body ?? {});
        if (!parsedData.success) {
        return res.status(400).json({
            success: false,
            message: z.prettifyError(parsedData.error),
        });
        }

        if (req.file) {
        parsedData.data.profilePic = `/uploads/${req.file.filename}`;
        }

        const newUser = await userService.adminCreateUser(parsedData.data);

        return res.status(201).json({
        success: true,
        data: newUser,
        message: "User Created Successfully.",
        });
    } catch (error: any) {
        return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error.",
        });
    }
    }


    async getAllUsers(req: Request, res: Response){
        try{
            const { page, size, search }: QueryParams = req.query;
            const { users, pagination } = await userService.getAllUsers(
                page, size, search
            );
            return res.status(200).json(
                { success: true, data: users, pagination, message: "Users retrieved successfully." }
            );
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                    {success: false, message: error.message || "Internal Server Error."}
            )
        }
        
    }

    async getUserById(req: Request, res: Response){
        try{
            const userId = req.params.id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User id is required" }
                )
            }
            const user = await userService.getUserById(userId);
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
               const userId = req.params.id;
               if(!userId){
                   return res.status(400).json(
                       { success: false, message: "User id is required" }
                   )
               }
               console.log('req.file:', req.file);
               console.log('req.body:', req.body);
               const parsedData = UpdateUserDto.safeParse(req.body);
               if(!parsedData.success){
                   return res.status(400).json(
                       { success: false, message: z.prettifyError(parsedData.error) }
                   )
               }
               if(req.file){
                   parsedData.data.profilePic = `/uploads/${req.file.filename}`;
                   console.log('setting profilePic:', parsedData.data.profilePic);
               }
               console.log('data to update:', parsedData.data);
               const updatedUser = await userService.AdminUpdateUser(userId, parsedData.data);
               console.log('updatedUser:', updatedUser);
               return res.status(200).json(
                   { success: true, data: updatedUser, message: "User updated successfully" }
               )
           }catch(error: Error | any){
               return res.status(error.statusCode || 500).json(
                   { success: false, message: error.message || "Internal Server Error" }
               )   
           }
       }

    async deleteUser(req: Request, res: Response){
        try {
            const userId = req.params.id;
            if (!userId) return res.status(400).json({ success: false, message: "User id is required" });

            await userService.deleteUser(userId);
            return res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}