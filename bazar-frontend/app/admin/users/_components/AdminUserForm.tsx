"use client";

import { useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createAdminUserAction, updateAdminUserAction } from "@/lib/actions/admin-user-action";
import type { AdminUser } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    mode: "create" | "edit";
    user?: AdminUser | null;
}

const roles = [
    { value: "user", label: "Community user" },
    { value: "seller", label: "Seller" },
    { value: "admin", label: "Admin" },
];

export default function AdminUserForm({ mode, user }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const normalizedRole = (() => {
        const fromMeta = user?.roleMeta?.name?.toLowerCase();
        if (fromMeta) return fromMeta;
        const roleCode = user?.role?.toLowerCase();
        if (roleCode?.includes("admin")) return "admin";
        if (roleCode?.includes("seller")) return "seller";
        return "user";
    })();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (mode === "edit" && !user?._id) {
            toast.error("Missing user id");
            return;
        }

        const formData = new FormData(event.currentTarget);
        const password = formData.get("password");
        if (!password) {
            formData.delete("password");
        }
        const confirmPassword = formData.get("confirmPassword");
        if (mode === "edit" || !confirmPassword) {
            formData.delete("confirmPassword");
        }
        const image = formData.get("image");
        if (image instanceof File && image.size === 0) {
            formData.delete("image");
        }
        startTransition(async () => {
            const action = mode === "create"
                ? createAdminUserAction(formData)
                : updateAdminUserAction(user?._id || "", formData);

            const result = await action;
            if (!result?.success) {
                toast.error(result?.message || "Unable to save user");
                return;
            }
            toast.success(mode === "create" ? "User created" : "User updated");
            router.push("/admin/users");
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" name="fullName" required defaultValue={user?.fullName} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required defaultValue={user?.email} placeholder="jane@bazar.app" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone number</Label>
                    <Input id="phoneNumber" name="phoneNumber" required defaultValue={user?.phoneNumber} placeholder="9800000000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" required defaultValue={user?.username} placeholder="janed" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password {mode === "edit" && <span className="text-xs text-neutral-500">(leave blank to keep current)</span>}</Label>
                    <Input id="password" name="password" type="password" placeholder="••••••••" />
                </div>
                {mode === "create" && (
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat password" required />
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                        id="role"
                        name="role"
                        defaultValue={normalizedRole}
                        className="w-full rounded-xl border border-white/20 bg-white/60 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="image">Profile image</Label>
                    <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                                setPreview(null);
                                return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => setPreview(reader.result as string);
                            reader.readAsDataURL(file);
                        }}
                    />
                    {preview && (
                        <img src={preview} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover border border-dashed border-white/30" />
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">
                    All submissions go through secure Multer upload.
                </p>
                <Button type="submit" disabled={isPending} className="px-6 py-2 rounded-full bg-white text-black">
                    {isPending ? "Saving..." : mode === "create" ? "Create user" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
