import mongoose, { Document, Schema } from "mongoose";
import { NotificationType } from "../types/notification.type";

export interface INotification extends NotificationType, Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        notificationId: { 
            type: String, 
            required: false, 
            unique: true, 
            default: () => new mongoose.Types.ObjectId().toHexString() 
        },
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        type: { 
            type: String, 
            enum: ['review_like', 'review_dislike', 'new_shop', 'shop_reviewed', 'seller_application', 'general'],
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        message: { 
            type: String, 
            required: true 
        },
        relatedEntityId: { 
            type: String, 
            required: false 
        },
        relatedEntityType: { 
            type: String, 
            enum: ['shop', 'review', 'user'],
            required: false 
        },
        isRead: { 
            type: Boolean, 
            default: false 
        },
        metadata: { 
            type: Schema.Types.Mixed, 
            required: false 
        }
    },
    {
        timestamps: true,
        collection: 'notifications'
    }
);

// Index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema);
