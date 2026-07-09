"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Store, Users, MapPin, TrendingUp, Star, Heart, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import Header from "./_components/Header";

const features = [
    {
        title: "Discover Local Shops",
        description: "Find unique businesses in your neighborhood and explore hidden gems around every corner.",
        icon: Store,
    },
    {
        title: "Community Driven",
        description: "Read and share trusted reviews from real people who love their local shops.",
        icon: Users,
    },
    {
        title: "Explore Locations",
        description: "Browse shops across multiple cities with interactive maps and directions.",
        icon: MapPin,
    },
    {
        title: "Trending Places",
        description: "Stay updated with popular spots and discover what's hot in your area.",
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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2D2318] via-[#3D2F22] to-[#5B3E2E]" />
                <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center opacity-5"
                    style={{ backgroundImage: "url('/images/auth-background.svg')" }}
                />
                <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
                    <div className="max-w-3xl animate-fade-up">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#8B6F47]/20 px-4 py-1.5 text-sm font-medium text-[#D4A574] mb-6">
                            <Sparkle /> Welcome to Bazar
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                            Discover Your
                            <br />
                            <span className="text-[#D4A574]">Local Favorites</span>
                        </h1>
                        <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl">
                            Connect with the best local shops, share experiences, and build your
                            favorite places collection. Join thousands of community members today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <Link href="/shops">
                                <Button className="bg-[#8B6F47] text-white hover:bg-[#7D5A3F] rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
                                    Browse Shops
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-white text-[#2D2318] hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                                    Get Started Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-[#2D2318] mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="w-full bg-[#FAF8F5]">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
                    <div className="text-center mb-16">
                        <span className="inline-block text-sm font-semibold text-[#8B6F47] uppercase tracking-[0.2em] mb-3">Features</span>
                        <h2 className="text-3xl lg:text-5xl font-bold text-[#2D2318] mb-4">
                            Why Choose Bazar?
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Experience the best way to discover and connect with local businesses
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="bg-white border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    <CardContent className="p-8">
                                        <div className="inline-flex p-3.5 bg-[#FAF4EC] rounded-2xl mb-5 group-hover:bg-[#8B6F47]/15 transition-colors duration-300">
                                            <Icon className="w-7 h-7 text-[#8B6F47]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#2D2318] mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full bg-white">
                <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#2D2318] to-[#5B3E2E] p-12 lg:p-16 text-center overflow-hidden">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#8B6F47]/20 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#D4A574]/10 blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                                Ready to Get Started?
                            </h2>
                            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                                Join our growing community and start discovering amazing local businesses today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/shops">
                                    <Button className="bg-[#8B6F47] hover:bg-[#7D5A3F] text-white rounded-full px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group">
                                        Browse Shops
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-white text-[#2D2318] hover:bg-white/90 rounded-full px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                                        Create Your Account
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-[#1A1410] text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex w-10 h-10 items-center justify-center bg-[#8B6F47] rounded-xl">
                                    <img
                                        className="w-6 h-6 object-contain"
                                        alt="Bazar logo"
                                        src="/images/logo.svg"
                                    />
                                </div>
                                <h3 className="font-semibold text-xl">Bazar</h3>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                                Discover and connect with amazing local businesses in your community.
                                Share experiences and build your favorite places collection.
                            </p>
                            <div className="flex gap-3">
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#8B6F47] transition-colors cursor-pointer">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#8B6F47] transition-colors cursor-pointer">
                                    <Heart className="w-4 h-4" />
                                </div>
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#8B6F47] transition-colors cursor-pointer">
                                    <Star className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-5 text-white/90">Quick Links</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-5 text-white/90">Support</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
                                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                            </ul>
                        </div>
                    </div>
                    <Separator className="my-10 bg-white/10" />
                    <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                        <p>&copy; 2024 Bazar. All rights reserved.</p>
                        <p>Made with ❤️ for local communities</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function Sparkle() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0L9.79 6.21L16 8L9.79 9.79L8 16L6.21 9.79L0 8L6.21 6.21L8 0Z" fill="currentColor" />
        </svg>
    );
}
