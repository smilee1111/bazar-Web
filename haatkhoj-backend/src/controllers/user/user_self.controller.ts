import { UpdateUserDto } from "../../dtos/user.dto";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import z from "zod";
import { UserModel } from "../../models/user.model";
import { ShopModel } from "../../models/shop.model";
import { UserBehaviourModel } from "../../interactions_userbehaviour/models/userBehaviour.model";

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

    async completeOnboarding(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(401).json(
                    { success: false, message: "Unauthorized" }
                );
            }

            const { categoryIds, location } = req.body;

            // 1. If categoryIds are provided, bootstrap recommendations
            if (Array.isArray(categoryIds) && categoryIds.length > 0) {
                // Find up to 2 active shops for each selected category
                const shops = await ShopModel.find({
                    categoryId: { $in: categoryIds },
                    isActive: true
                }).select("_id shopId categoryId").limit(categoryIds.length * 2).lean();

                if (shops.length > 0) {
                    // Create simulated 'view' behavior logs for these shops to bootstrap category profiling.
                    // Use shopId (string) for consistency with all other behaviour tracking code paths.
                    const logs = shops.map(shop => ({
                        userId,
                        shopId: (shop as any).shopId || shop._id,
                        eventType: 'view',
                        timestamp: new Date(),
                        userLocation: location ? { lat: location.lat, lng: location.lng } : undefined
                    }));

                    await UserBehaviourModel.insertMany(logs);
                }
            }

            // 2. Mark onboarding as completed
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { hasCompletedOnboarding: true },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                data: updatedUser,
                message: "Onboarding completed successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to complete onboarding"
            });
        }
    }
}
