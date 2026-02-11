"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Store, TrendingUp, Users, ArrowUpRight, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const stats = [
    {
        title: "Total Shops",
        value: "1,234",
        icon: Store,
        trend: "+12% from last month",
        trendUp: true,
    },
    {
        title: "Active Users",
        value: "5,678",
        icon: Users,
        trend: "+8% from last month",
        trendUp: true,
    },
    {
        title: "Reviews",
        value: "9,012",
        icon: TrendingUp,
        trend: "+15% from last month",
        trendUp: true,
    },
    {
        title: "Locations",
        value: "45",
        icon: MapPin,
        trend: "+3 new cities",
        trendUp: true,
    },
];

const recentActivities = [
    {
        title: "New shop added",
        description: "Downtown Coffee House joined the platform",
        time: "2 hours ago",
        icon: Store,
    },
    {
        title: "Review submitted",
        description: "5-star review for Artisan Bakery",
        time: "4 hours ago",
        icon: TrendingUp,
    },
    {
        title: "User registered",
        description: "New community member joined",
        time: "6 hours ago",
        icon: Users,
    },
];

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-10">
            <div className="space-y-2 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                    Overview
                </p>
                <h2 className="text-4xl font-bold text-white">
                    Welcome back{user?.name ? `, ${user.name}` : "!"}
                </h2>
                <p className="text-white/80 text-lg">
                    Here&apos;s what is happening with your local business community.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="rounded-xl bg-[#8f7e4f]/10 p-3 hover:bg-[#8f7e4f]/20 transition-colors">
                                        <Icon className="h-6 w-6 text-[#8f7e4f]" />
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-[#8f7e4f]/60" />
                                </div>
                                <h3 className="mb-1 text-sm font-medium text-[#4a4a4a]">
                                    {stat.title}
                                </h3>
                                <p className="mb-2 text-3xl font-bold text-[#1a1a1a]">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-[#8f7e4f] flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-[#8f7e4f] rounded-full"></span>
                                    {stat.trend}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-[#1a1a1a] flex items-center gap-2">
                            <Clock className="h-5 w-5 text-[#8f7e4f]" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 rounded-lg bg-neutral-50 p-4 hover:bg-neutral-100 transition-colors animate-fade-up"
                                        style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8f7e4f]/20 hover:bg-[#8f7e4f]/30 transition-colors">
                                            <Icon className="h-5 w-5 text-[#8f7e4f]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-[#1a1a1a]">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-[#4a4a4a]">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <div className="text-xs text-[#8f7e4f]/70">
                                            {activity.time}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-[#efefef] shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-[#1a1a1a] flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[#8f7e4f]" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full rounded-full bg-[#8f7e4f] text-white hover:bg-[#7a6b45] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                Add New Shop
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
                            >
                                View All Shops
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
                            >
                                Manage Reviews
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full rounded-full border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
                            >
                                Analytics
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
