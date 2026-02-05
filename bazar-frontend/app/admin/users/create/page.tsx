"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import UserForm, { UserFormValues } from "../_components/UserForm";
import { register } from "@/lib/api/admin/admin";
import { fetchRoles } from "@/lib/api/roles";
import type { RoleOption } from "@/components/auth/RoleSelect";

export default function CreateUserPage() {
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

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

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      console.log(values instanceof FormData);
      await register(values);
      toast.success("User created");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin</p>
        <h1 className="text-3xl font-bold text-white">Create User</h1>
        <p className="text-white/75">Add a new platform user.</p>
      </div>
      <UserForm
        mode="create"
        roles={roles}
        rolesLoading={rolesLoading}
        onSubmit={handleSubmit}
        ctaLabel={submitting ? "Saving..." : "Create user"}
      />
    </div>
  );
}
