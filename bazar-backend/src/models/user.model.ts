import mongoose,{ Document, Schema} from "mongoose";
import { UserType } from "../types/user.type";


const UserSchema: Schema = new Schema(
    {
        firstName: { type: String},
        LastName: { type: String},
        email : { type: String, required: true, unique: true},
        username : { type: String, required: true, unique: true},
        password : { type: String, required: true}
    },
    {
        timestamps: true, //auto createdAt and updatedAt
    }
)

export interface IUser extends UserType, Document{// combined type
    _id: mongoose.Types.ObjectId; //mogo realted attribute
    createdAt: Date;
    updatedAt: Date;

}

export const UserModdel = mongoose.model<IUser>('User', UserSchema);
//collection name 'users' (plural of 'User')
//UserModel -> db.users