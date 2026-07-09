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
        <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="flex w-10 h-10 items-center justify-center bg-[#2D2318] rounded-xl">
                            <img
                                className="w-6 h-6 object-contain"
                                alt="Bazar logo"
                                src="/images/logo.svg"
                            />
                        </div>
                        <h1 className="font-semibold text-[#2D2318] text-xl tracking-tight">
                            Bazar
                        </h1>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-gray-500 hover:text-[#2D2318] transition-colors font-medium text-sm"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/login">
                        <Button
                            variant="ghost"
                            className="text-[#2D2318] hover:bg-gray-100 transition-all duration-200 font-medium"
                        >
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-[#2D2318] text-white hover:bg-[#3D2F22] rounded-full shadow-sm hover:shadow-md transition-all duration-300 font-medium px-6">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden px-6 pb-4">
                <Separator className="mb-4 bg-gray-100" />
                <nav className="flex justify-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-gray-500 hover:text-[#2D2318] transition-colors text-sm font-medium"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}