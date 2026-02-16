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
    X,
    ZoomIn,
    Upload,
    Trash2,
    Link as LinkIcon,
    Plus,
    Save,
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
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import DeleteModal from "@/components/DeleteModal";
import { handleGetMyShop, handleUpdateShop } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleGetShopReviewsByShopId } from "@/lib/actions/shopReview-action";
import { handleGetShopPhotosByShopId, handleCreateShopPhoto, handleDeleteShopPhoto } from "@/lib/actions/shopPhoto-action";
import { handleGetShopDetailByShopId, handleCreateShopDetail, handleUpdateShopDetail, handleDeleteShopDetail } from "@/lib/actions/shopDetail-action";
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

interface ShopDetail {
    _id?: string;
    detailId?: string;
    link1?: string;
    link2?: string;
    link3?: string;
    link4?: string;
    shopId?: string;
    createdAt?: string;
    updatedAt?: string;
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
    const [shopDetail, setShopDetail] = useState<ShopDetail | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsEditing, setDetailsEditing] = useState(false);
    const [detailsSaving, setDetailsSaving] = useState(false);
    const [detailFormData, setDetailFormData] = useState({
        link1: "",
        link2: "",
        link3: "",
        link4: "",
    });
    const [deleteLinkModalOpen, setDeleteLinkModalOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState<'link1' | 'link2' | 'link3' | 'link4' | null>(null);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
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
        loadDetails(shop._id);
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

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !shop?._id) return;

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPEG, PNG and GIF images are allowed");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const result = await handleCreateShopPhoto(shop._id, formData);
            if (result.success) {
                toast.success("Photo uploaded successfully");
                await loadPhotos(shop._id);
            } else {
                toast.error(result.message || "Failed to upload photo");
            }
        } catch (error) {
            toast.error("Failed to upload photo");
        } finally {
            setUploading(false);
            // Reset file input
            event.target.value = "";
        }
    };

    const handlePhotoDelete = async (photoId: string) => {
        if (!shop?._id) return;

        const confirmed = window.confirm("Are you sure you want to delete this photo?");
        if (!confirmed) return;

        setDeletingPhotoId(photoId);
        try {
            const result = await handleDeleteShopPhoto(shop._id, photoId);
            if (result.success) {
                toast.success("Photo deleted successfully");
                await loadPhotos(shop._id);
            } else {
                toast.error(result.message || "Failed to delete photo");
            }
        } catch (error) {
            toast.error("Failed to delete photo");
        } finally {
            setDeletingPhotoId(null);
        }
    };

    const loadDetails = async (shopId: string) => {
        setDetailsLoading(true);
        try {
            const result = await handleGetShopDetailByShopId(shopId);
            if (result.success && result.data) {
                setShopDetail(result.data);
                setDetailFormData({
                    link1: result.data.link1 || "",
                    link2: result.data.link2 || "",
                    link3: result.data.link3 || "",
                    link4: result.data.link4 || "",
                });
            } else {
                setShopDetail(null);
            }
        } catch {
            // Details may not exist yet, this is fine
            setShopDetail(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleDetailsSave = async () => {
        if (!shop?._id) return;

        setDetailsSaving(true);
        try {
            let result;
            if (shopDetail) {
                // Update existing details
                const detailId = shopDetail.detailId || shopDetail._id || "";
                result = await handleUpdateShopDetail(shop._id, detailId, detailFormData);
            } else {
                // Create new details
                result = await handleCreateShopDetail(shop._id, detailFormData);
            }

            if (result.success) {
                toast.success(shopDetail ? "Links updated successfully" : "Links created successfully");
                setDetailsEditing(false);
                await loadDetails(shop._id);
            } else {
                toast.error(result.message || "Failed to save links");
            }
        } catch (error) {
            toast.error("Failed to save links");
        } finally {
            setDetailsSaving(false);
        }
    };

    const handleDetailsDelete = () => {
        if (!shop?._id || !shopDetail) return;
        setDeleteAllModalOpen(true);
    };

    const confirmDeleteAll = async () => {
        if (!shop?._id || !shopDetail) return;

        setDeleteAllModalOpen(false);
        setDetailsSaving(true);
        try {
            const detailId = shopDetail.detailId || shopDetail._id || "";
            const result = await handleDeleteShopDetail(shop._id, detailId);
            if (result.success) {
                toast.success("Links deleted successfully");
                setShopDetail(null);
                setDetailFormData({ link1: "", link2: "", link3: "", link4: "" });
                setDetailsEditing(false);
            } else {
                toast.error(result.message || "Failed to delete links");
            }
        } catch (error) {
            toast.error("Failed to delete links");
        } finally {
            setDetailsSaving(false);
        }
    };

    const handleDeleteIndividualLink = (linkKey: 'link1' | 'link2' | 'link3' | 'link4') => {
        setLinkToDelete(linkKey);
        setDeleteLinkModalOpen(true);
    };

    const confirmDeleteLink = async () => {
        if (!shop?._id || !shopDetail || !linkToDelete) return;

        setDeleteLinkModalOpen(false);
        setDetailsSaving(true);
        try {
            const detailId = shopDetail.detailId || shopDetail._id || "";
            const updateData = { [linkToDelete]: "" };
            
            const result = await handleUpdateShopDetail(shop._id, detailId, updateData);
            if (result.success) {
                toast.success("Link deleted successfully");
                await loadDetails(shop._id);
            } else {
                toast.error(result.message || "Failed to delete link");
            }
        } catch (error) {
            toast.error("Failed to delete link");
        } finally {
            setDetailsSaving(false);
            setLinkToDelete(null);
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
                                            className="group relative h-16 overflow-hidden rounded-xl border border-[#efe7d6] bg-[#f4ede0] cursor-pointer transition-transform hover:scale-105"
                                            onClick={() => imageUrl && setSelectedImage(imageUrl)}
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
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ZoomIn className="h-5 w-5 text-white drop-shadow-lg" />
                                            </div>
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
                            <TabsTrigger value="links" className="data-[state=active]:bg-white">
                                Links
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
                            <div className="mb-6">
                                <input
                                    type="file"
                                    id="photo-upload"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                <Button
                                    onClick={() => document.getElementById("photo-upload")?.click()}
                                    disabled={uploading}
                                    className="gap-2 bg-[#8f7e4f] hover:bg-[#7a6b45] text-white"
                                >
                                    <Upload className="h-4 w-4" />
                                    {uploading ? "Uploading..." : "Upload Photo"}
                                </Button>
                            </div>

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
                                    const photoIdentifier = photo.photoId || photo._id || "";
                                    const isDeleting = deletingPhotoId === photoIdentifier;
                                    
                                    return (
                                        <div
                                            key={photoIdentifier}
                                            className="group relative overflow-hidden rounded-2xl border border-[#efe7d6] bg-white"
                                        >
                                            <div 
                                                className="cursor-pointer"
                                                onClick={() => imageUrl && setSelectedImage(imageUrl)}
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
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#1f1a14]/20">
                                                    <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                                                </div>
                                                <div className="absolute inset-4 flex flex-col justify-end gap-1 text-white">
                                                    <div className="text-sm font-semibold">Shop moment</div>
                                                    <div className="text-xs text-white/80">
                                                        {formatDate(photo.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePhotoDelete(photoIdentifier);
                                                }}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <span className="text-xs">...</span>
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="links" className="mt-6">
                            {detailsLoading ? (
                                <div className="rounded-2xl border border-dashed border-[#e6d8be] bg-[#fbf8f1] px-4 py-6 text-center text-sm text-[#7a6b45]">
                                    Loading links...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-[#7a6b45]">
                                            <LinkIcon className="h-4 w-4" />
                                            <span>Social Media & Website Links</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {detailsEditing ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setDetailsEditing(false);
                                                            if (shopDetail) {
                                                                setDetailFormData({
                                                                    link1: shopDetail.link1 || "",
                                                                    link2: shopDetail.link2 || "",
                                                                    link3: shopDetail.link3 || "",
                                                                    link4: shopDetail.link4 || "",
                                                                });
                                                            }
                                                        }}
                                                        disabled={detailsSaving}
                                                        className="border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleDetailsSave}
                                                        disabled={detailsSaving}
                                                        className="gap-2 bg-[#8f7e4f] hover:bg-[#7a6b45] text-white"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                        {detailsSaving ? "Saving..." : "Save"}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    {shopDetail && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleDetailsDelete}
                                                            disabled={detailsSaving}
                                                            className="border-red-500 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setDetailsEditing(true)}
                                                        className="gap-2 bg-[#8f7e4f] hover:bg-[#7a6b45] text-white"
                                                    >
                                                        {shopDetail ? (
                                                            <>
                                                                <LinkIcon className="h-4 w-4" />
                                                                Edit Links
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="h-4 w-4" />
                                                                Add Links
                                                            </>
                                                        )}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-[#efe7d6] bg-white p-6 space-y-4">
                                        {detailsEditing ? (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="link1">Link 1 (Website/Facebook)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="link1"
                                                            type="url"
                                                            placeholder="https://example.com"
                                                            value={detailFormData.link1}
                                                            onChange={(e) => setDetailFormData({ ...detailFormData, link1: e.target.value })}
                                                            className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]"
                                                        />
                                                        {detailFormData.link1 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => setDetailFormData({ ...detailFormData, link1: "" })}
                                                                className="flex-shrink-0 border-[#e5e5e5] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="link2">Link 2 (Instagram/Twitter)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="link2"
                                                            type="url"
                                                            placeholder="https://example.com"
                                                            value={detailFormData.link2}
                                                            onChange={(e) => setDetailFormData({ ...detailFormData, link2: e.target.value })}
                                                            className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]"
                                                        />
                                                        {detailFormData.link2 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => setDetailFormData({ ...detailFormData, link2: "" })}
                                                                className="flex-shrink-0 border-[#e5e5e5] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="link3">Link 3 (LinkedIn/YouTube)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="link3"
                                                            type="url"
                                                            placeholder="https://example.com"
                                                            value={detailFormData.link3}
                                                            onChange={(e) => setDetailFormData({ ...detailFormData, link3: e.target.value })}
                                                            className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]"
                                                        />
                                                        {detailFormData.link3 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => setDetailFormData({ ...detailFormData, link3: "" })}
                                                                className="flex-shrink-0 border-[#e5e5e5] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="link4">Link 4 (Other)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="link4"
                                                            type="url"
                                                            placeholder="https://example.com"
                                                            value={detailFormData.link4}
                                                            onChange={(e) => setDetailFormData({ ...detailFormData, link4: e.target.value })}
                                                            className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]"
                                                        />
                                                        {detailFormData.link4 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => setDetailFormData({ ...detailFormData, link4: "" })}
                                                                className="flex-shrink-0 border-[#e5e5e5] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : shopDetail ? (
                                            <div className="space-y-3">
                                                {shopDetail.link1 && (
                                                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#f5efe3] hover:bg-[#efe6d2] transition-colors group">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <LinkIcon className="h-4 w-4 text-[#8f7e4f] flex-shrink-0" />
                                                            <a
                                                                href={shopDetail.link1}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-[#1f1a14] hover:text-[#8f7e4f] underline break-all"
                                                            >
                                                                {shopDetail.link1}
                                                            </a>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteIndividualLink('link1')}
                                                            disabled={detailsSaving}
                                                            className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {shopDetail.link2 && (
                                                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#f5efe3] hover:bg-[#efe6d2] transition-colors group">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <LinkIcon className="h-4 w-4 text-[#8f7e4f] flex-shrink-0" />
                                                            <a
                                                                href={shopDetail.link2}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-[#1f1a14] hover:text-[#8f7e4f] underline break-all"
                                                            >
                                                                {shopDetail.link2}
                                                            </a>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteIndividualLink('link2')}
                                                            disabled={detailsSaving}
                                                            className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {shopDetail.link3 && (
                                                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#f5efe3] hover:bg-[#efe6d2] transition-colors group">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <LinkIcon className="h-4 w-4 text-[#8f7e4f] flex-shrink-0" />
                                                            <a
                                                                href={shopDetail.link3}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-[#1f1a14] hover:text-[#8f7e4f] underline break-all"
                                                            >
                                                                {shopDetail.link3}
                                                            </a>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteIndividualLink('link3')}
                                                            disabled={detailsSaving}
                                                            className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {shopDetail.link4 && (
                                                    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#f5efe3] hover:bg-[#efe6d2] transition-colors group">
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <LinkIcon className="h-4 w-4 text-[#8f7e4f] flex-shrink-0" />
                                                            <a
                                                                href={shopDetail.link4}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-[#1f1a14] hover:text-[#8f7e4f] underline break-all"
                                                            >
                                                                {shopDetail.link4}
                                                            </a>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteIndividualLink('link4')}
                                                            disabled={detailsSaving}
                                                            className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-sm text-[#7a6b45]">
                                                No links added yet. Click "Add Links" to get started.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Image Viewer Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none">
                    <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                    {selectedImage && (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img
                                src={selectedImage}
                                alt="Shop photo full view"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Link Confirmation Modal */}
            <DeleteModal
                isOpen={deleteLinkModalOpen}
                onClose={() => {
                    setDeleteLinkModalOpen(false);
                    setLinkToDelete(null);
                }}
                onConfirm={confirmDeleteLink}
                title="Delete Link"
                description="Are you sure you want to delete this link? This action cannot be undone."
            />

            {/* Delete All Links Confirmation Modal */}
            <DeleteModal
                isOpen={deleteAllModalOpen}
                onClose={() => setDeleteAllModalOpen(false)}
                onConfirm={confirmDeleteAll}
                title="Delete All Links"
                description="Are you sure you want to delete all links for this shop? This action cannot be undone."
            />
        </div>
    );
}
