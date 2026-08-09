"use client";

import { useState } from "react";

interface TrendPoint {
    label: string;
    value: number;
}

interface TrendLineChartProps {
    points: TrendPoint[];
    color?: string;
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 24, left: 32 };
const PLOT_W = WIDTH - PADDING.left - PADDING.right;
const PLOT_H = HEIGHT - PADDING.top - PADDING.bottom;

// Single series -> one hue, no legend needed (the chart title names the series).
const DEFAULT_COLOR = "#2a78d6";

export default function TrendLineChart({ points, color = DEFAULT_COLOR }: TrendLineChartProps) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    if (points.length === 0) {
        return <p className="text-sm text-gray-400">No data yet.</p>;
    }

    const maxVal = Math.max(...points.map((p) => p.value), 1);
    const xFor = (i: number) => PADDING.left + (points.length > 1 ? (i / (points.length - 1)) * PLOT_W : PLOT_W / 2);
    const yFor = (v: number) => PADDING.top + (1 - v / maxVal) * PLOT_H;

    // Thin x-axis labels so ~30 daily ticks don't collide
    const tickEvery = Math.max(1, Math.ceil(points.length / 8));

    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`).join(" ");

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Daily interactions trend">
                {[0, 0.5, 1].map((g) => (
                    <line
                        key={g}
                        x1={PADDING.left}
                        x2={WIDTH - PADDING.right}
                        y1={PADDING.top + g * PLOT_H}
                        y2={PADDING.top + g * PLOT_H}
                        stroke="#e1e0d9"
                        strokeWidth={1}
                    />
                ))}

                {points.map((p, i) =>
                    i % tickEvery === 0 ? (
                        <text key={p.label} x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fontSize={9} fill="#898781">
                            {p.label.slice(5)}
                        </text>
                    ) : null
                )}

                {hoverIdx !== null && (
                    <line
                        x1={xFor(hoverIdx)}
                        x2={xFor(hoverIdx)}
                        y1={PADDING.top}
                        y2={HEIGHT - PADDING.bottom}
                        stroke="#c3c2b7"
                        strokeWidth={1}
                        strokeDasharray="2,2"
                    />
                )}

                <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle
                        key={p.label}
                        cx={xFor(i)}
                        cy={yFor(p.value)}
                        r={hoverIdx === i ? 4.5 : 2.5}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={1}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                    />
                ))}
            </svg>

            {hoverIdx !== null && (
                <div className="absolute top-2 left-10 bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs pointer-events-none">
                    <div className="font-semibold text-gray-700">{points[hoverIdx].label}</div>
                    <div className="text-gray-600">{points[hoverIdx].value} events</div>
                </div>
            )}
        </div>
    );
}
