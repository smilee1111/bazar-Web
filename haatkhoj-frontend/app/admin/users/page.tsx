"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { handleGetAllUsers, handleDeleteUser } from "@/lib/actions/admin/user-action";
import { normalizeRole } from "@/lib/utils";
import UsersTable from "./_components/UsersTable";
import { fetchRoles } from "@/lib/api/roles";
import type { RoleOption } from "@/components/auth/RoleSelect";

export type AdminUser = {
    _id: string;
    fullName?: string;
    email?: string;
    username?: string;
    phoneNumber?: string;
    profilePic?: string;
    roleId?: { roleName?: string; roleId?: string; status?: string } | string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(6);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await handleGetAllUsers(String(page), String(size), search || undefined);
                const data = Array.isArray(response?.data) ? response.data : response?.data?.data;
                setUsers(Array.isArray(data) ? data : []);
                // handle pagination if returned from action
                if (response?.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                } else if (response?.data?.pagination) {
                    setTotalPages(response.data.pagination?.totalPages || 1);
                }
                setError(null);
            } catch (err: any) {
                setError(err?.message || "Failed to load users");
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page, size, search]);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                setRolesLoading(true);
                const res = await fetchRoles();
                const data = res?.data?.data || res?.data;
                const mapped: RoleOption[] = Array.isArray(data)
                    ? data.map((r) => ({ id: r._id, value: r.roleName, label: r.roleName }))
                    : [];
                setRoles(mapped);
            } catch (err: any) {
                toast.error(err?.message || "Failed to load roles");
            } finally {
                setRolesLoading(false);
            }
        };
        loadRoles();
    }, []);

    // filteredUsers is same as users because server-side pagination used
    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return users;
        return users.filter((user) => {
            const name = (user.fullName || "").toLowerCase();
            const email = (user.email || "").toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [search, users]);

    const handleDelete = async (id: string) => {
        try {
            const res = await handleDeleteUser(id);
            if (res?.success) {
                setUsers((prev) => prev.filter((u) => u._id !== id));
                toast.success("User deleted");
            } else {
                throw new Error(res?.message || "Failed to delete user");
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete user");
        }
    };

    const roleMap = useMemo(() => {
        const map = new Map<string, string>();
        roles.forEach((r) => map.set(r.value, r.label));
        return map;
    }, [roles]);

    const formatRole = (user: AdminUser) => {
        const raw = typeof user.roleId === "object" ? user.roleId?.roleName || user.roleId?.roleId : user.roleId;
        if (raw && roleMap.has(raw)) return roleMap.get(raw)!;
        return normalizeRole(raw) || "unknown";
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Admin</p>
                <h1 className="text-4xl font-bold text-[#142A1C]">Users</h1>
                <p className="text-gray-500 text-lg">Manage platform users and their roles.</p>
            </div>

            <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#267A4C]/15">
                            <Users className="h-5 w-5 text-[#267A4C]" />
                        </span>
                        <CardTitle className="text-xl text-[#142A1C]">All Users</CardTitle>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#267A4C]" />
                            <Input
                                placeholder="Search users"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-10 pr-4"
                            />
                        </div>
                        <Link href="/admin/users/create">
                            <Button className="gap-2 bg-[#267A4C] text-white hover:bg-[#1C5C39]">
                                <UserPlus className="h-4 w-4" />
                                Add User
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <Separator className="bg-[#DCF0E2]" />
                <CardContent className="p-0">
                    <UsersTable
                        users={filteredUsers}
                        loading={loading}
                        error={error}
                        formatRole={formatRole}
                        onDelete={handleDelete}
                        rolesLoading={rolesLoading}
                        pagination={{ page, size, totalPages }}
                        searchQuery={search}
                        // handle page change locally
                        onPageChange={(p: number) => setPage(p)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}