import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type RoleInput =
    | string
    | { role?: string; roleName?: string; name?: string; roleId?: string }
    | null
    | undefined;

export const normalizeRole = (role: RoleInput) => {
    if (!role) return null;
    if (typeof role === "string") return role.trim().toLowerCase();

    const candidate = role.roleName || role.role || role.name || role.roleId;
    return typeof candidate === "string" ? candidate.trim().toLowerCase() : null;
};

export const getRoleHomePath = (role: RoleInput) => {
    const normalized = normalizeRole(role);

    switch (normalized) {
    case "admin":
        return "/admin/users";
    case "seller":
        return "/dashboard";
    case "user":
    default:
        return "/dashboard";
    }
};
