import { UpdateUserDto } from "../../dtos/user.dto";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import z from "zod";


let userService = new AdminUserService();

export class UserSelfController {
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
                   const updatedUser = await userService.AdminUpdateUser(userId, parsedData.data);
                   return res.status(200).json(
                       { success: true, data: updatedUser, message: "User updated successfully" }
                   )
               }catch(error: Error | any){
                   return res.status(error.statusCode || 500).json(
                       { success: false, message: error.message || "Internal Server Error" }
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
}
