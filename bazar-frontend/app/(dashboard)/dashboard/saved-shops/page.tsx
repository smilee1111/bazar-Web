"use client";

import { useEffect, useState } from "react";
import { Bookmark, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShopCard from "../../shops/_components/ShopCard";
import { handleGetSavedShops, handleRemoveSavedShop } from "@/lib/actions/savedShop-action";
import { handleGetPublicShopById } from "@/lib/actions/shop-action";
import { handleGetUserReviews } from "@/lib/actions/review-action";
import { toast } from "react-toastify";

interface SavedShopEntry {
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

export default function SavedShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        loadSavedShops();
    }, []);

    const loadSavedShops = async () => {
        setLoading(true);
        try {
            const [savedShopsResult, reviewsResult] = await Promise.all([
                handleGetSavedShops(),
                handleGetUserReviews(),
            ]);

            if (!savedShopsResult.success) {
                toast.error(savedShopsResult.message || "Failed to fetch saved shops");
                setShops([]);
                setLoading(false);
                return;
            }

            const entries = Array.isArray(savedShopsResult.data)
                ? savedShopsResult.data
                : savedShopsResult.data?.data || [];

            const shopResults = await Promise.all(
                entries.map((entry: SavedShopEntry) => handleGetPublicShopById(entry.shopId))
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
            toast.error("Failed to load saved shops");
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
            const result = await handleRemoveSavedShop(shopId);
            if (result.success) {
                toast.success("Removed from saved shops");
                setShops((prev) => prev.filter((shop) => (shop.shopId || shop._id) !== shopId));
            } else {
                toast.error(result.message || "Failed to remove saved shop");
            }
        } catch {
            toast.error("Failed to remove saved shop");
        } finally {
            setRemoving(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Saved</p>
                <h2 className="text-4xl font-bold text-[#2D2318]">Your Saved Shops</h2>
                <p className="text-gray-500">Keep track of shops you want to revisit.</p>
            </div>

            {loading ? (
                <Card className="bg-white border-[1.2px] border-gray-100 shadow-sm">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto"></div>
                            <p className="mt-4 text-[#7D5A3F]">Loading saved shops...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : shops.length === 0 ? (
                <Card className="bg-white border-[1.2px] border-gray-100 shadow-sm">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <Bookmark className="h-12 w-12 text-[#C99A6E] mx-auto mb-3" />
                            <p className="text-[#7D5A3F] text-lg">No saved shops yet</p>
                            <p className="text-[#a8986f] text-sm mt-2">Browse the shop feed and save your favorites.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {shops.map((shop) => (
                        <div key={shop._id} className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-3 text-[#2D2318]">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B6F47] text-white">
                                        <Store className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Saved shop</p>
                                        <p className="text-base font-semibold">{shop.shopName}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-gray-300 text-[#2D2318] hover:bg-gray-50"
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
