"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { handleGetPublicShops } from "@/lib/actions/shop-action";
import { handleGetUserReviews } from "@/lib/actions/review-action";
import ShopCard from "../shops/_components/ShopCard";

interface Shop {
    _id: string;
    shopId: string;
    shopName: string;
    shopAddress: string;
    description?: string;
    contactNumber?: string;
    categoryId?: { _id: string; name: string } | string;
    photos?: any[];
    reviews?: any[];
    details?: any[];
    priceRange?: string;
    avgRating?: number;
    reviewCount?: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [shops, setShops] = useState<Shop[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(shops.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedShops = shops.slice(startIndex, endIndex);

    useEffect(() => {
        loadShops();
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const loadShops = async () => {
        try {
            const [shopsResult, reviewsResult] = await Promise.all([
                handleGetPublicShops(),
                handleGetUserReviews(),
            ]);

            if (shopsResult.success) {
                const data = Array.isArray(shopsResult.data) ? shopsResult.data : shopsResult.data?.data || [];
                setShops(data);
                setCurrentPage(1);
            }

            if (reviewsResult.success) {
                const reviewsData = Array.isArray(reviewsResult.data) ? reviewsResult.data : reviewsResult.data?.data || [];
                setUserReviews(reviewsData);
            }
        } catch (error) {
            console.error("Failed to load shops:", error);
        } finally {
            setLoading(false);
        }
    };

    const isShopReviewed = (shopId: string): boolean => {
        return userReviews.some((review: any) => review.shopId === shopId);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                    Welcome to Bazar
                </p>
                <h2 className="text-4xl font-bold text-white">
                    {user?.name ? `Hello, ${user.name}` : "Welcome!"}
                </h2>
                <p className="text-white/80">Discover amazing local shops and connect with your community</p>
            </div>

            {/* Shop Feed Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Store className="h-6 w-6 text-[#d4c5a0]" />
                        Featured Shops Feed
                    </h3>
                    <Link href="/shops">
                        <Button className="bg-[#8f7e4f] text-white hover:bg-[#7a6b45] rounded-full px-6">
                            View All Shops →
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <CardContent className="p-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8f7e4f] mx-auto"></div>
                                <p className="mt-4 text-[#7a6b45]">Loading shops...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : shops.length === 0 ? (
                    <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <CardContent className="p-12">
                            <div className="text-center">
                                <Store className="h-12 w-12 text-[#d4c5a0] mx-auto mb-3" />
                                <p className="text-[#7a6b45] text-lg">No shops available yet</p>
                                <p className="text-[#a8986f] text-sm mt-2">Check back later for amazing shops!</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-0">
                        {paginatedShops.map((shop) => (
                            <div key={shop._id} className="pb-5 last:pb-0">
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
                        {shops.length > 0 && (
                            <div className="space-y-3 py-4 text-center text-white/85">
                                <p>
                                    Showing {startIndex + 1}-{Math.min(endIndex, shops.length)} of {shops.length} shops
                                </p>
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="border-white/30 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-white/90">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="border-white/30 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-[#8f7e4f] to-[#7a6b45] border-0 shadow-xl">
                <CardContent className="p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">
                                Want to explore more shops?
                            </h3>
                            <p className="text-white/90">
                                Visit our complete shop feed to discover all available local businesses in your area.
                            </p>
                        </div>
                        <Link href="/shops">
                            <Button className="bg-white text-[#8f7e4f] hover:bg-white/90 rounded-full px-8 font-semibold whitespace-nowrap">
                                Browse All Shops
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
