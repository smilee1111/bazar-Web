"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Store, MapPin, Phone, User, Calendar, Pencil, Trash2, Plus, MessageCircle, Image as ImageIcon, Link as LinkIcon, ZoomIn, X } from "lucide-react";
import { handleCreateAdminShop, handleDeleteAdminShop, handleGetAllAdminShops, handleUpdateAdminShop } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleGetAdminShopReviewsByShopId, handleAdminDeleteShopReview, handleAdminDisableShopReview } from "@/lib/actions/shopReview-action";
import { handleGetAdminShopPhotosByShopId, handleAdminDeleteShopPhoto, handleAdminDisableShopPhoto } from "@/lib/actions/shopPhoto-action";
import { handleGetAdminAllShopDetails, handleAdminDeleteShopDetail } from "@/lib/actions/shopDetail-action";
import { API_CONFIG } from "@/lib/api/config";
import { toast } from "react-toastify";

interface Shop {
    _id: string;
    shopId: string;
    shopName: string;
    shopAddress: string;
    shopContact: string;
    description: string;
    slug?: string;
    isActive?: boolean;
    categoryId: {
        _id: string;
        name: string;
    };
    ownerId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        sellerStatus?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface ShopFormState {
    ownerId: string;
    shopName: string;
    shopAddress: string;
    shopContact: string;
    description: string;
    categoryId: string;
    slug: string;
    isActive: boolean;
}

interface Category {
    _id: string;
    categoryId: string;
    categoryName: string;
}

const emptyForm: ShopFormState = {
    ownerId: "",
    shopName: "",
    shopAddress: "",
    shopContact: "",
    description: "",
    categoryId: "",
    slug: "",
    isActive: true,
};

export default function ApprovedShopsTab() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [formData, setFormData] = useState<ShopFormState>(emptyForm);
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [categories, setCategories] = useState<Category[]>([]);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [shopReviews, setShopReviews] = useState<any[]>([]);
    const [shopPhotos, setShopPhotos] = useState<any[]>([]);
    const [shopDetails, setShopDetails] = useState<any[]>([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        loadShops();
        loadCategories();
    }, []);

    const loadShops = async () => {
        try {
            const result = await handleGetAllAdminShops();
            console.log("🔵 DEBUG: Shop API result:", result);
            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : result.data?.data;
                console.log("🟢 DEBUG: Extracted shop data:", data);
                if (Array.isArray(data) && data.length > 0) {
                    console.log("🟢 DEBUG: First shop object:", data[0]);
                    console.log("🟢 DEBUG: Shop shopId field:", data[0].shopId);
                    console.log("🟢 DEBUG: Shop _id field:", data[0]._id);
                }
                setShops(Array.isArray(data) ? data : []);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load shops");
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

    const loadShopDetails = async (shopId: string) => {
        console.log("🟡 DEBUG: Starting loadShopDetails with shopId:", shopId);
        console.log("🟡 DEBUG: shopId type:", typeof shopId);
        console.log("🟡 DEBUG: shopId is empty?:", !shopId);
        
        setDetailsLoading(true);
        try {
            // Load reviews
            const reviewsResult = await handleGetAdminShopReviewsByShopId(shopId);
            console.log("=== Reviews Result ===", { shopId, reviewsResult });
            console.log("🟡 DEBUG: Reviews data:", reviewsResult?.data);
            console.log("🟡 DEBUG: Reviews length:", Array.isArray(reviewsResult?.data) ? reviewsResult.data.length : 'not array');
            if (reviewsResult?.success) {
                const reviews = Array.isArray(reviewsResult.data) ? reviewsResult.data : [];
                console.log("Setting reviews:", reviews);
                setShopReviews(reviews);
            } else {
                console.warn("Reviews fetch not successful:", reviewsResult?.message);
                toast.error(reviewsResult?.message || "Failed to fetch reviews");
            }

            // Load photos
            const photosResult = await handleGetAdminShopPhotosByShopId(shopId);
            console.log("=== Photos Result ===", { shopId, photosResult });
            console.log("🟡 DEBUG: Photos data:", photosResult?.data);
            console.log("🟡 DEBUG: Photos length:", Array.isArray(photosResult?.data) ? photosResult.data.length : 'not array');
            if (photosResult?.success) {
                const photos = Array.isArray(photosResult.data) ? photosResult.data : [];
                console.log("Setting photos:", photos);
                setShopPhotos(photos);
            } else {
                console.warn("Photos fetch not successful:", photosResult?.message);
                toast.error(photosResult?.message || "Failed to fetch photos");
            }

            // Load all shop details to filter by shop
            const detailsResult = await handleGetAdminAllShopDetails();
            console.log("=== Details Result (raw) ===", { detailsResult });
            console.log("🟡 DEBUG: All details data:", detailsResult?.data);
            if (detailsResult?.success) {
                const allDetails = Array.isArray(detailsResult.data) ? detailsResult.data : [];
                console.log("All details from API:", allDetails);
                console.log("🟡 DEBUG: Filtering details against shopId:", shopId);
                const filtered = allDetails.filter((d: any) => {
                    const detailShopId = String(d.shopId);
                    const targetShopId = String(shopId);
                    const match = detailShopId === targetShopId;
                    console.log("🟡 DEBUG: Detail comparison:", { 
                        detailShopId, 
                        targetShopId, 
                        match,
                        detailId: d._id,
                        detailShopIdType: typeof d.shopId,
                        targetShopIdType: typeof shopId
                    });
                    return match;
                });
                console.log("Filtered details:", filtered);
                setShopDetails(filtered);
            } else {
                console.warn("Details fetch not successful:", detailsResult?.message);
                toast.error(detailsResult?.message || "Failed to fetch details");
            }
        } catch (err) {
            console.error("=== Error in loadShopDetails ===", err);
            toast.error("Failed to load shop details");
        } finally {
            setDetailsLoading(false);
        }
    };

    const openCreateDialog = () => {
        setFormData(emptyForm);
        setCreateOpen(true);
    };

    const getCategoryIdByName = (name?: string) => {
        if (!name) return "";
        const match = categories.find((category) => category.categoryName === name);
        return match?.categoryId || "";
    };

    const openEditDialog = (shop: Shop) => {
        const resolvedCategoryId = getCategoryIdByName(shop.categoryId?.name);
        setSelectedShop(shop);
        setFormData({
            ownerId: shop.ownerId?._id || "",
            shopName: shop.shopName || "",
            shopAddress: shop.shopAddress || "",
            shopContact: shop.shopContact || "",
            description: shop.description || "",
            categoryId: resolvedCategoryId,
            slug: shop.slug || "",
            isActive: shop.isActive ?? true,
        });
        setEditOpen(true);
    };

    const handleCreate = async () => {
        setActionLoading(true);
        try {
            const result = await handleCreateAdminShop(formData);
            if (result.success) {
                toast.success("Shop created successfully");
                setCreateOpen(false);
                loadShops();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to create shop");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedShop) return;
        setActionLoading(true);
        try {
            const result = await handleUpdateAdminShop(selectedShop._id, formData);
            if (result.success) {
                toast.success("Shop updated successfully");
                setEditOpen(false);
                loadShops();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to update shop");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (shopId: string) => {
        setDeleteId(shopId);
        try {
            const result = await handleDeleteAdminShop(shopId);
            if (result.success) {
                toast.success("Shop deleted successfully");
                setShops((prev) => prev.filter((shop) => shop._id !== shopId));
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to delete shop");
        } finally {
            setDeleteId(null);
        }
    };

    const categoryOptions = useMemo(() => {
        const values = categories.map((category) => category.categoryName).filter(Boolean);
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    }, [categories]);

    const filteredShops = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return shops.filter((shop) => {
            const categoryName = shop.categoryId?.name || "Uncategorized";
            const matchesCategory =
                categoryFilter === "all" ||
                (categoryFilter === "uncategorized" && categoryName === "Uncategorized") ||
                categoryName === categoryFilter;
            if (!term) return matchesCategory;
            const haystack = [
                shop.shopName,
                shop.shopAddress,
                shop.shopContact,
                shop.ownerId?.fullName,
                shop.ownerId?.email,
                categoryName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return matchesCategory && haystack.includes(term);
        });
    }, [shops, searchTerm, categoryFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8f7e4f] mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading shops...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="w-full sm:w-64">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search shops"
                            className="bg-white"
                        />
                    </div>
                    <div className="w-full sm:w-56">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent className="z-[120]">
                                <SelectItem value="all">All categories</SelectItem>
                                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                {categoryOptions.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button
                    onClick={openCreateDialog}
                    className="flex items-center gap-2 bg-[#8f7e4f] text-white hover:bg-[#7b6b43]"
                >
                    <Plus className="h-4 w-4" />
                    Create Shop
                </Button>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Shop</DialogTitle>
                        <DialogDescription>Provide details to create a new shop.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ownerId">Owner Id</Label>
                            <Input
                                id="ownerId"
                                value={formData.ownerId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ownerId: e.target.value }))}
                                placeholder="Owner ObjectId"
                            />
                        </div>
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
                            <Label htmlFor="isActive">Active</Label>
                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked === true }))}
                                />
                                <span className="text-sm text-gray-600">Shop is active</span>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="shopAddress">Shop Address</Label>
                            <Input
                                id="shopAddress"
                                value={formData.shopAddress}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopAddress: e.target.value }))}
                                placeholder="Shop address"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Shop description"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={actionLoading}>
                            {actionLoading ? "Creating..." : "Create Shop"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {shops.length === 0 ? (
                <div className="text-center py-8">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No approved shops</h3>
                    <p className="text-gray-600">No shops have been approved yet.</p>
                </div>
            ) : filteredShops.length === 0 ? (
                <div className="text-center py-8">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching shops</h3>
                    <p className="text-gray-600">Try adjusting the search or category filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredShops.map((shop) => (
                        <Card key={shop._id} className="hover:shadow-md transition-shadow bg-white/95 border border-[#e8e1cf]">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Store className="h-5 w-5" />
                                            {shop.shopName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-sm">
                                            <div className="inline-flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                    Approved
                                                </Badge>
                                            </div>
                                        </CardDescription>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {shop.categoryId?.name || "Uncategorized"}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600 line-clamp-2">{shop.shopAddress}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">{shop.shopContact}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">{shop.ownerId.fullName}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">
                                            Created {new Date(shop.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => openEditDialog(shop)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Shop</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently remove the shop. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(shop._id)}
                                                        disabled={deleteId === shop._id}
                                                    >
                                                        {deleteId === shop._id ? "Deleting..." : "Delete"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <Dialog open={viewDetailsOpen && selectedShop?._id === shop._id} onOpenChange={(open) => {
                                            if (!open) {
                                                setViewDetailsOpen(false);
                                                setSelectedShop(null);
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex items-center gap-2"
                                                    onClick={() => {
                                                        console.log("🟡 DEBUG: View Details clicked for shop:", shop);
                                                        console.log("🟡 DEBUG: shop.shopId:", shop.shopId);
                                                        console.log("🟡 DEBUG: shop._id:", shop._id);
                                                        setSelectedShop(shop);
                                                        setViewDetailsOpen(true);
                                                        loadShopDetails(shop.shopId);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <Store className="h-5 w-5" />
                                                        {selectedShop?.shopName}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Shop information, reviews, photos, and contact details
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <Tabs defaultValue="info" className="w-full">
                                                    <TabsList className="grid w-full grid-cols-4">
                                                        <TabsTrigger value="info">Info</TabsTrigger>
                                                        <TabsTrigger value="reviews" className="flex items-center gap-1">
                                                            <MessageCircle className="h-3 w-3" />
                                                            Reviews ({shopReviews.length})
                                                        </TabsTrigger>
                                                        <TabsTrigger value="photos" className="flex items-center gap-1">
                                                            <ImageIcon className="h-3 w-3" />
                                                            Photos ({shopPhotos.length})
                                                        </TabsTrigger>
                                                        <TabsTrigger value="details" className="flex items-center gap-1">
                                                            <LinkIcon className="h-3 w-3" />
                                                            Links ({shopDetails.length})
                                                        </TabsTrigger>
                                                    </TabsList>

                                                    {/* Info Tab */}
                                                    <TabsContent value="info" className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Shop Name</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.shopName}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Category</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.categoryId?.name || "Uncategorized"}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-sm font-medium text-gray-700">Address</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.shopAddress}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Contact</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.shopContact}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Owner</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.ownerId.fullName}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Owner Email</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.ownerId.email}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Owner Phone</label>
                                                                <p className="text-sm text-gray-600">{selectedShop?.ownerId.phoneNumber}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Description</label>
                                                            <p className="text-sm text-gray-600 mt-1">{selectedShop?.description}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Created</label>
                                                                <p className="text-sm text-gray-600">
                                                                    {selectedShop && new Date(selectedShop.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                                                <p className="text-sm text-gray-600">
                                                                    {selectedShop && new Date(selectedShop.updatedAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    {/* Reviews Tab */}
                                                    <TabsContent value="reviews" className="space-y-4">
                                                        {detailsLoading ? (
                                                            <div className="flex justify-center py-8">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8f7e4f]"></div>
                                                            </div>
                                                        ) : shopReviews.length === 0 ? (
                                                            <div className="text-center py-8 text-sm text-gray-500">
                                                                No reviews found for this shop
                                                            </div>
                                                        ) : (
                                                            shopReviews.map((review: any) => (
                                                                <div key={review._id} className="border rounded-lg p-4 space-y-2">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="h-9 w-9 overflow-hidden rounded-full border bg-gray-100">
                                                                                {review.reviewedBy?.profilePic ? (
                                                                                    <img
                                                                                        src={API_CONFIG.getImageUrl(review.reviewedBy.profilePic)}
                                                                                        alt={review.reviewedBy?.fullName || "Reviewer"}
                                                                                        className="h-full w-full object-cover"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-600">
                                                                                        {(review.reviewedBy?.fullName || "AN").slice(0, 2).toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-sm">{review.reviewedBy?.fullName || 'Anonymous'}</p>
                                                                                <p className="text-xs text-gray-500 mb-1">
                                                                                    {review.reviewedBy?.sellerStatus === "approved" ||
                                                                                    review.reviewedBy?.roleId?.roleName?.toLowerCase?.() === "seller" ||
                                                                                    review.reviewedBy?.roleId?.toLowerCase?.() === "seller"
                                                                                        ? "Seller"
                                                                                        : "User"}
                                                                                </p>
                                                                                <div className="flex items-center gap-1">
                                                                                    {[...Array(5)].map((_, i) => (
                                                                                        <span key={i} className={i < (review.starNum || review.rating || 0) ? "text-yellow-400" : "text-gray-300"}>★</span>
                                                                                    ))}
                                                                                    <span className="text-xs text-gray-600 ml-2">({review.starNum || review.rating || 0}/5)</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Are you sure you want to delete this review?
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={async () => {
                                                                                            const result = await handleAdminDeleteShopReview(review._id);
                                                                                            if (result.success) {
                                                                                                toast.success("Review deleted");
                                                                                                loadShopDetails(selectedShop!.shopId);
                                                                                            } else {
                                                                                                toast.error(result.message);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        Delete
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">{review.reviewText}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </TabsContent>

                                                    {/* Photos Tab */}
                                                    <TabsContent value="photos" className="space-y-4">
                                                        {detailsLoading ? (
                                                            <div className="flex justify-center py-8">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8f7e4f]"></div>
                                                            </div>
                                                        ) : shopPhotos.length === 0 ? (
                                                            <div className="text-center py-8 text-sm text-gray-500">
                                                                No photos found for this shop
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                                {shopPhotos.map((photo: any) => {
                                                                    const photoUrl = API_CONFIG.getImageUrl(photo.photoName);
                                                                    console.log("🟡 DEBUG: Photo data:", { photoName: photo.photoName, photoUrl });
                                                                    return (
                                                                    <div key={photo._id} className="relative group">
                                                                        <div className="overflow-hidden rounded-lg bg-gray-100 aspect-square cursor-pointer" onClick={() => setSelectedImage(photoUrl)}>
                                                                            <img
                                                                                src={photoUrl}
                                                                                alt="Shop photo"
                                                                                className="w-full h-full object-cover group-hover:opacity-75 transition"
                                                                            />
                                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                                                <ZoomIn className="h-6 w-6 text-white" />
                                                                            </div>
                                                                        </div>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Are you sure you want to delete this photo?
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={async () => {
                                                                                            const result = await handleAdminDeleteShopPhoto(photo._id);
                                                                                            if (result.success) {
                                                                                                toast.success("Photo deleted");
                                                                                                loadShopDetails(selectedShop!.shopId);
                                                                                            } else {
                                                                                                toast.error(result.message);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        Delete
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </TabsContent>

                                                    {/* Links Tab */}
                                                    <TabsContent value="details" className="space-y-4">
                                                        {detailsLoading ? (
                                                            <div className="flex justify-center py-8">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8f7e4f]"></div>
                                                            </div>
                                                        ) : shopDetails.length === 0 ? (
                                                            <div className="text-center py-8 text-sm text-gray-500">
                                                                No links added for this shop
                                                            </div>
                                                        ) : (
                                                            shopDetails.map((detail: any) => (
                                                                <div key={detail._id} className="border rounded-lg p-4 space-y-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="space-y-2 flex-1">
                                                                            {[1, 2, 3, 4].map((num) => {
                                                                                const linkKey = `link${num}`;
                                                                                const link = (detail as any)[linkKey];
                                                                                return link ? (
                                                                                    <div key={linkKey} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                                                        <LinkIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                                                        <a
                                                                                            href={link}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="text-sm text-blue-600 hover:underline truncate"
                                                                                        >
                                                                                            {link}
                                                                                        </a>
                                                                                    </div>
                                                                                ) : null;
                                                                            })}
                                                                        </div>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 ml-2">
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>Delete Links</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Are you sure you want to delete all links for this shop?
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={async () => {
                                                                                            const result = await handleAdminDeleteShopDetail(detail._id);
                                                                                            if (result.success) {
                                                                                                toast.success("Links deleted");
                                                                                                loadShopDetails(selectedShop!.shopId);
                                                                                            } else {
                                                                                                toast.error(result.message);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        Delete
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </TabsContent>
                                                </Tabs>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Shop</DialogTitle>
                        <DialogDescription>Update shop details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="editOwnerId">Owner Id</Label>
                            <Input
                                id="editOwnerId"
                                value={formData.ownerId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ownerId: e.target.value }))}
                                placeholder="Owner ObjectId"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editShopName">Shop Name</Label>
                            <Input
                                id="editShopName"
                                value={formData.shopName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopName: e.target.value }))}
                                placeholder="Shop name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editShopContact">Shop Contact</Label>
                            <Input
                                id="editShopContact"
                                value={formData.shopContact}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopContact: e.target.value }))}
                                placeholder="10-digit phone"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCategoryId">Category</Label>
                            <Select
                                value={formData.categoryId || "uncategorized"}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        categoryId: value === "uncategorized" ? "" : value,
                                    }))
                                }
                            >
                                <SelectTrigger id="editCategoryId" className="bg-white">
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
                            <Label htmlFor="editSlug">Slug</Label>
                            <Input
                                id="editSlug"
                                value={formData.slug}
                                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                placeholder="Slug (optional)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editIsActive">Active</Label>
                            <div className="flex items-center gap-2 pt-2">
                                <Checkbox
                                    id="editIsActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked === true }))}
                                />
                                <span className="text-sm text-gray-600">Shop is active</span>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="editShopAddress">Shop Address</Label>
                            <Input
                                id="editShopAddress"
                                value={formData.shopAddress}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shopAddress: e.target.value }))}
                                placeholder="Shop address"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Shop description"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={actionLoading}>
                            {actionLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Image Viewer Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none">
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {selectedImage && (
                        <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img
                                src={selectedImage}
                                alt="Photo full view"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
