import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { User, Settings, Shield, Mail, Phone, AtSign } from "lucide-react";

export const dynamic = 'force-dynamic';

import { handleWhoAmI } from "@/lib/actions/auth-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_CONFIG } from "@/lib/api/config";
import { toast } from "react-toastify";

import UpdateForm from "./components/UpdateForm";

export default async function ProfilePage() {
    const result = await handleWhoAmI();
    if (!result.success) {
        redirect('/login');
    }

    if (!result.data) {
        notFound();
    }

    const user = result.data;
    const roleName = normalizeRoleName(user);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Profile</p>
                <h1 className="text-4xl font-bold text-[#2D2318]">Your Account</h1>
                <p className="text-gray-500 text-lg">Manage your profile and account settings.</p>
            </div>

            {/* Profile Overview Card */}
            <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B6F47] to-[#7D5A3F] shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-[#2D2318]">Profile Overview</CardTitle>
                            <CardDescription className="text-[#5B3E2E]">
                                Your account information and settings
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                        <Avatar className="h-32 w-32 ring-4 ring-[#8B6F47]/20 shadow-xl">
                            <AvatarImage
                                src={API_CONFIG.getImageUrl(user?.profilePic) || undefined}
                                alt={user.fullName || "Profile"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-[#8B6F47] to-[#7D5A3F] text-white text-2xl font-semibold">
                                {(user.fullName || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-[#2D2318] sm:text-4xl">{user.fullName || "Your profile"}</h2>
                                <p className="text-[#5B3E2E] mt-2 text-lg">
                                    Manage how your account appears to teammates and sellers across the Bazar workspace.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center gap-3 rounded-lg bg-[#8B6F47]/5 p-3 border border-[#8B6F47]/10">
                                    <Mail className="h-4 w-4 text-[#8B6F47]" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-[#5B3E2E] uppercase tracking-wide">Email</p>
                                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{user.email}</p>
                                    </div>
                                </div>

                                {user.username && (
                                    <div className="flex items-center gap-3 rounded-lg bg-[#8B6F47]/5 p-3 border border-[#8B6F47]/10">
                                        <AtSign className="h-4 w-4 text-[#8B6F47]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#5B3E2E] uppercase tracking-wide">Username</p>
                                            <p className="text-sm font-medium text-[#1a1a1a]">@{user.username}</p>
                                        </div>
                                    </div>
                                )}

                                {user.phoneNumber && (
                                    <div className="flex items-center gap-3 rounded-lg bg-[#8B6F47]/5 p-3 border border-[#8B6F47]/10">
                                        <Phone className="h-4 w-4 text-[#8B6F47]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#5B3E2E] uppercase tracking-wide">Phone</p>
                                            <p className="text-sm font-medium text-[#1a1a1a]">{user.phoneNumber}</p>
                                        </div>
                                    </div>
                                )}

                                {roleName && (
                                    <div className="flex items-center gap-3 rounded-lg bg-[#8B6F47]/5 p-3 border border-[#8B6F47]/10">
                                        <Shield className="h-4 w-4 text-[#8B6F47]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#5B3E2E] uppercase tracking-wide">Role</p>
                                            <p className="text-sm font-medium text-[#1a1a1a] capitalize">{roleName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <Separator className="bg-[#efefef]" />

                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-[#1a1a1a]">Need to switch context?</p>
                            <p className="text-sm text-[#5f5135]">Profile updates sync instantly with the dashboard.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/dashboard">
                                <Button
                                    variant="outline"
                                    className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47]/10 hover:border-[#7D5A3F] transition-all duration-300"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Update Form */}
            <UpdateForm user={user} />
        </div>
    );
}

function normalizeRoleName(user: any) {
    if (!user) return null;
    if (typeof user.role === "string") return user.role;
    return user.role?.roleName || user.role?.name || user.roleId?.roleName || null;
}