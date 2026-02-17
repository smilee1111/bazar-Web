"use server";

import { getUserReviews } from "../api/review";

const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Unexpected error";
};

export const handleGetUserReviews = async () => {
    try {
        const result = await getUserReviews();
        if (result.success) {
            return {
                success: true,
                message: "Reviews fetched successfully",
                data: result.data,
            };
        }
        return { success: false, message: result.message || "Failed to fetch reviews" };
    } catch (err: unknown) {
        return { success: false, message: getErrorMessage(err) || "Failed to fetch reviews" };
    }
};
