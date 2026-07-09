"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, RefreshCw } from "lucide-react";

export const ResetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({
    token,
}: {
    token: string;
}) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordDTO>({
        resolver: zodResolver(ResetPasswordSchema)
    });
    const router = useRouter();

    const onSubmit = async (data: ResetPasswordDTO) => {
        try {
            const response = await handleResetPassword(token, data.password, data.confirmPassword);
            if (response.success) {
                toast.success("Password reset successfully");
                // Redirect to login page
                router.replace('/login');
            } else {
                toast.error(response.message || "Failed to reset password");
            }
        } catch (error) {
            // Handle error
            toast.error("An unexpected error occurred");
        }
    }

    return (
        <Card className="w-full bg-white rounded-3xl border-[1.2px] border-[#efefef] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] hover:shadow-[0px_8px_25px_-5px_#0000001a] transition-shadow duration-300">
            <CardContent className="p-8 lg:p-[49.2px]">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3 animate-fade-up">
                        <h2 className="font-light text-[#2D2318] text-3xl lg:text-4xl tracking-[-0.72px] leading-tight lg:leading-[48px]">
                            New Password
                        </h2>
                        <p className="font-normal text-[#5B3E2E] text-sm md:text-base leading-relaxed">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password" className="font-normal text-[#524632] text-sm md:text-base">
                                New Password<span className="text-[#8B6F47]">*</span>
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a191980] group-focus-within:text-[#8B6F47] transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter new password"
                                    {...register("password")}
                                    className="h-11 md:h-12 pl-12 pr-4 rounded-[10px] border-[1.2px] font-normal text-sm md:text-base placeholder:text-[#1a191980] focus:border-[#8B6F47] focus:ring-2 focus:ring-[#8B6F47]/20 transition-all"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600 animate-fade-in">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword" className="font-normal text-[#524632] text-sm md:text-base">
                                Confirm Password<span className="text-[#8B6F47]">*</span>
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a191980] group-focus-within:text-[#8B6F47] transition-colors" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    {...register("confirmPassword")}
                                    className="h-11 md:h-12 pl-12 pr-4 rounded-[10px] border-[1.2px] font-normal text-sm md:text-base placeholder:text-[#1a191980] focus:border-[#8B6F47] focus:ring-2 focus:ring-[#8B6F47]/20 transition-all"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-600 animate-fade-in">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 md:h-14 bg-[#8B6F47] hover:bg-[#7D5A3F] text-white rounded-full shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-sm md:text-base disabled:opacity-60 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>

                    <div className="flex flex-col gap-4 text-center">
                        <Link href="/login" className="flex items-center justify-center gap-2 text-[#8B6F47] hover:underline hover:text-[#7D5A3F] transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                        <Link href="/forget-password" className="text-[#8B6F47] hover:underline hover:text-[#7D5A3F] transition-colors text-sm">
                            Request another reset email
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}