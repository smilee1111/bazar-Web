"use client";

interface BarDatum {
    label: string;
    value: number;
}

interface SimpleBarChartProps {
    data: BarDatum[];
    color?: string;
    valueFormat?: (v: number) => string;
    maxBars?: number;
}

// Sequential single-hue bars: the safe default for "compare magnitude" per the dataviz method --
// these charts rank sources/categories/cities/buckets by count, not by identity.
const DEFAULT_COLOR = "#2a78d6";

export default function SimpleBarChart({ data, color = DEFAULT_COLOR, valueFormat = (v) => String(v), maxBars = 8 }: SimpleBarChartProps) {
    const shown = data.slice(0, maxBars);
    const overflowCount = data.length - shown.length;
    const max = Math.max(...data.map((d) => d.value), 1);

    if (data.length === 0) {
        return <p className="text-sm text-gray-400">No data yet.</p>;
    }

    return (
        <div className="space-y-2.5">
            {shown.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 truncate text-xs text-gray-600" title={d.label}>
                        {d.label}
                    </div>
                    <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.max((d.value / max) * 100, 2)}%`, background: color }}
                        />
                    </div>
                    <div className="w-14 shrink-0 text-right text-xs font-mono tabular-nums text-gray-700">
                        {valueFormat(d.value)}
                    </div>
                </div>
            ))}
            {overflowCount > 0 && (
                <p className="text-xs text-gray-400 pt-1">+{overflowCount} more</p>
            )}
        </div>
    );
}
