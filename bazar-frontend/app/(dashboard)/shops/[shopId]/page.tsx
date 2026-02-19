"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Mail, Star, ThumbsUp, ThumbsDown, X, ZoomIn, ChevronLeft, ChevronRight, Heart, Bookmark, Edit2, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ReviewForm from "@/components/ReviewForm";
import { API_CONFIG } from "@/lib/api/config";
import { handleGetPublicShopById } from "@/lib/actions/shop-action";
import { handleLikeShopReview, handleUnlikeShopReview, handleIsReviewLiked, handleDislikeShopReview, handleUndislikeShopReview, handleIsReviewDisliked } from "@/lib/actions/shopReview-action";
import { handleGetUserReviews } from "@/lib/actions/review-action";
import { handleAddFavourite, handleRemoveFavourite, handleGetFavourites } from "@/lib/actions/favourite-action";
import { handleSaveShop, handleRemoveSavedShop, handleGetSavedShops } from "@/lib/actions/savedShop-action";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";

interface Review {
    _id: string;
    shopId: string;
    userId: string;
    reviewedBy?: {
        fullName?: string;
        email?: string;
    } | string;
    starNum: number;
    reviewText?: string;
    reviewName?: string;
    likes: number;
    dislikes: number;
    likesCount?: number;
    dislikeCount?: number;
    userLiked?: boolean;
    userDisliked?: boolean;
    createdAt: string;
}

interface Photo {
    _id: string;
    photoName: string;
    shopId: string;
}

interface Shop {
    _id: string;
    shopId: string;
    shopName: string;
    shopAddress: string;
    description: string;
    contactNumber?: string;
    email?: string;
    categoryId?: any;
    priceRange?: string;
    details?: any[];
    photos?: Photo[];
    reviews?: Review[];
    avgRating?: number;
}

export default function ShopDetailPage() {
    const params = useParams();
    const shopId = params?.shopId as string;
    const { user } = useAuth();
    const [shop, setShop] = useState<Shop | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isReviewed, setIsReviewed] = useState(false);
    const [isFav, setIsFav] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(false);
    const [isLoadingSave, setIsLoadingSave] = useState(false);
    const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
    const [loadingLikeStates, setLoadingLikeStates] = useState<Set<string>>(new Set());
    const [dislikedReviews, setDislikedReviews] = useState<Set<string>>(new Set());
    const [loadingDislikeStates, setLoadingDislikeStates] = useState<Set<string>>(new Set());
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editReviewText, setEditReviewText] = useState("");
    const [editReviewRating, setEditReviewRating] = useState(0);

    const getReviewerName = (reviewedBy?: Review["reviewedBy"], userId?: string) => {
        if (reviewedBy && typeof reviewedBy !== "string") {
            return reviewedBy.fullName || (reviewedBy.email ? reviewedBy.email.split("@")[0] : "Customer");
        }
        if (typeof reviewedBy === "string" && reviewedBy.trim().length > 0) {
            return "Customer";
        }
        if (userId) {
            return "Customer";
        }
        return "Anonymous";
    };

    const formatDate = (value?: string) => {
        if (!value) return "Recently";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Recently";
        return date.toLocaleDateString();
    };

    useEffect(() => {
        if (shopId) {
            loadShopDetails();
        }
    }, [shopId]);

    const loadShopDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Loading shop details for shopId:", shopId);
            const result = await handleGetPublicShopById(shopId);
            console.log("Shop API response:", result);

            if (result.success && result.data) {
                const shopData = Array.isArray(result.data) ? result.data[0] : result.data;
                console.log("Shop data received:", shopData);
                setShop(shopData);
                setPhotos(shopData.photos || []);
                setReviews(shopData.reviews || []);

                const canonicalShopId = shopData.shopId || shopData._id || shopId;
                const [reviewsResult, favouritesResult, savedResult] = await Promise.all([
                    handleGetUserReviews(),
                    handleGetFavourites(),
                    handleGetSavedShops(),
                ]);

                if (reviewsResult.success) {
                    const reviewsData = Array.isArray(reviewsResult.data)
                        ? reviewsResult.data
                        : reviewsResult.data?.data || [];
                    setIsReviewed(reviewsData.some((review: any) => review.shopId === canonicalShopId));
                }

                if (favouritesResult.success) {
                    const favouritesData = Array.isArray(favouritesResult.data)
                        ? favouritesResult.data
                        : favouritesResult.data?.data || [];
                    setIsFav(favouritesData.some((entry: any) => entry.shopId === canonicalShopId));
                }

                if (savedResult.success) {
                    const savedData = Array.isArray(savedResult.data)
                        ? savedResult.data
                        : savedResult.data?.data || [];
                    setIsSaved(savedData.some((entry: any) => entry.shopId === canonicalShopId));
                }

                // Check which reviews are liked by current user
                if (shopData.reviews && shopData.reviews.length > 0) {
                    const likedSet = new Set<string>();
                    const dislikedSet = new Set<string>();
                    const canonicalId = canonicalShopId;
                    for (const review of shopData.reviews) {
                        try {
                            const likeCheckResult = await handleIsReviewLiked(canonicalId, review._id);
                            if (likeCheckResult.success && likeCheckResult.isLiked) {
                                likedSet.add(review._id);
                            }
                        } catch (err) {
                            // Silently fail on like check
                            console.error("Error checking if review is liked:", err);
                        }

                        try {
                            const dislikeCheckResult = await handleIsReviewDisliked(canonicalId, review._id);
                            if (dislikeCheckResult.success && dislikeCheckResult.isDisliked) {
                                dislikedSet.add(review._id);
                            }
                        } catch (err) {
                            // Silently fail on dislike check
                            console.error("Error checking if review is disliked:", err);
                        }
                    }
                    setLikedReviews(likedSet);
                    setDislikedReviews(dislikedSet);
                }
            } else {
                console.log("API error:", result.message);
                setError(result.message || "Failed to load shop details");
            }
        } catch (error) {
            console.error("Failed to load shop details:", error);
            setError("Failed to load shop details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resolveShopId = () => shop?.shopId || shop?._id || shopId;

    const handleFavouriteToggle = async () => {
        const targetId = resolveShopId();
        if (!targetId) return;
        setIsLoadingFav(true);
        try {
            if (isFav) {
                const result = await handleRemoveFavourite(targetId);
                if (result.success) {
                    setIsFav(false);
                }
            } else {
                const result = await handleAddFavourite(targetId);
                if (result.success) {
                    setIsFav(true);
                }
            }
        } finally {
            setIsLoadingFav(false);
        }
    };

    const handleSaveToggle = async () => {
        const targetId = resolveShopId();
        if (!targetId) return;
        setIsLoadingSave(true);
        try {
            if (isSaved) {
                const result = await handleRemoveSavedShop(targetId);
                if (result.success) {
                    setIsSaved(false);
                }
            } else {
                const result = await handleSaveShop(targetId);
                if (result.success) {
                    setIsSaved(true);
                }
            }
        } finally {
            setIsLoadingSave(false);
        }
    };

    const handleLikeReview = async (reviewId: string) => {
        const targetShopId = resolveShopId();
        if (!targetShopId) {
            toast.error("Shop ID not found");
            return;
        }

        setLoadingLikeStates(prev => new Set(prev).add(reviewId));
        try {
            const isCurrentlyLiked = likedReviews.has(reviewId);
            
            if (isCurrentlyLiked) {
                // Unlike the review
                const result = await handleUnlikeShopReview(targetShopId, reviewId);
                if (result.success) {
                    // Update liked reviews set
                    const newLikedSet = new Set(likedReviews);
                    newLikedSet.delete(reviewId);
                    setLikedReviews(newLikedSet);
                    
                    // Update review likesCount
                    setReviews(reviews.map(r =>
                        r._id === reviewId
                            ? { 
                                ...r, 
                                likesCount: Math.max(0, (r.likesCount ?? 0) - 1)
                              }
                            : r
                    ));
                    toast.success("Review unliked");
                } else {
                    toast.error(result.message || "Failed to unlike review");
                }
            } else {
                // Like the review
                const result = await handleLikeShopReview(targetShopId, reviewId);
                if (result.success) {
                    // Update liked reviews set
                    const newLikedSet = new Set(likedReviews);
                    newLikedSet.add(reviewId);
                    setLikedReviews(newLikedSet);
                    
                    // Update review likesCount
                    setReviews(reviews.map(r =>
                        r._id === reviewId
                            ? { 
                                ...r, 
                                likesCount: (r.likesCount ?? 0) + 1
                              }
                            : r
                    ));
                    toast.success("Review liked");
                } else {
                    toast.error(result.message || "Failed to like review");
                }
            }
        } catch (error: any) {
            console.error("Error liking/unliking review:", error);
            toast.error(error.message || "Error processing like");
        } finally {
            setLoadingLikeStates(prev => {
                const newSet = new Set(prev);
                newSet.delete(reviewId);
                return newSet;
            });
        }
    };

    const handleDislikeReview = async (reviewId: string) => {
        const targetShopId = resolveShopId();
        if (!targetShopId) {
            toast.error("Shop ID not found");
            return;
        }

        setLoadingDislikeStates(prev => new Set(prev).add(reviewId));
        try {
            const isCurrentlyDisliked = dislikedReviews.has(reviewId);
            
            if (isCurrentlyDisliked) {
                // Undislike the review
                const result = await handleUndislikeShopReview(targetShopId, reviewId);
                if (result.success) {
                    // Update disliked reviews set
                    const newDislikedSet = new Set(dislikedReviews);
                    newDislikedSet.delete(reviewId);
                    setDislikedReviews(newDislikedSet);
                    
                    // Update review dislikeCount
                    setReviews(reviews.map(r =>
                        r._id === reviewId
                            ? { 
                                ...r, 
                                dislikeCount: Math.max(0, (r.dislikeCount ?? 0) - 1)
                              }
                            : r
                    ));
                    toast.success("Review undisliked");
                } else {
                    toast.error(result.message || "Failed to undislike review");
                }
            } else {
                // Dislike the review
                const result = await handleDislikeShopReview(targetShopId, reviewId);
                if (result.success) {
                    // Update disliked reviews set
                    const newDislikedSet = new Set(dislikedReviews);
                    newDislikedSet.add(reviewId);
                    setDislikedReviews(newDislikedSet);
                    
                    // Update review dislikeCount
                    setReviews(reviews.map(r =>
                        r._id === reviewId
                            ? { 
                                ...r, 
                                dislikeCount: (r.dislikeCount ?? 0) + 1
                              }
                            : r
                    ));
                    toast.success("Review disliked");
                } else {
                    toast.error(result.message || "Failed to dislike review");
                }
            }
        } catch (error: any) {
            console.error("Error disliking/undisliking review:", error);
            toast.error(error.message || "Error processing dislike");
        } finally {
            setLoadingDislikeStates(prev => {
                const newSet = new Set(prev);
                newSet.delete(reviewId);
                return newSet;
            });
        }
    };

    const handleStartEditReview = (review: Review) => {
        setEditingReviewId(review._id);
        setEditReviewText(review.reviewText || review.reviewName || "");
        setEditReviewRating(review.starNum);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setEditReviewText("");
        setEditReviewRating(0);
    };

    const handleSaveEditReview = async (reviewId: string) => {
        const targetShopId = resolveShopId();
        if (!targetShopId) {
            toast.error("Shop ID not found");
            return;
        }

        if (editReviewRating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (editReviewText.trim().length < 10) {
            toast.error("Review must be at least 10 characters long");
            return;
        }

        try {
            const { updateShopReview } = await import("@/lib/api/shopReview");
            const result = await updateShopReview(targetShopId, reviewId, {
                reviewName: editReviewText,
                starNum: editReviewRating
            });

            if (result.success) {
                // Update local state
                setReviews(reviews.map(r =>
                    r._id === reviewId
                        ? { 
                            ...r, 
                            reviewName: editReviewText,
                            reviewText: editReviewText,
                            starNum: editReviewRating
                          }
                        : r
                ));
                toast.success("Review updated successfully");
                handleCancelEdit();
            } else {
                toast.error(result.message || "Failed to update review");
            }
        } catch (error: any) {
            console.error("Error updating review:", error);
            toast.error(error.message || "Error updating review");
        }
    };

    const isReviewOwner = (review: Review): boolean => {
        if (!user) return false;
        const reviewerId = typeof review.reviewedBy === 'object' && review.reviewedBy?._id
            ? review.reviewedBy._id
            : typeof review.reviewedBy === 'object' && review.reviewedBy?.email
            ? review.reviewedBy.email
            : review.reviewedBy;
        
        return user._id === reviewerId || user.email === reviewerId || user._id === review.userId;
    };

    const isShopOwner = (): boolean => {
        if (!user || !shop) return false;
        const shopOwnerId = typeof shop.ownerId === 'object' && (shop.ownerId as any)?._id
            ? (shop.ownerId as any)._id
            : shop.ownerId;
        
        return user._id === shopOwnerId || user.email === shopOwnerId;
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.starNum || 0), 0) / reviews.length).toFixed(1)
        : "0";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#2c2416]/95 to-[#1a1812] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8f7e4f]/30 border-t-[#8f7e4f]"></div>
                    </div>
                    <p className="mt-6 text-white/70 text-lg">Loading shop details...</p>
                </div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#2c2416]/95 to-[#1a1812] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6">
                        <p className="text-red-300 text-lg font-medium">{error || "Shop not found"}</p>
                        <p className="text-white/50 text-sm mt-2">The shop you're looking for doesn't exist or is no longer available.</p>
                    </div>
                    <Link href="/shops">
                        <Button className="bg-[#8f7e4f] hover:bg-[#7a6940] text-white px-8">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Shops
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2c2416] via-[#1a1812] to-[#0f0d0a]">
            {/* Back Button */}
            <div className="sticky top-4 z-40 flex justify-start px-4 md:px-8">
                <Link href="/shops">
                    <Button variant="outline" className="border-white/20 bg-black/40 text-white hover:bg-white/10 backdrop-blur-sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Shops
                    </Button>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Photo Gallery Section */}
                {photos.length > 0 && (
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                        <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-[#e6d8be] to-[#d4c5a0]">
                            <Image
                                src={API_CONFIG.getImageUrl(photos[currentPhotoIndex].photoName)}
                                alt={shop.shopName}
                                fill
                                className="object-cover cursor-pointer hover:opacity-95 transition"
                                onClick={() => setSelectedPhoto(photos[currentPhotoIndex])}
                                priority
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                <div className="bg-black/50 p-4 rounded-full">
                                    <ZoomIn className="h-8 w-8 text-white" />
                                </div>
                            </div>

                            {/* Photo Counter */}
                            {photos.length > 1 && (
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg">
                                    {currentPhotoIndex + 1}/{photos.length}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-3 rounded-full transition shadow-lg z-10"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-black" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-3 rounded-full transition shadow-lg z-10"
                                    >
                                        <ChevronRight className="h-6 w-6 text-black" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Photo Thumbnails */}
                        {photos.length > 1 && (
                            <div className="p-4 bg-white/5 flex gap-3 overflow-x-auto backdrop-blur-sm">
                                {photos.map((photo, idx) => (
                                    <button
                                        key={photo._id}
                                        onClick={() => setCurrentPhotoIndex(idx)}
                                        className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                                            idx === currentPhotoIndex
                                                ? "border-[#8f7e4f] shadow-lg"
                                                : "border-white/20 hover:border-[#8f7e4f]"
                                        }`}
                                    >
                                        <Image
                                            src={API_CONFIG.getImageUrl(photo.photoName)}
                                            alt="thumbnail"
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Shop Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shop Header Card */}
                        <Card className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
                            <div className="space-y-6">
                                {/* Title and Badge */}
                                <div>
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <h1 className="text-5xl font-bold text-white">{shop.shopName}</h1>
                                        <div className="flex flex-wrap items-center gap-3 justify-end">
                                            {shop.priceRange && (
                                                <span className="rounded-full bg-[#8f7e4f]/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-[#d4c5a0] border border-[#8f7e4f]/30">
                                                    Price Range: {shop.priceRange}
                                                </span>
                                            )}
                                            {isReviewed && (
                                                <span className="rounded-full bg-green-500/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-green-200 border border-green-400/30">
                                                    ✓ You reviewed this
                                                </span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleFavouriteToggle}
                                                    disabled={isLoadingFav}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group relative border border-white/10"
                                                    title={isFav ? "Remove from Favourites" : "Add to Favourites"}
                                                >
                                                    <Heart
                                                        size={20}
                                                        className={`transition-colors ${
                                                            isFav
                                                                ? "fill-red-500 text-red-500"
                                                                : "text-white/60 group-hover:text-red-400"
                                                        } ${isLoadingFav ? "opacity-50" : ""}`}
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        {isFav ? "Remove from Favourites" : "Add to Favourites"}
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={handleSaveToggle}
                                                    disabled={isLoadingSave}
                                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group relative border border-white/10"
                                                    title={isSaved ? "Remove from Saved" : "Save Shop"}
                                                >
                                                    <Bookmark
                                                        size={20}
                                                        className={`transition-colors ${
                                                            isSaved
                                                                ? "fill-blue-400 text-blue-400"
                                                                : "text-white/60 group-hover:text-blue-400"
                                                        } ${isLoadingSave ? "opacity-50" : ""}`}
                                                    />
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        {isSaved ? "Remove from Saved" : "Save Shop"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${
                                                        i < Math.round(parseFloat(avgRating))
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-white/30"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-white">
                                            <span className="text-3xl font-bold text-[#d4c5a0]">{avgRating}</span>
                                            <span className="text-white/60 ml-2">({reviews.length} reviews)</span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {shop.description && (
                                        <p className="text-white/80 text-lg leading-relaxed">
                                            {shop.description}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4 border-t border-white/10 pt-6">
                                    <h3 className="text-white font-semibold text-lg">Contact Information</h3>
                                    <div className="space-y-3">
                                        {shop.shopAddress && (
                                            <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                                <MapPin className="h-5 w-5 text-[#8f7e4f] mt-0.5 flex-shrink-0" />
                                                <span className="text-white/90">{shop.shopAddress}</span>
                                            </div>
                                        )}
                                        {shop.contactNumber && (
                                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                                <Phone className="h-5 w-5 text-[#8f7e4f] flex-shrink-0" />
                                                <a href={`tel:${shop.contactNumber}`} className="text-white/90 hover:text-[#d4c5a0] transition">
                                                    {shop.contactNumber}
                                                </a>
                                            </div>
                                        )}
                                        {shop.email && (
                                            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                                                <Mail className="h-5 w-5 text-[#8f7e4f] flex-shrink-0" />
                                                <a href={`mailto:${shop.email}`} className="text-white/90 hover:text-[#d4c5a0] transition">
                                                    {shop.email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Shop Links */}
                                {shop.details && shop.details.length > 0 && (
                                    <div className="border-t border-white/10 pt-6">
                                        <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {shop.details.flatMap((detail: any) => [
                                                detail.link1,
                                                detail.link2,
                                                detail.link3,
                                                detail.link4,
                                            ]).filter(Boolean).map((link: string, idx: number) => (
                                                <a
                                                    key={`${link}-${idx}`}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-4 py-2 rounded-lg bg-[#8f7e4f]/20 text-[#d4c5a0] hover:bg-[#8f7e4f]/40 transition border border-[#8f7e4f]/30 text-sm"
                                                >
                                                    Link {idx + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Reviews Section */}
                        <Card className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold text-white">Customer Reviews</h2>
                                {reviews.length > 0 && (
                                    <span className="text-white/60 text-sm">{reviews.length} reviews</span>
                                )}
                            </div>

                            {reviews.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                                    {reviews.map((review) => (
                                        <div
                                            key={review._id}
                                            className="border-l-2 border-[#8f7e4f] pl-4 py-4 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-semibold">
                                                    {getReviewerName(review.reviewedBy, review.userId)}
                                                </span>
                                                <span className="text-white/60 text-sm">
                                                    {formatDate(review.createdAt)}
                                                </span>
                                            </div>
                                            {/* Rating */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < review.starNum
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-white/20"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Review Text or Edit Mode */}
                                            {editingReviewId === review._id ? (
                                                <div className="mb-4 space-y-3">
                                                    {/* Star Rating Selector in Edit Mode */}
                                                    <div className="flex items-center gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setEditReviewRating(star)}
                                                                className="transition"
                                                            >
                                                                <Star
                                                                    className={`h-6 w-6 ${
                                                                        star <= editReviewRating
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-white/30 hover:text-yellow-400/50"
                                                                    }`}
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Textarea
                                                        value={editReviewText}
                                                        onChange={(e) => setEditReviewText(e.target.value)}
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                                                        placeholder="Update your review..."
                                                    />
                                                </div>
                                            ) : (
                                                <p className="text-white/80 mb-4 leading-relaxed">
                                                    {review.reviewText || review.reviewName || ""}
                                                </p>
                                            )}

                                            {/* Like/Dislike and Edit Buttons */}
                                            <div className="flex items-center gap-4">
                                                {editingReviewId === review._id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEditReview(review._id)}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 transition"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            <span className="text-sm">Save</span>
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="text-sm">Cancel</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleLikeReview(review._id)}
                                                            disabled={loadingLikeStates.has(review._id)}
                                                            className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
                                                                likedReviews.has(review._id)
                                                                    ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                                                                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                            } ${loadingLikeStates.has(review._id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            title={likedReviews.has(review._id) ? "Unlike review" : "Like review"}
                                                        >
                                                            <ThumbsUp className="h-4 w-4" />
                                                            <span className="text-sm">{review.likesCount ?? 0}</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDislikeReview(review._id)}
                                                            disabled={loadingDislikeStates.has(review._id)}
                                                            className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
                                                                dislikedReviews.has(review._id)
                                                                    ? "bg-red-500/30 text-red-300 border border-red-500/50"
                                                                    : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                                            } ${loadingDislikeStates.has(review._id) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            title={dislikedReviews.has(review._id) ? "Undislike review" : "Dislike review"}
                                                        >
                                                            <ThumbsDown className="h-4 w-4" />
                                                            <span className="text-sm">{review.dislikeCount ?? 0}</span>
                                                        </button>
                                                        {isReviewOwner(review) && (
                                                            <button
                                                                onClick={() => handleStartEditReview(review)}
                                                                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition ml-auto"
                                                                title="Edit your review"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                                <span className="text-sm">Edit</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Star className="h-12 w-12 text-white/20 mx-auto mb-4" />
                                    <p className="text-white/60 text-lg">No reviews yet</p>
                                    <p className="text-white/40 text-sm mt-2">Be the first to share your experience!</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar - Review Form */}
                    <div className="lg:col-span-1">
                        <ReviewForm 
                            shopId={shop.shopId || shop._id} 
                            onReviewSubmitted={loadShopDetails}
                            isShopOwner={isShopOwner()}
                        />
                    </div>
                </div>
            </div>

            {/* Photo Zoom Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <Image
                            src={API_CONFIG.getImageUrl(selectedPhoto.photoName)}
                            alt="Full size"
                            width={1200}
                            height={800}
                            className="object-contain rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Custom Scrollbar CSS */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(143, 126, 79, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(143, 126, 79, 0.5);
                }
            `}</style>
        </div>
    );
}
