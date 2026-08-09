"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShopCard from "../../shops/_components/ShopCard";
import { handleGetFavourites, handleRemoveFavourite } from "@/lib/actions/favourite-action";
import { handleGetPublicShopById } from "@/lib/actions/shop-action";import { handleGetUserReviews } from "@/lib/actions/review-action";import { toast } from "react-toastify";

interface FavouriteEntry {
    _id: string;
    shopId: string;
}

interface ShopPhoto {
    photoName?: string;
}

interface ShopReview {
    _id?: string;
    starNum?: number;
    reviewText?: string;
    reviewName?: string;
}

interface ShopDetail {
    [key: string]: unknown;
}

interface Shop {
    _id: string;
    shopId: string;
    shopName: string;
    shopAddress: string;
    description?: string;
    contactNumber?: string;
    categoryId?: string | { _id?: string; name?: string; categoryId?: string } | null;
    priceRange?: string;
    photos?: ShopPhoto[];
    reviews?: ShopReview[];
    details?: ShopDetail[];
    avgRating?: number;
    reviewCount?: number;
}

export default function FavouritesPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        loadFavourites();
    }, []);

    const loadFavourites = async () => {
        setLoading(true);
        try {
            const [favouritesResult, reviewsResult] = await Promise.all([
                handleGetFavourites(),
                handleGetUserReviews(),
            ]);

            if (!favouritesResult.success) {
                toast.error(favouritesResult.message || "Failed to fetch favourites");
                setShops([]);
                setLoading(false);
                return;
            }

            const list = Array.isArray(favouritesResult.data)
                ? favouritesResult.data
                : favouritesResult.data?.data || [];

            const shopResults = await Promise.all(
                list.map((entry: FavouriteEntry) => handleGetPublicShopById(entry.shopId))
            );

            const resolvedShops = shopResults
                .filter((res) => res?.success)
                .map((res) => (Array.isArray(res.data) ? res.data[0] : res.data?.data || res.data))
                .filter(Boolean);

            setShops(resolvedShops);

            if (reviewsResult.success) {
                const reviewsData = Array.isArray(reviewsResult.data) ? reviewsResult.data : reviewsResult.data?.data || [];
                setUserReviews(reviewsData);
            }
        } catch {
            toast.error("Failed to load favourites");
        } finally {
            setLoading(false);
        }
    };

    const isShopReviewed = (shopId: string): boolean => {
        return userReviews.some((review: any) => review.shopId === shopId);
    };

    const handleRemove = async (shopId: string) => {
        setRemoving(shopId);
        try {
            const result = await handleRemoveFavourite(shopId);
            if (result.success) {
                toast.success("Removed from favourites");
                setShops((prev) => prev.filter((shop) => (shop.shopId || shop._id) !== shopId));
            } else {
                toast.error(result.message || "Failed to remove favourite");
            }
        } catch {
            toast.error("Failed to remove favourite");
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Favourites</p>
                <h2 className="text-4xl font-bold text-[#142A1C]">Your Top Rated Picks</h2>
                <p className="text-gray-500">Shops you rated 4 stars and above live here.</p>
            </div>

            {loading ? (
                <Card className="bg-white border-[1.2px] border-gray-100 shadow-sm">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#267A4C] mx-auto"></div>
                            <p className="mt-4 text-[#1C5C39]">Loading favourites...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : shops.length === 0 ? (
                <Card className="bg-white border-[1.2px] border-gray-100 shadow-sm">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <Heart className="h-12 w-12 text-[#93E48B] mx-auto mb-3" />
                            <p className="text-[#1C5C39] text-lg">No favourites yet</p>
                            <p className="text-[#4FAF6D] text-sm mt-2">Leave a 4-star review to add a favourite.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {shops.map((shop) => (
                        <div key={shop._id} className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-3 text-[#142A1C]">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#267A4C] text-white">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Top rated</p>
                                        <p className="text-base font-semibold">{shop.shopName}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-gray-300 text-[#142A1C] hover:bg-gray-50"
                                    onClick={() => handleRemove(shop.shopId || shop._id)}
                                    disabled={removing === (shop.shopId || shop._id)}
                                >
                                    {removing === (shop.shopId || shop._id) ? "Removing..." : "Remove"}
                                </Button>
                            </div>

                            <ShopCard
                                shopId={shop.shopId || shop._id}
                                shopName={shop.shopName}
                                shopAddress={shop.shopAddress}
                                description={shop.description}
                                contactNumber={shop.contactNumber}
                                categoryId={shop.categoryId}
                                priceRange={shop.priceRange}
                                photos={shop.photos || []}
                                reviews={shop.reviews || []}
                                details={shop.details || []}
                                avgRating={shop.avgRating}
                                reviewCount={shop.reviewCount}
                                isReviewed={isShopReviewed(shop.shopId || shop._id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
