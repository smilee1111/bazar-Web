"use server";

import { revalidatePath } from "next/cache";
import {
    fetchAdminUsers,
    fetchAdminUserById,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
} from "../api/users";

const getErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.message || fallback;

export const fetchAdminUsersAction = async () => {
    try {
        const response = await fetchAdminUsers();
        return response.data;
    } catch (err) {
        return { success: false, data: [], message: getErrorMessage(err, "Failed to load users") };
    }
};

export const fetchAdminUserAction = async (id: string) => {
    try {
        const response = await fetchAdminUserById(id);
        return response.data;
    } catch (err) {
        return { success: false, data: null, message: getErrorMessage(err, "Failed to load user") };
    }
};

export const createAdminUserAction = async (formData: FormData) => {
    try {
        const response = await createAdminUser(formData);
        revalidatePath("/admin/users");
        return response.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to create user") };
    }
};

export const updateAdminUserAction = async (id: string, formData: FormData) => {
    try {
        const response = await updateAdminUser(id, formData);
        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${id}`);
        return response.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to update user") };
    }
};

export const deleteAdminUserAction = async (id: string) => {
    try {
        const response = await deleteAdminUser(id);
        revalidatePath("/admin/users");
        return response.data;
    } catch (err) {
        return { success: false, message: getErrorMessage(err, "Failed to delete user") };
    }
};
