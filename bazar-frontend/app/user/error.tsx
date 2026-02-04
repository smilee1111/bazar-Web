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
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">Error</p>
                <h1 className="text-4xl font-bold text-white">Oops! Something went wrong</h1>
                <p className="text-white/75 text-lg">We encountered an unexpected error. Please try again.</p>
            </div>

            <Card className="border-[1.2px] border-white/25 bg-white/95 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-[#1a1a1a] text-2xl">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-[#4a4a4a]">
                        We apologize for the inconvenience. An unexpected error occurred while processing your request.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={reset}
                            className="bg-[#8f7e4f] hover:bg-[#7a6b45] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try again
                        </Button>
                        <Link href="/dashboard">
                            <Button
                                variant="outline"
                                className="border-[#8f7e4f] text-[#8f7e4f] hover:bg-[#8f7e4f]/10 hover:border-[#7a6b45] transition-all duration-300"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-[#8f7e4f]/70">
                            If the problem persists, please contact our support team.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}