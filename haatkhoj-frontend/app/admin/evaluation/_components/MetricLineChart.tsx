"use client";

import { useState } from "react";

interface SeriesPoint {
    k: number;
    value: number;
}

interface Series {
    key: string;
    label: string;
    color: string;
    points: SeriesPoint[];
}

interface MetricLineChartProps {
    title: string;
    series: Series[];
    kValues: number[];
    valueFormat?: (v: number) => string;
}

const WIDTH = 520;
const HEIGHT = 240;
const PADDING = { top: 16, right: 78, bottom: 28, left: 36 };
const PLOT_W = WIDTH - PADDING.left - PADDING.right;
const PLOT_H = HEIGHT - PADDING.top - PADDING.bottom;
const GRID_LINES = [0, 0.25, 0.5, 0.75, 1.0];

// Colors are the dataviz skill's validated categorical slots 1-3 (blue/orange/aqua), checked
// against this admin panel's white card surface -- slot 3 (aqua) sits at 2.82:1 contrast, which
// is why every line also carries a direct end-label and a table view exists as relief.
export default function MetricLineChart({ title, series, kValues, valueFormat = (v) => v.toFixed(2) }: MetricLineChartProps) {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const [showTable, setShowTable] = useState(false);

    const xFor = (i: number) => PADDING.left + (kValues.length > 1 ? (i / (kValues.length - 1)) * PLOT_W : PLOT_W / 2);
    const yFor = (v: number) => PADDING.top + (1 - Math.min(Math.max(v, 0), 1)) * PLOT_H;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-[#142A1C]">{title}</h4>
                <button
                    onClick={() => setShowTable((s) => !s)}
                    className="text-xs font-medium text-[#267A4C] hover:text-[#6B4F33] underline underline-offset-2"
                >
                    {showTable ? "View chart" : "View table"}
                </button>
            </div>

            {showTable ? (
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left py-1.5 text-gray-500 font-medium">K</th>
                            {series.map((s) => (
                                <th key={s.key} className="text-right py-1.5 font-medium" style={{ color: s.color }}>
                                    {s.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {kValues.map((k, i) => (
                            <tr key={k} className="border-t border-gray-100">
                                <td className="py-1.5 text-gray-700">{k}</td>
                                {series.map((s) => (
                                    <td key={s.key} className="text-right py-1.5 font-mono tabular-nums">
                                        {valueFormat(s.points[i]?.value ?? 0)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="relative">
                    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label={`${title} across K`}>
                        {GRID_LINES.map((g) => (
                            <g key={g}>
                                <line
                                    x1={PADDING.left}
                                    x2={WIDTH - PADDING.right}
                                    y1={yFor(g)}
                                    y2={yFor(g)}
                                    stroke="#e1e0d9"
                                    strokeWidth={1}
                                />
                                <text x={PADDING.left - 6} y={yFor(g) + 3} textAnchor="end" fontSize={9} fill="#898781">
                                    {g.toFixed(2)}
                                </text>
                            </g>
                        ))}

                        {kValues.map((k, i) => (
                            <text key={k} x={xFor(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={9} fill="#898781">
                                K={k}
                            </text>
                        ))}

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

                        {series.map((s) => {
                            const d = s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.value)}`).join(" ");
                            const last = s.points[s.points.length - 1];
                            return (
                                <g key={s.key}>
                                    <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    {s.points.map((p, i) => (
                                        <circle
                                            key={i}
                                            cx={xFor(i)}
                                            cy={yFor(p.value)}
                                            r={hoverIdx === i ? 5 : 3.5}
                                            fill={s.color}
                                            stroke="#fff"
                                            strokeWidth={1.5}
                                            onMouseEnter={() => setHoverIdx(i)}
                                            onMouseLeave={() => setHoverIdx(null)}
                                        />
                                    ))}
                                    {last && (
                                        <text x={xFor(s.points.length - 1) + 8} y={yFor(last.value) + 3} fontSize={10} fill={s.color} fontWeight={600}>
                                            {s.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {hoverIdx !== null && (
                        <div className="absolute top-2 left-10 bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs space-y-1 pointer-events-none">
                            <div className="font-semibold text-gray-700">K={kValues[hoverIdx]}</div>
                            {series.map((s) => (
                                <div key={s.key} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                    <span className="text-gray-600">{s.label}:</span>
                                    <span className="font-mono font-medium tabular-nums">{valueFormat(s.points[hoverIdx]?.value ?? 0)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-2">
                {series.map((s) => (
                    <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        {s.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
