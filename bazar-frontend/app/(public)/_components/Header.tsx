import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
    return (
        <header className="w-full bg-[#8f7e4f]/80 backdrop-blur-sm border-b border-white/10">
            <div className="w-full px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex w-10 h-10 items-center justify-center bg-white/20 rounded-xl border-[1.2px] border-white/30">
                        <img
                            className="w-6 h-6 object-contain"
                            alt="Bazar logo"
                            src="/images/logo.svg"
                        />
                    </div>
                    <h1 className="font-normal text-white text-2xl tracking-[-0.32px]">
                        Bazar
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-white text-[#8f7e4f] hover:bg-white/90 rounded-full">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}