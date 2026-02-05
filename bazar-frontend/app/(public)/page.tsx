"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Store, Users, MapPin, TrendingUp, Star, Heart, Globe } from "lucide-react";
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

const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Local Shops", value: "5K+" },
    { label: "Cities Covered", value: "50+" },
    { label: "Reviews", value: "25K+" },
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
                <div className="max-w-4xl mx-auto animate-fade-up">
                    <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                        Discover Your Local
                        <br />
                        Business Community
                    </h1>
                    <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Connect with the best local shops, share experiences, and build your
                        favorite places collection. Join thousands of community members today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button className="bg-white text-[#8f7e4f] hover:bg-white/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button
                                variant="outline"
                                className="border-2 border-white text-white hover:bg-white/20 rounded-full px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                            >
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full px-8 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-center">
                                <CardContent className="p-6">
                                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                                    <div className="text-white/80">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="w-full px-8 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Why Choose Bazar?
                        </h2>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            Experience the best way to discover and connect with local businesses
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="bg-white/95 backdrop-blur-sm border-[1.2px] border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="inline-flex p-4 bg-[#8f7e4f]/10 rounded-2xl mb-4 group-hover:bg-[#8f7e4f]/20 transition-colors">
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
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm border-[1.2px] border-white/30 shadow-xl hover:shadow-2xl transition-shadow">
                        <CardContent className="p-12 text-center">
                            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-4">
                                Ready to Get Started?
                            </h2>
                            <p className="text-xl text-[#4a4a4a] mb-8 max-w-2xl mx-auto">
                                Join our growing community and start discovering amazing local businesses today.
                            </p>
                            <Link href="/register">
                                <Button className="bg-[#8f7e4f] hover:bg-[#7a6b45] text-white rounded-full px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                    Create Your Account
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-[#1a1a1a] text-white">
                <div className="max-w-7xl mx-auto px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex w-10 h-10 items-center justify-center bg-[#8f7e4f] rounded-xl">
                                    <img
                                        className="w-6 h-6 object-contain"
                                        alt="Bazar logo"
                                        src="/images/logo.svg"
                                    />
                                </div>
                                <h3 className="font-semibold text-xl">Bazar</h3>
                            </div>
                            <p className="text-gray-400 mb-4 max-w-md">
                                Discover and connect with amazing local businesses in your community.
                                Share experiences and build your favorite places collection.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-[#8f7e4f] rounded-full flex items-center justify-center">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="w-8 h-8 bg-[#8f7e4f] rounded-full flex items-center justify-center">
                                    <Heart className="w-4 h-4" />
                                </div>
                                <div className="w-8 h-8 bg-[#8f7e4f] rounded-full flex items-center justify-center">
                                    <Star className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                            </ul>
                        </div>
                    </div>
                    <Separator className="my-8 bg-gray-700" />
                    <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
                        <p>&copy; 2024 Bazar. All rights reserved.</p>
                        <p>Made with ❤️ for local communities</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
