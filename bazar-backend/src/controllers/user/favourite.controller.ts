import { Request, Response } from 'express';
import { FavouriteService } from '../../services/user/favourite.service';

const service = new FavouriteService();

export class FavouriteController {
    async add(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const { shopId } = req.body;
            if(!shopId) return res.status(400).json({ success: false, message: 'shopId is required' });
            const fav = await service.addFavourite(userId, shopId);
            return res.status(201).json({ success: true, data: fav, message: 'Added to favourites' });
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
            const removed = await service.removeFavourite(userId, shopId);
            return res.status(200).json({ success: true, data: removed, message: removed ? 'Removed' : 'Not found' });
        }catch(err:any){
            return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || 'Internal Server Error' });
        }
    }

    async list(req: Request, res: Response){
        try{
            const userId = req.user?._id;
            if(!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
            const list = await service.listFavourites(userId);
            return res.status(200).json({ success: true, data: list, message: 'Favourites fetched' });
        }catch(err:any){
            return res.status(err?.statusCode || 500).json({ success: false, message: err?.message || 'Internal Server Error' });
        }
    }
}
