"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSelect, RoleOption } from "@/components/auth/RoleSelect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_CONFIG } from "@/lib/api/config";
import { Camera, Upload } from "lucide-react";

const baseSchema = {
  fullName: z.string().min(2, "Full name is required"),
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  profilePic: z.instanceof(File).optional(),
};

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string().min(6, "Min 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

const updateSchema = z.object({
  ...baseSchema,
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (!data.password && !data.confirmPassword) return true;
  return data.password === data.confirmPassword;
}, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type UserFormValues = z.infer<typeof updateSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  mode: "create" | "edit";
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  ctaLabel?: string;
  roles: RoleOption[];
  rolesLoading?: boolean;
  userId?: string;
}

export default function UserForm({ defaultValues, mode, onSubmit, ctaLabel, roles, rolesLoading, userId }: UserFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(mode === "create" ? createSchema : updateSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || "",
      username: defaultValues?.username || "",
      email: defaultValues?.email || "",
      phoneNumber: defaultValues?.phoneNumber || "",
      role: defaultValues?.role || "",
      password: "",
      confirmPassword: "",
    },
  });

  const roleValue = form.watch("role");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("profilePic", file, { shouldValidate: true, shouldDirty: true });
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setSubmitting(true);

      // If there's a profile picture file, use FormData
      if (values.profilePic) {
        const formData = new FormData();

        // Add all form values except profilePic (which is handled separately)
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'profilePic' && value !== undefined && value !== '') {
            formData.append(key, value as string);
          }
        });

        // Add the profile picture file
        formData.append('profilePic', values.profilePic);

        await onSubmit(formData as any);
      } else {
        // No profile picture, send as regular object
        const payload = { ...values };
        delete payload.profilePic; // Remove undefined profilePic
        await onSubmit(payload);
      }

      router.push("/admin/users");
    } catch (err: any) {
      form.setError("fullName", { message: err?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const { register, handleSubmit: rhfSubmit, formState: { errors } } = form;

  return (
    <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
      <CardContent className="space-y-6 p-8">
        <form className="space-y-6" onSubmit={rhfSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="Jane Doe" {...register("fullName")}
              className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]" />
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@example.com" {...register("email")}
              className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="username" {...register("username")}
              className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]" />
            {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone</Label>
            <Input id="phoneNumber" placeholder="Optional" {...register("phoneNumber")}
              className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]" />
            {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>}
          </div>

          {/* Profile Image Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-[#1a1a1a]">Profile Picture</Label>
            <div className="flex items-center gap-8">
              <div className="relative">
                <Avatar className="h-28 w-28">
                  <AvatarImage
                    src={previewImage || (userId && typeof defaultValues?.profilePic === 'string' ? API_CONFIG.getImageUrl(defaultValues.profilePic) || undefined : undefined)}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-[#8f7e4f] text-white text-xl font-semibold">
                    {(defaultValues?.fullName || defaultValues?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profilePic"
                  className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#8f7e4f] text-white hover:bg-[#7a6b45] cursor-pointer transition-colors shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="profilePic"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6a5c38] mb-2">
                  Upload a profile picture. Recommended size: 400x400px
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("profilePic")?.click()}
                    className="gap-2 border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f] hover:text-white"
                  >
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                  {previewImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPreviewImage(null);
                        form.setValue("profilePic", undefined);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <RoleSelect
            label="Role"
            required
            roles={roles}
            loading={rolesLoading}
            value={roleValue}
            onValueChange={(val) => form.setValue("role", val, { shouldValidate: true, shouldDirty: true })}
            error={errors.role?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="password">Password {mode === "edit" && <span className="text-xs text-[#8f7e4f]">(leave blank to keep)</span>}</Label>
            <Input id="password" type="password" placeholder="••••••" {...register("password")}
              className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]" />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••" {...register("confirmPassword")}
              className="border-[#e5e5e5] focus-visible:ring-[#8f7e4f]" />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={submitting}
              className="w-full bg-[#8f7e4f] text-white hover:bg-[#7a6b45] disabled:opacity-60">
              {submitting ? "Saving..." : ctaLabel || (mode === "create" ? "Create user" : "Save changes")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
