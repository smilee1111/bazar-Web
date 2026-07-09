import mongoose, { Document, Schema } from "mongoose";
import { RoleType } from "../types/role.type";

export interface IRole extends RoleType, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
    {
        roleId: { type: String, required: false, unique: true, default: () => new mongoose.Types.ObjectId().toHexString() },
        roleName: { type: String, required: true, unique: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    },
    {
        timestamps: true, // auto createdAt and updatedAt
        collection: 'roles'
    }
);

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema);
// collection name 'roles' (plural of 'Role')
// RoleModel -> db.roles
