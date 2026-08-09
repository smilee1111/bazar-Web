"use client";

import { useEffect, useState } from "react";
import { BarChart as BarChartIcon, AlertCircle, Loader2, Users, CheckCircle2, MinusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleGetEvaluationStats } from "@/lib/actions/evaluation-action";
import MetricLineChart from "./_components/MetricLineChart";

// Dataviz-skill validated categorical slots 1-3 (blue / orange / aqua), checked against this
// panel's white card surface -- see MetricLineChart.tsx for the contrast note.
const SERIES_COLORS = {
    personalized: "#2a78d6",
    baseline: "#eb6834",
    random: "#1baf7a"
};

interface WilcoxonResult {
    n: number;
    statistic: number;
    zScore: number;
    pValue: number;
    significant: boolean;
    significantCorrected: boolean;
}

interface EvaluationStats {
    totalUsersWithHistory: number;
    totalUsersEvaluated: number;
    minLogsCount: number;
    kValues: number[];
    variants: {
        personalized: { precision: Record<number, number>; recall: Record<number, number>; ndcg: Record<number, number> };
        baseline: { precision: Record<number, number>; recall: Record<number, number>; ndcg: Record<number, number> };
        random: { precision: Record<number, number>; recall: Record<number, number>; ndcg: Record<number, number> };
    };
    significance: {
        vsBaseline: { precision: Record<number, WilcoxonResult>; recall: Record<number, WilcoxonResult> };
        vsRandom: { precision: Record<number, WilcoxonResult>; recall: Record<number, WilcoxonResult> };
        bonferroniAlpha: number;
        testedAtK: number[];
    };
}

function SignificanceRow({ label, result }: { label: string; result: WilcoxonResult }) {
    const isSignificant = result.significantCorrected;
    return (
        <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono tabular-nums text-gray-500">
                    p={result.pValue < 0.001 ? "<0.001" : result.pValue.toFixed(3)} (n={result.n})
                </span>
                {isSignificant ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-[#0ca30c]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Significant
                    </span>
                ) : (
                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        <MinusCircle className="h-3.5 w-3.5" /> Not significant
                    </span>
                )}
            </div>
        </div>
    );
}

export default function EvaluationPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EvaluationStats | null>(null);
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

    const kValues = stats.kValues;
    const buildSeries = (metric: "precision" | "recall" | "ndcg") => [
        {
            key: "personalized",
            label: "Personalized",
            color: SERIES_COLORS.personalized,
            points: kValues.map((k) => ({ k, value: stats.variants.personalized[metric][k] ?? 0 }))
        },
        {
            key: "baseline",
            label: "Baseline (geo-only)",
            color: SERIES_COLORS.baseline,
            points: kValues.map((k) => ({ k, value: stats.variants.baseline[metric][k] ?? 0 }))
        },
        {
            key: "random",
            label: "Random (floor)",
            color: SERIES_COLORS.random,
            points: kValues.map((k) => ({ k, value: stats.variants.random[metric][k] ?? 0 }))
        }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-[#2D2318]">Model Evaluation</h1>
                <p className="text-gray-500 mt-2">
                    Offline train/test comparison of the personalized recommendation engine against a non-personalized
                    geo-only baseline and a random-within-radius floor.
                </p>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardContent className="flex flex-wrap items-center gap-6 p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FAF4EC] rounded-xl">
                            <Users className="h-4 w-4 text-[#8B6F47]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#2D2318] tabular-nums">{stats.totalUsersEvaluated}</p>
                            <p className="text-xs text-gray-500">users evaluated (n)</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        out of <span className="font-medium text-gray-700">{stats.totalUsersWithHistory}</span> users with
                        at least <span className="font-medium text-gray-700">{stats.minLogsCount}</span> logged interactions,
                        each split chronologically 70% train / 30% test.
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="p-5">
                        <MetricLineChart title="Precision@K" series={buildSeries("precision")} kValues={kValues} />
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm">
                    <CardContent className="p-5">
                        <MetricLineChart title="Recall@K" series={buildSeries("recall")} kValues={kValues} />
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm md:col-span-2">
                    <CardContent className="p-5">
                        <MetricLineChart title="NDCG@K (ranking quality)" series={buildSeries("ndcg")} kValues={kValues} />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Statistical Significance</CardTitle>
                    <CardDescription>
                        Paired Wilcoxon signed-rank test on per-user scores at K={stats.significance.testedAtK.join(", ")}.
                        &quot;Significant&quot; requires clearing a Bonferroni-corrected threshold (&alpha;=
                        {stats.significance.bonferroniAlpha.toFixed(4)}) across the {stats.significance.testedAtK.length * 4}{" "}
                        tests run, not just the raw p&lt;0.05 cutoff.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">vs. Baseline (geo-only)</p>
                        {stats.significance.testedAtK.map((k) => (
                            <div key={k}>
                                <SignificanceRow
                                    label={`Precision@${k}`}
                                    result={stats.significance.vsBaseline.precision[k]}
                                />
                                <SignificanceRow
                                    label={`Recall@${k}`}
                                    result={stats.significance.vsBaseline.recall[k]}
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">vs. Random (floor)</p>
                        {stats.significance.testedAtK.map((k) => (
                            <div key={k}>
                                <SignificanceRow
                                    label={`Precision@${k}`}
                                    result={stats.significance.vsRandom.precision[k]}
                                />
                                <SignificanceRow
                                    label={`Recall@${k}`}
                                    result={stats.significance.vsRandom.recall[k]}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-[#8B6F47]" />
                        How to read this
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-600">
                    <p>
                        <strong className="text-gray-800">Precision@K:</strong> of the top K shops recommended, what share did
                        the user actually interact with in the held-out test period.
                    </p>
                    <p>
                        <strong className="text-gray-800">Recall@K:</strong> of everything the user interacted with in the
                        test period, what share appeared in the top K recommendations.
                    </p>
                    <p>
                        <strong className="text-gray-800">NDCG@K:</strong> like precision, but rank-aware -- a relevant shop
                        ranked 1st counts for more than one ranked 10th, so it captures whether the engine is ordering
                        results well, not just retrieving the right set.
                    </p>
                    <p>
                        <strong className="text-gray-800">Baseline (geo-only):</strong> the same scoring pipeline with an
                        empty interest profile -- distance, popularity and recency only, no personalization.
                    </p>
                    <p>
                        <strong className="text-gray-800">Random (floor):</strong> shops within radius in random order,
                        establishing the lower bound any real ranking should clear.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
