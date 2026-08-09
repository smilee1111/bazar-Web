"use client";

import { useState, useEffect } from "react";
import { Sparkles, MapPin, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleCompleteOnboarding } from "@/lib/actions/user-action";
import { handleGetAllCategories } from "@/lib/actions/category-action";
import { useAuth } from "@/app/providers/AuthContext";

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
    const { checkAuth } = useAuth();
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await handleGetAllCategories();
            if (res.success && res.data) {
                setCategories(res.data);
            }
        };
        fetchCategories();
    }, []);

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleRequestLocation = () => {
        setLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                    setLoading(false);
                    setStep(3);
                },
                (error) => {
                    console.error("Location error", error);
                    // Fallback to Kathmandu
                    setLocation({ lat: 27.7, lng: 85.32 });
                    setLoading(false);
                    setStep(3);
                },
                { timeout: 5000 }
            );
        } else {
            setLocation({ lat: 27.7, lng: 85.32 });
            setLoading(false);
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const res = await handleCompleteOnboarding({
            categoryIds: selectedCategories,
            location
        });
        if (res.success) {
            await checkAuth(); // Refresh auth context so hasCompletedOnboarding is true
            onComplete();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-[#142A1C] p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="w-32 h-32" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Welcome to HaatKhoj!</h2>
                    <p className="text-white/80 text-lg">Let's personalize your experience.</p>
                </div>
                
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">What are you looking for?</h3>
                                <p className="text-gray-500 mb-6">Select a few categories so we can recommend the best shops.</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => toggleCategory(cat._id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedCategories.includes(cat._id) ? 'border-[#267A4C] bg-[#E3F5E9]' : 'border-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`font-medium ${selectedCategories.includes(cat._id) ? 'text-[#267A4C]' : 'text-gray-700'}`}>{cat.categoryName || cat.name}</span>
                                                {selectedCategories.includes(cat._id) && <Check className="w-4 h-4 text-[#267A4C]" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end mt-8">
                                <Button 
                                    onClick={() => setStep(2)} 
                                    disabled={selectedCategories.length === 0}
                                    className="bg-[#267A4C] hover:bg-[#1C5C39] text-white px-8 rounded-full"
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 text-center py-8">
                            <div className="mx-auto w-20 h-20 bg-[#E3F5E9] rounded-full flex items-center justify-center mb-6">
                                <MapPin className="w-10 h-10 text-[#267A4C]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900">Find shops near you</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                We use your location to recommend top-rated shops, boutiques, and stores in your immediate area.
                            </p>
                            
                            <div className="flex justify-center mt-8">
                                <Button 
                                    onClick={handleRequestLocation} 
                                    disabled={loading}
                                    className="bg-[#267A4C] hover:bg-[#1C5C39] text-white px-8 rounded-full h-12 text-lg"
                                >
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Allow Location Access"}
                                </Button>
                            </div>
                            <button onClick={() => { setLocation({ lat: 27.7, lng: 85.32 }); setStep(3); }} className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline">
                                Skip for now (Default: Kathmandu)
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 text-center py-12">
                            <Sparkles className="w-16 h-16 text-[#267A4C] mx-auto mb-6 animate-pulse" />
                            <h3 className="text-2xl font-semibold text-gray-900">Curating your feed...</h3>
                            <p className="text-gray-500">We are gathering the best recommendations for you.</p>
                            
                            <div className="flex justify-center mt-8">
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={loading}
                                    className="bg-[#267A4C] hover:bg-[#1C5C39] text-white px-10 rounded-full h-12 text-lg"
                                >
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Explore HaatKhoj"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
