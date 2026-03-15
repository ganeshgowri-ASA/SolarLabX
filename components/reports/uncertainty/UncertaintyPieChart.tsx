// @ts-nocheck
"use client"

import React, { useState } from "react"

export interface UncertaintyCategoryData {
  category: string
  contribution: number
  color: string
}

export interface UncertaintyPieChartProps {
  data: UncertaintyCategoryData[]
  title?: string
  size?: number
}

const DEFAULT_COLORS = ["#2563eb", "#dc2626", "#059669", "#d97706", "#7c3aed", "#0891b2", "#e11d48", "#4f46e5"]

export function UncertaintyPieChart({
  data,
  title = "Uncertainty Contribution by Category",
  size = 280,
}: UncertaintyPieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.contribution, 0)
  const radius = size / 2 - 30
  const innerRadius = radius * 0.55
  const cx = size / 2
  const cy = size / 2

  let currentAngle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const pct = total > 0 ? d.contribution / total : 0
    const angle = pct * 2 * Math.PI
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    const midAngle = startAngle + angle / 2
    const largeArc = angle > Math.PI ? 1 : 0

    const outerR = hovered === i ? radius + 6 : radius
    const x1o = cx + outerR * Math.cos(startAngle)
    const y1o = cy + outerR * Math.sin(startAngle)
    const x2o = cx + outerR * Math.cos(endAngle)
    const y2o = cy + outerR * Math.sin(endAngle)
    const x1i = cx + innerRadius * Math.cos(endAngle)
    const y1i = cy + innerRadius * Math.sin(endAngle)
    const x2i = cx + innerRadius * Math.cos(startAngle)
    const y2i = cy + innerRadius * Math.sin(startAngle)

    const path = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2i} ${y2i}`,
      "Z",
    ].join(" ")

    const labelR = radius + 20
    const labelX = cx + labelR * Math.cos(midAngle)
    const labelY = cy + labelR * Math.sin(midAngle)

    return { ...d, path, pct, midAngle, labelX, labelY, color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length], index: i }
  })

  return (
    <div className="bg-white rounded-lg border p-4 uncertainty-pie-chart">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      <div className="flex items-start gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((s) => (
            <path
              key={s.category}
              d={s.path}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
              opacity={hovered !== null && hovered !== s.index ? 0.5 : 1}
              onMouseEnter={() => setHovered(s.index)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10} fill="#6b7280">
            Total
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#1f2937">
            100%
          </text>
        </svg>
        <div className="flex-1 space-y-1.5 text-xs">
          {slices.map((s) => (
            <div
              key={s.category}
              className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${hovered === s.index ? "bg-gray-100" : ""}`}
              onMouseEnter={() => setHovered(s.index)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1">{s.category}</span>
              <span className="font-mono font-semibold">{(s.pct * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Default Data ──────────────────────────────────────────────────────────────

export const DEFAULT_UNCERTAINTY_PIE_DATA: UncertaintyCategoryData[] = [
  { category: "Reference Standard", contribution: 54.2, color: "#0891b2" },
  { category: "Irradiance", contribution: 28.2, color: "#2563eb" },
  { category: "Spectral Mismatch", contribution: 10.2, color: "#16a34a" },
  { category: "Temperature", contribution: 4.3, color: "#ea580c" },
  { category: "Non-uniformity", contribution: 2.9, color: "#9333ea" },
  { category: "Repeatability", contribution: 0.8, color: "#dc2626" },
]
