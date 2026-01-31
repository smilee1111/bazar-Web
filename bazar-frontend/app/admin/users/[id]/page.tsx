import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAdminUserAction } from "@/lib/actions/admin-user-action";
import { Button } from "@/components/ui/button";

interface Params {
    params: {
        id: string;
    };
}

export default async function AdminUserDetailsPage({ params }: Params) {
    const result = await fetchAdminUserAction(params.id);
    if (!result.success || !result.data) {
        notFound();
    }

    const user = result.data;
    const roleName = (() => {
        if (user.roleMeta?.name) {
            return user.roleMeta.name;
        }
        const code = user.role?.toLowerCase();
        if (code?.includes("admin")) return "admin";
        if (code?.includes("seller")) return "seller";
        return "user";
    })();

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0b1220,_#01040a)] py-12 px-6 text-white">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/50">User detail</p>
                        <h1 className="text-4xl font-semibold">{user.fullName}</h1>
                        <p className="text-white/70">ID • {params.id}</p>
                    </div>
                    <Link href={`/admin/users/${params.id}/edit`}>
                        <Button className="rounded-full bg-white text-black">Edit record</Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Identity</p>
                        <h2 className="text-3xl font-semibold mt-2">{roleName}</h2>
                        <p className="text-white/60 mt-2">Username @{user.username}</p>
                        <p className="text-white/60">Email {user.email}</p>
                        <p className="text-white/60">Phone +{user.phoneNumber}</p>
                    </div>
                    <div className="rounded-3xl border border-white/15 bg-white/5 p-6 space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Created</p>
                            <p className="text-lg font-semibold">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Last update</p>
                            <p className="text-lg font-semibold">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
