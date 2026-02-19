"use server";

import { getShopReviewsByShopId, getAdminShopReviewsByShopId, adminDisableShopReview, adminDeleteShopReview, likeShopReview, unlikeShopReview, isReviewLiked, dislikeShopReview, undislikeShopReview, isReviewDisliked } from "../api/shopReview";

export const handleGetShopReviewsByShopId = async (shopId: string) => {
    try {
        const result = await getShopReviewsByShopId(shopId);
        if (result.success) {
            return {
                success: true,
                message: "Shop reviews fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to fetch shop reviews",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to fetch shop reviews",
        };
    }
};

export const handleGetAdminShopReviewsByShopId = async (shopId: string) => {
    try {
        console.log("🟠 SERVER ACTION: Calling getAdminShopReviewsByShopId with shopId:", shopId);
        const result = await getAdminShopReviewsByShopId(shopId);
        console.log("🟠 SERVER ACTION: API returned:", result);
        
        // Handle both array and object responses
        if (result?.success !== false && (Array.isArray(result) || result?.data !== undefined)) {
            const data = Array.isArray(result) ? result : result?.data;
            return {
                success: true,
                message: "Shop reviews fetched successfully",
                data: data,
            };
        }
        
        if (result?.success) {
            return {
                success: true,
                message: "Shop reviews fetched successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result?.message || "Failed to fetch shop reviews",
        };
    } catch (err: Error | any) {
        console.error("🟠 SERVER ACTION: Error caught:", err);
        return {
            success: false,
            message: err.message || "Failed to fetch shop reviews",
        };
    }
};

export const handleAdminDisableShopReview = async (reviewId: string) => {
    try {
        const result = await adminDisableShopReview(reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review disabled successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to disable review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to disable review",
        };
    }
};

export const handleAdminDeleteShopReview = async (reviewId: string) => {
    try {
        const result = await adminDeleteShopReview(reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review deleted successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to delete review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to delete review",
        };
    }
};

export const handleLikeShopReview = async (shopId: string, reviewId: string) => {
    try {
        const result = await likeShopReview(shopId, reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review liked successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to like review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to like review",
        };
    }
};

export const handleUnlikeShopReview = async (shopId: string, reviewId: string) => {
    try {
        const result = await unlikeShopReview(shopId, reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review unliked successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to unlike review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to unlike review",
        };
    }
};

export const handleIsReviewLiked = async (shopId: string, reviewId: string) => {
    try {
        const result = await isReviewLiked(shopId, reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Check completed",
                isLiked: result.data?.isLiked || false,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to check if review is liked",
            isLiked: false,
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to check if review is liked",
            isLiked: false,
        };
    }
};

export const handleDislikeShopReview = async (shopId: string, reviewId: string) => {
    try {
        const result = await dislikeShopReview(shopId, reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review disliked successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to dislike review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to dislike review",
        };
    }
};

export const handleUndislikeShopReview = async (shopId: string, reviewId: string) => {
    try {
        const result = await undislikeShopReview(shopId, reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Review undisliked successfully",
                data: result.data,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to undislike review",
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to undislike review",
        };
    }
};

export const handleIsReviewDisliked = async (shopId: string, reviewId: string) => {
    try {
        const result = await isReviewDisliked(shopId, reviewId);
        if (result.success) {
            return {
                success: true,
                message: "Check completed",
                isDisliked: result.data?.isDisliked || false,
            };
        }
        return {
            success: false,
            message: result.message || "Failed to check if review is disliked",
            isDisliked: false,
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Failed to check if review is disliked",
            isDisliked: false,
        };
    }
};
