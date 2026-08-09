"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone, User } from "lucide-react";
import { RegisterData, registerSchema } from "../schema";
import { handleLogin, handleRegister } from "@/lib/actions/auth-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { getRolesAction } from "@/lib/actions/role-action";
import { useAuth } from "../../providers/AuthContext";
import { getRoleHomePath } from "@/lib/utils";

const formFields = [
    {
        id: "fullName",
        label: "Full Name",
        placeholder: "John Doe",
        icon: User,
        type: "text" as const,
        autoComplete: "name",
    },
    {
        id: "email",
        label: "Email",
        placeholder: "your.email@example.com",
        icon: Mail,
        type: "email" as const,
        autoComplete: "email",
    },
    {
        id: "phoneNumber",
        label: "Phone Number",
        placeholder: "+1 (555) 000-0000",
        icon: Phone,
        type: "tel" as const,
        autoComplete: "tel",
    },
    {
        id: "username",
        label: "Username",
        placeholder: "johndoe123",
        icon: User,
        type: "text" as const,
        autoComplete: "username",
    },
    {
        id: "password",
        label: "Password",
        placeholder: "Create a password",
        icon: Lock,
        type: "password" as const,
        autoComplete: "new-password",
    },
    {
        id: "confirmPassword",
        label: "Confirm Password",
        placeholder: "Re-enter your password",
        icon: Lock,
        type: "password" as const,
        autoComplete: "new-password",
    },
];

export default function RegisterForm() {
    const router = useRouter();
    const { checkAuth } = useAuth();
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });

    const [pending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const onSubmit = async (values: RegisterData) => {
        if (!acceptTerms) {
            setServerError("Please review and accept the terms to continue.");
            return;
        }

        setServerError(null);
        try {
            const result = await handleRegister(values);
            if (!result.success) {
                throw new Error(result.message);
            }

            const loginResult = await handleLogin({ email: values.email, password: values.password });
            if (loginResult.success) {
                const destination = getRoleHomePath(loginResult.data?.role ?? loginResult.data?.roleId);
                await checkAuth();
                startTransition(async () => {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    router.push(destination);
                });
                return;
            }

            router.push("/login");
        } catch (error: any) {
            setServerError(error.message || "Registration failed");
        }
    };

    const isBusy = isSubmitting || pending;

    return (
        <Card className="w-full bg-white rounded-3xl border-[1.2px] border-[#efefef] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a] hover:shadow-[0px_8px_25px_-5px_#0000001a] transition-shadow duration-300">
            <CardContent className="p-8 md:p-[42px]">
                <div className="flex flex-col gap-3 animate-fade-up">
                    <h2 className="font-light text-[#142A1C] text-3xl md:text-4xl tracking-[-0.72px] leading-tight md:leading-[48px]">
                        Create Account
                    </h2>
                    <p className="font-normal text-[#1B4A31] text-sm md:text-base leading-relaxed">
                        Join HaatKhoj to discover local shops
                    </p>
                </div>

                {serverError && (
                    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
                        {serverError}
                    </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {formFields.map((field) => {
                            const IconComponent = field.icon;
                            const fieldError = errors[field.id as keyof RegisterData];
                            return (
                                <div key={field.id} className="flex flex-col gap-1.5">
                                    <Label htmlFor={field.id} className="font-normal text-[#1C5C39] text-sm md:text-base">
                                        {field.label}
                                        <span className="text-[#267A4C] ml-1">*</span>
                                    </Label>
                                    <div className="relative group">
                                        <IconComponent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a191980] group-focus-within:text-[#267A4C] transition-colors" />
                                        <Input
                                            id={field.id}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            autoComplete={field.autoComplete}
                                            {...register(field.id as keyof RegisterData)}
                                            className="h-11 md:h-12 pl-12 pr-4 rounded-[10px] border-[1.2px] font-normal text-sm md:text-base placeholder:text-[#1a191980] focus:border-[#267A4C] focus:ring-2 focus:ring-[#267A4C]/20 transition-all"
                                        />
                                    </div>
                                    {fieldError?.message && (
                                        <p className="text-xs text-red-600 animate-fade-in">{String(fieldError.message)}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-[#E9F6EE] bg-[#F7FCF9] px-4 py-3 hover:bg-[#F7FCF9] transition-colors">
                        <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                            className="mt-1 w-[17px] h-[17px] border-[#267A4C] data-[state=checked]:bg-[#267A4C] data-[state=checked]:border-[#267A4C] hover:border-[#1C5C39] transition-colors"
                        />
                        <Label htmlFor="terms" className="font-normal text-black text-sm md:text-base leading-relaxed">
                            I agree to the {" "}
                            <a href="#" className="text-[#267A4C] underline hover:text-[#1C5C39] transition-colors">
                                Terms of Service
                            </a>{" "}
                            and {" "}
                            <a href="#" className="text-[#267A4C] underline hover:text-[#1C5C39] transition-colors">
                                Privacy Policy
                            </a>
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isBusy || !acceptTerms}
                        className="w-full h-12 md:h-14 bg-[#267A4C] hover:bg-[#1C5C39] text-white rounded-full shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-sm md:text-base disabled:opacity-60 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    >
                        {isBusy ? "Creating account..." : "Create Account"}
                    </Button>
                </form>

                <div className="relative mt-8">
                    <Separator className="bg-[#efefef]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                        <span className="font-normal text-[#1B4A31] text-sm md:text-base">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    className="w-full h-12 md:h-[52px] mt-8 bg-white rounded-full border-[1.2px] border-[#efefef] shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-[#1a1a1a] text-sm md:text-base hover:bg-neutral-50 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M18.1713 8.36788H17.5001V8.33329H10.0001V11.6666H14.7096C14.0225 13.6069 12.1763 15 10.0001 15C7.23882 15 5.00007 12.7612 5.00007 9.99996C5.00007 7.23871 7.23882 4.99996 10.0001 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1859 2.52204 12.1951 1.66663 10.0001 1.66663C5.39799 1.66663 1.66675 5.39788 1.66675 9.99996C1.66675 14.602 5.39799 18.3333 10.0001 18.3333C14.6022 18.3333 18.3334 14.602 18.3334 9.99996C18.3334 9.44121 18.2759 8.89579 18.1713 8.36788Z"
                            fill="#FFC107"
                        />
                        <path
                            d="M2.62756 6.12121L5.36548 8.12913C6.10631 6.29496 7.90048 5 10.0001 5C11.2746 5 12.4342 5.48083 13.3171 6.26625L15.6742 3.90917C14.1859 2.52208 12.1951 1.66667 10.0001 1.66667C6.79923 1.66667 4.02339 3.47371 2.62756 6.12121Z"
                            fill="#FF3D00"
                        />
                        <path
                            d="M10.0001 18.3333C12.1526 18.3333 14.1092 17.5095 15.5876 16.17L13.0084 13.9875C12.1434 14.6452 11.0801 15.0008 10.0001 15C7.83259 15 5.99176 13.6179 5.29843 11.6891L2.58093 13.7829C3.96009 16.4816 6.76176 18.3333 10.0001 18.3333Z"
                            fill="#4CAF50"
                        />
                        <path
                            d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3355 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89587 18.1713 8.36796Z"
                            fill="#1976D2"
                        />
                    </svg>
                    Sign up with Google
                </Button>

                <p className="text-center font-normal text-[#1B4A31] text-sm md:text-base mt-8">
                    Already have an account? {" "}
                    <Link href="/login" className="text-[#267A4C] hover:underline hover:text-[#1C5C39] transition-colors">
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
