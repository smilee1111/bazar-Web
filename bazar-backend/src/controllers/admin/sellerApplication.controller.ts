import { Request, Response, NextFunction } from "express";
import { AdminSellerApplicationService } from "../../services/admin/sellerApplication.service";

const adminSellerApplicationService = new AdminSellerApplicationService();

export class AdminSellerApplicationController {
    async createSellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const result = await adminSellerApplicationService.createSellerApplication(data);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getAllSellerApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminSellerApplicationService.getAllSellerApplications();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getPendingSellerApplications(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await adminSellerApplicationService.getPendingSellerApplications();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async getSellerApplicationById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await adminSellerApplicationService.getSellerApplicationById(id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async approveSellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { adminRemark } = req.body;
            const result = await adminSellerApplicationService.approveSellerApplication(id, adminRemark);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async rejectSellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { adminRemark } = req.body;
            const result = await adminSellerApplicationService.rejectSellerApplication(id, adminRemark);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async updateSellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await adminSellerApplicationService.updateSellerApplication(id, data);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async deleteSellerApplication(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await adminSellerApplicationService.deleteSellerApplication(id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}