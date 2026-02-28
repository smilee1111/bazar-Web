"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Compass, Heart, MessageCircle, Sparkles, Star, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleGetPublicShops } from "@/lib/actions/shop-action";
import { handleGetUserReviews } from "@/lib/actions/review-action";
import { handleGetSavedShops } from "@/lib/actions/savedShop-action";
import { handleGetFavourites } from "@/lib/actions/favourite-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { API_CONFIG } from "@/lib/api/config";
import { useAuth } from "../../context/AuthContext";
import ShopCard from "../shops/_components/ShopCard";

interface Shop {
    _id: string;
    shopId: string;
    shopName: string;
    shopAddress: string;
    description?: string;
    contactNumber?: string;
    categoryId?: { _id: string; name: string } | string;
    photos?: Array<{ photoName?: string }>;
    reviews?: any[];
    details?: any[];
    priceRange?: string;
    avgRating?: number;
    reviewCount?: number;
}

interface UserReview {
    _id?: string;
    shopId?: string;
    starNum?: number;
    reviewText?: string;
    reviewName?: string;
    createdAt?: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [allShops, setAllShops] = useState<Shop[]>([]);
    const [userReviews, setUserReviews] = useState<UserReview[]>([]);
    const [savedShopsCount, setSavedShopsCount] = useState(0);
    const [favouritesCount, setFavouritesCount] = useState(0);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const roleRaw = typeof user?.role === "string"
        ? user.role
        : user?.role?.roleName || user?.role?.name || user?.roleId?.roleName || user?.roleId;
    const normalizedRole = typeof roleRaw === "string" ? roleRaw.toLowerCase() : "user";
    const isAdmin = normalizedRole === "admin";
    const isSeller = normalizedRole === "seller" || user?.sellerStatus === "approved";

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [shopsResult, reviewsResult, savedResult, favouritesResult] = await Promise.all([
                handleGetPublicShops(),
                handleGetUserReviews(),
                handleGetSavedShops(),
                handleGetFavourites(),
            ]);

            if (shopsResult.success) {
                const data = Array.isArray(shopsResult.data) ? shopsResult.data : shopsResult.data?.data || [];
                setAllShops(data);
            }

            if (reviewsResult.success) {
                const reviewsData = Array.isArray(reviewsResult.data) ? reviewsResult.data : reviewsResult.data?.data || [];
                setUserReviews(reviewsData);
            }

            if (savedResult.success) {
                const savedData = Array.isArray(savedResult.data) ? savedResult.data : savedResult.data?.data || [];
                setSavedShopsCount(savedData.length);
            }

            if (favouritesResult.success) {
                const favData = Array.isArray(favouritesResult.data) ? favouritesResult.data : favouritesResult.data?.data || [];
                setFavouritesCount(favData.length);
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const isShopReviewed = (shopId: string): boolean => {
        return userReviews.some((review: UserReview) => review.shopId === shopId);
    };

    const topRatedShops = useMemo(() => {
        return [...allShops]
            .sort((a, b) => {
                const aRating = typeof a.avgRating === "number" ? a.avgRating : 0;
                const bRating = typeof b.avgRating === "number" ? b.avgRating : 0;
                if (bRating !== aRating) return bRating - aRating;
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            })
            .slice(0, 4);
    }, [allShops]);
    const totalPlatformReviews = useMemo(
        () => allShops.reduce((sum, shop) => sum + (shop.reviewCount || 0), 0),
        [allShops]
    );
    const avgPlatformRating = useMemo(() => {
        if (allShops.length === 0) return 0;
        const rated = allShops.filter((shop) => typeof shop.avgRating === "number" && (shop.avgRating || 0) > 0);
        if (rated.length === 0) return 0;
        const total = rated.reduce((sum, shop) => sum + (shop.avgRating || 0), 0);
        return total / rated.length;
    }, [allShops]);

    const spotlightShop = topRatedShops[0];
    const topPicks = topRatedShops.slice(0, 3);

    const recentActivity = useMemo(() => {
        return [...userReviews]
            .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 4);
    }, [userReviews]);

    const shopNameById = useMemo(() => {
        const map = new Map<string, string>();
        allShops.forEach((shop) => {
            const id = shop.shopId || shop._id;
            if (id) map.set(id, shop.shopName);
        });
        return map;
    }, [allShops]);

    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden border-white/20 bg-gradient-to-br from-[#8f7e4f] via-[#7f7247] to-[#5f5536] text-white shadow-2xl">
                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#d4c5a0]/20 blur-3xl" />
                <CardContent className="relative p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                        <div className="space-y-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-white/80">Welcome to Bazar</p>
                            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                                {isAdmin
                                    ? "Admin Control Center"
                                    : isSeller
                                        ? `${user?.name ? `Hi ${user.name},` : "Seller,"} grow your shop today.`
                                        : `${user?.name ? `Hi ${user.name},` : "Welcome,"} let's find your next favorite shop.`}
                            </h1>
                            <p className="max-w-xl text-white/85">
                                {isAdmin
                                    ? "Monitor platform performance, manage shops, and keep operations smooth."
                                    : isSeller
                                        ? "Track engagement, monitor reviews, and jump into shop management fast."
                                        : "Fresh picks, your activity, and quick actions all in one place."}
                            </p>
                            <div className="flex flex-wrap gap-3 pt-1">
                                <Link href={isAdmin ? "/admin/shops" : isSeller ? "/my-shop" : "/shops"}>
                                    <Button className="bg-white text-[#7a6b45] hover:bg-white/90">
                                        <Compass className="mr-2 h-4 w-4" />
                                        {isAdmin ? "Manage Shops" : isSeller ? "My Shop" : "Browse Shops"}
                                    </Button>
                                </Link>
                                <Link href={isAdmin ? "/admin/users" : "/dashboard/saved-shops"}>
                                    <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                                        {isAdmin ? "Manage Users" : "My Saved Shops"}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-black/15 p-4 backdrop-blur-sm">
                            {spotlightShop ? (
                                <div className="space-y-3">
                                    <div className="relative h-44 overflow-hidden rounded-xl border border-white/20">
                                        <Image
                                            src={API_CONFIG.getImageUrl(spotlightShop.photos?.[0]?.photoName)}
                                            alt={spotlightShop.shopName}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-xs uppercase tracking-[0.2em] text-white/75">Spotlight</p>
                                            <p className="text-lg font-semibold text-white">{spotlightShop.shopName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-white/90">
                                            <Star className="h-4 w-4 text-yellow-300" />
                                            <span>{(spotlightShop.avgRating || 0).toFixed(1)}</span>
                                            <span className="text-white/70">({spotlightShop.reviewCount || 0} reviews)</span>
                                        </div>
                                        <Link href={`/shops/${spotlightShop.shopId || spotlightShop._id}`}>
                                            <Button size="sm" className="bg-[#d4c5a0] text-[#4f462d] hover:bg-[#e2d6b8]">
                                                Open Shop
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-44 items-center justify-center text-white/70">
                                    Recommendations will appear here.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-white/20 bg-white/95 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[#7a6b45]">{isAdmin ? "Managed Shops" : "Saved Shops"}</p>
                            <Bookmark className="h-4 w-4 text-[#8f7e4f]" />
                        </div>
                        <p className="mt-1 text-2xl font-bold text-[#1f1a14]">{isAdmin ? allShops.length : savedShopsCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 bg-white/95 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[#7a6b45]">{isAdmin ? "Platform Reviews" : "Favourites"}</p>
                            <Heart className="h-4 w-4 text-[#8f7e4f]" />
                        </div>
                        <p className="mt-1 text-2xl font-bold text-[#1f1a14]">{isAdmin ? totalPlatformReviews : favouritesCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 bg-white/95 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[#7a6b45]">{isAdmin ? "Top Rated Shops" : "My Reviews"}</p>
                            <MessageCircle className="h-4 w-4 text-[#8f7e4f]" />
                        </div>
                        <p className="mt-1 text-2xl font-bold text-[#1f1a14]">
                            {isAdmin ? allShops.filter((shop) => (shop.avgRating || 0) >= 4.5).length : userReviews.length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 bg-white/95 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-[#7a6b45]">{isAdmin ? "Avg Platform Rating" : "Available Shops"}</p>
                            <Store className="h-4 w-4 text-[#8f7e4f]" />
                        </div>
                        <p className="mt-1 text-2xl font-bold text-[#1f1a14]">
                            {isAdmin ? avgPlatformRating.toFixed(1) : allShops.length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {topPicks.map((shop) => (
                    <Link key={shop._id} href={`/shops/${shop.shopId || shop._id}`}>
                        <Card className="overflow-hidden border-white/20 bg-white/95 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                            <div className="relative h-32">
                                <Image
                                    src={API_CONFIG.getImageUrl(shop.photos?.[0]?.photoName)}
                                    alt={shop.shopName}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                                    <span className="truncate text-sm font-semibold">{shop.shopName}</span>
                                    <span className="flex items-center gap-1 text-xs">
                                        <Star className="h-3 w-3 text-yellow-300" />
                                        {(shop.avgRating || 0).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <p className="line-clamp-1 text-xs text-[#7a6b45]">{shop.shopAddress}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {!loading && topPicks.length === 0 && (
                    <Card className="border-white/20 bg-white/95 shadow-lg md:col-span-3">
                        <CardContent className="p-5 text-center text-sm text-[#7a6b45]">
                            No top picks yet.
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="border-[1.2px] border-white/20 bg-white/95 shadow-lg lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-[#1f1a14]">{isAdmin ? "Admin Actions" : isSeller ? "Seller Actions" : "Quick Actions"}</CardTitle>
                        <CardDescription>
                            {isAdmin ? "Jump into core admin workflows." : isSeller ? "Manage your shop and engagement." : "Jump into your most used pages."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href={isAdmin ? "/admin/shops" : isSeller ? "/my-shop" : "/shops"} className="block">
                            <Button className="w-full justify-start bg-[#8f7e4f] text-white hover:bg-[#7a6b45]">
                                <Compass className="mr-2 h-4 w-4" />
                                {isAdmin ? "Manage Shops" : isSeller ? "My Shop" : "Browse Shops"}
                            </Button>
                        </Link>
                        <Link href={isAdmin ? "/admin/users" : "/dashboard/saved-shops"} className="block">
                            <Button variant="outline" className="w-full justify-start border-[#d8c9a4] text-[#7a6b45] hover:bg-[#f5efe3]">
                                <Bookmark className="mr-2 h-4 w-4" />
                                {isAdmin ? "Manage Users" : "My Saved Shops"}
                            </Button>
                        </Link>
                        <Link href={isAdmin ? "/shops" : "/dashboard/favourites"} className="block">
                            <Button variant="outline" className="w-full justify-start border-[#d8c9a4] text-[#7a6b45] hover:bg-[#f5efe3]">
                                <Heart className="mr-2 h-4 w-4" />
                                {isAdmin ? "View Public Feed" : "My Favourites"}
                            </Button>
                        </Link>
                        <Link href={isAdmin ? "/profile" : "/profile"} className="block">
                            <Button variant="outline" className="w-full justify-start border-[#d8c9a4] text-[#7a6b45] hover:bg-[#f5efe3]">
                                Profile Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-[1.2px] border-white/20 bg-white/95 shadow-lg lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-[#1f1a14]">{isAdmin ? "Platform Activity" : "Recent Activity"}</CardTitle>
                            <CardDescription>{isAdmin ? "Latest review activity across shops." : "Your latest review activity."}</CardDescription>
                        </div>
                        <Link href="/shops">
                            <Button variant="outline" className="border-[#d8c9a4] text-[#7a6b45] hover:bg-[#f5efe3]">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Explore More
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-[#7a6b45]">No recent activity yet. Start by reviewing a shop.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((review, index) => {
                                    const reviewShopId = review.shopId || "";
                                    const reviewShopName = shopNameById.get(reviewShopId) || "Shop";
                                    return (
                                        <div key={review._id || `${reviewShopId}-${index}`} className="rounded-xl border border-[#efe7d6] bg-[#fbf8f1] p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <Link href={reviewShopId ? `/shops/${reviewShopId}` : "/shops"} className="font-medium text-[#1f1a14] hover:text-[#8f7e4f]">
                                                    {reviewShopName}
                                                </Link>
                                                <span className="text-xs text-[#7a6b45]">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-[#7a6b45]">
                                                <Star className="h-4 w-4 text-[#d1a547]" />
                                                <span>{review.starNum || 0}/5</span>
                                            </div>
                                            <p className="mt-2 text-sm text-[#5f5135] line-clamp-2">
                                                {review.reviewText || review.reviewName || "You left feedback for this shop."}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                        {isAdmin ? "Top Performing Shops" : isSeller ? "Market Highlights" : "Recommended For You"}
                    </h3>
                    <Link href={isAdmin ? "/admin/shops" : "/shops"}>
                        <Button className="bg-[#8f7e4f] text-white hover:bg-[#7a6b45] rounded-full px-6">
                            {isAdmin ? "Open Admin Shops" : "Browse All Shops"}
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <CardContent className="p-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8f7e4f] mx-auto"></div>
                                <p className="mt-3 text-[#7a6b45]">Loading your dashboard...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : topRatedShops.length === 0 ? (
                    <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <CardContent className="p-10">
                            <div className="text-center">
                                <Store className="h-12 w-12 text-[#d4c5a0] mx-auto mb-3" />
                                <p className="text-[#7a6b45] text-lg">No recommendations yet</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-0">
                        {topRatedShops.map((shop) => {
                            const categoryName =
                           typeof shop.categoryId === "object"
                            ? shop.categoryId.name
                            : categories.find(cat => cat._id === shop.categoryId)?.name || ""; 
                            return(
                                <div key={shop._id} className="pb-5 last:pb-0">
                                <ShopCard
                                    shopId={shop.shopId || shop._id}
                                    shopName={shop.shopName}
                                    shopAddress={shop.shopAddress}
                                    description={shop.description}
                                    contactNumber={shop.contactNumber}
                                    categoryId={shop.categoryId}
                                    categoryName={categoryName}
                                    priceRange={shop.priceRange}
                                    photos={shop.photos || []}
                                    reviews={shop.reviews || []}
                                    details={shop.details || []}
                                    avgRating={shop.avgRating}
                                    reviewCount={shop.reviewCount}
                                    isReviewed={isShopReviewed(shop.shopId || shop._id)}
                                />
                            </div>
                            );              
                       })}
                    </div>
                )}
            </div>
        </div>
    );
}
