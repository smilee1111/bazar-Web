"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const RequestPasswordResetSchema = z.object({
    email: z.email()
});

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export default function Page() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestPasswordResetDTO>({
        resolver: zodResolver(RequestPasswordResetSchema)
    });

    const onSubmit = async (data: RequestPasswordResetDTO) => {
        try{
            const response = await requestPasswordReset(data.email);
            if (response.success) {
                toast.success('Password reset link sent to your email.');
            }else{
                toast.error(response.message || 'Failed to request password reset.');
            }
        }catch(error){
            toast.error((error as Error).message || 'Failed to request password reset.');
        }
    }

    return (
        <div className="relative w-full min-h-screen bg-neutral-50 flex">
            {/* Left Panel */}
            <section className="relative w-full lg:w-[57%] min-h-screen bg-gradient-to-br from-[#8f7e4f] via-[#7a6b45] to-[#6b5d3c] overflow-hidden">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/auth-background.svg')" }}
                />

                <div className="relative z-10 flex min-h-screen flex-col w-full max-w-[520px] px-4 lg:px-[60px] pt-[23px] pb-12">
                    <header className="flex items-center gap-3">
                        <div className="flex w-12 h-12 items-center justify-center bg-white/20 rounded-2xl border-[1.2px] border-white/30">
                            <img
                                className="w-8 h-8 object-contain"
                                alt="Bazar logo"
                                src="/images/logo.svg"
                            />
                        </div>
                        <h1 className="font-normal text-white text-[32px] tracking-[-0.32px] leading-[41.6px]">
                            Bazar
                        </h1>
                    </header>

                    <div className="mt-12 flex flex-col gap-10 animate-fade-up">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Reset Password</p>
                            <h2 className="font-semibold text-white text-3xl lg:text-[40px] tracking-[-0.6px] leading-snug">
                                Forgot Your Password?
                            </h2>

                            <p className="font-normal text-white text-base lg:text-lg leading-relaxed text-white/90">
                                No worries! Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Panel */}
            <section className="relative w-[43%] flex items-start justify-center pt-[23px] px-8 bg-white">
                <div className="w-full max-w-[576px]">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 mb-12 h-auto p-0 hover:bg-transparent text-[#4a4a4a] hover:text-[#8f7e4f] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-normal text-base">
                                Back to Login
                            </span>
                        </Button>
                    </Link>

                    <Card className="w-full bg-white rounded-3xl border-[1.2px] border-[#efefef] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] hover:shadow-[0px_8px_25px_-5px_#0000001a] transition-shadow duration-300">
                        <CardContent className="p-8 lg:p-[49.2px]">
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3 animate-fade-up">
                                    <h2 className="font-light text-[#1a1a1a] text-3xl lg:text-4xl tracking-[-0.72px] leading-tight lg:leading-[48px]">
                                        Reset Password
                                    </h2>
                                    <p className="font-normal text-[#4a4a4a] text-sm md:text-base leading-relaxed">
                                        Enter your email to receive a reset link
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="email" className="font-normal text-[#524632] text-sm md:text-base">
                                            Email<span className="text-[#8f7e4f]">*</span>
                                        </Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a191980] group-focus-within:text-[#8f7e4f] transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...register("email")}
                                                className="h-11 md:h-12 pl-12 pr-4 rounded-[10px] border-[1.2px] font-normal text-sm md:text-base placeholder:text-[#1a191980] focus:border-[#8f7e4f] focus:ring-2 focus:ring-[#8f7e4f]/20 transition-all"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-red-600 animate-fade-in">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 md:h-14 bg-[#8f7e4f] hover:bg-[#7a6b45] text-white rounded-full shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-sm md:text-base disabled:opacity-60 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                                    >
                                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                                    </Button>
                                </form>

                                <p className="text-center font-normal text-[#4a4a4a] text-sm md:text-base">
                                    Remember your password? {" "}
                                    <Link href="/login" className="text-[#8f7e4f] hover:underline hover:text-[#7a6b45] transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}