"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserById } from "@/lib/api/admin/admin";
import { normalizeRole } from "@/lib/utils";
import { fetchRoles } from "@/lib/api/roles";
import type { RoleOption } from "@/components/auth/RoleSelect";
import { toast } from "react-toastify";

export default function ViewUserPage() {
  const params = useParams<{ id: string }>();
  const userId = params?.id;
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const response = await getUserById(userId);
        const data = response?.data || response?.data?.data || response;
        setUser(data);
      } catch (err: any) {
        toast.error(err?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

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

  if (loading) return <div className="text-white/80">Loading user...</div>;
  if (!user) return <div className="text-white/80">User not found</div>;

  const roleValue = typeof user.roleId === "object" ? user.roleId?.roleName || user.roleId?.roleId : user.roleId;
  const roleLabel = roles.find((r) => r.value === roleValue)?.label || normalizeRole(roleValue) || "unknown";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin</p>
        <h1 className="text-3xl font-bold text-white">User Details</h1>
        <p className="text-white/75">View full profile information.</p>
      </div>

      <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#1a1a1a]">{user.fullName || "Unnamed"}</CardTitle>
        </CardHeader>
        <Separator className="bg-[#efefef]" />
        <CardContent className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <Info label="Full Name" value={user.fullName} />
          <Info label="Email" value={user.email} />
          <Info label="Username" value={user.username} />
          <Info label="Phone" value={user.phoneNumber} />
          <Info label="Role" value={roleLabel} />
          <Info label="Status" value={user.roleId?.status || "-"} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.18em] text-[#7a6b45]">{label}</p>
      <p className="rounded-lg border border-[#f0f0f0] bg-white px-3 py-2 text-sm text-[#1a1a1a]">
        {value || "-"}
      </p>
    </div>
  );
}
