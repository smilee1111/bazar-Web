"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Store, FileCheck, CheckCircle, XCircle } from "lucide-react";
import SellerApplicationsTab from "./_components/SellerApplicationsTab";
import ApprovedShopsTab from "./_components/ApprovedShopsTab";
import RejectedApplicationsTab from "./_components/RejectedApplicationsTab";

export default function AdminShopsPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin</p>
                <h1 className="text-4xl font-bold text-white">Shops Management</h1>
                <p className="text-white/75 text-lg">Manage seller applications and approved shops</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15">
                            <Store className="h-5 w-5 text-[#8f7e4f]" />
                        </span>
                        <CardTitle className="text-xl text-[#1a1a1a]">Shops Management</CardTitle>
                    </div>
                    <div className="w-full lg:w-auto">
                        <div className="flex justify-end">
                            <div className="hidden lg:block" />
                        </div>
                    </div>
                </CardHeader>
                <Separator className="bg-[#efefef]" />
                <CardContent>
                    <Tabs defaultValue="applications" className="space-y-6">
                        <TabsList className="grid w-full max-w-2xl grid-cols-3 border border-[#e8e1cf] bg-white/90 shadow-sm">
                            <TabsTrigger
                                value="applications"
                                className="flex items-center gap-2 text-[#4a4a4a] data-[state=active]:bg-[#8f7e4f] data-[state=active]:text-white data-[state=active]:shadow"
                            >
                                <FileCheck className="h-4 w-4" />
                                Applications
                            </TabsTrigger>
                            <TabsTrigger
                                value="shops"
                                className="flex items-center gap-2 text-[#4a4a4a] data-[state=active]:bg-[#8f7e4f] data-[state=active]:text-white data-[state=active]:shadow"
                            >
                                <CheckCircle className="h-4 w-4" />
                                Approved Shops
                            </TabsTrigger>
                            <TabsTrigger
                                value="rejected"
                                className="flex items-center gap-2 text-[#4a4a4a] data-[state=active]:bg-[#8f7e4f] data-[state=active]:text-white data-[state=active]:shadow"
                            >
                                <XCircle className="h-4 w-4" />
                                Rejected Shops
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="applications" className="space-y-6">
                            <Card className="border-[#e8e1cf] bg-white/95 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileCheck className="h-5 w-5 text-[#4a4a4a]" />
                                        Seller Applications
                                    </CardTitle>
                                    <CardDescription>
                                        Review and manage seller applications. Approve or reject applications to grant or deny shop creation permissions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SellerApplicationsTab />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="shops" className="space-y-6">
                            <Card className="border-[#e8e1cf] bg-white/95 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-[#4a4a4a]" />
                                        Approved Shops
                                    </CardTitle>
                                    <CardDescription>
                                        View all approved shops and their current status. Monitor shop activity and performance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ApprovedShopsTab />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="rejected" className="space-y-6">
                            <Card className="border-[#e8e1cf] bg-white/95 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-[#4a4a4a]" />
                                        Rejected Shops
                                    </CardTitle>
                                    <CardDescription>
                                        Review seller applications that were rejected and their admin remarks.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RejectedApplicationsTab />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}