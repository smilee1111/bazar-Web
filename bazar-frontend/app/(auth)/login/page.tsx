"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginData, loginSchema } from "../schema";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

const features = [
    {
        title: "Personalized Recommendations",
        description: "Discover shops tailored to your preferences",
    },
    {
        title: "Save & Share",
        description: "Build your collection of favorite places",
    },
    {
        title: "Community Reviews",
        description: "Read and write trusted reviews",
    },
];

export default function Page() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit",
    });

    const [pending, setTransition] = useTransition();

    const submit = async (values: LoginData) => {
        setTransition(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            router.push("/dashboard");
        });
        console.log("login", values);
    };

    return (
        <div className="relative w-full min-h-screen bg-neutral-50 flex">
            {/* Left Panel */}
            <section className="relative w-full lg:w-[57%] min-h-screen bg-gradient-to-br from-[#8f7e4f] via-[#7a6b45] to-[#6b5d3c] overflow-hidden">
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/auth-background.svg')" }}
                />

                <div className="relative z-10 flex flex-col w-full max-w-[512px] px-8 lg:px-[60px] py-[39px] gap-12 lg:gap-[182px]">
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

                    <div className="flex flex-col gap-12 lg:gap-[101px]">
                        <div className="flex flex-col gap-8 lg:gap-[88px]">
                            <h2 className="font-bold text-white text-3xl lg:text-5xl tracking-[-0.96px] leading-tight lg:leading-[57.6px]">
                                Welcome Back to Bazar
                            </h2>

                            <p className="font-normal text-white text-lg lg:text-xl leading-[27.2px]">
                                Continue discovering amazing local shops and connecting with your community.
                            </p>
                        </div>

                        <ul className="flex flex-col gap-4">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex w-8 h-8 items-center justify-center bg-white/20 rounded-full flex-shrink-0">
                                        <span className="font-normal text-white text-base">
                                            ✓
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-normal text-white text-lg lg:text-xl leading-[27.2px]">
                                            {feature.title}
                                        </h3>
                                        <p className="font-normal text-white/80 text-base lg:text-lg leading-[27.2px]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Right Panel */}
            <section className="relative w-full lg:w-[43%] flex items-start justify-center pt-[23px] px-4 lg:px-8 bg-neutral-50">
                <div className="w-full max-w-[576px]">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 mb-12 h-auto p-0 hover:bg-transparent"
                        >
                            <ChevronLeft className="w-5 h-5 text-[#4a4a4a]" />
                            <span className="font-normal text-[#4a4a4a] text-base">
                                Back to Home
                            </span>
                        </Button>
                    </Link>

                    <Card className="w-full bg-white rounded-3xl border-[1.2px] border-[#efefef] shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]">
                        <CardContent className="p-8 lg:p-[49.2px]">
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-col gap-3">
                                    <h2 className="font-light text-[#1a1a1a] text-4xl lg:text-5xl tracking-[-0.96px] leading-tight lg:leading-[57.6px]">
                                        Welcome Back
                                    </h2>
                                    <p className="font-normal text-[#4a4a4a] text-base leading-[27.2px]">
                                        Sign in to your Bazar account
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-2">
                                        <Label
                                            htmlFor="email"
                                            className="font-normal text-[#524632] text-base"
                                        >
                                            Email<span className="text-[#8f7e4f]">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a191980]" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...register("email")}
                                                className="h-[50px] pl-12 pr-4 rounded-[10px] border-[1.2px] font-normal text-base placeholder:text-[#1a191980]"
                                            />
                                        </div>
                                        {errors.email?.message && (
                                            <p className="text-xs text-red-600">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="font-normal text-[#524632] text-base"
                                        >
                                            Password<span className="text-[#8f7e4f]">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a191980]" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter your password"
                                                {...register("password")}
                                                className="h-[50px] pl-12 pr-4 rounded-[10px] border-[1.2px] font-normal text-base placeholder:text-[#1a191980]"
                                            />
                                        </div>
                                        {errors.password?.message && (
                                            <p className="text-xs text-red-600">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <a
                                            href="#"
                                            className="text-[#8f7e4f] text-sm hover:underline"
                                        >
                                            Forgot password?
                                        </a>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || pending}
                                        className="w-full h-14 bg-[#8f7e4f] hover:bg-[#7a6b45] text-white rounded-full shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-base disabled:opacity-60"
                                    >
                                        {isSubmitting || pending ? "Logging in..." : "Log in"}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <Separator className="bg-[#efefef]" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4">
                                        <span className="font-normal text-[#4a4a4a] text-base">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full h-[58px] bg-white rounded-full border-[1.2px] border-[#efefef] shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a] font-normal text-[#1a1a1a] text-base hover:bg-neutral-50"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M18.1713 8.36788H17.5001V8.33329H10.0001V11.6666H14.7096C14.0225 13.6069 12.1763 15 10.0001 15C7.23882 15 5.00007 12.7612 5.00007 9.99996C5.00007 7.23871 7.23882 4.99996 10.0001 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1859 2.52204 12.1951 1.66663 10.0001 1.66663C5.39799 1.66663 1.66675 5.39788 1.66675 9.99996C1.66675 14.602 5.39799 18.3333 10.0001 18.3333C14.6022 18.3333 18.3334 14.602 18.3334 9.99996C18.3334 9.44121 18.2759 8.89579 18.1713 8.36788Z"
                                            fill="#FFC107"
                                        />
                                        <path
                                            d="M2.62756 6.12121L5.36548 8.12913C6.10631 6.29496 7.90048 4.99996 10.0001 4.99996C11.2746 4.99996 12.4342 5.48079 13.3171 6.26621L15.6742 3.90913C14.1859 2.52204 12.1951 1.66663 10.0001 1.66663C6.79923 1.66663 4.02339 3.47371 2.62756 6.12121Z"
                                            fill="#FF3D00"
                                        />
                                        <path
                                            d="M10.0001 18.3333C12.1526 18.3333 14.1084 17.5095 15.5871 16.17L13.0079 13.9875C12.1431 14.6452 11.0864 15.0008 10.0001 15C7.83259 15 5.99176 13.6179 5.29843 11.6891L2.58093 13.7829C3.96009 16.4816 6.76176 18.3333 10.0001 18.3333Z"
                                            fill="#4CAF50"
                                        />
                                        <path
                                            d="M18.1713 8.36796H17.5001V8.33337H10.0001V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.9879L13.0079 13.9871L15.5871 16.1696C15.4046 16.3354 18.3334 14.1667 18.3334 10C18.3334 9.44129 18.2759 8.89587 18.1713 8.36796Z"
                                            fill="#1976D2"
                                        />
                                    </svg>
                                    Sign in with Google
                                </Button>

                                <p className="text-center font-normal text-[#4a4a4a] text-base">
                                    Don't have an account?{" "}
                                    <Link href="/register" className="text-[#8f7e4f] hover:underline">
                                        Sign up
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