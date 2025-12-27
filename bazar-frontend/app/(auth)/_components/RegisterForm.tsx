"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { RegisterData, registerSchema } from "../schema";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LockIcon, MailIcon, UserIcon, PhoneIcon } from "lucide-react";

const formFields = [
    {
        id: "fullName",
        label: "Full Name",
        placeholder: "John Doe",
        icon: UserIcon,
        type: "text" as const,
        autoComplete: "name",
    },
    {
        id: "email",
        label: "Email",
        placeholder: "your.email@example.com",
        icon: MailIcon,
        type: "email" as const,
        autoComplete: "email",
    },
    {
        id: "phoneNumber",
        label: "Phone Number",
        placeholder: "+1 (555) 000-0000",
        icon: PhoneIcon,
        type: "tel" as const,
        autoComplete: "tel",
    },
    {
        id: "password",
        label: "Password",
        placeholder: "Create a password",
        icon: LockIcon,
        type: "password" as const,
        autoComplete: "new-password",
    },
    {
        id: "confirmPassword",
        label: "Confirm Password",
        placeholder: "Re-enter your password",
        icon: LockIcon,
        type: "password" as const,
        autoComplete: "new-password",
    },
];

export default function RegisterForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });

    const [pending, setTransition] = useTransition();

    const submit = async (values: RegisterData) => {
        setTransition(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push("/login");
        });
        console.log("register", values);
    };

    return (
        <div className="w-full max-w-[576px] mx-auto flex flex-col bg-white dark:bg-gray-900 rounded-3xl border-[1.2px] border-solid border-[#efefef] dark:border-gray-800 p-8 md:p-[49.2px]">
            <header className="flex flex-col gap-3">
                <h1 className="font-light text-[#1a1a1a] dark:text-white text-4xl md:text-5xl tracking-[-0.96px] leading-tight">
                    Create Account
                </h1>
                <p className="font-normal text-[#4a4a4a] dark:text-gray-400 text-base leading-[27.2px]">
                    Join Bazar to discover local shops
                </p>
            </header>

            <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6 mt-10">
                {formFields.map((field) => {
                    const IconComponent = field.icon;
                    const fieldError = errors[field.id as keyof RegisterData];
                    return (
                        <div key={field.id} className="flex flex-col gap-2">
                            <Label
                                htmlFor={field.id}
                                className="font-normal text-[#524632] dark:text-gray-300 text-base leading-6"
                            >
                                {field.label}
                                <span className="font-normal text-[#8f7e4f] text-base ml-0.5">
                                    *
                                </span>
                            </Label>
                            <div className="relative">
                                <IconComponent className="absolute left-4 top-[15px] w-5 h-5 text-[#1a191980] dark:text-gray-500" />
                                <Input
                                    id={field.id}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    autoComplete={field.autoComplete}
                                    {...register(field.id as keyof RegisterData)}
                                    className="h-[50px] pl-12 pr-4 py-3 rounded-[10px] border-[1.2px] font-normal text-base placeholder:text-[#1a191980] dark:placeholder:text-gray-500"
                                />
                            </div>
                            {fieldError?.message && (
                                <p className="text-xs text-red-600">{String(fieldError.message)}</p>
                            )}
                        </div>
                    );
                })}

                <div className="flex items-start gap-2 mt-2">
                    <p className="font-normal text-black dark:text-white text-base leading-[26px]">
                        I agree to the{" "}
                        <a
                            href="#"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="text-[#8f7e4f] underline hover:text-[#8f7e4f]/80"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="#"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="text-[#8f7e4f] underline hover:text-[#8f7e4f]/80"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting || pending}
                    className="h-14 bg-[#8f7e4f] hover:bg-[#8f7e4f]/90 rounded-full shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-white text-base mt-4 disabled:opacity-60"
                >
                    {isSubmitting || pending ? "Creating account..." : "Create Account"}
                </Button>
            </form>

            <div className="relative flex items-center justify-center mt-8">
                <Separator className="absolute w-full border-t-[1.2px] border-[#efefef] dark:border-gray-700" />
                <div className="relative bg-white dark:bg-gray-900 px-4">
                    <span className="font-normal text-[#4a4a4a] dark:text-gray-400 text-base leading-6">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                variant="outline"
                type="button"
                className="h-[58px] mt-8 bg-white dark:bg-gray-900 rounded-full border-[1.2px] border-[#efefef] dark:border-gray-700 shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-[#1a1a1a] dark:text-white text-base hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
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

            <footer className="flex items-center justify-center gap-2 mt-8">
                <p className="font-normal text-[#4a4a4a] dark:text-gray-400 text-base text-center leading-[27.2px]">
                    Already have an account?
                </p>
                <Link
                    href="/login"
                    className="font-normal text-[#8f7e4f] text-base text-center leading-[27.2px] hover:underline"
                >
                    Sign in
                </Link>
            </footer>
        </div>
    );
}
