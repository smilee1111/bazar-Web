import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function notFound() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">404</p>
                <h1 className="text-4xl font-bold text-white">Page not found</h1>
                <p className="text-white/75 text-lg">The page you're looking for doesn't exist.</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8f7e4f]/10">
                            <FileQuestion className="h-8 w-8 text-[#8f7e4f]" />
                        </div>
                    </div>
                    <CardTitle className="text-[#1a1a1a] text-2xl">Oops! Page not found</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-[#4a4a4a]">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button className="bg-[#8f7e4f] hover:bg-[#7a6b45] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                <Home className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                        </Link>
                        <Button
                            onClick={() => window.history.back()}
                            variant="outline"
                            className="border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
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