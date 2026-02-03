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

const baseSchema = {
  fullName: z.string().min(2, "Full name is required"),
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional(),
  role: z.string().min(1, "Role is required"),
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
}

export default function UserForm({ defaultValues, mode, onSubmit, ctaLabel, roles, rolesLoading }: UserFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setSubmitting(true);
      await onSubmit(values);
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
      <CardContent className="space-y-5 p-6">
        <form className="space-y-4" onSubmit={rhfSubmit(handleSubmit)}>
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
