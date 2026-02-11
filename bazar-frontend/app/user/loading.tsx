import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Loading</p>
                <h1 className="text-4xl font-bold text-white">Please wait</h1>
                <p className="text-white/75 text-lg">We're preparing your content...</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-12 w-12 text-[#8f7e4f] animate-spin mb-4" />
                    <p className="text-[#1a1a1a] font-medium">Loading...</p>
                    <p className="text-[#4a4a4a] text-sm mt-2">Please wait while we fetch your data</p>
                </CardContent>
            </Card>
        </div>
    );
}