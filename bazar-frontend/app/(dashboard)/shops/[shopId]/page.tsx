"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Phone, Mail, Star, ThumbsUp, ThumbsDown, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ReviewForm from "@/components/ReviewForm";
import { API_CONFIG } from "@/lib/api/config";
import { handleGetPublicShopById } from "@/lib/actions/shop-action";
import { toast } from "react-toastify";

interface ShopDetailPageProps {
    params: {
        shopId: string;
    };
}

interface Review {
    _id: string;
    shopId: string;
    userId: string;
    starNum: number;
    reviewText: string;
    likes: number;
    dislikes: number;
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
}

export default function ShopDetailPage({ params }: ShopDetailPageProps) {
    const { shopId } = params;
    const [shop, setShop] = useState<Shop | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        loadShopDetails();
    }, [shopId]);

    const loadShopDetails = async () => {
        try {
            setLoading(true);
            const result = await handleGetPublicShopById(shopId);

            if (result.success && result.data) {
                const shopData = Array.isArray(result.data) ? result.data[0] : result.data;
                setShop(shopData);
                setPhotos(shopData.photos || []);
                setReviews(shopData.reviews || []);
            }
        } catch (error) {
            console.error("Failed to load shop details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLikeReview = async (reviewId: string) => {
        try {
            // Like/dislike functionality can be added to backend later
            // For now, we'll simulate it on the frontend
            setReviews(reviews.map(r =>
                r._id === reviewId
                    ? { ...r, likes: r.likes + (r.userLiked ? -1 : 1), userLiked: !r.userLiked }
                    : r
            ));
            toast.success(reviews.find(r => r._id === reviewId)?.userLiked ? "Unlike" : "Review liked!");
        } catch (error) {
            console.error("Error liking review:", error);
        }
    };

    const handleDislikeReview = async (reviewId: string) => {
        try {
            // Like/dislike functionality can be added to backend later
            // For now, we'll simulate it on the frontend
            setReviews(reviews.map(r =>
                r._id === reviewId
                    ? { ...r, dislikes: r.dislikes + (r.userDisliked ? -1 : 1), userDisliked: !r.userDisliked }
                    : r
            ));
            toast.success(reviews.find(r => r._id === reviewId)?.userDisliked ? "Remove dislike" : "Review disliked!");
        } catch (error) {
            console.error("Error disliking review:", error);
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.starNum, 0) / reviews.length).toFixed(1)
        : "0";

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8f7e4f] mx-auto"></div>
                    <p className="mt-4 text-white/80">Loading shop details...</p>
                </div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="space-y-6">
                <Link href="/shops">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Shops
                    </Button>
                </Link>
                <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                    <div className="p-8 text-center">
                        <p className="text-[#7a6b45] text-lg">Shop not found</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link href="/shops">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Shops
                </Button>
            </Link>

            {/* Photo Gallery */}
            {photos.length > 0 && (
                <Card className="overflow-hidden bg-gradient-to-br from-[#e6d8be] to-[#d4c5a0]">
                    <div className="relative w-full h-96">
                        <Image
                            src={API_CONFIG.getImageUrl(photos[currentPhotoIndex].photoName)}
                            alt={shop.shopName}
                            fill
                            className="object-cover cursor-pointer hover:opacity-90 transition"
                            onClick={() => setSelectedPhoto(photos[currentPhotoIndex])}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <div className="bg-black/50 p-4 rounded-full">
                                <ZoomIn className="h-8 w-8 text-white" />
                            </div>
                        </div>

                        {/* Photo Counter and Navigation */}
                        {photos.length > 1 && (
                            <>
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold">
                                    {currentPhotoIndex + 1}/{photos.length}
                                </div>
                                <button
                                    onClick={() => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-3 rounded-full transition"
                                >
                                    ◀
                                </button>
                                <button
                                    onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-3 rounded-full transition"
                                >
                                    ▶
                                </button>
                            </>
                        )}
                    </div>

                    {/* Photo Thumbnails */}
                    {photos.length > 1 && (
                        <div className="p-4 bg-white/95 flex gap-2 overflow-x-auto">
                            {photos.map((photo, idx) => (
                                <button
                                    key={photo._id}
                                    onClick={() => setCurrentPhotoIndex(idx)}
                                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                                        idx === currentPhotoIndex
                                            ? "border-[#8f7e4f]"
                                            : "border-transparent hover:border-[#d4c5a0]"
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
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shop Info Card */}
                    <Card className="p-8 bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <h1 className="text-4xl font-bold text-[#2c2416]">{shop.shopName}</h1>
                                    {shop.priceRange && (
                                        <span className="rounded-full bg-[#f5efe3] px-3 py-1 text-xs font-semibold text-[#8f7e4f]">
                                            Price {shop.priceRange}
                                        </span>
                                    )}
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-2xl ${
                                                    i < Math.round(parseFloat(avgRating))
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-2xl font-bold text-[#8f7e4f]">{avgRating}</span>
                                    <span className="text-gray-600">({reviews.length} reviews)</span>
                                </div>

                                {/* Description */}
                                {shop.description && (
                                    <p className="text-gray-700 text-lg leading-relaxed">
                                        {shop.description}
                                    </p>
                                )}
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 border-t border-[#efe7d6] pt-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-[#8f7e4f]" />
                                    <span className="text-[#2c2416]">{shop.shopAddress}</span>
                                </div>
                                {shop.contactNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-[#8f7e4f]" />
                                        <span className="text-[#2c2416]">{shop.contactNumber}</span>
                                    </div>
                                )}
                                {shop.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-[#8f7e4f]" />
                                        <span className="text-[#2c2416]">{shop.email}</span>
                                    </div>
                                )}
                            </div>

                            {shop.details && shop.details.length > 0 && (
                                <div className="border-t border-[#efe7d6] pt-6">
                                    <h3 className="text-lg font-semibold text-[#2c2416] mb-3">Shop Links</h3>
                                    <div className="space-y-2">
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
                                                className="block text-sm text-[#8f7e4f] hover:underline break-all"
                                            >
                                                {link}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Reviews Section */}
                    <Card className="p-8 bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <h2 className="text-2xl font-bold text-[#2c2416] mb-6">Customer Reviews</h2>

                        {reviews.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="border-l-4 border-[#8f7e4f] pl-4 py-3 hover:bg-[#f9f7f4] rounded transition"
                                    >
                                        {/* Rating and Author */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`text-sm ${
                                                            i < review.starNum
                                                                ? "text-yellow-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Review Text */}
                                        <p className="text-gray-700 mb-3">{review.reviewText || (review as any).reviewName || ""}</p>

                                        {/* Like/Dislike */}
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleLikeReview(review._id)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                                                    review.userLiked
                                                        ? "bg-green-100 text-green-600"
                                                        : "hover:bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                <ThumbsUp className="h-4 w-4" />
                                                <span className="text-sm">{review.likes ?? (review as any).likesCount ?? 0}</span>
                                            </button>
                                            <button
                                                onClick={() => handleDislikeReview(review._id)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${
                                                    review.userDisliked
                                                        ? "bg-red-100 text-red-600"
                                                        : "hover:bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                <ThumbsDown className="h-4 w-4" />
                                                <span className="text-sm">{review.dislikes ?? (review as any).dislikeCount ?? 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No reviews yet. Be the first to review this shop!</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar - Review Form */}
                <div className="lg:col-span-1">
                    <ReviewForm shopId={shop.shopId} onReviewSubmitted={loadShopDetails} />
                </div>
            </div>

            {/* Photo Zoom Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
                        >
                            <X className="h-8 w-8" />
                        </button>
                        <Image
                            src={API_CONFIG.getImageUrl(selectedPhoto.photoName)}
                            alt="Full size"
                            width={800}
                            height={600}
                            className="object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
