"use client";

import { useEffect, useState } from "react";
import { Building2, Store, User, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { handleGetMyShop, handleUpdateShop } from "@/lib/actions/shop-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
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
    isActive?: boolean;
    ownerId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
}

export default function MyShopPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shop, setShop] = useState<Shop | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        shopName: "",
        shopAddress: "",
        shopContact: "",
        description: "",
        categoryId: "",
        slug: "",
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
        </div>
    );
}
