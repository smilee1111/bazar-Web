import { PasswordResetModel, IPasswordReset } from "../models/passwordReset.model";
import mongoose from "mongoose";

export class PasswordResetRepository {
    async createPasswordReset(data: {
        userId: mongoose.Types.ObjectId;
        email: string;
        type: 'otp' | 'link';
        tokenHash?: string;
        otpHash?: string;
        expiresAt: Date;
    }): Promise<IPasswordReset> {
        const reset = new PasswordResetModel(data);
        return await reset.save();
    }

    async findByToken(tokenHash: string): Promise<IPasswordReset | null> {
        return await PasswordResetModel.findOne({
            tokenHash,
            used: false,
            expiresAt: { $gt: new Date() }
        });
    }

    async findByOtp(email: string, otpHash: string): Promise<IPasswordReset | null> {
        return await PasswordResetModel.findOne({
            email,
            otpHash,
            type: 'otp',
            used: false,
            expiresAt: { $gt: new Date() }
        });
    }

    async findByEmailAndType(email: string, type: 'otp' | 'link'): Promise<IPasswordReset | null> {
        return await PasswordResetModel.findOne({
            email,
            type,
            used: false,
            expiresAt: { $gt: new Date() }
        });
    }

    async markAsUsed(id: mongoose.Types.ObjectId): Promise<void> {
        await PasswordResetModel.updateOne(
            { _id: id },
            { used: true }
        );
    }

    async decrementAttempts(id: mongoose.Types.ObjectId): Promise<void> {
        await PasswordResetModel.updateOne(
            { _id: id },
            { $inc: { attemptsLeft: -1 } }
        );
    }

    async deleteByEmail(email: string): Promise<void> {
        await PasswordResetModel.deleteMany({ email });
    }
}
