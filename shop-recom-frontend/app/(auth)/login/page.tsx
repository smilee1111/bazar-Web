import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import LoginForm from "../_components/LoginForm";

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
    return (
        <div className="relative w-full min-h-screen bg-neutral-50 flex">
            {/* Left Panel */}
            <section className="relative w-full lg:w-[57%] min-h-screen bg-gradient-to-br from-[#142A1C] via-[#1A3625] to-[#1B4A31] overflow-hidden">
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-5"
                    style={{ backgroundImage: "url('/images/auth-background.svg')" }}
                />

                <div className="relative z-10 flex min-h-screen flex-col w-full max-w-[520px] px-4 lg:px-[60px] pt-[23px] pb-12">
                    <header className="flex items-center gap-3">
                        <div className="flex w-12 h-12 items-center justify-center bg-white/20 rounded-2xl border-[1.2px] border-white/30">
                            <img
                                className="w-8 h-8 object-contain"
                                alt="HaatKhoj logo"
                                src="/images/HaatKhoj.svg"
                            />
                        </div>
                        <h1 className="font-normal text-white text-[32px] tracking-[-0.32px] leading-[41.6px]">
                            HaatKhoj
                        </h1>
                    </header>

                    <div className="mt-12 flex flex-col gap-10">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Sign in</p>
                            <h2 className="font-semibold text-white text-3xl lg:text-[40px] tracking-[-0.6px] leading-snug">
                                Welcome Back to HaatKhoj
                            </h2>

                            <p className="font-normal text-white text-base lg:text-lg leading-relaxed text-white/90">
                                Continue discovering amazing local shops and connecting with your community.
                            </p>
                        </div>

                        <ul className="flex flex-col gap-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex w-7 h-7 items-center justify-center bg-white/20 rounded-full flex-shrink-0">
                                        <span className="font-normal text-white text-sm">✓</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <h3 className="font-medium text-white text-base lg:text-lg leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="font-normal text-white/80 text-sm lg:text-base leading-relaxed">
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
                            <ChevronLeft className="w-5 h-5 text-[#1B4A31]" />
                            <span className="font-normal text-[#1B4A31] text-base">
                                Back to Home
                            </span>
                        </Button>
                    </Link>

                    <LoginForm />
                </div>
            </section>
        </div>
    );
}