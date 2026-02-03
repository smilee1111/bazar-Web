import Link from "next/link";
import { notFound } from "next/navigation";

import { handleWhoAmI } from "@/lib/actions/auth-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
        <section className="min-h-screen bg-[#f7f4ec]">
            <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-0">
                <Card className="border-none bg-gradient-to-r from-[#f0e8d9] via-[#f7f2e3] to-[#fdfbf6] shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-sm uppercase tracking-[0.2em] text-[#8f7e4f]">Your profile</CardTitle>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold text-[#1a1a1a] sm:text-4xl">{user.fullName || "Your profile"}</h1>
                            <CardDescription className="text-base text-[#4a4a4a]">
                                Manage how your account appears to teammates and sellers across the Bazar workspace.
                            </CardDescription>
                            <div className="flex flex-wrap gap-3 text-sm text-[#6a5c38]">
                                <span className="rounded-full bg-white/80 px-3 py-1 font-medium">{user.email}</span>
                                {user.username && <span className="rounded-full bg-white/80 px-3 py-1 font-medium">@{user.username}</span>}
                                {roleName && <span className="rounded-full bg-white/80 px-3 py-1 font-medium capitalize">{roleName}</span>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-[#5f5135]">
                            <p>Need to switch context?</p>
                            <p className="font-medium text-[#1a1a1a]">Profile updates sync instantly with the dashboard.</p>
                        </div>
                        <Link href="/dashboard">
                            <Button
                                variant="outline"
                                className="border-[#c7b899] text-[#6a5c38] hover:bg-[#f4ecda]"
                            >
                                Back to dashboard
                            </Button>
                        </Link>
                    </CardContent>
                    <Separator className="bg-[#eadfc6]" />
                </Card>

                <UpdateForm user={user} />
            </div>
        </section>
    );
}

function normalizeRoleName(user: any) {
    if (!user) return null;
    if (typeof user.role === "string") return user.role;
    return user.role?.roleName || user.role?.name || user.roleId?.roleName || null;
}