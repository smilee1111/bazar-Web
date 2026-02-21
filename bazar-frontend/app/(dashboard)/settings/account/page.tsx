"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, ShieldCheck, FileCheck, RefreshCw, Upload, FileText, MapPin } from "lucide-react";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { handleCreateMySellerApplication, handleGetMySellerApplication } from "@/lib/actions/sellerApplication-action";
import { uploadDocument } from "@/lib/api/sellerApplication";
import { toast } from "react-toastify";

const ShopLocationMap = dynamic(() => import("@/components/maps/ShopLocationMap"), { ssr: false });
const LocationPicker = dynamic(() => import("@/components/maps/LocationPicker"), { ssr: false });

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
    location?: { type: "Point"; coordinates: [number, number] };
    description?: string;
    documentUrl: string;
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
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        businessName: "",
        categoryName: "",
        businessPhone: "",
        businessAddress: "",
        locationLat: "",
        locationLng: "",
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
    const locationLatValue = Number(formData.locationLat);
    const locationLngValue = Number(formData.locationLng);
    const hasValidLocation = Number.isFinite(locationLatValue) && Number.isFinite(locationLngValue);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            toast.error("Only PDF files are allowed");
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setSelectedFile(file);
        
        // Auto-upload the document
        setUploadingDocument(true);
        try {
            const result = await uploadDocument(file);
            if (result.success) {
                const documentUrl = result.data?.documentUrl || result.data?.url;
                setFormData(prev => ({ ...prev, documentUrl }));
                toast.success("Document uploaded successfully");
            } else {
                toast.error(result.message || "Failed to upload document");
                setSelectedFile(null);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to upload document");
            setSelectedFile(null);
        } finally {
            setUploadingDocument(false);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.info("Fetching your location...", { autoClose: 2000 });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setFormData((prev) => ({
                    ...prev,
                    locationLat: lat.toFixed(6),
                    locationLng: lng.toFixed(6),
                }));
                toast.success("Location fetched successfully!");
            },
            (error) => {
                let errorMessage = "Unable to fetch your location";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied. Please enable location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable. Please try again.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out. Please try again.";
                        break;
                }
                toast.error(errorMessage);
                console.error("Geolocation error:", error);
            },
            { 
                enableHighAccuracy: true, 
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = async () => {
        if (!formData.businessName || !formData.categoryName || !formData.businessPhone || !formData.businessAddress) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.documentUrl) {
            toast.error("Please upload a supporting document (PDF)");
            return;
        }

        setActionLoading(true);
        try {
            const { locationLat, locationLng, ...rest } = formData;
            const lat = Number(locationLat);
            const lng = Number(locationLng);
            const location = Number.isFinite(lat) && Number.isFinite(lng)
                ? { type: "Point", coordinates: [lng, lat] as [number, number] }
                : undefined;
            const payload = {
                ...rest,
                location,
            };
            const result = await handleCreateMySellerApplication(payload);
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
        const coords = application.location?.coordinates || [];
        const [lng, lat] = coords.length === 2 ? coords : ["", ""];
        setFormData({
            businessName: application.businessName || "",
            categoryName: application.categoryName || "",
            businessPhone: application.businessPhone || "",
            businessAddress: application.businessAddress || "",
            locationLat: lat ? String(lat) : "",
            locationLng: lng ? String(lng) : "",
            description: application.description || "",
            documentUrl: application.documentUrl || "",
        });
        setSelectedFile(null);
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
                                <div>
                                    <span className="font-medium text-[#1a1a1a]">Location</span>
                                    <p>
                                        {application.location?.coordinates
                                            ? `${application.location.coordinates[1].toFixed(5)}, ${application.location.coordinates[0].toFixed(5)}`
                                            : "Not set"}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="font-medium text-[#1a1a1a]">Supporting Document</span>
                                    <p>
                                        <a 
                                            href={application.documentUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[#8f7e4f] hover:underline flex items-center gap-1"
                                        >
                                            <FileText className="h-4 w-4" />
                                            View Document
                                        </a>
                                    </p>
                                </div>
                            </div>
                            {application.location?.coordinates && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 text-sm text-[#7a6b45]">
                                        <MapPin className="h-4 w-4" />
                                        <span>Business location</span>
                                    </div>
                                    <div className="mt-2 overflow-hidden rounded-2xl">
                                        <ShopLocationMap
                                            lat={application.location.coordinates[1]}
                                            lng={application.location.coordinates[0]}
                                            height={220}
                                        />
                                    </div>
                                </div>
                            )}
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
                            </div>

                            {/* Interactive Location Picker */}
                            <div className="space-y-2">
                                <Label>Business Location</Label>
                                <LocationPicker
                                    value={
                                        formData.locationLat && formData.locationLng
                                            ? {
                                                  lat: Number(formData.locationLat),
                                                  lng: Number(formData.locationLng),
                                              }
                                            : undefined
                                    }
                                    onChange={(location) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            locationLat: location.lat.toFixed(6),
                                            locationLng: location.lng.toFixed(6),
                                        }));
                                    }}
                                    height={350}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Tell us about your business"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="document" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Supporting Document (PDF) <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="document"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handleFileChange}
                                                disabled={uploadingDocument}
                                                className="cursor-pointer"
                                            />
                                            {uploadingDocument && (
                                                <Upload className="h-4 w-4 animate-spin text-[#8f7e4f]" />
                                            )}
                                        </div>
                                        {selectedFile && (
                                            <p className="text-sm text-[#4a4a4a]">
                                                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        )}
                                        {formData.documentUrl && (
                                            <p className="text-sm text-green-600">
                                                ✓ Document uploaded successfully
                                            </p>
                                        )}
                                    </div>
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
