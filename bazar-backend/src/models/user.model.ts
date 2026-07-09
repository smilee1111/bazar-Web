import mongoose,{ Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";


const UserSchema: Schema = new Schema(
    {
        fullName: { type: String,required: true},
        email : { type: String, required: true, unique: true},
        phoneNumber: { type: String, required: true, unique: true },
        username : { type: String, required: true, unique: true},
        password : { type: String, required: true},
        profilePic: { type: String, required: false },
        roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: false },
        sellerStatus: { type: String, enum: ['none','pending','approved','rejected'], default: 'none' },
        hasCompletedOnboarding: { type: Boolean, default: false }
    },
    {
        timestamps: true, //auto createdAt and updatedAt
    }
)

export interface IUser extends UserType, Document{// combined type
    _id: mongoose.Types.ObjectId; //mogo realted attribute
    roleId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
//collection name 'users' (plural of 'User')
//UserModel -> db.users