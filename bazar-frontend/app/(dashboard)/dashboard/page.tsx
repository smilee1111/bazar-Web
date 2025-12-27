"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Store, Users, TrendingUp, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stats = [
    {
        title: "Total Shops",
        value: "1,234",
        icon: Store,
        trend: "+12% from last month",
    },
    {
        title: "Active Users",
        value: "5,678",
        icon: Users,
        trend: "+8% from last month",
    },
    {
        title: "Reviews",
        value: "9,012",
        icon: TrendingUp,
        trend: "+15% from last month",
    },
    {
        title: "Locations",
        value: "45",
        icon: MapPin,
        trend: "+3 new cities",
    },
];

export default function DashboardPage() {
    const router = useRouter();

    const handleLogout = () => {
        // Add logout logic here
        router.push("/login");
    };

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-[#8f7e4f] via-[#7a6b45] to-[#6b5d3c]">
            {/* Background Pattern */}
            <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10"
                style={{ backgroundImage: "url('/images/auth-background.svg')" }}
            />

            <div className="relative z-10 w-full min-h-screen">
                {/* Header */}
                <header className="w-full bg-white/10 backdrop-blur-sm border-b border-white/20">
                    <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex w-10 h-10 items-center justify-center bg-white/20 rounded-xl border-[1.2px] border-white/30">
                                <img
                                    className="w-6 h-6 object-contain"
                                    alt="Bazar logo"
                                    src="/images/logo.svg"
                                />
                            </div>
                            <h1 className="font-normal text-white text-2xl tracking-[-0.32px]">
                                Bazar Dashboard
                            </h1>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="text-white hover:bg-white/20 gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-8 py-12">
                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-white mb-2">
                            Welcome Back!
                        </h2>
                        <p className="text-white/80 text-lg">
                            Here's what's happening with your local business community
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={index}
                                    className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-[#8f7e4f]/10 rounded-xl">
                                                <Icon className="w-6 h-6 text-[#8f7e4f]" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-medium text-[#4a4a4a] mb-1">
                                            {stat.title}
                                        </h3>
                                        <p className="text-3xl font-bold text-[#1a1a1a] mb-2">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-[#8f7e4f]">{stat.trend}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Content Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-[#1a1a1a]">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                                        >
                                            <div className="w-10 h-10 bg-[#8f7e4f]/20 rounded-full flex items-center justify-center">
                                                <Store className="w-5 h-5 text-[#8f7e4f]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-[#1a1a1a]">
                                                    New shop added
                                                </p>
                                                <p className="text-sm text-[#4a4a4a]">
                                                    2 hours ago
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-[#1a1a1a]">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Button className="w-full bg-[#8f7e4f] hover:bg-[#7a6b45] text-white rounded-full">
                                        Add New Shop
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                    >
                                        View All Shops
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10"
                                    >
                                        Manage Reviews
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
