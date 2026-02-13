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
import { Eye, Store, MapPin, Phone, User, Calendar, Pencil, Trash2, Plus } from "lucide-react";
import { handleCreateAdminShop, handleDeleteAdminShop, handleGetAllAdminShops, handleUpdateAdminShop } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { toast } from "react-toastify";

interface Shop {
    _id: string;
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

    useEffect(() => {
        loadShops();
        loadCategories();
    }, []);

    const loadShops = async () => {
        try {
            const result = await handleGetAllAdminShops();
            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : result.data?.data;
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
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle className="flex items-center gap-2">
                                                        <Store className="h-5 w-5" />
                                                        {shop.shopName}
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Complete shop information and details
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Shop Name</label>
                                                            <p className="text-sm text-gray-600">{shop.shopName}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Category</label>
                                                            <p className="text-sm text-gray-600">{shop.categoryId?.name || "Uncategorized"}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="text-sm font-medium text-gray-700">Address</label>
                                                            <p className="text-sm text-gray-600">{shop.shopAddress}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Contact</label>
                                                            <p className="text-sm text-gray-600">{shop.shopContact}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Owner</label>
                                                            <p className="text-sm text-gray-600">{shop.ownerId.fullName}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Owner Email</label>
                                                            <p className="text-sm text-gray-600">{shop.ownerId.email}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Owner Phone</label>
                                                            <p className="text-sm text-gray-600">{shop.ownerId.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                                        <p className="text-sm text-gray-600 mt-1">{shop.description}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Created</label>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(shop.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(shop.updatedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
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
        </div>
    );
}