import mongoose,{ Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";
import { IRole } from "./role.model";


const UserSchema: Schema = new Schema(
    {
        fullName: { type: String,required: true},
        email : { type: String, required: true, unique: true},
        phoneNumber: { type: Number, required: true, unique: true },
        username : { type: String, required: true, unique: true},
        password : { type: String, required: true},
        roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: false }
    },
    {
        timestamps: true, //auto createdAt and updatedAt
    }
)

export interface IUser extends UserType, Document{// combined type
    _id: mongoose.Types.ObjectId; //mogo realted attribute
    roleId?: mongoose.Types.ObjectId | IRole; // Can be ObjectId or populated IRole
    createdAt: Date;
    updatedAt: Date;

}

// Type guard to check if roleId is populated
export function isRolePopulated(user: IUser): user is IUser & { roleId: IRole } {
    return user.roleId != null && 
           typeof user.roleId === 'object' && 
           !Array.isArray(user.roleId) &&
           '_id' in user.roleId &&
           'roleName' in user.roleId &&
           typeof (user.roleId as any).roleName === 'string';
}

// Type guard to check if req.user is an IUser
export function isIUser(user: any): user is IUser {
    return user != null && 
           typeof user === 'object' &&
           '_id' in user &&
           'email' in user &&
           'username' in user;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
//collection name 'users' (plural of 'User')
//UserModel -> db.users