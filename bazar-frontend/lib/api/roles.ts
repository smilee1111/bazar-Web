import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface RoleApiResponse {
    _id: string;
    roleId?: string;
    roleName: string;
    status?: string;
}

export interface RolesResponse {
    success: boolean;
    data: RoleApiResponse[];
    message?: string;
}

export const fetchRoles = () =>
    axiosInstance.get<RolesResponse>(API.ROLES.GET_ALL);
