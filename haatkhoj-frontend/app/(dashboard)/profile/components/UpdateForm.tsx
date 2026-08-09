"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "react-toastify";
import { Controller, useForm } from "react-hook-form";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { useRef, useState } from "react";
import { User, Upload, X, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_CONFIG } from "@/lib/api/config";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const updateSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    username: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z
        .string()
        .refine((val) => /^\d{10}$/.test(val), {
            message: "Phone number must be exactly 10 digits",
        }),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
});

type UpdateData = z.infer<typeof updateSchema>;

export default function UpdateForm({ user }: { user: any }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch } = useForm<UpdateData>({
        resolver: zodResolver(updateSchema),
        defaultValues: {
            fullName: user.fullName || "",
            username: user.username || "",
            email: user?.email || '',
            phoneNumber: user?.phoneNumber || '',
        }
    });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const watchedImage = watch("image");

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: UpdateData) => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("username", data.username);
            formData.append('email', data.email);
            formData.append('phoneNumber', data.phoneNumber);
            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await handleUpdateProfile(formData);
            if (!response.success) {
                throw new Error(response.message || 'Update profile failed');
            }

            if (response.data?.profilePic) {
                setPreviewImage(API_CONFIG.getImageUrl(response.data.profilePic));
            } else {
                handleDismissImage();
            }
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Profile update failed');
            setError(error.message || 'Profile update failed');
        }
    };

    return (
        <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#267A4C] to-[#1C5C39] shadow-lg">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl text-[#142A1C]">Update Profile</CardTitle>
                        <CardDescription className="text-[#1B4A31]">
                            Keep your profile information up to date
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <Separator className="bg-[#efefef]" />

            <CardContent className="pt-6">
                <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Profile Image Section */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold text-[#1a1a1a]">Profile Picture</Label>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                            <div className="relative">
                                <Avatar className="h-32 w-32 ring-4 ring-[#267A4C]/20 shadow-lg">
                                    <AvatarImage
                                        src={previewImage || API_CONFIG.getImageUrl(user?.profilePic) || undefined}
                                        alt={user.fullName || "Profile"}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-[#267A4C] to-[#1C5C39] text-white text-2xl font-semibold">
                                        {(user.fullName || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                {(previewImage || user?.profilePic) && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                        onClick={() => handleDismissImage()}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex-1 space-y-3">
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field: { onChange } }) => (
                                        <div className="space-y-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="border-[#267A4C]/40 text-[#267A4C] hover:bg-[#267A4C]/10 hover:border-[#1C5C39] transition-all duration-300"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Choose Image
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                                accept=".jpg,.jpeg,.png,.webp"
                                                className="hidden"
                                            />
                                            <p className="text-xs text-[#1C5C39]">
                                                JPG, PNG or WebP. Max size 5MB.
                                            </p>
                                        </div>
                                    )}
                                />
                                {errors.image && (
                                    <p className="text-sm text-red-600 font-medium">{errors.image.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-[#efefef]" />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-semibold text-[#1a1a1a]">
                                Full Name *
                            </Label>
                            <Input
                                id="fullName"
                                type="text"
                                {...register("fullName")}
                                className="border-[#267A4C]/30 focus:border-[#267A4C] focus:ring-2 focus:ring-[#267A4C]/20 transition-all"
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-600 font-medium">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-semibold text-[#1a1a1a]">
                                Username *
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                {...register("username")}
                                className="border-[#267A4C]/30 focus:border-[#267A4C] focus:ring-2 focus:ring-[#267A4C]/20 transition-all"
                                placeholder="Enter your username"
                            />
                            {errors.username && (
                                <p className="text-sm text-red-600 font-medium">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-[#1a1a1a]">
                                Email Address *
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="border-[#267A4C]/30 focus:border-[#267A4C] focus:ring-2 focus:ring-[#267A4C]/20 transition-all"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber" className="text-sm font-semibold text-[#1a1a1a]">
                                Phone Number *
                            </Label>
                            <Input
                                id="phoneNumber"
                                type="text"
                                {...register("phoneNumber")}
                                className="border-[#267A4C]/30 focus:border-[#267A4C] focus:ring-2 focus:ring-[#267A4C]/20 transition-all"
                                placeholder="Enter 10-digit phone number"
                            />
                            {errors.phoneNumber && (
                                <p className="text-sm text-red-600 font-medium">{errors.phoneNumber.message}</p>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-[#efefef]" />

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-[#267A4C] to-[#1C5C39] text-white hover:from-[#1C5C39] hover:to-[#1B4A31] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Profile
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}