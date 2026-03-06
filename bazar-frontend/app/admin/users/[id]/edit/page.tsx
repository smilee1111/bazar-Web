"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

import UserForm, { UserFormValues } from "../../_components/UserForm";
import { handleGetOneUser,handleUpdateUser } from "@/lib/actions/admin/user-action";
import { fetchRoles } from "@/lib/api/roles";
import type { RoleOption } from "@/components/auth/RoleSelect";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
        const response = await handleGetOneUser(userId);
        const data = response?.data || response?.data?.data || response;
        setInitialValues({
          fullName: data?.fullName || "",
          email: data?.email || "",
          username: data?.username || "",
          phoneNumber: data?.phoneNumber || "",
          role: typeof data?.roleId === "object" ? data?.roleId?.roleName : data?.roleId || "",
          image: data?.profilePic || undefined,
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

  const handleSubmit = async (data: any) => {
    if (!userId) return;
    try {
      await handleUpdateUser(userId, data);
      toast.success("User updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user");
      throw err;
    }
  };

  if (loading || !initialValues) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-lg">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Admin Panel</p>
            <h1 className="text-4xl font-bold text-[#2D2318]">Edit User</h1>
            <p className="text-gray-500 text-lg">Update user information and profile settings.</p>
          </div>
          <Link href={`/admin/users/${userId}`}>
            <Button variant="outline" className="gap-2 border-gray-300 text-[#2D2318] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>

      <UserForm
        mode="edit"
        defaultValues={initialValues}
        roles={roles}
        rolesLoading={rolesLoading}
        onSubmit={handleSubmit}
        userId={userId}
      />
    </div>
  );
}
