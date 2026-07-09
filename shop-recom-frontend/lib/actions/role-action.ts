import { fetchRoles } from "../api/roles";

export interface RoleOption {
    id: string;
    value: string;
    label: string;
    status?: string;
}

export interface RolesResult {
    success: boolean;
    data: RoleOption[];
    message?: string;
}

export const getRolesAction = async (): Promise<RolesResult> => {
    try {
        const response = await fetchRoles();
        const data = response.data?.data ?? [];

        const roles = data.map((role) => ({
            id: role._id || role.roleId || role.roleName,
            value: role.roleName,
            label: role.roleName,
            status: role.status,
        }));

        return {
            success: true,
            data: roles,
            message: response.data?.message,
        };
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error?.response?.data?.message || error.message || "Unable to load roles",
        };
    }
};
