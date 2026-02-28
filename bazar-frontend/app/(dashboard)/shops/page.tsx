"use client";

import { useState, useEffect } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShopCard from "./_components/ShopCard";
import ShopSearch from "./_components/ShopSearch";
import { handleGetNearestShops, handleGetPublicShops } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleGetUserReviews } from "@/lib/actions/review-action";
import { toast } from "react-toastify";

interface Shop {
    _id: string;
    shopId: string;
    shopName: string;
    shopAddress: string;
    description?: string;
    contactNumber?: string;
    categoryId?: any;
    priceRange?: string;
    photos?: any[];
    reviews?: any[];
    details?: any[];
    avgRating?: number;
    reviewCount?: number;
}

interface ShopFilters {
    search: string;
    category: string;
    location: string;
    minPrice: string;
    maxPrice: string;
    minRating: string;
    nearestOnly?: boolean;
}

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.max(1, Math.ceil(filteredShops.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedShops = filteredShops.slice(startIndex, endIndex);

    useEffect(() => {
        loadShopsAndCategories();
    }, []);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const loadShopsAndCategories = async () => {
        try {
            setLoading(true);
            const [shopsResult, categoriesResult, reviewsResult] = await Promise.all([
                handleGetPublicShops(),
                handleGetAllCategories(),
                handleGetUserReviews(),
            ]);

            if (shopsResult.success) {
                const shopsData = Array.isArray(shopsResult.data) ? shopsResult.data : shopsResult.data?.data || [];
                setShops(shopsData);
                setFilteredShops(shopsData);

            }

            if (categoriesResult.success) {
                const catsData = Array.isArray(categoriesResult.data)
                    ? categoriesResult.data
                    : categoriesResult.data?.data || [];
                setCategories(catsData);
            }

            if (reviewsResult.success) {
                const reviewsData = Array.isArray(reviewsResult.data) ? reviewsResult.data : reviewsResult.data?.data || [];
                setUserReviews(reviewsData);
            }
        } catch (error) {
            console.error("Failed to load shops and categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const isShopReviewed = (shopId: string): boolean => {
        return userReviews.some((review: any) => review.shopId === shopId);
    };

    const handleFiltersChange = (filters: ShopFilters) => {
        console.log("Selected category for nearest:", filters.category);
        if (filters.nearestOnly && filters.category) {
        // Get user location (prompt if needed)
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const result = await handleGetNearestShops(filters.category, lat, lng);
            if (result.success) {
                setFilteredShops(result.data);
                setCurrentPage(1);
            } else {
                toast.error(result?.message || "Could not fetch nearest shops.");
            }
        }, (err) => {
             toast.error("Location access denied. Showing all shops instead.");
        });
    } else {
        let filtered = [...shops];

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter((shop) =>
                shop.shopName.toLowerCase().includes(searchLower) ||
                shop.description?.toLowerCase().includes(searchLower) ||
                shop.shopAddress.toLowerCase().includes(searchLower)
            );
        }

        // Category filter
        if (filters.category) {
            filtered = filtered.filter((shop) => {
                // Shop may have categoryId as string or as object with _id/categoryId
                const catId = typeof shop.categoryId === "string" ? shop.categoryId : shop.categoryId?._id;
                const catAltId = shop.categoryId?.categoryId;
                // Also check if shop.categoryId matches the selected category's _id
                return (
        String(catId) === String(filters.category) ||
        String(catAltId) === String(filters.category) ||
        String(shop.categoryId) === String(filters.category)
    );
            });
        }

        // Location filter
        if (filters.location) {
            const locationLower = filters.location.toLowerCase();
            filtered = filtered.filter((shop) =>
                shop.shopAddress.toLowerCase().includes(locationLower)
            );
        }

        // Rating filter (would require data from reviews - for now, kept as placeholder)
        if (filters.minRating) {
            const minRating = Number(filters.minRating);
            filtered = filtered.filter((shop) => {
                const reviews = shop.reviews || [];
                const avg = typeof shop.avgRating === "number"
                    ? shop.avgRating
                    : reviews.length > 0
                        ? reviews.reduce((sum: number, r: any) => sum + (r.starNum || 0), 0) / reviews.length
                        : 0;
                return avg >= minRating;
            });
        }

        if (filters.minPrice || filters.maxPrice) {
            const minPrice = filters.minPrice ? Number(filters.minPrice) : Number.NEGATIVE_INFINITY;
            const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Number.POSITIVE_INFINITY;
            filtered = filtered.filter((shop) => {
                const raw = shop.priceRange || "";
                const numeric = Number(String(raw).replace(/[^0-9.]/g, ""));
                const dollarCount = String(raw).split("").filter((c) => c === "$").length;
                const score = Number.isNaN(numeric) ? dollarCount : numeric;
                if (!score) {
                    return false;
                }
                return score >= minPrice && score <= maxPrice;
            });
        }

        setFilteredShops(filtered);
        setCurrentPage(1);
    }      
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Discover</p>
                <h2 className="text-4xl font-bold text-white">Shop Feed</h2>
                <p className="text-white/80">Explore and discover amazing local shops</p>
            </div>

            {/* Search and Filters */}
            <ShopSearch categories={categories} onFiltersChange={handleFiltersChange} />

            {/* Shops Grid */}
            <div className="space-y-6">
                {loading ? (
                    <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8f7e4f] mx-auto"></div>
                                <p className="mt-4 text-[#7a6b45]">Loading shops...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredShops.length === 0 ? (
                    <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <Store className="h-12 w-12 text-[#d4c5a0] mx-auto mb-3" />
                                <p className="text-[#7a6b45] text-lg">No shops found matching your criteria</p>
                                <p className="text-[#a8986f] text-sm mt-2">Try adjusting your search filters</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-0">
                        {paginatedShops.map((shop) => {
                            const categoryName =
                           typeof shop.categoryId === "object"
                            ? shop.categoryId.name
                            : categories.find(cat => cat._id === shop.categoryId)?.name || "";               
                            console.log("Rendering ShopCard for", shop.shopName, "categoryId:", shop.categoryId, "categoryName:", categoryName);;
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

                {/* Results Count */}
                {filteredShops.length > 0 && (
                    <div className="space-y-3 py-4 text-center text-white/80">
                        <p>
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredShops.length)} of {filteredShops.length} shops
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
        </div>
    );
}
