// @ts-nocheck
"use client"

import React, { useState } from "react"

export interface FishboneSource {
  id: string
  name: string
  value?: number
  unit?: string
  description?: string
}

export interface FishboneCategory {
  name: string
  color: string
  sources: FishboneSource[]
}

export interface ReportFishboneDiagramProps {
  categories: FishboneCategory[]
  measurand: string
  title?: string
  editable?: boolean
  onSourceEdit?: (categoryName: string, sourceId: string, value: number) => void
}

export function ReportFishboneDiagram({
  categories,
  measurand,
  title = "Ishikawa (Fishbone) Diagram — Uncertainty Sources",
  editable = false,
  onSourceEdit,
}: ReportFishboneDiagramProps) {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null)
  const [editingSource, setEditingSource] = useState<string | null>(null)

  const activeCategories = categories.filter((c) => c.sources.length > 0)

  const width = 960
  const spineY = 220
  const spineStartX = 40
  const spineEndX = 920
  const headWidth = 30
  const branchLength = 140
  const svgHeight = 480

  const topCats = activeCategories.filter((_, i) => i % 2 === 0)
  const bottomCats = activeCategories.filter((_, i) => i % 2 === 1)
  const spacing = (spineEndX - spineStartX - headWidth - 80) / Math.max(activeCategories.length, 1)

  return (
    <div className="bg-white rounded-lg border p-4 fishbone-diagram">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        {editable && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Admin Edit Mode</span>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${svgHeight}`} className="w-full" style={{ minWidth: 700, maxHeight: 520 }}>
          <rect width={width} height={svgHeight} fill="#fafafa" rx={8} />

          {/* Main spine */}
          <line x1={spineStartX} y1={spineY} x2={spineEndX - headWidth} y2={spineY} stroke="#374151" strokeWidth={3} />

          {/* Fish head */}
          <polygon
            points={`${spineEndX - headWidth},${spineY - 16} ${spineEndX},${spineY} ${spineEndX - headWidth},${spineY + 16}`}
            fill="#374151"
          />
          <text x={spineEndX - headWidth - 10} y={spineY + 5} textAnchor="end" fontSize={13} fontWeight="bold" fill="#1f2937">
            {measurand}
          </text>

          {/* Category branches */}
          {activeCategories.map((cat, i) => {
            const direction = i % 2 === 0 ? "up" : "down"
            const sign = direction === "up" ? -1 : 1
            const cx = spineStartX + 70 + i * spacing
            const endY = spineY + sign * branchLength
            const angleX = cx + 45

            return (
              <g key={cat.name}>
                {/* Main branch line */}
                <line x1={angleX} y1={spineY} x2={cx} y2={endY} stroke={cat.color} strokeWidth={2.5} opacity={0.8} />

                {/* Category label box */}
                <rect
                  x={cx - 60}
                  y={endY + sign * 5 - (direction === "up" ? 20 : 0)}
                  width={120}
                  height={22}
                  rx={4}
                  fill={cat.color}
                  opacity={0.9}
                />
                <text
                  x={cx}
                  y={endY + sign * 5 + (direction === "up" ? -5 : 15)}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="bold"
                  fill="white"
                >
                  {cat.name}
                </text>

                {/* Sub-branches */}
                {cat.sources.map((src, idx) => {
                  const subY = direction === "up"
                    ? spineY - 18 - idx * 24
                    : spineY + 18 + idx * 24
                  const t = (subY - spineY) / (endY - spineY)
                  const branchX = angleX + t * (cx - angleX)
                  const labelX = branchX - 8
                  const isHovered = hoveredSource === src.id
                  const isEditing = editingSource === src.id

                  return (
                    <g
                      key={src.id}
                      onMouseEnter={() => setHoveredSource(src.id)}
                      onMouseLeave={() => setHoveredSource(null)}
                      style={{ cursor: editable ? "pointer" : "default" }}
                      onClick={() => {
                        if (editable) setEditingSource(isEditing ? null : src.id)
                      }}
                    >
                      <line
                        x1={branchX}
                        y1={subY}
                        x2={labelX - 2}
                        y2={subY}
                        stroke={cat.color}
                        strokeWidth={isHovered ? 2 : 1}
                        opacity={isHovered ? 1 : 0.6}
                      />
                      <circle
                        cx={branchX}
                        cy={subY}
                        r={isHovered ? 3.5 : 2.5}
                        fill={cat.color}
                        opacity={isHovered ? 1 : 0.7}
                      />
                      <text
                        x={labelX - 5}
                        y={subY + 3.5}
                        textAnchor="end"
                        fontSize={isHovered ? 9.5 : 8.5}
                        fill={isHovered ? cat.color : "#4b5563"}
                        fontWeight={isHovered ? "bold" : "normal"}
                      >
                        {src.name.length > 30 ? src.name.slice(0, 27) + "..." : src.name}
                      </text>
                      {(isHovered || isEditing) && src.value !== undefined && (
                        <text
                          x={labelX - 5}
                          y={subY + 15}
                          textAnchor="end"
                          fontSize={8}
                          fill={cat.color}
                          fontWeight="600"
                        >
                          {src.value.toFixed(3)}{src.unit ? ` ${src.unit}` : ""}
                        </text>
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(${spineStartX}, ${svgHeight - 35})`}>
            {activeCategories.map((cat, i) => (
              <g key={cat.name} transform={`translate(${i * 150}, 0)`}>
                <rect x={0} y={0} width={10} height={10} rx={2} fill={cat.color} />
                <text x={14} y={9} fontSize={9} fill="#6b7280">{cat.name}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── Default 6-Category PV Testing Fishbone ──────────────────────────────────

export const DEFAULT_PV_FISHBONE_CATEGORIES: FishboneCategory[] = [
  {
    name: "Irradiance",
    color: "#2563eb",
    sources: [
      { id: "irr-1", name: "Spatial non-uniformity", value: 0.50, unit: "%" },
      { id: "irr-2", name: "Temporal instability (STI)", value: 0.10, unit: "%" },
      { id: "irr-3", name: "Long-term instability (LTI)", value: 0.20, unit: "%" },
      { id: "irr-4", name: "Spectral mismatch (MMF)", value: 0.30, unit: "%" },
      { id: "irr-5", name: "Sensor position error", value: 0.05, unit: "%" },
    ],
  },
  {
    name: "Temperature",
    color: "#ea580c",
    sources: [
      { id: "temp-1", name: "Sensor accuracy (Pt100)", value: 0.30, unit: "°C" },
      { id: "temp-2", name: "Thermal gradient", value: 0.50, unit: "°C" },
      { id: "temp-3", name: "Stabilization time", value: 0.20, unit: "°C" },
      { id: "temp-4", name: "Contact quality", value: 0.10, unit: "°C" },
    ],
  },
  {
    name: "Reference",
    color: "#0891b2",
    sources: [
      { id: "ref-1", name: "Calibration uncertainty (PTB)", value: 0.80, unit: "%" },
      { id: "ref-2", name: "Reference cell drift", value: 0.10, unit: "%" },
      { id: "ref-3", name: "Temp coefficient of ref", value: 0.05, unit: "%/°C" },
      { id: "ref-4", name: "Spectral response mismatch", value: 0.15, unit: "%" },
    ],
  },
  {
    name: "Electrical",
    color: "#16a34a",
    sources: [
      { id: "elec-1", name: "Contact resistance", value: 0.005, unit: "Ω" },
      { id: "elec-2", name: "Cable losses", value: 0.010, unit: "%" },
      { id: "elec-3", name: "Shunt/series resistance", value: 0.020, unit: "Ω" },
      { id: "elec-4", name: "DAQ resolution", value: 0.020, unit: "%" },
    ],
  },
  {
    name: "Method",
    color: "#9333ea",
    sources: [
      { id: "meth-1", name: "IV curve fitting", value: 0.10, unit: "%" },
      { id: "meth-2", name: "IEC 60891 correction", value: 0.15, unit: "%" },
      { id: "meth-3", name: "Extrapolation to STC", value: 0.20, unit: "%" },
      { id: "meth-4", name: "Hysteresis (scan dir.)", value: 0.05, unit: "%" },
    ],
  },
  {
    name: "Repeatability",
    color: "#dc2626",
    sources: [
      { id: "rep-1", name: "Internal repeatability", value: 0.15, unit: "%" },
      { id: "rep-2", name: "ILC/round-robin", value: 0.30, unit: "%" },
      { id: "rep-3", name: "Operator variation", value: 0.05, unit: "%" },
      { id: "rep-4", name: "Daily variation", value: 0.10, unit: "%" },
    ],
  },
]
