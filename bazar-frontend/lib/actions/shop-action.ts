"use server";

//server side processing of shop actions
import {
    createShop,
    getAllShops,
    getAllAdminShops,
    getMyShop,
    getShopById,
    updateShop,
    deleteShop,
    createAdminShop,
    getAdminShopById,
    updateAdminShop,
    deleteAdminShop
} from "../api/shop";
import { revalidatePath } from "next/cache";

export const handleCreateShop = async (formData: any) => {
    try {
        const result = await createShop(formData);
        if (result.success) {
            revalidatePath('/dashboard');
            return {
                success: true,
                message: "Shop created successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to create shop"
        };
    }
}

export const handleGetAllShops = async () => {
    try {
        const result = await getAllShops();
        if (result.success) {
            return {
                success: true,
                message: "Shops fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shops"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shops"
        };
    }
}

export const handleGetAllAdminShops = async () => {
    try {
        const result = await getAllAdminShops();
        if (result.success) {
            return {
                success: true,
                message: "Shops fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shops"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shops"
        };
    }
}

export const handleGetMyShop = async () => {
    try {
        const result = await getMyShop();
        if (result.success) {
            return {
                success: true,
                message: "Your shop fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch your shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch your shop"
        };
    }
}

export const handleGetShopById = async (id: string) => {
    try {
        const result = await getShopById(id);
        if (result.success) {
            return {
                success: true,
                message: "Shop fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop"
        };
    }
}

export const handleUpdateShop = async (id: string, formData: any) => {
    try {
        const result = await updateShop(id, formData);
        if (result.success) {
            revalidatePath('/dashboard');
            revalidatePath(`/shop/${id}`);
            return {
                success: true,
                message: "Shop updated successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update shop"
        };
    }
}

export const handleDeleteShop = async (id: string) => {
    try {
        const result = await deleteShop(id);
        if (result.success) {
            revalidatePath('/dashboard');
            return {
                success: true,
                message: "Shop deleted successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete shop"
        };
    }
}

export const handleCreateAdminShop = async (formData: any) => {
    try {
        const result = await createAdminShop(formData);
        if (result.success) {
            revalidatePath('/admin/shops');
            return {
                success: true,
                message: "Shop created successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to create shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to create shop"
        };
    }
}

export const handleGetAdminShopById = async (id: string) => {
    try {
        const result = await getAdminShopById(id);
        if (result.success) {
            return {
                success: true,
                message: "Shop fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop"
        };
    }
}

export const handleUpdateAdminShop = async (id: string, formData: any) => {
    try {
        const result = await updateAdminShop(id, formData);
        if (result.success) {
            revalidatePath('/admin/shops');
            return {
                success: true,
                message: "Shop updated successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update shop"
        };
    }
}

export const handleDeleteAdminShop = async (id: string) => {
    try {
        const result = await deleteAdminShop(id);
        if (result.success) {
            revalidatePath('/admin/shops');
            return {
                success: true,
                message: "Shop deleted successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete shop"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete shop"
        };
    }
}