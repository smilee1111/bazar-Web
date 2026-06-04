import { UserBehaviourEventType } from "../models/userBehaviour.model";
import { UserBehaviourRepository } from "../repositories/userBehaviour.repository";

const repo = new UserBehaviourRepository();

export class UserBehaviourService {
    async logEvent(data: {
        userId: string;
        shopId?: string;
        eventType: UserBehaviourEventType;
        searchQuery?: string;
        timestamp?: Date;
        userLocation?: { lat: number; lng: number };
    }) {
        return repo.logEvent(data);
    }

    async listByUser(userId: string) {
        return repo.listByUser(userId);
    }
}