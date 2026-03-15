// @ts-nocheck
"use client"

import React from "react"

export interface UncertaintyRow {
  id: string
  component: string
  category: string
  source: string
  value: number
  type: "A" | "B"
  distribution: "normal" | "uniform" | "triangular" | "u-shaped" | "lognormal"
  divisor: number
  standardUncertainty: number
  sensitivityCoefficient: number
  contribution: number
  percentContribution: number
}

export interface ReportUncertaintyBudgetTableProps {
  rows: UncertaintyRow[]
  measurand: string
  measuredValue: number
  unit: string
  combinedUncertainty: number
  coverageFactor: number
  expandedUncertainty: number
  coverageProbability?: number
  title?: string
  compact?: boolean
}

const DIST_LABELS: Record<string, string> = {
  normal: "Normal (k=2)",
  uniform: "Rectangular",
  triangular: "Triangular",
  "u-shaped": "U-Shaped",
  lognormal: "Log-Normal",
}

export function ReportUncertaintyBudgetTable({
  rows,
  measurand,
  measuredValue,
  unit,
  combinedUncertainty,
  coverageFactor,
  expandedUncertainty,
  coverageProbability = 95.45,
  title = "Uncertainty Budget",
  compact = false,
}: ReportUncertaintyBudgetTableProps) {
  const maxPct = Math.max(...rows.map((r) => r.percentContribution), 1)
  const relativeU = measuredValue > 0 ? (expandedUncertainty / measuredValue) * 100 : 0

  const fontSize = compact ? "7pt" : "8.5pt"
  const cellPad = compact ? "3px 4px" : "5px 8px"

  return (
    <div className="bg-white rounded-lg border p-4 report-uncertainty-budget" style={{ fontSize }}>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">
        {measurand} = {measuredValue} {unit} · GUM JCGM 100:2008
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ fontSize }}>
          <thead>
            <tr className="bg-gray-100">
              {["Component", "Category", "Source", "Value", "Type", "Distribution", "Divisor", "u(xi)", "ci", "ci²·u²(xi)", "% Contrib."].map((h) => (
                <th key={h} className="border border-gray-300 text-left font-semibold" style={{ padding: cellPad }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 font-medium" style={{ padding: cellPad }}>{row.component}</td>
                <td className="border border-gray-200" style={{ padding: cellPad }}>{row.category}</td>
                <td className="border border-gray-200" style={{ padding: cellPad }}>{row.source}</td>
                <td className="border border-gray-200 text-right font-mono" style={{ padding: cellPad }}>{row.value.toFixed(4)}</td>
                <td className="border border-gray-200 text-center" style={{ padding: cellPad }}>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${
                    row.type === "A" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {row.type}
                  </span>
                </td>
                <td className="border border-gray-200" style={{ padding: cellPad }}>{DIST_LABELS[row.distribution] || row.distribution}</td>
                <td className="border border-gray-200 text-center font-mono" style={{ padding: cellPad }}>{row.divisor.toFixed(2)}</td>
                <td className="border border-gray-200 text-right font-mono" style={{ padding: cellPad }}>{row.standardUncertainty.toExponential(3)}</td>
                <td className="border border-gray-200 text-right font-mono" style={{ padding: cellPad }}>{row.sensitivityCoefficient.toFixed(2)}</td>
                <td className="border border-gray-200 text-right font-mono" style={{ padding: cellPad }}>{row.contribution.toExponential(3)}</td>
                <td className="border border-gray-200" style={{ padding: cellPad }}>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden" style={{ minWidth: 40 }}>
                      <div
                        className={`h-full rounded-full ${
                          row.percentContribution > 40 ? "bg-red-500" : row.percentContribution > 20 ? "bg-orange-500" : row.percentContribution > 8 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${(row.percentContribution / maxPct) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs w-10 text-right">{row.percentContribution.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 font-semibold">
              <td colSpan={7} className="border border-gray-300 text-right" style={{ padding: cellPad }}>
                Combined Standard Uncertainty u<sub>c</sub> (k=1)
              </td>
              <td className="border border-gray-300 text-right font-mono" style={{ padding: cellPad }}>
                {combinedUncertainty.toExponential(3)}
              </td>
              <td colSpan={3} className="border border-gray-300" style={{ padding: cellPad }}>
                {((combinedUncertainty / measuredValue) * 100).toFixed(3)}% (relative)
              </td>
            </tr>
            <tr className="bg-blue-100 font-bold">
              <td colSpan={7} className="border border-gray-300 text-right" style={{ padding: cellPad }}>
                Expanded Uncertainty U (k={coverageFactor.toFixed(2)}, {coverageProbability}%)
              </td>
              <td className="border border-gray-300 text-right font-mono" style={{ padding: cellPad }}>
                {expandedUncertainty.toExponential(3)}
              </td>
              <td colSpan={3} className="border border-gray-300" style={{ padding: cellPad }}>
                ±{relativeU.toFixed(2)}% (relative)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
        <strong>Result:</strong> {measurand} = {measuredValue} ± {expandedUncertainty.toFixed(4)} {unit} (k={coverageFactor.toFixed(2)}, {coverageProbability}% confidence)
      </div>
    </div>
  )
}

// ─── Default Demo Data ───────────────────────────────────────────────────────

export const DEFAULT_PMAX_UNCERTAINTY_ROWS: UncertaintyRow[] = [
  { id: "u1", component: "Irradiance", category: "Equipment", source: "Spatial non-uniformity (%)", value: 0.50, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.002887, sensitivityCoefficient: 1.0, contribution: 8.33e-6, percentContribution: 28.2 },
  { id: "u2", component: "Temperature", category: "Environment", source: "Module temp sensor (°C)", value: 0.50, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.002500, sensitivityCoefficient: 0.45, contribution: 1.27e-6, percentContribution: 4.3 },
  { id: "u3", component: "Spectral Mismatch", category: "Method", source: "MMF correction (%)", value: 0.30, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.001732, sensitivityCoefficient: 1.0, contribution: 3.0e-6, percentContribution: 10.2 },
  { id: "u4", component: "Repeatability", category: "Method", source: "10 measurements (type A)", value: 0.15, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.000474, sensitivityCoefficient: 1.0, contribution: 2.25e-7, percentContribution: 0.8 },
  { id: "u5", component: "Calibration", category: "Reference Standard", source: "Ref cell cal cert (PTB)", value: 0.80, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.004000, sensitivityCoefficient: 1.0, contribution: 1.6e-5, percentContribution: 54.2 },
  { id: "u6", component: "DAQ Resolution", category: "Equipment", source: "ADC resolution (V, A)", value: 0.02, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.000115, sensitivityCoefficient: 1.0, contribution: 1.33e-8, percentContribution: 0.05 },
  { id: "u7", component: "Non-uniformity", category: "Equipment", source: "Irradiance spatial (%)", value: 0.20, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.001155, sensitivityCoefficient: 0.80, contribution: 8.53e-7, percentContribution: 2.9 },
]

export const DEFAULT_UNCERTAINTY_BUDGET = {
  rows: DEFAULT_PMAX_UNCERTAINTY_ROWS,
  measurand: "Pmax",
  measuredValue: 432.0,
  unit: "W",
  combinedUncertainty: 0.00543,
  coverageFactor: 2.0,
  expandedUncertainty: 0.01086,
  coverageProbability: 95.45,
}
