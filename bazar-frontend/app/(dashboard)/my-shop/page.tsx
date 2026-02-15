"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    Camera,
    MessageCircle,
    Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { handleGetMyShop, handleUpdateShop } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleGetShopReviewsByShopId } from "@/lib/actions/shopReview-action";
import { handleGetShopPhotosByShopId } from "@/lib/actions/shopPhoto-action";
import { API_CONFIG } from "@/lib/api/config";
import { toast } from "react-toastify";

interface Category {
    _id: string;
    categoryId: string;
    categoryName: string;
}

interface Shop {
    _id: string;
    shopName: string;
    shopAddress: string;
    shopContact: string;
    description?: string;
    categoryId: { _id: string; name: string };
    slug?: string;
    priceRange?: string;
    isActive?: boolean;
    ownerId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
}

interface ShopReview {
    _id?: string;
    reviewId?: string;
    reviewName?: string;
    shopId?: string;
    reviewedBy?: string | { fullName?: string; email?: string };
    starNum?: number;
    likesCount?: number;
    dislikeCount?: number;
    createdAt?: string;
}

interface ShopPhoto {
    _id?: string;
    photoId?: string;
    photoName?: string;
    shopId?: string;
    createdAt?: string;
}

export default function MyShopPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shop, setShop] = useState<Shop | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [reviews, setReviews] = useState<ShopReview[]>([]);
    const [photos, setPhotos] = useState<ShopPhoto[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [photosLoading, setPhotosLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopName: "",
        shopAddress: "",
        shopContact: "",
        description: "",
        categoryId: "",
        slug: "",
        priceRange: "",
        isActive: true,
    });

    useEffect(() => {
        loadShop();
        loadCategories();
    }, []);

    const loadShop = async () => {
        setLoading(true);
        try {
            const result = await handleGetMyShop();
            if (result.success) {
                setShop(result.data || null);
                if (result.data) {
                    setFormData({
                        shopName: result.data.shopName || "",
                        shopAddress: result.data.shopAddress || "",
                        shopContact: result.data.shopContact || "",
                        description: result.data.description || "",
                        categoryId: "",
                        slug: result.data.slug || "",
                        priceRange: result.data.priceRange || "",
                        isActive: result.data.isActive ?? true,
                    });
                }
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load shop");
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const result = await handleGetAllCategories();
            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : result.data?.data;
                setCategories(Array.isArray(data) ? data : []);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load categories");
        }
    };

    useEffect(() => {
        if (!shop || categories.length === 0) return;
        const match = categories.find((category) => category.categoryName === shop.categoryId?.name);
        if (match) {
            setFormData((prev) => ({ ...prev, categoryId: match.categoryId }));
        }
    }, [shop, categories]);

    useEffect(() => {
        if (!shop?._id) return;
        loadReviews(shop._id);
        loadPhotos(shop._id);
    }, [shop?._id]);

    const loadReviews = async (shopId: string) => {
        setReviewsLoading(true);
        try {
            const result = await handleGetShopReviewsByShopId(shopId);
            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : result.data?.data;
                setReviews(Array.isArray(data) ? data : []);
            } else if (result.message) {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load reviews");
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadPhotos = async (shopId: string) => {
        setPhotosLoading(true);
        try {
            const result = await handleGetShopPhotosByShopId(shopId);
            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : result.data?.data;
                setPhotos(Array.isArray(data) ? data : []);
            } else if (result.message) {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load photos");
        } finally {
            setPhotosLoading(false);
        }
    };

    const reviewStats = useMemo(() => {
        const total = reviews.length;
        const average = total
            ? reviews.reduce((sum, review) => sum + (review.starNum || 0), 0) / total
            : 0;
        const breakdown = [5, 4, 3, 2, 1].map((rating) => {
            const count = reviews.filter((review) => review.starNum === rating).length;
            const percent = total ? Math.round((count / total) * 100) : 0;
            return { label: rating.toString(), percent, count };
        });
        return { total, average, breakdown };
    }, [reviews]);

    const sortedReviews = useMemo(() => {
        return [...reviews].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [reviews]);

    const getReviewerMeta = (reviewedBy?: ShopReview["reviewedBy"]) => {
        if (!reviewedBy) {
            return { name: "Anonymous", detail: "" };
        }
        if (typeof reviewedBy === "string") {
            const shortId = reviewedBy.slice(-6).toUpperCase();
            return { name: "Customer", detail: shortId ? `ID ${shortId}` : "" };
        }
        const name = reviewedBy.fullName || (typeof reviewedBy.email === "string" ? reviewedBy.email.split("@")[0] : "Customer");
        return { name, detail: reviewedBy.email || "" };
    };

    const formatDate = (value?: string) => {
        if (!value) return "Recently";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Recently";
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const handleSave = async () => {
        if (!shop) return;
        setSaving(true);
        try {
            const payload = {
                shopName: formData.shopName,
                shopAddress: formData.shopAddress,
                shopContact: formData.shopContact,
                description: formData.description,
                categoryId: formData.categoryId || "",
                slug: formData.slug,
                priceRange: formData.priceRange,
                isActive: formData.isActive,
            };
            const result = await handleUpdateShop(shop._id, payload);
            if (result.success) {
                toast.success("Shop updated successfully");
                await loadShop();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to update shop");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="text-sm text-white/80">Loading your shop...</div>
            </div>
        );
    }

    if (!shop) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/70">Seller</p>
                    <h1 className="text-4xl font-bold text-white">My Shop</h1>
                    <p className="text-white/75 text-lg">We could not find a shop for your account yet.</p>
                </div>
                <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                    <CardContent className="py-10 text-center text-sm text-[#4a4a4a]">
                        Your shop will appear here once it is created from an approved seller application.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Seller</p>
                <h1 className="text-4xl font-bold text-white">My Shop</h1>
                <p className="text-white/75 text-lg">Manage your shop details and keep them up to date.</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15">
                            <Store className="h-5 w-5 text-[#8f7e4f]" />
                        </span>
                        <div>
                            <CardTitle className="text-xl text-[#1a1a1a]">Shop Overview</CardTitle>
                            <CardDescription>Review and update your shop information.</CardDescription>
                        </div>
                    </div>

                    <div className="grid gap-3 text-sm text-[#4a4a4a] md:grid-cols-2">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-[#8f7e4f]" />
                            <span className="font-medium text-[#1a1a1a]">Owner:</span>
                            <span>{shop.ownerId.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#8f7e4f]" />
                            <span className="font-medium text-[#1a1a1a]">Email:</span>
                            <span>{shop.ownerId.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#8f7e4f]" />
                            <span className="font-medium text-[#1a1a1a]">Phone:</span>
                            <span>{shop.ownerId.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#8f7e4f]" />
                            <span className="font-medium text-[#1a1a1a]">Address:</span>
                            <span>{shop.shopAddress}</span>
                        </div>
                    </div>
                </CardHeader>

                <Separator className="bg-[#efefef]" />

                <CardContent className="space-y-6 pt-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-[#8f7e4f]" />
                        <h2 className="text-lg font-semibold text-[#1a1a1a]">Shop Details</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="shopName">Shop Name</Label>
                            <Input
                                id="shopName"
                                value={formData.shopName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopName: e.target.value }))}
                                placeholder="Shop name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shopContact">Shop Contact</Label>
                            <Input
                                id="shopContact"
                                value={formData.shopContact}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopContact: e.target.value }))}
                                placeholder="10-digit phone"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Select
                                value={formData.categoryId || "uncategorized"}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        categoryId: value === "uncategorized" ? "" : value,
                                    }))
                                }
                            >
                                <SelectTrigger id="categoryId" className="bg-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="z-[120]">
                                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.categoryId} value={category.categoryId}>
                                            {category.categoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="Slug (optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priceRange">Price Range</Label>
                            <Input
                                id="priceRange"
                                value={formData.priceRange}
                                onChange={(e) => setFormData((prev) => ({ ...prev, priceRange: e.target.value }))}
                                placeholder="e.g., $$ or Medium or 500-1000"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="shopAddress">Shop Address</Label>
                            <Input
                                id="shopAddress"
                                value={formData.shopAddress}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopAddress: e.target.value }))}
                                placeholder="Shop address"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your shop"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="isActive">Active</Label>
                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, isActive: checked === true }))
                                    }
                                />
                                <span className="text-sm text-[#4a4a4a]">Shop is active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#8f7e4f] text-white hover:bg-[#7a6b45]"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15">
                                <MessageCircle className="h-5 w-5 text-[#8f7e4f]" />
                            </span>
                            <div>
                                <CardTitle className="text-xl text-[#1a1a1a]">Reviews & Photos</CardTitle>
                                <CardDescription>
                                    Highlight what customers love and curate shop moments.
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-[#f0e7d6] text-[#6f5f3a] border border-[#e6d8be]">
                                {shop.categoryId?.name || "Shop"}
                            </Badge>
                            <Badge variant="outline" className="border-[#e6d8be] text-[#7a6b45]">
                                {shop.shopAddress}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <Separator className="bg-[#efefef]" />

                <CardContent className="space-y-6 pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-[#efe7d6] bg-[#fbf8f1] p-5">
                            <div className="flex items-center gap-2 text-sm text-[#7a6b45]">
                                <Star className="h-4 w-4" />
                                <span>Average rating</span>
                            </div>
                            <div className="mt-3 flex items-end gap-2">
                                <span className="text-3xl font-semibold text-[#1f1a14]">
                                    {reviewStats.average.toFixed(1)}
                                </span>
                                <span className="text-sm text-[#7a6b45]">out of 5</span>
                            </div>
                            <div className="mt-3 flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                        key={`avg-star-${index}`}
                                        className={`h-4 w-4 ${
                                            index < Math.round(reviewStats.average)
                                                ? "text-[#d1a547]"
                                                : "text-[#e6d8be]"
                                        }`}
                                        fill="currentColor"
                                    />
                                ))}
                                <span className="ml-2 text-xs text-[#7a6b45]">
                                    {reviewStats.total} reviews
                                </span>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#efe7d6] bg-white p-5">
                            <div className="flex items-center gap-2 text-sm text-[#7a6b45]">
                                <Camera className="h-4 w-4" />
                                <span>Photo highlights</span>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {photos.length === 0 && (
                                    <div className="col-span-3 rounded-xl border border-dashed border-[#e6d8be] bg-[#fbf8f1] px-3 py-4 text-center text-xs text-[#7a6b45]">
                                        No photos yet. Upload moments to showcase your shop.
                                    </div>
                                )}
                                {photos.slice(0, 6).map((photo) => {
                                    const imageUrl = API_CONFIG.getImageUrl(photo.photoName);
                                    return (
                                        <div
                                            key={photo.photoId || photo._id}
                                            className="group relative h-16 overflow-hidden rounded-xl border border-[#efe7d6] bg-[#f4ede0]"
                                        >
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt="Shop photo"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-gradient-to-br from-[#f4ede0] via-[#efe6d2] to-[#e7dbc2]" />
                                            )}
                                            <div className="absolute inset-0 rounded-xl bg-[#1f1a14]/0 transition group-hover:bg-[#1f1a14]/10" />
                                            <div className="absolute bottom-1 left-1 right-1 rounded-md bg-white/80 px-1 py-0.5 text-[10px] text-[#7a6b45]">
                                                {formatDate(photo.createdAt)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#efe7d6] bg-white p-5">
                            <div className="flex items-center gap-2 text-sm text-[#7a6b45]">
                                <Heart className="h-4 w-4" />
                                <span>Customer sentiment</span>
                            </div>
                            <div className="mt-4 space-y-2">
                                {reviewStats.breakdown.map((item) => (
                                    <div key={`rating-${item.label}`} className="flex items-center gap-2 text-xs">
                                        <span className="w-5 text-[#6f5f3a]">{item.label}</span>
                                        <div className="h-2 flex-1 rounded-full bg-[#efe7d6]">
                                            <div
                                                className="h-2 rounded-full bg-[#c9a86a]"
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                        <span className="w-10 text-right text-[#7a6b45]">{item.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="reviews" className="w-full">
                        <TabsList className="w-full justify-start bg-[#f5efe3]">
                            <TabsTrigger value="reviews" className="data-[state=active]:bg-white">
                                Reviews
                            </TabsTrigger>
                            <TabsTrigger value="photos" className="data-[state=active]:bg-white">
                                Photos
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="reviews" className="mt-6">
                            <div className="space-y-4">
                                {reviewsLoading && (
                                    <div className="rounded-2xl border border-dashed border-[#e6d8be] bg-[#fbf8f1] px-4 py-6 text-center text-sm text-[#7a6b45]">
                                        Loading reviews...
                                    </div>
                                )}
                                {!reviewsLoading && sortedReviews.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-[#e6d8be] bg-[#fbf8f1] px-4 py-6 text-center text-sm text-[#7a6b45]">
                                        No reviews yet. Encourage customers to leave feedback.
                                    </div>
                                )}
                                {sortedReviews.map((review) => {
                                    const reviewer = getReviewerMeta(review.reviewedBy);
                                    const initials = reviewer.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .join("");
                                    return (
                                        <div
                                            key={review.reviewId || review._id}
                                            className="rounded-2xl border border-[#efe7d6] bg-white p-5"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src="" alt={reviewer.name} />
                                                        <AvatarFallback>{initials || "CU"}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold text-[#1f1a14]">
                                                            {reviewer.name}
                                                        </div>
                                                        <div className="text-xs text-[#7a6b45]">
                                                            {reviewer.detail || "Verified visitor"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-[#7a6b45]">
                                                    {formatDate(review.createdAt)}
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, index) => (
                                                    <Star
                                                        key={`review-star-${review.reviewId || review._id}-${index}`}
                                                        className={`h-4 w-4 ${
                                                            index < (review.starNum || 0)
                                                                ? "text-[#d1a547]"
                                                                : "text-[#e6d8be]"
                                                        }`}
                                                        fill="currentColor"
                                                    />
                                                ))}
                                                <span className="ml-2 text-xs text-[#7a6b45]">
                                                    {(review.starNum || 0).toFixed(1)}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-sm text-[#4a4a4a]">
                                                {review.reviewName || "No review text provided."}
                                            </p>
                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="border-[#e6d8be] text-[#7a6b45]"
                                                >
                                                    {review.likesCount || 0} likes
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="border-[#e6d8be] text-[#7a6b45]"
                                                >
                                                    {review.dislikeCount || 0} dislikes
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="photos" className="mt-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {photosLoading && (
                                    <div className="col-span-full rounded-2xl border border-dashed border-[#e6d8be] bg-[#fbf8f1] px-4 py-6 text-center text-sm text-[#7a6b45]">
                                        Loading photos...
                                    </div>
                                )}
                                {!photosLoading && photos.length === 0 && (
                                    <div className="col-span-full rounded-2xl border border-dashed border-[#e6d8be] bg-[#fbf8f1] px-4 py-6 text-center text-sm text-[#7a6b45]">
                                        No photos uploaded yet. Add photos to bring your shop to life.
                                    </div>
                                )}
                                {photos.map((photo) => {
                                    const imageUrl = API_CONFIG.getImageUrl(photo.photoName);
                                    return (
                                        <div
                                            key={photo.photoId || photo._id}
                                            className="group relative overflow-hidden rounded-2xl border border-[#efe7d6] bg-white"
                                        >
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt="Shop photo"
                                                    className="h-40 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-40 bg-gradient-to-br from-[#f4ede0] via-[#efe6d2] to-[#e7dbc2]" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a14]/30 via-transparent to-transparent" />
                                            <div className="absolute inset-4 flex flex-col justify-end gap-1 text-white">
                                                <div className="text-sm font-semibold">Shop moment</div>
                                                <div className="text-xs text-white/80">
                                                    {formatDate(photo.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
