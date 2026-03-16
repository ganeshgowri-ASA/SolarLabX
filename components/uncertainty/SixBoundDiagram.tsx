// @ts-nocheck
"use client"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SixBoundProps {
  measurand: string
  measuredValue: number
  unit: string
  combinedUncertainty: number
  coverageFactors?: { k: number; confidence: string; label: string }[]
  standardRef?: string
  testType?: string
}

const DEFAULT_COVERAGE = [
  { k: 1, confidence: "68.27%", label: "1 sigma" },
  { k: 1.65, confidence: "90.00%", label: "1.65 sigma" },
  { k: 1.96, confidence: "95.00%", label: "1.96 sigma" },
  { k: 2, confidence: "95.45%", label: "2 sigma" },
  { k: 2.58, confidence: "99.00%", label: "2.58 sigma" },
  { k: 3, confidence: "99.73%", label: "3 sigma" },
]

const BOUND_COLORS = [
  { bg: "#fee2e2", border: "#ef4444", text: "text-red-700" },
  { bg: "#ffedd5", border: "#f97316", text: "text-orange-700" },
  { bg: "#fef9c3", border: "#eab308", text: "text-yellow-700" },
  { bg: "#dcfce7", border: "#22c55e", text: "text-green-700" },
  { bg: "#dbeafe", border: "#3b82f6", text: "text-blue-700" },
  { bg: "#ede9fe", border: "#8b5cf6", text: "text-purple-700" },
]

export function SixBoundDiagram({
  measurand,
  measuredValue,
  unit,
  combinedUncertainty,
  coverageFactors = DEFAULT_COVERAGE,
  standardRef = "JCGM 100:2008 (GUM)",
  testType = "General",
}: SixBoundProps) {
  const bounds = useMemo(() => {
    return coverageFactors.map((cf, i) => ({
      ...cf,
      expanded: cf.k * combinedUncertainty,
      lower: measuredValue - cf.k * combinedUncertainty,
      upper: measuredValue + cf.k * combinedUncertainty,
      color: BOUND_COLORS[i % BOUND_COLORS.length],
    }))
  }, [measuredValue, combinedUncertainty, coverageFactors])

  const maxExpanded = bounds.length > 0 ? bounds[bounds.length - 1].expanded : 1
  const svgWidth = 700
  const svgHeight = 320
  const centerX = svgWidth / 2
  const centerY = 180
  const maxBarHalf = 280

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">6-Bound Uncertainty Diagram</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{standardRef}</Badge>
            <Badge variant="secondary">{testType}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Coverage intervals per GUM / ILAC-G17:01/2021 for {measurand} ({unit})
        </p>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Title */}
          <text x={centerX} y={20} textAnchor="middle" className="text-xs" fill="#64748b" fontSize="11">
            Measured Value: {measuredValue.toFixed(4)} {unit} | u_c = {combinedUncertainty.toFixed(4)} {unit}
          </text>

          {/* Bounds - drawn from outermost to innermost */}
          {[...bounds].reverse().map((b, ri) => {
            const i = bounds.length - 1 - ri
            const halfWidth = maxExpanded > 0 ? (b.expanded / maxExpanded) * maxBarHalf : 0
            const barHeight = 28 + i * 6
            const y = centerY - barHeight / 2
            return (
              <g key={b.label}>
                <rect
                  x={centerX - halfWidth}
                  y={y}
                  width={halfWidth * 2}
                  height={barHeight}
                  rx={4}
                  fill={b.color.bg}
                  stroke={b.color.border}
                  strokeWidth={1.5}
                  opacity={0.85}
                />
                {/* Left bound label */}
                <text x={centerX - halfWidth - 4} y={y + barHeight / 2 + 4} textAnchor="end" fontSize="9" fill={b.color.border}>
                  {b.lower.toFixed(3)}
                </text>
                {/* Right bound label */}
                <text x={centerX + halfWidth + 4} y={y + barHeight / 2 + 4} textAnchor="start" fontSize="9" fill={b.color.border}>
                  {b.upper.toFixed(3)}
                </text>
              </g>
            )
          })}

          {/* Center line */}
          <line x1={centerX} y1={centerY - 50} x2={centerX} y2={centerY + 50} stroke="#1e293b" strokeWidth={2} strokeDasharray="4 2" />
          <circle cx={centerX} cy={centerY} r={4} fill="#1e293b" />
          <text x={centerX} y={centerY + 65} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e293b">
            {measuredValue.toFixed(4)} {unit}
          </text>

          {/* Legend */}
          {bounds.map((b, i) => {
            const lx = 20 + (i % 3) * 235
            const ly = 260 + Math.floor(i / 3) * 22
            return (
              <g key={`leg-${b.label}`}>
                <rect x={lx} y={ly - 8} width={14} height={14} rx={2} fill={b.color.bg} stroke={b.color.border} strokeWidth={1} />
                <text x={lx + 20} y={ly + 3} fontSize="10" fill="#334155">
                  k={b.k} ({b.confidence}) U = {"\u00B1"}{b.expanded.toFixed(4)} {unit}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tabular summary */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Coverage Factor (k)</th>
                <th className="text-left p-2">Confidence Level</th>
                <th className="text-right p-2">Expanded U</th>
                <th className="text-right p-2">Lower Bound</th>
                <th className="text-right p-2">Upper Bound</th>
                <th className="text-right p-2">Interval Width</th>
              </tr>
            </thead>
            <tbody>
              {bounds.map((b) => (
                <tr key={b.label} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono">{b.k.toFixed(2)}</td>
                  <td className="p-2">
                    <Badge style={{ backgroundColor: b.color.bg, color: b.color.border, borderColor: b.color.border }} variant="outline">
                      {b.confidence}
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-mono">{"\u00B1"}{b.expanded.toFixed(4)} {unit}</td>
                  <td className="p-2 text-right font-mono">{b.lower.toFixed(4)}</td>
                  <td className="p-2 text-right font-mono">{b.upper.toFixed(4)}</td>
                  <td className="p-2 text-right font-mono">{(b.expanded * 2).toFixed(4)} {unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Reference: {standardRef} | ILAC-G17:01/2021 | Coverage probability assumes normal (Gaussian) distribution with effective degrees of freedom {"\u2265"} 30.
        </p>
      </CardContent>
    </Card>
  )
}
