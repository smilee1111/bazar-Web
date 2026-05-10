import { Request, Response } from 'express';
import z from 'zod';
import { CreateUserBehaviourDto } from '../dtos/userBehaviour.dto';
import { UserBehaviourService } from '../services/userBehaviour.service';

const service = new UserBehaviourService();

export class UserBehaviourController {
    async log(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const parsedData = CreateUserBehaviourDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error),
                });
            }

            const logged = await service.logEvent({
                userId: userId.toString(),
                shopId: parsedData.data.shopId,
                eventType: parsedData.data.eventType,
                timestamp: parsedData.data.timestamp,
                userLocation: parsedData.data.userLocation,
            });

            return res.status(201).json({ success: true, data: logged, message: 'Event logged' });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error',
            });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const list = await service.listByUser(userId.toString());
            return res.status(200).json({ success: true, data: list, message: 'Events fetched' });
        } catch (err: any) {
            return res.status(err?.statusCode || 500).json({
                success: false,
                message: err?.message || 'Internal Server Error',
            });
        }
    }
}