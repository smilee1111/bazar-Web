"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Users, Filter, Download, RefreshCw, User } from "lucide-react";
import { toast } from "react-toastify";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getAllUsers, deleteUser } from "@/lib/api/admin/admin";
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
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		fetchUsers();
	}, []);

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

	const fetchUsers = async () => {
		try {
			setRefreshing(true);
			const response = await getAllUsers();
			const data = Array.isArray(response?.data) ? response.data : response?.data?.data;
			setUsers(Array.isArray(data) ? data : []);
			setError(null);
		} catch (err: any) {
			setError(err?.message || "Failed to load users");
			setUsers([]);
		} finally {
			setLoading(false);
			setRefreshing(false);
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

	const stats = useMemo(() => {
		const total = users.length;
		const active = users.filter(u => {
			const role = typeof u.roleId === "object" ? u.roleId : null;
			return role?.status !== "inactive";
		}).length;
		const sellers = users.filter(u => formatRole(u).toLowerCase().includes("seller")).length;
		const admins = users.filter(u => formatRole(u).toLowerCase().includes("admin")).length;

		return { total, active, sellers, admins };
	}, [users, formatRole]);

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
			await deleteUser(id);
			setUsers((prev) => prev.filter((u) => u._id !== id));
			toast.success("User deleted");
		} catch (err: any) {
			toast.error(err?.message || "Failed to delete user");
		}
	};

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-4 animate-fade-up">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin Panel</p>
						<h1 className="text-4xl font-bold text-white">User Management</h1>
						<p className="text-white/75 text-lg mt-2">Manage platform users and their roles</p>
					</div>
					<Button
						onClick={fetchUsers}
						disabled={refreshing}
						variant="outline"
						className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
				<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group p-6">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
						<CardTitle className="text-base font-semibold text-[#4a4a4a]">Total Users</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8f7e4f]/15 group-hover:bg-[#8f7e4f]/25 transition-colors">
							<Users className="h-5 w-5 text-[#8f7e4f]" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-3xl font-bold text-[#1a1a1a] mb-2">{stats.total}</div>
						<p className="text-sm text-[#6a5c38]">Registered users</p>
					</CardContent>
				</Card>

				<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group p-6">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
						<CardTitle className="text-base font-semibold text-[#4a4a4a]">Active Users</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
							<User className="h-5 w-5 text-green-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-3xl font-bold text-[#1a1a1a] mb-2">{stats.active}</div>
						<p className="text-sm text-[#6a5c38]">Currently active</p>
					</CardContent>
				</Card>

				<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group p-6">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
						<CardTitle className="text-base font-semibold text-[#4a4a4a]">Sellers</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
							<User className="h-5 w-5 text-blue-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-3xl font-bold text-[#1a1a1a] mb-2">{stats.sellers}</div>
						<p className="text-sm text-[#6a5c38]">Seller accounts</p>
					</CardContent>
				</Card>

				<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group p-6">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
						<CardTitle className="text-base font-semibold text-[#4a4a4a]">Admins</CardTitle>
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
							<User className="h-5 w-5 text-purple-600" />
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="text-3xl font-bold text-[#1a1a1a] mb-2">{stats.admins}</div>
						<p className="text-sm text-[#6a5c38]">Admin accounts</p>
					</CardContent>
				</Card>
			</div>

			{/* Users List Card */}
			<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
				<CardHeader className="space-y-4">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8f7e4f] to-[#7a6b45] shadow-lg">
								<Users className="h-6 w-6 text-white" />
							</div>
							<div>
								<CardTitle className="text-xl text-[#1a1a1a]">All Users</CardTitle>
								<p className="text-sm text-[#4a4a4a]">Manage and monitor user accounts</p>
							</div>
						</div>

						<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:w-auto">
							<div className="relative w-full sm:w-80 animate-fade-up" style={{ animationDelay: '0.2s' }}>
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7e4f]" />
								<Input
									placeholder="Search users by name, email, or username..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-10 pr-4 border-[#8f7e4f]/30 focus:border-[#8f7e4f] focus:ring-2 focus:ring-[#8f7e4f]/20 transition-all"
								/>
							</div>

							<div className="flex gap-2">
								<Button
									variant="outline"
									className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
								>
									<Filter className="h-4 w-4 mr-2" />
									Filter
								</Button>

								<Button
									variant="outline"
									className="border-[#8f7e4f]/40 text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
								>
									<Download className="h-4 w-4 mr-2" />
									Export
								</Button>

								<Link href="/admin/users/create">
									<Button className="gap-2 bg-gradient-to-r from-[#8f7e4f] to-[#7a6b45] text-white hover:from-[#7a6b45] hover:to-[#6b5d3c] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
										<UserPlus className="h-4 w-4" />
										Add User
									</Button>
								</Link>
							</div>
						</div>
					</div>

					{search && (
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="bg-[#8f7e4f]/10 text-[#7a6b45]">
								<Search className="h-3 w-3 mr-1" />
								Searching: "{search}"
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setSearch("")}
								className="h-6 px-2 text-xs text-[#6a5c38] hover:text-[#1a1a1a]"
							>
								Clear
							</Button>
						</div>
					)}
				</CardHeader>

				<CardContent className="p-0">
					<UsersTable
						users={filteredUsers}
						loading={loading}
						error={error}
						formatRole={formatRole}
						onDelete={handleDelete}
						rolesLoading={rolesLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);

	useEffect(() => {
		fetchUsers();
	}, []);

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

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-3 animate-fade-up">
				<p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin</p>
				<h1 className="text-4xl font-bold text-white">Users</h1>
				<p className="text-white/75 text-lg">Manage platform users and their roles.</p>
			</div>

			<Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
				<CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8f7e4f]/15 hover:bg-[#8f7e4f]/25 transition-colors">
							<Users className="h-5 w-5 text-[#8f7e4f]" />
						</span>
						<CardTitle className="text-xl text-[#1a1a1a]">All Users</CardTitle>
					</div>
					<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
						<div className="relative w-full sm:w-72 animate-fade-up" style={{ animationDelay: '0.2s' }}>
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7e4f]" />
							<Input
								placeholder="Search users"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10 pr-4 border-[#8f7e4f]/30 focus:border-[#8f7e4f] focus:ring-2 focus:ring-[#8f7e4f]/20 transition-all"
							/>
						</div>
						<Link href="/admin/users/create">
							<Button className="gap-2 bg-[#8f7e4f] text-white hover:bg-[#7a6b45] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
								<UserPlus className="h-4 w-4" />
								Add User
							</Button>
						</Link>
					</div>
				</CardHeader>
				<Separator className="bg-[#efefef]" />
				<CardContent className="p-0">
					<UsersTable
						users={filteredUsers}
						loading={loading}
						error={error}
						formatRole={formatRole}
						onDelete={handleDelete}
						rolesLoading={rolesLoading}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
