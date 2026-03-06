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
                <p className="text-sm uppercase tracking-[0.2em] text-[#8B6F47]">Profile</p>
                <h1 className="text-4xl font-bold text-[#2D2318]">Your Account</h1>
                <p className="text-gray-500 text-lg">Manage your profile and account settings.</p>
            </div>

            <Card className="border-gray-100 bg-white shadow-sm">
                <CardHeader className="space-y-4">
                    <CardTitle className="text-sm uppercase tracking-[0.2em] text-[#8B6F47]">Your profile</CardTitle>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold text-[#2D2318] sm:text-4xl">{user.fullName || "Your profile"}</h1>
                        <CardDescription className="text-base text-[#5B3E2E]">
                            Manage how your account appears to teammates and sellers across the Bazar workspace.
                        </CardDescription>
                        <div className="flex flex-wrap gap-3 text-sm text-[#5B3E2E]">
                            <span className="rounded-full bg-[#8B6F47]/10 px-3 py-1 font-medium text-[#8B6F47]">{user.email}</span>
                            {user.username && <span className="rounded-full bg-[#8B6F47]/10 px-3 py-1 font-medium text-[#8B6F47]">@{user.username}</span>}
                            {roleName && <span className="rounded-full bg-[#8B6F47]/10 px-3 py-1 font-medium text-[#8B6F47] capitalize">{roleName}</span>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-[#5B3E2E]">
                        <p>Need to switch context?</p>
                        <p className="font-medium text-[#2D2318]">Profile updates sync instantly with the dashboard.</p>
                    </div>
                    <Link href="/dashboard">
                        <Button
                            variant="outline"
                            className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47]/10 hover:border-[#7D5A3F] transition-all duration-300"
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