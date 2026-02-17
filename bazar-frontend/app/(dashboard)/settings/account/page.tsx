"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, ShieldCheck, FileCheck, RefreshCw } from "lucide-react";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleCreateMySellerApplication, handleGetMySellerApplication } from "@/lib/actions/sellerApplication-action";
import { toast } from "react-toastify";

interface Category {
    _id: string;
    categoryId: string;
    categoryName: string;
}

interface SellerApplication {
    _id: string;
    businessName: string;
    businessPhone: string;
    businessAddress: string;
    description?: string;
    documentUrl?: string;
    categoryName?: string;
    status: "pending" | "approved" | "rejected";
    adminRemark?: string | null;
    createdAt: string;
    updatedAt: string;
}

const statusStyles: Record<SellerApplication["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
};

export default function AccountSettingsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [application, setApplication] = useState<SellerApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        categoryName: "",
        businessPhone: "",
        businessAddress: "",
        description: "",
        documentUrl: "",
    });

    useEffect(() => {
        loadCategories();
        loadApplication();
    }, []);

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

    const loadApplication = async () => {
        setLoading(true);
        try {
            const result = await handleGetMySellerApplication();
            if (result.success) {
                setApplication(result.data || null);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load application");
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = useMemo(() => {
        const values = categories.map((category) => category.categoryName).filter(Boolean);
        return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
    }, [categories]);

    const canApply = !application || application.status === "rejected";

    const handleSubmit = async () => {
        if (!formData.businessName || !formData.categoryName || !formData.businessPhone || !formData.businessAddress) {
            toast.error("Please fill in all required fields");
            return;
        }

        setActionLoading(true);
        try {
            const result = await handleCreateMySellerApplication(formData);
            if (result.success) {
                toast.success("Seller application submitted successfully");
                setShowForm(false);
                await loadApplication();
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to submit application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleTryAgain = () => {
        if (!application) return;
        setFormData({
            businessName: application.businessName || "",
            categoryName: application.categoryName || "",
            businessPhone: application.businessPhone || "",
            businessAddress: application.businessAddress || "",
            description: application.description || "",
            documentUrl: application.documentUrl || "",
        });
        setShowForm(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Settings</p>
                <h1 className="text-4xl font-bold text-white">Account</h1>
                <p className="text-white/75 text-lg">Manage your account preferences and seller status.</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15">
                            <ShieldCheck className="h-5 w-5 text-[#8f7e4f]" />
                        </span>
                        <div>
                            <CardTitle className="text-xl text-[#1a1a1a]">Seller Mode</CardTitle>
                            <CardDescription>Apply to become a seller and manage your shop.</CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3 rounded-full border border-[#e8e1cf] bg-white px-4 py-2">
                            <Checkbox
                                id="sellerMode"
                                checked={showForm}
                                onCheckedChange={(checked) => {
                                    if (!canApply) {
                                        setShowForm(false);
                                        return;
                                    }
                                    setShowForm(checked === true);
                                }}
                            />
                            <Label htmlFor="sellerMode" className="text-sm font-medium text-[#4a4a4a]">
                                Enable seller mode
                            </Label>
                        </div>
                        {!canApply && (
                            <span className="text-sm text-[#7a6b45]">Application already submitted.</span>
                        )}
                    </div>
                </CardHeader>

                <Separator className="bg-[#efefef]" />

                <CardContent className="space-y-6 pt-6">
                    {loading ? (
                        <p className="text-sm text-[#4a4a4a]">Loading your application...</p>
                    ) : application ? (
                        <div className="rounded-xl border border-[#e8e1cf] bg-[#faf7f0] p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="h-5 w-5 text-[#8f7e4f]" />
                                    <h3 className="text-lg font-semibold text-[#1a1a1a]">Your Seller Application</h3>
                                </div>
                                <Badge className={statusStyles[application.status]}>{application.status}</Badge>
                            </div>
                            <div className="mt-4 grid gap-3 text-sm text-[#4a4a4a] md:grid-cols-2">
                                <div>
                                    <span className="font-medium text-[#1a1a1a]">Business</span>
                                    <p>{application.businessName}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-[#1a1a1a]">Category</span>
                                    <p>{application.categoryName || "Uncategorized"}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-[#1a1a1a]">Phone</span>
                                    <p>{application.businessPhone}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-[#1a1a1a]">Address</span>
                                    <p>{application.businessAddress}</p>
                                </div>
                            </div>
                            {application.adminRemark && (
                                <p className="mt-3 text-sm text-[#7a6b45]">Admin remark: {application.adminRemark}</p>
                            )}
                            {application.status === "rejected" && (
                                <Button
                                    onClick={handleTryAgain}
                                    className="mt-4 flex items-center gap-2 bg-[#8f7e4f] text-white hover:bg-[#7a6b45]"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-[#e8e1cf] bg-white p-5 text-sm text-[#4a4a4a]">
                            No seller application submitted yet. Enable seller mode to start.
                        </div>
                    )}

                    {showForm && canApply && (
                        <div className="space-y-4 rounded-xl border border-[#e8e1cf] bg-white p-5">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-[#8f7e4f]" />
                                <h3 className="text-lg font-semibold text-[#1a1a1a]">Seller Application</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input
                                        id="businessName"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                                        placeholder="Your business name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="categoryName">Category</Label>
                                    <Select
                                        value={formData.categoryName || ""}
                                        onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryName: value }))}
                                    >
                                        <SelectTrigger id="categoryName" className="bg-white">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[120]">
                                            {categoryOptions.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessPhone">Business Phone</Label>
                                    <Input
                                        id="businessPhone"
                                        value={formData.businessPhone}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, businessPhone: e.target.value }))}
                                        placeholder="10-digit phone"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessAddress">Business Address</Label>
                                    <Input
                                        id="businessAddress"
                                        value={formData.businessAddress}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, businessAddress: e.target.value }))}
                                        placeholder="Address"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Tell us about your business"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="documentUrl">Supporting Document (optional)</Label>
                                    <Input
                                        id="documentUrl"
                                        value={formData.documentUrl}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, documentUrl: e.target.value }))}
                                        placeholder="Document URL"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={actionLoading}
                                    className="bg-[#8f7e4f] text-white hover:bg-[#7a6b45]"
                                >
                                    {actionLoading ? "Submitting..." : "Submit Application"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
