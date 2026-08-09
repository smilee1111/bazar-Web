import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Loading</p>
                <h1 className="text-4xl font-bold text-[#142A1C]">Please wait</h1>
                <p className="text-gray-500 text-lg">We're preparing your content...</p>
            </div>

            <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-12 w-12 text-[#267A4C] animate-spin mb-4" />
                    <p className="text-[#142A1C] font-medium">Loading...</p>
                    <p className="text-[#1B4A31] text-sm mt-2">Please wait while we fetch your data</p>
                </CardContent>
            </Card>
        </div>
    );
}