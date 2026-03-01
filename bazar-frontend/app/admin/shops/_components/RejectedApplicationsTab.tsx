"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Calendar, User, Phone, MapPin, Building, Eye, XCircle } from "lucide-react";
import { handleGetAllSellerApplications } from "@/lib/actions/sellerApplication-action";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import ApplicationLocationMap from "./ApplicationLocationMap";

interface SellerApplication {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
    businessName: string;
    categoryName?: string;
    businessPhone: string;
    businessAddress: string;
    location?: { type: "Point"; coordinates: [number, number] };
    description: string;
    documentUrl: string;
    status: "pending" | "approved" | "rejected";
    adminRemark?: string;
    createdAt: string;
    updatedAt: string;
}

export default function RejectedApplicationsTab() {
    const [applications, setApplications] = useState<SellerApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const result = await handleGetAllSellerApplications();
            if (result.success) {
                const rejected = Array.isArray(result.data)
                    ? result.data.filter((app) => app.status === "rejected")
                    : [];
                setApplications(rejected);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load rejected applications");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B6F47] mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading rejected applications...</p>
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected applications</h3>
                <p className="text-gray-600">There are no rejected seller applications.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((application) => (
                <Card key={application._id} className="hover:shadow-md transition-shadow bg-white border border-[#e8e1cf]">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    {application.businessName}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        {application.userId.fullName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(application.createdAt).toLocaleDateString()}
                                    </span>
                                </CardDescription>
                            </div>
                            <div className="inline-flex items-center gap-2">
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    Rejected
                                </Badge>
                                <span className="text-sm text-gray-500">
                                    {application.categoryName || "Uncategorized"}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Owner:</span>
                                    <span>{application.userId.fullName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Business Phone:</span>
                                    <span>{application.businessPhone}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">Address:</span>
                                    <span className="truncate">{application.businessAddress}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="inline-flex items-center gap-2 text-sm text-[#5B3E2E] border border-[#e8e1cf] rounded-md px-3 py-1.5 hover:bg-[#f7f3ea]">
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white border-[1.2px] border-gray-200 text-[#2D2318] rounded-lg p-6 shadow-xl">
                                    <DialogHeader className="mb-4">
                                        <DialogTitle className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            {application.businessName}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm text-gray-600">
                                            Rejected seller application details and business information
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Business Name</Label>
                                                <p className="text-sm text-gray-700">{application.businessName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Category</Label>
                                                <p className="text-sm text-gray-700">{application.categoryName || "Uncategorized"}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Business Phone</Label>
                                                <p className="text-sm text-gray-700">{application.businessPhone}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-sm font-medium">Business Address</Label>
                                                <p className="text-sm text-gray-700">{application.businessAddress}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Owner Name</Label>
                                                <p className="text-sm text-gray-700">{application.userId.fullName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Owner Email</Label>
                                                <p className="text-sm text-gray-700">{application.userId.email}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium">Description</Label>
                                            <p className="text-sm text-gray-700 mt-1">{application.description}</p>
                                        </div>
                                        <ApplicationLocationMap
                                            location={application.location}
                                            businessAddress={application.businessAddress}
                                            height={220}
                                        />
                                        {application.adminRemark && (
                                            <div>
                                                <Label className="text-sm font-medium">Admin Remark</Label>
                                                <p className="text-sm text-gray-700 mt-1">{application.adminRemark}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-sm font-medium">Document</Label>
                                            <a
                                                href={application.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#8B6F47] hover:underline ml-2"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
