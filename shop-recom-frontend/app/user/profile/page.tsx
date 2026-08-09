import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import { handleWhoAmI } from "@/lib/actions/auth-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import UpdateForm from "./components/UpdateForm";

export default async function ProfilePage() {
    const result = await handleWhoAmI();
    if (!result.success) {
        // Redirect to login instead of throwing error
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
                <p className="text-sm uppercase tracking-[0.2em] text-[#267A4C]">Profile</p>
                <h1 className="text-4xl font-bold text-[#142A1C]">Your Account</h1>
                <p className="text-gray-500 text-lg">Manage your profile and account settings.</p>
            </div>

            <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="space-y-4">
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-[#267A4C]">Your profile</CardTitle>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold text-[#142A1C] sm:text-4xl">{user.fullName || "Your profile"}</h1>
                        <CardDescription className="text-base text-[#1B4A31]">
                            Manage how your account appears to teammates and sellers across the HaatKhoj workspace.
                        </CardDescription>
                        <div className="flex flex-wrap gap-3 text-sm text-[#1B4A31]">
                            <span className="rounded-full bg-[#267A4C]/10 px-3 py-1 font-medium text-[#267A4C]">{user.email}</span>
                            {user.username && <span className="rounded-full bg-[#267A4C]/10 px-3 py-1 font-medium text-[#267A4C]">@{user.username}</span>}
                            {roleName && <span className="rounded-full bg-[#267A4C]/10 px-3 py-1 font-medium text-[#267A4C] capitalize">{roleName}</span>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-[#1B4A31]">
                        <p>Need to switch context?</p>
                        <p className="font-medium text-[#142A1C]">Profile updates sync instantly with the dashboard.</p>
                    </div>
                    <Link href="/dashboard">
                        <Button
                            variant="outline"
                            className="border-[#267A4C] text-[#267A4C] hover:bg-[#267A4C]/10 hover:border-[#1C5C39] transition-all duration-300"
                        >
                            Back to dashboard
                        </Button>
                    </Link>
                </CardContent>
                <Separator className="bg-[#efefef]" />
            </Card>

            <UpdateForm user={user} />
        </div>
    );
}

function normalizeRoleName(user: any) {
    if (!user) return null;
    if (typeof user.role === "string") return user.role;
    return user.role?.roleName || user.role?.name || user.roleId?.roleName || null;
}