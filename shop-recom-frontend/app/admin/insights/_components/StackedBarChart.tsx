"use client";

export interface StackedSegment {
    key: string;
    value: number;
}

export interface StackedBarDatum {
    label: string;
    segments: StackedSegment[];
    total: number;
}

export interface SeriesLegendEntry {
    key: string;
    label: string;
    color: string;
}

interface StackedBarChartProps {
    data: StackedBarDatum[];
    legend: SeriesLegendEntry[];
    maxBars?: number;
}

export default function StackedBarChart({ data, legend, maxBars = 8 }: StackedBarChartProps) {
    const shown = data.slice(0, maxBars);
    const overflowCount = data.length - shown.length;
    const max = Math.max(...data.map((d) => d.total), 1);
    const colorFor = (key: string) => legend.find((l) => l.key === key)?.color || "#c3c2b7";

    if (data.length === 0) {
        return <p className="text-sm text-gray-400">No data yet.</p>;
    }

    return (
        <div>
            <div className="flex flex-wrap items-center gap-4 mb-3">
                {legend.map((l) => (
                    <div key={l.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                        {l.label}
                    </div>
                ))}
            </div>
            <div className="space-y-2.5">
                {shown.map((d) => (
                    <div key={d.label} className="flex items-center gap-3">
                        <div className="w-28 shrink-0 truncate text-xs text-gray-600" title={d.label}>
                            {d.label}
                        </div>
                        <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden flex">
                            {d.segments.map((seg, i) => (
                                <div
                                    key={seg.key}
                                    className={i > 0 ? "h-full ml-[2px]" : "h-full"}
                                    style={{
                                        width: `${Math.max((seg.value / max) * 100, seg.value > 0 ? 1 : 0)}%`,
                                        background: colorFor(seg.key)
                                    }}
                                    title={`${seg.key}: ${seg.value}`}
                                />
                            ))}
                        </div>
                        <div className="w-10 shrink-0 text-right text-xs font-mono tabular-nums text-gray-700">
                            {d.total}
                        </div>
                    </div>
                ))}
            </div>
            {overflowCount > 0 && <p className="text-xs text-gray-400 pt-2">+{overflowCount} more categories</p>}
        </div>
    );
}
