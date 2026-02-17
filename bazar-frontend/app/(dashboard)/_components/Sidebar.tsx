"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Heart, Home, LogOut, Shield, UserRound, Users, Store, Settings, ChevronUp, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";

const baseNavItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Browse Shops", href: "/shops", icon: MapPin },
    { label: "Saved Shops", href: "/dashboard/saved-shops", icon: Bookmark },
    { label: "Favourites", href: "/dashboard/favourites", icon: Heart },
    { label: "Profile", href: "/profile", icon: UserRound },
];

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);

    const roleName = typeof user?.role === "string"
        ? user?.role
        : user?.role?.name || user?.roleId?.roleName || user?.role?.roleName;
    const normalizedRole = roleName?.toLowerCase() || "user";
    const isAdmin = normalizedRole === "admin";
    const roleBadgeLabel = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
    const isSeller = roleName?.toLowerCase() === "seller" || user?.sellerStatus === "approved";

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const navItems = isAdmin
        ? [
            ...baseNavItems,
            { label: "Users", href: "/admin/users", icon: Users },
            { label: "Shops", href: "/admin/shops", icon: Store }
        ]
        : isSeller
            ? [
                ...baseNavItems,
                { label: "My Shop", href: "/my-shop", icon: Store }
            ]
            : baseNavItems;

    return (
        <aside
            className={cn(
                "sticky top-0 flex h-screen flex-none flex-col overflow-hidden bg-white/10 text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-[width] duration-300 ease-in-out will-change-[width]",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            <div className={cn("px-6 pt-7 pb-5", isCollapsed && "px-3")}> 
                <div
                    className={cn(
                        "grid items-center gap-3",
                        isCollapsed ? "grid-cols-1 justify-items-center" : "grid-cols-[auto_1fr_auto]"
                    )}
                >
                    <div className={cn("flex items-center gap-3", isCollapsed && "flex-col")}> 
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-white/15"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <Image
                                src="/images/logo.svg"
                                alt="Bazar logo"
                                width={26}
                                height={26}
                                className="h-6 w-6"
                                priority
                            />
                        </button>
                        {!isCollapsed && (
                            <div className="leading-tight">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Bazar</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-semibold">Dashboard</p>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-[3px] text-[11px] font-medium text-white/90">
                                        <Shield className="h-3 w-3" />
                                        {roleBadgeLabel}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && <div />}

                    <Button
                        variant="ghost"
                        onClick={onToggleCollapse}
                        className="h-8 w-8 rounded-full p-0 text-white/70 hover:bg-white/15 hover:text-white"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Separator className="bg-white/15" />

            <nav className={cn("flex-1 px-3 py-5", isCollapsed && "px-2")}> 
                {!isCollapsed && (
                    <p className="px-3 pb-3 text-xs uppercase tracking-[0.25em] text-white/50">Menu</p>
                )}
                <div className="space-y-1">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = href === "/dashboard"
                            ? pathname === href
                            : pathname === href || pathname.startsWith(`${href}/`);

                        return (
                            <Link key={href} href={href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "group relative flex w-full items-center justify-start gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/15 hover:text-white",
                                        isCollapsed && "justify-center px-2",
                                        isActive && "bg-white/15 text-white shadow-inner"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "absolute left-0 h-8 w-[3px] rounded-full bg-transparent transition",
                                            isActive && "bg-white"
                                        )}
                                    />
                                    <Icon className="h-[18px] w-[18px] text-white/70 group-hover:text-white" />
                                    {!isCollapsed && <span>{label}</span>}
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <div className={cn("px-4 pb-8 pt-4", isCollapsed && "px-2")}> 
                <Separator className="mb-4 bg-white/10" />
                <div className="mb-3">
                    <Button
                        onClick={() => setSettingsOpen((prev) => !prev)}
                        variant="ghost"
                        className={cn(
                            "flex w-full items-center justify-start gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/15 hover:text-white",
                            isCollapsed && "justify-center px-2"
                        )}
                    >
                        <Settings className="h-[18px] w-[18px] text-white/70" />
                        {!isCollapsed && (
                            <>
                                <span>Settings</span>
                                <ChevronUp
                                    className={cn(
                                        "ml-auto h-4 w-4 text-white/50 transition-transform",
                                        settingsOpen ? "rotate-0" : "rotate-180"
                                    )}
                                />
                            </>
                        )}
                    </Button>
                    {!isCollapsed && (
                        <div
                            className={cn(
                                "overflow-hidden pl-6 transition-all duration-300",
                                settingsOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                            )}
                        >
                            <div className="mt-2 space-y-1">
                                <Link href="/settings/account">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 rounded-xl px-4 py-2 text-[14px] font-medium text-white/75 hover:bg-white/10 hover:text-white"
                                    >
                                        Account
                                    </Button>
                                </Link>
                                <Link href="/settings/security">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 rounded-xl px-4 py-2 text-[14px] font-medium text-white/75 hover:bg-white/10 hover:text-white"
                                    >
                                        Security
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className={cn(
                        "flex w-full items-center justify-start gap-3 rounded-xl px-4 py-3 text-[15px] font-medium text-white/80 transition hover:bg-white/15 hover:text-white",
                        isCollapsed && "justify-center px-2"
                    )}
                >
                    <LogOut className="h-[18px] w-[18px] text-white/70" />
                    {!isCollapsed && <span>Logout</span>}
                </Button>
            </div>
        </aside>
    );
}
