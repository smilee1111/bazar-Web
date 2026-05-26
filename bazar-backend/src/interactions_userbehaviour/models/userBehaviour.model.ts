import mongoose, { Document, Schema } from "mongoose";

export type UserBehaviourEventType = 'view' | 'save' | 'favorite' | 'search_click';

export interface IUserBehaviour extends Document {
    userId: mongoose.Types.ObjectId;
    shopId: mongoose.Types.ObjectId;
    eventType: UserBehaviourEventType;
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
        shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
        eventType: {
            type: String,
            enum: ['view', 'save', 'favorite', 'search_click'],
            required: true,
        },
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