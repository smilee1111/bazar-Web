import mongoose from 'mongoose';
import { IUserBehaviour, UserBehaviourEventType, UserBehaviourModel } from "../models/userBehaviour.model";

export interface IUserBehaviourRepository {
    logEvent(data: {
        userId: string;
        shopId: string;
        eventType: UserBehaviourEventType;
        timestamp?: Date;
        userLocation?: { lat: number; lng: number };
    }): Promise<IUserBehaviour>;
    listByUser(userId: string): Promise<IUserBehaviour[]>;
}

export class UserBehaviourRepository implements IUserBehaviourRepository {
    async logEvent(data: {
        userId: string;
        shopId: string;
        eventType: UserBehaviourEventType;
        timestamp?: Date;
        userLocation?: { lat: number; lng: number };
    }): Promise<IUserBehaviour> {
        const doc = new UserBehaviourModel({
            userId: new mongoose.Types.ObjectId(data.userId),
            shopId: new mongoose.Types.ObjectId(data.shopId),
            eventType: data.eventType,
            timestamp: data.timestamp,
            userLocation: data.userLocation,
        });
        await doc.save();
        return doc;
    }

    async listByUser(userId: string): Promise<IUserBehaviour[]> {
        return UserBehaviourModel.find({ userId }).sort({ timestamp: -1 }).lean();
    }
}