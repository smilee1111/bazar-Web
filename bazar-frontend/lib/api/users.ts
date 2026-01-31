import axiosInstance from "./axios";
import { API } from "./endpoints";

export interface RoleMeta {
    id?: string;
    code?: string;
    name?: string;
    status?: string;
}

export interface AdminUser {
    _id: string;
    fullName: string;
    email: string;
    username: string;
    phoneNumber: string;
    profilePic?: string | null;
    role?: string | null;
    roleMeta?: RoleMeta | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const fetchAdminUsers = () =>
    axiosInstance.get<ApiResponse<AdminUser[]>>(API.ADMIN.USERS);

export const fetchAdminUserById = (id: string) =>
    axiosInstance.get<ApiResponse<AdminUser>>(API.ADMIN.USER(id));

export const createAdminUser = (formData: FormData) =>
    axiosInstance.post<ApiResponse<AdminUser>>(API.ADMIN.USERS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const updateAdminUser = (id: string, formData: FormData) =>
    axiosInstance.put<ApiResponse<AdminUser>>(API.ADMIN.USER(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const deleteAdminUser = (id: string) =>
    axiosInstance.delete<ApiResponse<{ success: boolean } | null>>(API.ADMIN.USER(id));
