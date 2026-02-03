"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

import UserForm, { UserFormValues } from "../../_components/UserForm";
import { getUserById, updateUser } from "@/lib/api/admin/admin";
import { fetchRoles } from "@/lib/api/roles";
import type { RoleOption } from "@/components/auth/RoleSelect";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const userId = params?.id;
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<UserFormValues | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const response = await getUserById(userId);
        const data = response?.data || response?.data?.data || response;
        setInitialValues({
          fullName: data?.fullName || "",
          email: data?.email || "",
          username: data?.username || "",
          phoneNumber: data?.phoneNumber || "",
          role: typeof data?.roleId === "object" ? data?.roleId?.roleName : data?.roleId || "",
        });
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

  const handleSubmit = async (values: UserFormValues) => {
    if (!userId) return;
    const payload = { ...values } as any;
    if (!values.password) {
      delete payload.password;
    }
    try {
      await updateUser(userId, payload);
      toast.success("User updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user");
      throw err;
    }
  };

  if (loading || !initialValues) {
    return <div className="text-white/80">Loading user...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Admin</p>
        <h1 className="text-3xl font-bold text-white">Edit User</h1>
        <p className="text-white/75">Update user details.</p>
      </div>
      <UserForm
        mode="edit"
        defaultValues={initialValues}
        roles={roles}
        rolesLoading={rolesLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
