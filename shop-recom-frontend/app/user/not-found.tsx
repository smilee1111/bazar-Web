"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function notFound() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">404</p>
                <h1 className="text-4xl font-bold text-[#2D2318]">Page not found</h1>
                <p className="text-gray-500 text-lg">The page you're looking for doesn't exist.</p>
            </div>

            <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8B6F47]/10">
                            <FileQuestion className="h-8 w-8 text-[#8B6F47]" />
                        </div>
                    </div>
                    <CardTitle className="text-[#2D2318] text-2xl">Oops! Page not found</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-[#5B3E2E]">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button className="bg-[#8B6F47] hover:bg-[#7D5A3F] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                <Home className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Button
                            onClick={() => window.history.back()}
                            variant="outline"
                            className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47]/10 hover:border-[#7D5A3F] transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}