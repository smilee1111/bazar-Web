"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "@/lib/api/admin/admin";
import { normalizeRole } from "@/lib/utils";

type ApiUser = {
    _id: string;
    fullName?: string;
    email?: string;
    roleId?: { roleName?: string; roleId?: string; status?: string } | string;
};

export default function AdminUsersPage() {
	const [users, setUsers] = useState<ApiUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setLoading(true);
				const response = await getAllUsers();
				const data = Array.isArray(response?.data) ? response.data : response?.data?.data;
				setUsers(Array.isArray(data) ? data : []);
				setError(null);
			} catch (err: any) {
				setError(err?.message || "Failed to load users");
				setUsers([]);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return users;
		return users.filter((user) => {
			const name = (user.fullName || "").toLowerCase();
			const email = (user.email || "").toLowerCase();
			return name.includes(query) || email.includes(query);
		});
	}, [search, users]);

	const formatRole = (user: ApiUser) => {
		const roleValue = typeof user.roleId === "object" ? user.roleId?.roleName || user.roleId?.roleId : user.roleId;
		return normalizeRole(roleValue) || "unknown";
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-3">
				<p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin</p>
				<h1 className="text-4xl font-bold text-white">Users</h1>
				<p className="text-white/75 text-lg">Manage platform users and their roles.</p>
			</div>

			<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
				<CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15">
							<Users className="h-5 w-5 text-[#8f7e4f]" />
						</span>
						<CardTitle className="text-xl text-[#1a1a1a]">All Users</CardTitle>
					</div>
					<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
						<div className="relative w-full sm:w-72">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7e4f]" />
							<Input
								placeholder="Search users"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10 pr-4"
							/>
						</div>
						<Button className="gap-2 bg-[#8f7e4f] text-white hover:bg-[#7a6b45]">
							<UserPlus className="h-4 w-4" />
							Add User
						</Button>
					</div>
				</CardHeader>
				<Separator className="bg-[#efefef]" />
				<CardContent className="p-0">
					{loading ? (
						<div className="px-6 py-4 text-sm text-[#4a4a4a]">Loading users...</div>
					) : error ? (
						<div className="px-6 py-4 text-sm text-red-600">{error}</div>
					) : filteredUsers.length === 0 ? (
						<div className="px-6 py-4 text-sm text-[#4a4a4a]">No users found.</div>
					) : (
						<div className="divide-y divide-[#f1f1f1]">
							{filteredUsers.map((user) => (
								<div key={user._id} className="flex items-center justify-between px-6 py-4">
									<div className="space-y-1">
										<p className="text-base font-semibold text-[#1a1a1a]">{user.fullName || "Unnamed"}</p>
										<p className="text-sm text-[#4a4a4a]">{user.email || "No email"}</p>
									</div>
									<span className="rounded-full bg-[#8f7e4f]/12 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7a6b45]">
										{formatRole(user)}
									</span>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
