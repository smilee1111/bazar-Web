"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Store, MapPin, Phone, User, Calendar } from "lucide-react";
import { handleGetAllAdminShops } from "@/lib/actions/shop-action";
import { toast } from "react-toastify";

interface Shop {
    _id: string;
    shopName: string;
    shopAddress: string;
    shopContact: string;
    description: string;
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

export default function ApprovedShopsTab() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShops();
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

    if (shops.length === 0) {
        return (
            <div className="text-center py-8">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No approved shops</h3>
                <p className="text-gray-600">No shops have been approved yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shops.map((shop) => (
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

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full flex items-center gap-2 mt-3">
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
                                                    <p className="text-sm text-gray-600">{shop.categoryId.name}</p>
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
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}