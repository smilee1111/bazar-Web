"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
     error,
     reset
}: {
     error: Error & { digest?: string },
     reset: () => void
}) {

     useEffect(() => {
         console.error(error)
     },[error])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 animate-fade-up">
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Error</p>
                <h1 className="text-4xl font-bold text-[#2D2318]">Oops! Something went wrong</h1>
                <p className="text-gray-500 text-lg">We encountered an unexpected error. Please try again.</p>
            </div>

            <Card className="border-[1.2px] border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-[#2D2318] text-2xl">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-[#5B3E2E]">
                        We apologize for the inconvenience. An unexpected error occurred while processing your request.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={reset}
                            className="bg-[#8B6F47] hover:bg-[#7D5A3F] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try again
                        </Button>
                        <Link href="/dashboard">
                            <Button
                                variant="outline"
                                className="border-[#8B6F47] text-[#8B6F47] hover:bg-[#8B6F47]/10 hover:border-[#7D5A3F] transition-all duration-300"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-[#8B6F47]/70">
                            If the problem persists, please contact our support team.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}