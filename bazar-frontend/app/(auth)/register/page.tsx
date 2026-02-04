import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import RegisterForm from "../_components/RegisterForm";

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
                            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Sign up</p>
                            <h2 className="font-semibold text-white text-3xl lg:text-[40px] tracking-[-0.6px] leading-snug">
                                Join Our Growing Community
                            </h2>

                            <p className="font-normal text-white text-base lg:text-lg leading-relaxed text-white/90">
                                Get personalized recommendations, save your favorite shops, and help others discover the best local businesses.
                            </p>
                        </div>

                        <ul className="flex flex-col gap-3">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="flex w-7 h-7 items-center justify-center bg-white/20 rounded-full flex-shrink-0 hover:bg-white/30 transition-colors">
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
            <section className="relative w-[43%] flex items-start justify-center pt-[23px] px-8 bg-white">
                <div className="w-full max-w-[576px]">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 mb-12 h-auto p-0 hover:bg-transparent text-[#4a4a4a] hover:text-[#8f7e4f] transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-normal text-base">
                                Back to Home
                            </span>
                        </Button>
                    </Link>

                    <RegisterForm />
                </div>
            </section>
        </div>
    );
}
