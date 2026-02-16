"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { API_CONFIG } from "@/lib/api/config";

interface ShopCardProps {
    shopId: string;
    shopName: string;
    shopAddress: string;
    description?: string;
    photos?: any[];
    reviews?: any[];
    avgRating?: number;
    reviewCount?: number;
    contactNumber?: string;
    categoryId?: any;
    priceRange?: string;
    details?: any[];
}

export default function ShopCard({
    shopId,
    shopName,
    shopAddress,
    description,
    photos = [],
    reviews = [],
    avgRating = 0,
    reviewCount,
    contactNumber,
    priceRange,
}: ShopCardProps) {
    const resolvedReviewCount = typeof reviewCount === "number" ? reviewCount : reviews?.length || 0;
    const avgReviewRating = reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.starNum || 0), 0) / reviews.length).toFixed(1)
        : avgRating ? avgRating.toFixed(1) : "0";

    const collagePhotos = photos.slice(0, 4);
    const reviewSnippets = reviews.slice(0, 2);

    const renderPhotoTile = (photo: any, className: string) => (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            <Image
                src={photo?.photoName ? API_CONFIG.getImageUrl(photo.photoName) : "/images/shop-placeholder.png"}
                alt={shopName}
                fill
                className="object-cover"
            />
        </div>
    );

    return (
        <Link href={`/shops/${shopId}`}>
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border-0">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0">
                    {/* Photo Collage */}
                    <div className="p-4 bg-gradient-to-br from-[#e6d8be] to-[#d4c5a0]">
                        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-64">
                            {collagePhotos[0]
                                ? renderPhotoTile(collagePhotos[0], "col-span-2 row-span-2")
                                : (
                                    <div className="col-span-2 row-span-2 rounded-xl bg-white/70 flex items-center justify-center text-[#8f7e4f] text-sm">
                                        No photos yet
                                    </div>
                                )}
                            {collagePhotos[1]
                                ? renderPhotoTile(collagePhotos[1], "col-span-2 row-span-1")
                                : (
                                    <div className="col-span-2 row-span-1 rounded-xl bg-white/70 flex items-center justify-center text-[#8f7e4f] text-xs">
                                        Add a photo
                                    </div>
                                )}
                            {collagePhotos[2]
                                ? renderPhotoTile(collagePhotos[2], "col-span-1 row-span-1")
                                : (
                                    <div className="col-span-1 row-span-1 rounded-xl bg-white/70" />
                                )}
                            {collagePhotos[3]
                                ? renderPhotoTile(collagePhotos[3], "col-span-1 row-span-1")
                                : (
                                    <div className="col-span-1 row-span-1 rounded-xl bg-white/70" />
                                )}
                        </div>
                    </div>

                    {/* Shop Info */}
                    <div className="p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-2xl font-bold text-[#2c2416] leading-tight">
                                    {shopName}
                                </h3>
                                {priceRange && (
                                    <span className="rounded-full bg-[#f5efe3] px-3 py-1 text-xs font-semibold text-[#8f7e4f]">
                                        Price {priceRange}
                                    </span>
                                )}
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`text-lg ${
                                                i < Math.round(parseFloat(avgReviewRating))
                                                    ? "text-yellow-400"
                                                    : "text-gray-300"
                                            }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-[#8f7e4f]">{avgReviewRating}</span>
                                <span className="text-xs text-gray-600">({resolvedReviewCount})</span>
                            </div>

                            {description && (
                                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                    {description}
                                </p>
                            )}

                            <div className="mt-4 space-y-2">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-[#8f7e4f] mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-700 line-clamp-2">
                                        {shopAddress}
                                    </p>
                                </div>
                                {contactNumber && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4 text-[#8f7e4f]" />
                                        <span>{contactNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Snippets */}
                        <div className="mt-4 rounded-xl bg-[#faf7f1] p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8f7e4f]">Recent reviews</p>
                            {reviewSnippets.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                    {reviewSnippets.map((review: any, idx: number) => (
                                        <div key={review._id || idx} className="text-sm text-gray-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`text-xs ${i < (review.starNum || 0) ? "text-yellow-400" : "text-gray-300"}`}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-[#8f7e4f]">{review.starNum || 0}/5</span>
                                            </div>
                                            <p className="line-clamp-2">
                                                {review.reviewText || review.reviewName || "Great experience!"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-gray-500">No reviews yet. Be the first to review.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
