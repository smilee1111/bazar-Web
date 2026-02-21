"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Eye, FileText, Calendar, User, Phone, MapPin, Building } from "lucide-react";
import { handleGetPendingSellerApplications, handleApproveSellerApplication, handleRejectSellerApplication } from "@/lib/actions/sellerApplication-action";
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
    status: 'pending' | 'approved' | 'rejected';
    adminRemark?: string;
    createdAt: string;
    updatedAt: string;
}

export default function SellerApplicationsTab() {
    const [applications, setApplications] = useState<SellerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminRemark, setAdminRemark] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const result = await handleGetPendingSellerApplications();
            if (result.success) {
                setApplications(result.data);
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to load applications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (applicationId: string) => {
        setActionLoading(true);
        try {
            const result = await handleApproveSellerApplication(applicationId, adminRemark || undefined);
            if (result.success) {
                toast.success("Application approved successfully");
                setApplications(prev => prev.filter(app => app._id !== applicationId));
                setAdminRemark("");
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to approve application");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (applicationId: string) => {
        setActionLoading(true);
        try {
            const result = await handleRejectSellerApplication(applicationId, adminRemark || undefined);
            if (result.success) {
                toast.success("Application rejected successfully");
                setApplications(prev => prev.filter(app => app._id !== applicationId));
                setAdminRemark("");
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to reject application");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8f7e4f] mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading applications...</p>
                </div>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
                <p className="text-gray-600">All seller applications have been processed.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((application) => (
                <Card key={application._id} className="hover:shadow-md transition-shadow bg-white/95 border border-[#e8e1cf]">
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
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    Pending Review
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
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white border-[1.2px] border-white/25 text-[#1a1a1a] rounded-lg p-6 shadow-xl">
                                    <DialogHeader className="mb-4">
                                        <DialogTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            {application.businessName}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm text-gray-600">
                                            Seller application details and business information
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
                                        <div>
                                            <Label className="text-sm font-medium">Document</Label>
                                            <a
                                                href={application.documentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#8f7e4f] hover:underline ml-2"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Approve Seller Application</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to approve this seller application? This will grant the user permission to create and manage a shop.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="remark">Admin Remark (Optional)</Label>
                                            <Textarea
                                                id="remark"
                                                placeholder="Add any remarks for this approval..."
                                                value={adminRemark}
                                                onChange={(e) => setAdminRemark(e.target.value)}
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleApprove(application._id)}
                                            disabled={actionLoading}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {actionLoading ? "Approving..." : "Approve"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reject Seller Application</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to reject this seller application? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="reject-remark">Admin Remark (Required)</Label>
                                            <Textarea
                                                id="reject-remark"
                                                placeholder="Please provide a reason for rejection..."
                                                value={adminRemark}
                                                onChange={(e) => setAdminRemark(e.target.value)}
                                                className="mt-2"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleReject(application._id)}
                                            disabled={actionLoading || !adminRemark.trim()}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {actionLoading ? "Rejecting..." : "Reject"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
