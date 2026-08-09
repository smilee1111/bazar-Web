"use client";

import { useState, useEffect, useRef } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShopCard from "./_components/ShopCard";
import ShopSearch from "./_components/ShopSearch";
import { handleGetNearestShops, handleGetPublicShops } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleGetUserReviews } from "@/lib/actions/review-action";
import { handleLogUserBehaviour } from "@/lib/actions/userBehaviour-action";
import { toast } from "react-toastify";
import { cacheUserLocation, getCachedUserLocation } from "@/lib/services/userLocation.service";

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
    const [activeFilters, setActiveFilters] = useState<ShopFilters>({
        search: "",
        category: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        minRating: "",
        nearestOnly: false,
    });
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const savedPage = sessionStorage.getItem("haatkhoj_shops_page");
        if (savedPage) {
            const parsed = parseInt(savedPage, 10);
            if (!isNaN(parsed)) setCurrentPage(parsed);
        }
        
        const savedFilters = sessionStorage.getItem("haatkhoj_shops_filters");
        if (savedFilters) {
            try {
                setActiveFilters(JSON.parse(savedFilters));
            } catch (e) {}
        }
        
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            sessionStorage.setItem("haatkhoj_shops_filters", JSON.stringify(activeFilters));
            sessionStorage.setItem("haatkhoj_shops_page", currentPage.toString());
        }
    }, [activeFilters, currentPage, isInitialized]);

    const searchLogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    useEffect(() => {
        const query = activeFilters.search.trim();
        if (searchLogTimer.current) {
            clearTimeout(searchLogTimer.current);
            searchLogTimer.current = null;
        }
        if (query.length < 2) {
            return;
        }
        searchLogTimer.current = setTimeout(() => {
            const userLocation = getCachedUserLocation() || undefined;
            void handleLogUserBehaviour({
                eventType: "search",
                searchQuery: query,
                userLocation,
            });
        }, 600);

        return () => {
            if (searchLogTimer.current) {
                clearTimeout(searchLogTimer.current);
                searchLogTimer.current = null;
            }
        };
    }, [activeFilters.search]);

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

    const applyFilters = async (filters: ShopFilters, currentShops: Shop[]) => {
        if (filters.nearestOnly && filters.category) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                cacheUserLocation({ lat, lng });
                toast.info("Finding nearest shops...", { autoClose: 2000 });
                
                const result = await handleGetNearestShops(filters.category, lat, lng);
                if (result.success) {
                    const nearestShops = result.data || [];
                    setFilteredShops(nearestShops);
                    if (nearestShops.length === 0) {
                        toast.warn("No shops found in this category within 10km. Try expanding your search.");
                    } else {
                        toast.success(`Found ${nearestShops.length} nearest shop(s)`);
                    }
                } else {
                    toast.error(result?.message || "Could not fetch nearest shops.");
                }
            }, (err) => {
                 toast.error("Location access denied. Please enable location access in your browser.");
                 applyClientSideFilters(filters, currentShops);
            });
        } else {
            applyClientSideFilters(filters, currentShops);
        }
    };

    const applyClientSideFilters = (filters: ShopFilters, currentShops: Shop[]) => {
        let filtered = [...currentShops];
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter((shop) =>
                shop.shopName.toLowerCase().includes(searchLower) ||
                shop.description?.toLowerCase().includes(searchLower) ||
                shop.shopAddress.toLowerCase().includes(searchLower)
            );
        }

        if (filters.category) {
            filtered = filtered.filter((shop) => {
                const catId = typeof shop.categoryId === "string" ? shop.categoryId : shop.categoryId?._id;
                const catAltId = shop.categoryId?.categoryId;
                return (
                    String(catId) === String(filters.category) ||
                    String(catAltId) === String(filters.category) ||
                    String(shop.categoryId) === String(filters.category)
                );
            });
        }

        if (filters.location) {
            const locationLower = filters.location.toLowerCase();
            filtered = filtered.filter((shop) =>
                shop.shopAddress.toLowerCase().includes(locationLower)
            );
        }

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
                if (!score) return false;
                return score >= minPrice && score <= maxPrice;
            });
        }

        setFilteredShops(filtered);
    };

    useEffect(() => {
        if (!shops.length) return;
        applyFilters(activeFilters, shops);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shops, activeFilters]);

    const handleFiltersChange = (filters: ShopFilters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
    };

    useEffect(() => {
        const handleScroll = () => {
            sessionStorage.setItem("haatkhoj_shops_scroll", window.scrollY.toString());
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (!loading && isInitialized) {
            const savedScroll = sessionStorage.getItem("haatkhoj_shops_scroll");
            if (savedScroll) {
                setTimeout(() => {
                    window.scrollTo(0, parseInt(savedScroll, 10));
                }, 100);
            }
        }
    }, [loading, isInitialized]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-[#267A4C]">Discover</p>
                <h2 className="text-4xl font-bold text-[#142A1C]">Shop Feed</h2>
                <p className="text-gray-500">Explore and discover amazing local shops</p>
            </div>

            {/* Search and Filters */}
            <ShopSearch categories={categories} filters={activeFilters} onFiltersChange={handleFiltersChange} />

            {/* Shops Grid */}
            <div className="space-y-6">
                {loading ? (
                    <Card className="bg-white border-gray-100 shadow-sm">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#267A4C] mx-auto"></div>
                                <p className="mt-4 text-gray-500">Loading shops...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredShops.length === 0 ? (
                    <Card className="bg-white border-gray-100 shadow-sm">
                        <CardContent className="p-8">
                            <div className="text-center">
                                <Store className="h-12 w-12 text-[#93E48B] mx-auto mb-3" />
                                <p className="text-gray-500 text-lg">No shops found matching your criteria</p>
                                <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
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
                                    searchQuery={activeFilters.search}
                                    
                                />
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* Results Count */}
                {filteredShops.length > 0 && (
                    <div className="space-y-3 py-4 text-center text-gray-500">
                        <p>
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredShops.length)} of {filteredShops.length} shops
                        </p>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="border-gray-200 bg-white text-[#142A1C] hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-[#142A1C]">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="border-gray-200 bg-white text-[#142A1C] hover:bg-gray-50 disabled:opacity-50"
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
