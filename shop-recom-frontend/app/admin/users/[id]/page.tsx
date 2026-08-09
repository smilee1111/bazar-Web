"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {handleGetOneUser } from "@/lib/actions/admin/user-action";
import { normalizeRole } from "@/lib/utils";
import { fetchRoles } from "@/lib/api/roles";
import type { RoleOption } from "@/components/auth/RoleSelect";
import { toast } from "react-toastify";
import { ArrowLeft, Edit, Mail, Phone, User, Shield, Calendar } from "lucide-react";
import { API_CONFIG } from "@/lib/api/config";

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
        const response = await handleGetOneUser(userId);
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

  if (loading) return <div className="text-gray-500">Loading user...</div>;
  if (!user) return <div className="text-gray-500">User not found</div>;

  const roleValue = typeof user.roleId === "object" ? user.roleId?.roleName || user.roleId?.roleId : user.roleId;
  const roleLabel = roles.find((r) => r.value === roleValue)?.label || normalizeRole(roleValue) || "unknown";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Admin Panel</p>
            <h1 className="text-4xl font-bold text-[#142A1C]">User Profile</h1>
            <p className="text-gray-500 text-lg">View detailed user information and manage account settings.</p>
          </div>
          <Link href="/admin/users">
            <Button variant="outline" className="gap-2 border-gray-300 text-[#142A1C] hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#267A4C] to-[#1C5C39] shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Avatar className="h-18 w-18">
                <AvatarImage
                  src={API_CONFIG.getImageUrl(user?.profilePic) || undefined}
                  alt={user.fullName || "Profile"}
                />
                <AvatarFallback className="bg-[#267A4C] text-white text-xl font-semibold">
                  {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="text-xl text-[#142A1C]">Profile Overview</CardTitle>
              <CardDescription className="text-[#1B4A31]">
                Complete user account information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="bg-[#DCF0E2]" />
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#142A1C] flex items-center gap-3">
                <User className="h-6 w-6 text-[#267A4C]" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <InfoItem label="Full Name" value={user.fullName} />
                <InfoItem label="Email" value={user.email} icon={<Mail className="h-5 w-5" />} />
                <InfoItem label="Username" value={user.username} />
                <InfoItem label="Phone" value={user.phoneNumber} icon={<Phone className="h-5 w-5" />} />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#142A1C] flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#267A4C]" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1B4A31]">Role:</span>
                  <Badge variant="secondary" className="bg-[#267A4C]/10 text-[#1C5C39] capitalize">
                    {roleLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1B4A31]">Status:</span>
                  <Badge
                    variant={user.roleId?.status === "active" ? "default" : "secondary"}
                    className={user.roleId?.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }
                  >
                    {user.roleId?.status || "unknown"}
                  </Badge>
                </div>
                <InfoItem label="Created" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"} icon={<Calendar className="h-4 w-4" />} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link href={`/admin/users/${userId}/edit`}>
          <Button className="gap-2 bg-gradient-to-r from-[#267A4C] to-[#1C5C39] text-white hover:from-[#1C5C39] hover:to-[#1B4A31] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <Edit className="h-4 w-4" />
            Edit User
          </Button>
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-[#DCF0E2] bg-white/60 hover:bg-white/80 transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        {icon && <span className="text-[#267A4C]">{icon}</span>}
        <span className="text-sm font-semibold text-[#1B4A31]">{label}:</span>
      </div>
      <span className="text-base text-[#142A1C] font-medium">{value || "-"}</span>
    </div>
  );
}
