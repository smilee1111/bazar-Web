import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordReset extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    type: 'otp' | 'link'; // 'otp' for mobile, 'link' for web
    tokenHash?: string; // hashed token for link-based reset
    otpHash?: string; // hashed OTP for mobile
    expiresAt: Date;
    attemptsLeft: number;
    used: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PasswordResetSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        email: { type: String, required: true },
        type: { type: String, enum: ['otp', 'link'], required: true },
        tokenHash: { type: String, required: false }, // for link-based
        otpHash: { type: String, required: false }, // for OTP-based
        expiresAt: { type: Date, required: true },
        attemptsLeft: { type: Number, default: 5 },
        used: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// TTL index to auto-delete expired records after 24 hours
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = mongoose.model<IPasswordReset>(
    'PasswordReset',
    PasswordResetSchema
);
