"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Users, MapPin, TrendingUp } from "lucide-react";
import Link from "next/link";
import Header from "./_components/Header";

const features = [
    {
        title: "Discover Local Shops",
        description: "Find unique businesses in your neighborhood",
        icon: Store,
    },
    {
        title: "Community Driven",
        description: "Read and share trusted reviews",
        icon: Users,
    },
    {
        title: "Explore Locations",
        description: "Browse shops across multiple cities",
        icon: MapPin,
    },
    {
        title: "Trending Places",
        description: "Stay updated with popular spots",
        icon: TrendingUp,
    },
];

export default function Home() {
    return (
        <>
            {/* Background Pattern */}
            <div 
                className="fixed inset-0 w-full h-full bg-gradient-to-br from-[#8f7e4f] via-[#7a6b45] to-[#6b5d3c] bg-cover bg-center -z-10"
                style={{ backgroundImage: "url('/images/auth-background.svg')" }}
            />

            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="w-full px-8 py-20 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                            Discover Your Local
                            <br />
                            Business Community
                        </h1>
                        <p className="text-xl text-white/90 mb-10 leading-relaxed">
                            Connect with the best local shops, share experiences, and build your
                            favorite places collection. Join thousands of community members today.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/register">
                                <Button className="bg-white text-[#8f7e4f] hover:bg-white/90 rounded-full px-8 py-6 text-lg">
                                    Get Started
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button
                                    variant="outline"
                                    className="border-2 border-white text-white hover:bg-white/20 rounded-full px-8 py-6 text-lg"
                                >
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full px-8 py-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Why Choose Bazar?
                    </h2>
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="bg-white/95 backdrop-blur-sm border-[1.2px] border-white/30 shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="inline-flex p-4 bg-[#8f7e4f]/10 rounded-2xl mb-4">
                                            <Icon className="w-8 h-8 text-[#8f7e4f]" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-[#1a1a1a] mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#4a4a4a]">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full px-8 py-20">
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-white/95 backdrop-blur-sm border-[1.2px] border-white/30 shadow-xl">
                            <CardContent className="p-12">
                                <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">
                                    Ready to Get Started?
                                </h2>
                                <p className="text-xl text-[#4a4a4a] mb-8">
                                    Join our growing community and start discovering amazing local businesses today.
                                </p>
                                <Link href="/register">
                                    <Button className="bg-[#8f7e4f] hover:bg-[#7a6b45] text-white rounded-full px-10 py-6 text-lg">
                                        Create Your Account
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </section>
        </>
    );
}
