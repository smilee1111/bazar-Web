import Link from "next/link";
import { notFound } from "next/navigation";
import { User, Settings, Shield, Mail, Phone, AtSign } from "lucide-react";

export const dynamic = 'force-dynamic';

import { handleWhoAmI } from "@/lib/actions/auth-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_CONFIG } from "@/lib/api/config";

import UpdateForm from "./components/UpdateForm";

export default async function ProfilePage() {
    const result = await handleWhoAmI();
    if (!result.success) {
        throw new Error(result.message || "some error occurred");
    }

    if (!result.data) {
        notFound();
    }

    const user = result.data;
    const roleName = normalizeRoleName(user);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Profile</p>
                <h1 className="text-4xl font-bold text-white">Your Account</h1>
                <p className="text-white/75 text-lg">Manage your profile and account settings.</p>
            </div>

            {/* Profile Overview Card */}
            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8f7e4f] to-[#7a6b45] shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-[#1a1a1a]">Profile Overview</CardTitle>
                            <CardDescription className="text-[#4a4a4a]">
                                Your account information and settings
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                        <Avatar className="h-32 w-32 ring-4 ring-[#8f7e4f]/20 shadow-xl">
                            <AvatarImage
                                src={API_CONFIG.getImageUrl(user?.profilePic) || undefined}
                                alt={user.fullName || "Profile"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-[#8f7e4f] to-[#7a6b45] text-white text-2xl font-semibold">
                                {(user.fullName || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-[#1a1a1a] sm:text-4xl">{user.fullName || "Your profile"}</h2>
                                <p className="text-[#4a4a4a] mt-2 text-lg">
                                    Manage how your account appears to teammates and sellers across the Bazar workspace.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="flex items-center gap-3 rounded-lg bg-[#8f7e4f]/5 p-3 border border-[#8f7e4f]/10">
                                    <Mail className="h-4 w-4 text-[#8f7e4f]" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-[#6a5c38] uppercase tracking-wide">Email</p>
                                        <p className="text-sm font-medium text-[#1a1a1a] truncate">{user.email}</p>
                                    </div>
                                </div>

                                {user.username && (
                                    <div className="flex items-center gap-3 rounded-lg bg-[#8f7e4f]/5 p-3 border border-[#8f7e4f]/10">
                                        <AtSign className="h-4 w-4 text-[#8f7e4f]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#6a5c38] uppercase tracking-wide">Username</p>
                                            <p className="text-sm font-medium text-[#1a1a1a]">@{user.username}</p>
                                        </div>
                                    </div>
                                )}

                                {user.phoneNumber && (
                                    <div className="flex items-center gap-3 rounded-lg bg-[#8f7e4f]/5 p-3 border border-[#8f7e4f]/10">
                                        <Phone className="h-4 w-4 text-[#8f7e4f]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#6a5c38] uppercase tracking-wide">Phone</p>
                                            <p className="text-sm font-medium text-[#1a1a1a]">{user.phoneNumber}</p>
                                        </div>
                                    </div>
                                )}

                                {roleName && (
                                    <div className="flex items-center gap-3 rounded-lg bg-[#8f7e4f]/5 p-3 border border-[#8f7e4f]/10">
                                        <Shield className="h-4 w-4 text-[#8f7e4f]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-[#6a5c38] uppercase tracking-wide">Role</p>
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
                                    className="border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
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