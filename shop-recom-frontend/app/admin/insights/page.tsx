"use client";

import { useEffect, useState } from "react";
import { Store, Globe, Users, Activity, AlertCircle, Loader2, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { handleGetDatasetOverview, handleGetInteractionOverview } from "@/lib/actions/eda-action";
import SimpleBarChart from "./_components/SimpleBarChart";
import StackedBarChart, { StackedBarDatum, SeriesLegendEntry } from "./_components/StackedBarChart";
import TrendLineChart from "./_components/TrendLineChart";

// Dataviz-skill validated categorical slots 1-3, same ones used on the evaluation dashboard.
const SOURCE_COLORS = ["#2a78d6", "#eb6834", "#1baf7a"];
const OTHER_COLOR = "#c3c2b7";

interface DatasetOverview {
    totalShops: number;
    shopsBySource: Array<{ source: string; count: number }>;
    shopsByCategory: Array<{ categoryName: string; bySource: Record<string, number>; total: number }>;
    shopsByCity: Array<{ city: string; count: number }>;
    completenessBySource: Array<{
        source: string;
        totalShops: number;
        withPhotoPct: number;
        withDescriptionPct: number;
        withWebsitePct: number;
        withReviewPct: number;
    }>;
}

interface InteractionOverview {
    totalEvents: number;
    activeUsers: number;
    byEventType: Array<{ eventType: string; count: number }>;
    perUserHistogram: Array<{ bucket: string; userCount: number }>;
    dailyTrend: Array<{ date: string; count: number }>;
}

function StatTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
    return (
        <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">{label}</p>
                    <div className="p-2 bg-[#FAF4EC] rounded-xl">
                        <Icon className="h-4 w-4 text-[#8B6F47]" />
                    </div>
                </div>
                <p className="mt-1 text-2xl font-bold text-[#2D2318] tabular-nums">{value}</p>
            </CardContent>
        </Card>
    );
}

function CompletenessCell({ pct }: { pct: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: `${Math.max(pct * 100, 2)}%` }} />
            </div>
            <span className="text-xs font-mono tabular-nums text-gray-600">{(pct * 100).toFixed(0)}%</span>
        </div>
    );
}

export default function InsightsPage() {
    const [loading, setLoading] = useState(true);
    const [dataset, setDataset] = useState<DatasetOverview | null>(null);
    const [interactions, setInteractions] = useState<InteractionOverview | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            const [datasetRes, interactionRes] = await Promise.all([
                handleGetDatasetOverview(),
                handleGetInteractionOverview()
            ]);
            if (datasetRes.success && interactionRes.success) {
                setDataset(datasetRes.data);
                setInteractions(interactionRes.data);
            } else {
                setError(datasetRes.message || interactionRes.message);
            }
            setLoading(false);
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B6F47]" />
            </div>
        );
    }

    if (error || !dataset || !interactions) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                <p className="text-xl font-semibold text-gray-900">Failed to load dataset insights</p>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    // Fold sources beyond the top 3 into "Other" -- keeps the stacked chart within the
    // dataviz method's all-pairs-safe categorical series cap.
    const topSources = dataset.shopsBySource.slice(0, 3).map((s) => s.source);
    const sourceLegend: SeriesLegendEntry[] = topSources.map((source, i) => ({
        key: source,
        label: source,
        color: SOURCE_COLORS[i]
    }));
    const hasOther = dataset.shopsBySource.length > 3;
    if (hasOther) {
        sourceLegend.push({ key: "other", label: "Other", color: OTHER_COLOR });
    }

    const categoryStackData: StackedBarDatum[] = dataset.shopsByCategory.map((c) => {
        const segments = topSources.map((source) => ({ key: source, value: c.bySource[source] || 0 }));
        if (hasOther) {
            const otherCount = Object.entries(c.bySource)
                .filter(([src]) => !topSources.includes(src))
                .reduce((sum, [, count]) => sum + count, 0);
            segments.push({ key: "other", value: otherCount });
        }
        return { label: c.categoryName, segments, total: c.total };
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-[#2D2318]">Data Insights</h1>
                <p className="text-gray-500 mt-2">
                    Descriptive statistics for the aggregated shop dataset and logged user interactions -- the evidence
                    base behind the recommendation and evaluation results.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile icon={Store} label="Total Shops" value={dataset.totalShops} />
                <StatTile icon={Globe} label="Data Sources" value={dataset.shopsBySource.length} />
                <StatTile icon={Activity} label="Interaction Events" value={interactions.totalEvents} />
                <StatTile icon={Users} label="Active Users" value={interactions.activeUsers} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Shops by Source</CardTitle>
                        <CardDescription>How much each crawler (and manual seller submissions) contributed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart
                            data={dataset.shopsBySource.map((s) => ({ label: s.source, value: s.count }))}
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Shops by City</CardTitle>
                        <CardDescription>Bucketed by nearest known city center.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart data={dataset.shopsByCity.map((c) => ({ label: c.city, value: c.count }))} />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Shops by Category, per Source</CardTitle>
                    <CardDescription>Which categories each source actually added coverage to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <StackedBarChart data={categoryStackData} legend={sourceLegend} maxBars={10} />
                </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Data Completeness by Source</CardTitle>
                    <CardDescription>
                        Share of each source&apos;s shops that have a photo, description, website link, or at least one review.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                                    <th className="py-2 pr-4">Source</th>
                                    <th className="py-2 pr-4">Shops</th>
                                    <th className="py-2 pr-4">Has Photo</th>
                                    <th className="py-2 pr-4">Has Description</th>
                                    <th className="py-2 pr-4">Has Website</th>
                                    <th className="py-2 pr-4">Has Review</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataset.completenessBySource.map((row) => (
                                    <tr key={row.source} className="border-t border-gray-100">
                                        <td className="py-2 pr-4 font-medium text-gray-700">{row.source}</td>
                                        <td className="py-2 pr-4 text-gray-500 tabular-nums">{row.totalShops}</td>
                                        <td className="py-2 pr-4">
                                            <CompletenessCell pct={row.withPhotoPct} />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <CompletenessCell pct={row.withDescriptionPct} />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <CompletenessCell pct={row.withWebsitePct} />
                                        </td>
                                        <td className="py-2 pr-4">
                                            <CompletenessCell pct={row.withReviewPct} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Interactions by Event Type</CardTitle>
                        <CardDescription>What users are actually doing on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart
                            data={interactions.byEventType.map((e) => ({ label: e.eventType, value: e.count }))}
                            color="#eb6834"
                        />
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Interactions per User</CardTitle>
                        <CardDescription>
                            How much history users have -- the evaluation&apos;s minimum-history threshold trades off
                            against how many users clear it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SimpleBarChart
                            data={interactions.perUserHistogram.map((h) => ({ label: h.bucket, value: h.userCount }))}
                            color="#1baf7a"
                        />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Daily Interaction Volume (last 30 days)</CardTitle>
                    <CardDescription>Platform activity trend feeding the recommendation and evaluation pipelines.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TrendLineChart points={interactions.dailyTrend.map((d) => ({ label: d.date, value: d.count }))} />
                </CardContent>
            </Card>
        </div>
    );
}
