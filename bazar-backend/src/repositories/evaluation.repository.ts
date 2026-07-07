import mongoose from "mongoose";
import { IUserBehaviour, UserBehaviourModel } from "../interactions_userbehaviour/models/userBehaviour.model";

export interface IEvaluationRepository {
    getUsersWithMinHistory(minLogsCount: number): Promise<string[]>;
    getUserLogs(userId: string): Promise<IUserBehaviour[]>;
}

export class EvaluationRepository implements IEvaluationRepository {
    async getUsersWithMinHistory(minLogsCount: number): Promise<string[]> {
        const results = await UserBehaviourModel.aggregate([
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gte: minLogsCount }
                }
            }
        ]);
        return results.map(r => r._id.toString());
    }

    async getUserLogs(userId: string): Promise<IUserBehaviour[]> {
        return UserBehaviourModel.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ timestamp: 1 })
            .lean();
    }
}
