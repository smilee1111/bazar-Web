import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Help", href: "/help" },
];

export default function Header() {
    return (
        <header className="w-full bg-[#8f7e4f]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
            <div className="w-full px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="flex w-10 h-10 items-center justify-center bg-white/20 rounded-xl border-[1.2px] border-white/30 hover:bg-white/30 transition-colors">
                            <img
                                className="w-6 h-6 object-contain"
                                alt="Bazar logo"
                                src="/images/logo.svg"
                            />
                        </div>
                        <h1 className="font-normal text-white text-2xl tracking-[-0.32px]">
                            Bazar
                        </h1>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-white/80 hover:text-white transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20 transition-all duration-200"
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-white text-[#8f7e4f] hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden px-8 pb-4">
                <Separator className="mb-4 bg-white/20" />
                <nav className="flex justify-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}