import mongoose, { Document, Schema } from "mongoose";

export type UserBehaviourEventType = 'view' | 'save' | 'favorite' | 'search_click' | 'search';

export interface IUserBehaviour extends Document {
    userId: mongoose.Types.ObjectId;
    shopId?: mongoose.Types.ObjectId;
    eventType: UserBehaviourEventType;
    searchQuery?: string;
    timestamp: Date;
    userLocation?: {
        lat: number;
        lng: number;
    };
}

const UserLocationSchema = new Schema(
    {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    { _id: false }
);

const UserBehaviourSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: false },
        eventType: {
            type: String,
            enum: ['view', 'save', 'favorite', 'search_click', 'search'],
            required: true,
        },
        searchQuery: { type: String, required: false },
        timestamp: { type: Date, default: Date.now },
        userLocation: { type: UserLocationSchema, required: false },
    },
    {
        collection: 'user_behaviour',
    }
);

UserBehaviourSchema.index({ userId: 1, timestamp: -1 });
UserBehaviourSchema.index({ shopId: 1, eventType: 1, timestamp: -1 });

export const UserBehaviourModel = mongoose.model<IUserBehaviour>('UserBehaviour', UserBehaviourSchema);