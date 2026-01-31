"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { deleteAdminUserAction } from "@/lib/actions/admin-user-action";
import type { AdminUser } from "@/lib/api/users";
import { Button } from "@/components/ui/button";

interface Props {
    users: AdminUser[];
}

const getRoleBadgeColor = (roleName?: string | null) => {
    const role = roleName?.toLowerCase();
    if (role === "admin") return "bg-rose-100 text-rose-700 border-rose-200";
    if (role === "seller") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
};

const resolveRoleName = (user: AdminUser) => {
    const metaName = user.roleMeta?.name;
    if (metaName) return metaName;
    const roleCode = user.role?.toLowerCase();
    if (roleCode?.includes("admin")) return "admin";
    if (roleCode?.includes("seller")) return "seller";
    return "user";
};

export default function UserTable({ users }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string) => {
        startTransition(async () => {
            const result = await deleteAdminUserAction(id);
            if (!result?.success) {
                toast.error(result?.message || "Failed to delete user");
                return;
            }
            toast.success("User removed");
        });
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left text-white/70 uppercase tracking-[0.3em] text-[11px]">
                        <th className="px-6 py-4 font-medium">User</th>
                        <th className="px-6 py-4 font-medium">Contact</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Last update</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 && (
                        <tr>
                            <td className="px-6 py-8 text-center text-white/60" colSpan={5}>
                                No users yet. Create your first teammate.
                            </td>
                        </tr>
                    )}
                    {users.map((user) => {
                        const roleName = resolveRoleName(user);
                        return (
                            <tr key={user._id} className="border-t border-white/10 text-white/90">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-sm font-semibold uppercase">
                                            {user.fullName?.slice(0, 2) || "US"}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{user.fullName}</p>
                                            <p className="text-white/60 text-xs">{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="space-y-1">
                                        <p>{user.email}</p>
                                        <p className="text-xs text-white/60">+{user.phoneNumber}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeColor(roleName)}`}>
                                        {roleName}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-white/60 text-sm">
                                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/users/${user._id}`} className="text-white/70 text-xs underline decoration-dotted">
                                            View
                                        </Link>
                                        <Link href={`/admin/users/${user._id}/edit`} className="text-white/70 text-xs underline decoration-dotted">
                                            Edit
                                        </Link>
                                        <Button
                                            onClick={() => handleDelete(user._id)}
                                            variant="ghost"
                                            className="text-rose-300 hover:text-rose-100 hover:bg-rose-500/10"
                                            disabled={isPending}
                                        >
                                            {isPending ? "Working..." : "Delete"}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
