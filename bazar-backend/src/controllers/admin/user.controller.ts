import { AdminUserService } from '../../services/admin/user.service';
import z from 'zod';
import { Request, Response } from 'express';
import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";

let userService = new AdminUserService();

export class AdminUserController{
    async createUser(req:Request, res: Response){
        try{
            const payload = {
                ...req.body,
                role: req.body.role || 'user'
            };

            if(req.file){
                payload.profilePic = `/uploads/${req.file.filename}`;
            }

            const parsedData = CreateUserDto.safeParse(payload);
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
        try{
            const users = await userService.getAllUsers();
            return res.status(200).json(
                {success: true, data: users, message: "Users retrieved successfully."}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                    {success: false, message: error.message || "Internal Server Error."}
            )
        }
        
    }

    async getUserById(req: Request, res: Response){
        try{
            const { id } = req.params;
            if(!id){
                return res.status(400).json({ success: false, message: "User id is required" });
            }
            const user = await userService.getUserById(id);
            return res.status(200).json({ success: true, data: user, message: "User retrieved successfully." });
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message: error.message || "Internal Server Error."}
            );
        }
    }

    async updateUser(req: Request, res: Response){
        try{
            const { id } = req.params;
            if(!id){
                return res.status(400).json({ success: false, message: "User id is required" });
            }

            const payload = { ...req.body };
            if(req.file){
                payload.profilePic = `/uploads/${req.file.filename}`;
            }

            const parsedData = UpdateUserDto.safeParse(payload);
            if(!parsedData.success){
                return res.status(400).json({ success: false, message: z.prettifyError(parsedData.error) });
            }

            const updatedUser = await userService.updateUser(id, parsedData.data);
            return res.status(200).json({ success: true, data: updatedUser, message: "User updated successfully." });
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message: error.message || "Internal Server Error."}
            );
        }
    }

    async deleteUser(req: Request, res: Response){
        try{
            const { id } = req.params;
            if(!id){
                return res.status(400).json({ success: false, message: "User id is required" });
            }
            await userService.deleteUser(id);
            return res.status(200).json({ success: true, message: "User deleted successfully." });
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message: error.message || "Internal Server Error."}
            );
        }
    }
}