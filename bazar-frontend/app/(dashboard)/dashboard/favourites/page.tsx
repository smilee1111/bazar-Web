"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShopCard from "../../shops/_components/ShopCard";
import { handleGetFavourites, handleRemoveFavourite } from "@/lib/actions/favourite-action";
import { handleGetPublicShopById } from "@/lib/actions/shop-action";
import { toast } from "react-toastify";

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
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        loadFavourites();
    }, []);

    const loadFavourites = async () => {
        setLoading(true);
        try {
            const result = await handleGetFavourites();
            if (!result.success) {
                toast.error(result.message || "Failed to fetch favourites");
                setShops([]);
                return;
            }

            const list = Array.isArray(result.data)
                ? result.data
                : result.data?.data || [];

            const shopResults = await Promise.all(
                list.map((entry: FavouriteEntry) => handleGetPublicShopById(entry.shopId))
            );

            const resolvedShops = shopResults
                .filter((res) => res?.success)
                .map((res) => (Array.isArray(res.data) ? res.data[0] : res.data?.data || res.data))
                .filter(Boolean);

            setShops(resolvedShops);
        } catch {
            toast.error("Failed to load favourites");
        } finally {
            setLoading(false);
        }
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
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Favourites</p>
                <h2 className="text-4xl font-bold text-white">Your Top Rated Picks</h2>
                <p className="text-white/80">Shops you rated 4 stars and above live here.</p>
            </div>

            {loading ? (
                <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8f7e4f] mx-auto"></div>
                            <p className="mt-4 text-[#7a6b45]">Loading favourites...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : shops.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                    <CardContent className="p-8">
                        <div className="text-center">
                            <Heart className="h-12 w-12 text-[#d4c5a0] mx-auto mb-3" />
                            <p className="text-[#7a6b45] text-lg">No favourites yet</p>
                            <p className="text-[#a8986f] text-sm mt-2">Leave a 4-star review to add a favourite.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {shops.map((shop) => (
                        <div key={shop._id} className="space-y-3">
                            <div className="flex items-center justify-between rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                                <div className="flex items-center gap-3 text-white">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8f7e4f] text-white">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Top rated</p>
                                        <p className="text-base font-semibold">{shop.shopName}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-white/60 text-white hover:bg-white/15"
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
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
