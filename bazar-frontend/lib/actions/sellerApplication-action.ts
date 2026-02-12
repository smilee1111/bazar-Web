"use server";

//server side processing of seller application actions
import {
    createSellerApplication,
    getAllSellerApplications,
    getPendingSellerApplications,
    getSellerApplicationById,
    approveSellerApplication,
    rejectSellerApplication,
    updateSellerApplication,
    deleteSellerApplication
} from "../api/sellerApplication";
import { revalidatePath } from "next/cache";

export const handleCreateSellerApplication = async (formData: any) => {
    try {
        const result = await createSellerApplication(formData);
        if (result.success) {
            revalidatePath('/dashboard');
            return {
                success: true,
                message: "Seller application submitted successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to submit seller application"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to submit seller application"
        };
    }
}

export const handleGetAllSellerApplications = async () => {
    try {
        const result = await getAllSellerApplications();
        if (result.success) {
            return {
                success: true,
                message: "Seller applications fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch seller applications"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch seller applications"
        };
    }
}

export const handleGetPendingSellerApplications = async () => {
    try {
        const result = await getPendingSellerApplications();
        if (result.success) {
            return {
                success: true,
                message: "Pending applications fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch pending applications"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch pending applications"
        };
    }
}

export const handleGetSellerApplicationById = async (id: string) => {
    try {
        const result = await getSellerApplicationById(id);
        if (result.success) {
            return {
                success: true,
                message: "Seller application fetched successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch seller application"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch seller application"
        };
    }
}

export const handleApproveSellerApplication = async (id: string, adminRemark?: string) => {
    try {
        const result = await approveSellerApplication(id, adminRemark);
        if (result.success) {
            revalidatePath('/admin/seller-applications');
            return {
                success: true,
                message: "Seller application approved successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to approve seller application"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to approve seller application"
        };
    }
}

export const handleRejectSellerApplication = async (id: string, adminRemark?: string) => {
    try {
        const result = await rejectSellerApplication(id, adminRemark);
        if (result.success) {
            revalidatePath('/admin/seller-applications');
            return {
                success: true,
                message: "Seller application rejected successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to reject seller application"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to reject seller application"
        };
    }
}

export const handleUpdateSellerApplication = async (id: string, formData: any) => {
    try {
        const result = await updateSellerApplication(id, formData);
        if (result.success) {
            revalidatePath('/admin/seller-applications');
            return {
                success: true,
                message: "Seller application updated successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to update seller application"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to update seller application"
        };
    }
}

export const handleDeleteSellerApplication = async (id: string) => {
    try {
        const result = await deleteSellerApplication(id);
        if (result.success) {
            revalidatePath('/admin/seller-applications');
            return {
                success: true,
                message: "Seller application deleted successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete seller application"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete seller application"
        };
    }
}