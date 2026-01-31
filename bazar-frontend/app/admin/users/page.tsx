import Link from "next/link";
import { fetchAdminUsersAction } from "@/lib/actions/admin-user-action";
import UserTable from "./_components/UserTable";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/api/users";

export default async function AdminUsersPage() {
	const result = await fetchAdminUsersAction();
	if (!result.success) {
		throw new Error(result.message || "Failed to load admin users");
	}

	const users: AdminUser[] = result.data || [];
	const normalizeRole = (user: AdminUser) => {
		const meta = user.roleMeta?.name;
		if (meta) return meta.toLowerCase();
		const code = user.role?.toLowerCase();
		if (code?.includes("admin")) return "admin";
		if (code?.includes("seller")) return "seller";
		return "user";
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] py-12 px-6">
			<div className="max-w-7xl mx-auto space-y-10">
				<header className="flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
					<div>
						<p className="uppercase tracking-[0.4em] text-xs text-white/50">Control center</p>
						<h1 className="text-4xl font-semibold">Admin user board</h1>
						<p className="text-white/70 mt-2 max-w-2xl">
							Create, inspect, and evolve every identity in your ecosystem with a single view.
						</p>
					</div>
					<Link href="/admin/users/create">
						<Button className="rounded-full bg-white text-black px-6 py-2 shadow-lg shadow-white/20">
							+ Invite teammate
						</Button>
					</Link>
				</header>

				<section className="grid gap-5 md:grid-cols-3">
					{[{
						title: "Total accounts",
						value: users.length.toString().padStart(2, "0"),
						caption: "active members",
					},
					{
						title: "Admins",
						value: users
							.filter((u) => normalizeRole(u) === "admin")
							.length.toString()
							.padStart(2, "0"),
						caption: "with elevated control",
					},
					{
						title: "Sellers",
						value: users
							.filter((u) => normalizeRole(u) === "seller")
							.length.toString()
							.padStart(2, "0"),
						caption: "merchant accounts",
					}].map((item) => (
						<div key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-6 text-white/80 shadow-[0_20px_50px_rgba(2,6,23,0.45)]">
							<p className="text-xs uppercase tracking-[0.4em] text-white/50">{item.title}</p>
							<p className="text-4xl font-semibold mt-3 text-white">{item.value}</p>
							<p className="text-sm text-white/60 mt-1">{item.caption}</p>
						</div>
					))}
				</section>

				<UserTable users={users} />
			</div>
		</div>
	);
}
