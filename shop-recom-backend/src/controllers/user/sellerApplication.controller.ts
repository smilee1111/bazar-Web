import { Request, Response, NextFunction } from "express";
import z from "zod";
import { UserSellerApplicationService } from "../../services/user/sellerApplication.service";
import { CreateSellerApplicationDto } from "../../dtos/sellerApplication.dto";

const userSellerApplicationService = new UserSellerApplicationService();

export class UserSellerApplicationController {
    async uploadDocument(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }
            
            // Construct the URL for the uploaded document
            // Use BACKEND_URL from env, or construct from request
            const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
            const documentUrl = `${baseUrl}/uploads/${req.file.filename}`;
            
            return res.status(200).json({ 
                success: true, 
                message: "Document uploaded successfully",
                data: { 
                    documentUrl,
                    url: documentUrl // fallback for compatibility
                } 
            });
        } catch (error) {
            next(error);
        }
    }

    async createMySellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const data = { ...req.body, userId: req.user._id.toString() };
            const parsed = CreateSellerApplicationDto.safeParse(data);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: z.prettifyError(parsed.error) });
            }

            const result = await userSellerApplicationService.createMySellerApplication(parsed.data);
            return res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getMySellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const result = await userSellerApplicationService.getMySellerApplication(req.user._id.toString());
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}
