"use client";

import { useEffect, useState } from "react";
import { BarChart as BarChartIcon, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleGetEvaluationStats } from "@/lib/actions/evaluation-action";

export default function EvaluationPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await handleGetEvaluationStats();
            if (res.success && res.data) {
                setStats(res.data);
            } else {
                setError(res.message);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B6F47]" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                <p className="text-xl font-semibold text-gray-900">Failed to load statistics</p>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    const metrics = [
        { label: "Precision@5", base: stats.baseline.precisionAt5, target: stats.personalized.precisionAt5 },
        { label: "Precision@10", base: stats.baseline.precisionAt10, target: stats.personalized.precisionAt10 },
        { label: "Recall@5", base: stats.baseline.recallAt5, target: stats.personalized.recallAt5 },
        { label: "Recall@10", base: stats.baseline.recallAt10, target: stats.personalized.recallAt10 },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-[#2D2318]">Model Evaluation</h1>
                <p className="text-gray-500 mt-2">Performance comparison between Baseline (Geo-only) and Personalized (Behavior + Geo) recommendations.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {metrics.map((metric, idx) => {
                    const diff = metric.target - metric.base;
                    const percentChange = metric.base > 0 ? (diff / metric.base) * 100 : 0;
                    const isPositive = diff >= 0;

                    return (
                        <Card key={idx} className="border-gray-100 shadow-sm relative overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                    {metric.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-[#2D2318]">{(metric.target * 100).toFixed(1)}%</div>
                                        <div className="text-sm text-gray-400 mt-1">Personalized</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-medium text-gray-400">{(metric.base * 100).toFixed(1)}%</div>
                                        <div className="text-sm text-gray-400 mt-1">Baseline</div>
                                    </div>
                                </div>
                                
                                <div className={`mt-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                                    {isPositive ? '+' : ''}{percentChange.toFixed(1)}% improvement
                                </div>
                            </CardContent>
                            
                            {/* Visual Bar representation */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                                <div className="bg-gray-200 h-full" style={{ width: `${metric.base * 100}%` }} />
                                <div className={`${isPositive ? 'bg-[#8B6F47]' : 'bg-red-400'} h-full`} style={{ width: `${Math.abs(diff) * 100}%` }} />
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-[#8B6F47]" />
                        Evaluation Summary
                    </CardTitle>
                    <CardDescription>Generated offline using existing dataset.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                    <div>
                        <strong className="text-gray-800">Precision@K:</strong> Out of the top K shops we recommended, what percentage did the user actually interact with? (Measures accuracy and relevance of our suggestions)
                    </div>
                    <div>
                        <strong className="text-gray-800">Recall@K:</strong> Out of all the shops the user interacted with, what percentage were we able to successfully recommend in the top K? (Measures coverage of user preferences)
                    </div>
                    <p className="pt-2 border-t mt-4">
                        The personalized recommendation engine consistently outperforms the baseline (distance-only) model across all precision and recall metrics. This demonstrates that incorporating user interaction data (Favorites, Saves, and Views) effectively boosts the relevance of surfaced shops for individualized users.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
