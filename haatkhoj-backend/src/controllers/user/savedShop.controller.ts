import { Request, Response } from 'express';
import { SavedShopService } from '../../services/user/savedShop.service';
import { UserBehaviourService } from '../../interactions_userbehaviour/services/userBehaviour.service';

const service = new SavedShopService();
const behaviourService = new UserBehaviourService();

export class SavedShopController {
    async save(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { shopId } = req.body;
            if(!shopId) return res.status(400).json({ success: false, message: 'shopId is required' });
            const saved = await service.saveShop(userId, shopId);
            const rawLocation = req.body?.userLocation;
            const userLocation =
                rawLocation && typeof rawLocation.lat === 'number' && typeof rawLocation.lng === 'number'
                    ? { lat: rawLocation.lat, lng: rawLocation.lng }
                    : undefined;
            void behaviourService
                .logEvent({
                    userId: userId.toString(),
                    shopId,
                    eventType: 'save',
                    userLocation,
                })
                .catch((err) => console.error('Failed to log save event:', err));
            return res.status(201).json({ success: true, data: saved, message: 'Shop saved' });
        }catch(err:any){
            return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || 'Internal Server Error' });
        }
    }

    async remove(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { shopId } = req.params;
            if(!shopId) return res.status(400).json({ success: false, message: 'shopId is required' });
            const removed = await service.removeSavedShop(userId, shopId);
            return res.status(200).json({ success: true, data: removed, message: removed ? 'Removed' : 'Not found' });
        }catch(err:any){
            return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || 'Internal Server Error' });
        }
    }

    async list(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const list = await service.listSavedShops(userId);
            return res.status(200).json({ success: true, data: list, message: 'Saved shops fetched' });
        }catch(err:any){
            return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || 'Internal Server Error' });
        }
    }
}
