import { IUser } from "../models/user.model";
import { IRole } from "../models/role.model";
import mongoose from "mongoose";

export interface RoleMeta {
    id: string;
    code: string;
    name: string;
    status?: string;
}

export interface SafeUser {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    username: string;
    profilePic?: string | null;
    roleId?: string | null;
    role?: string | null;
    roleMeta?: RoleMeta | null;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: any;
}

const ADMIN_ROLE_CODE = "role_admin_001";

function isRoleDocument(role: unknown): role is IRole {
    return !!role && typeof role === "object" && "roleName" in (role as Record<string, unknown>);
}

export const extractRoleMeta = (user?: IUser | null): RoleMeta | null => {
    if (!user || !user.roleId) {
        return null;
    }

    if (isRoleDocument(user.roleId)) {
        const roleDoc = user.roleId;
        return {
            id: roleDoc._id?.toString() ?? "",
            code: roleDoc.roleId,
            name: roleDoc.roleName,
            status: roleDoc.status,
        };
    }

    return null;
};

export const sanitizeUser = (user: IUser): SafeUser => {
    const plain = typeof user.toObject === "function" ? user.toObject() : (user as unknown as Record<string, any>);
    const { password, __v, ...rest } = plain;
    const roleMeta = extractRoleMeta(user);

    const sanitized: SafeUser = {
        ...rest,
        _id: user._id?.toString?.() ?? (typeof user._id === "string" ? user._id : ""),
        roleMeta,
        role: roleMeta?.code ?? null,
        roleId: roleMeta?.id ?? (rest.roleId instanceof mongoose.Types.ObjectId ? rest.roleId.toString() : rest.roleId ?? null),
    };

    return sanitized;
};

export const isAdminUser = (user?: IUser | null): boolean => {
    const roleMeta = extractRoleMeta(user);
    if (!roleMeta) {
        return false;
    }
    return roleMeta.code === ADMIN_ROLE_CODE || roleMeta.name?.toLowerCase() === "admin";
};
