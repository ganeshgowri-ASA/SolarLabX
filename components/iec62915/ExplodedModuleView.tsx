// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import {
  BOM_COMPONENTS, TEST_DEFINITIONS,
  getSeverityColor, getMaxSeverity,
  type BomComponent, type ChangeCategory, type Severity,
} from "@/lib/iec62915-data"

interface ExplodedModuleViewProps {
  selectedChanges: string[]
  onToggleChange: (id: string) => void
}

// Map BOM component IDs to their position in the exploded view (top to bottom)
const LAYER_CONFIG: {
  bomId: string
  label: string
  yOffset: number
  height: number
  color: string
  hoverColor: string
  gradient: [string, string]
}[] = [
  { bomId: "frontsheet", label: "Front Glass", yOffset: 0, height: 28, color: "#7dd3fc", hoverColor: "#38bdf8", gradient: ["#bae6fd", "#7dd3fc"] },
  { bomId: "encapsulation", label: "Encapsulant (EVA/POE)", yOffset: 44, height: 18, color: "#86efac", hoverColor: "#4ade80", gradient: ["#bbf7d0", "#86efac"] },
  { bomId: "cell_tech", label: "Solar Cell + Ribbons", yOffset: 78, height: 32, color: "#a78bfa", hoverColor: "#8b5cf6", gradient: ["#c4b5fd", "#a78bfa"] },
  { bomId: "cell_layout", label: "Cell Layout / Strings", yOffset: 78, height: 32, color: "#fbbf24", hoverColor: "#f59e0b", gradient: ["#fde68a", "#fbbf24"] },
  { bomId: "interconnect", label: "Interconnect / Ribbons", yOffset: 78, height: 32, color: "#fb923c", hoverColor: "#f97316", gradient: ["#fed7aa", "#fb923c"] },
  { bomId: "encapsulation", label: "Encapsulant (Rear)", yOffset: 126, height: 18, color: "#86efac", hoverColor: "#4ade80", gradient: ["#bbf7d0", "#86efac"] },
  { bomId: "backsheet", label: "Backsheet / Rear Glass", yOffset: 160, height: 24, color: "#fca5a5", hoverColor: "#f87171", gradient: ["#fecaca", "#fca5a5"] },
  { bomId: "edge_seal", label: "Edge Seal", yOffset: 200, height: 14, color: "#5eead4", hoverColor: "#2dd4bf", gradient: ["#99f6e4", "#5eead4"] },
  { bomId: "junction_box", label: "Junction Box", yOffset: 230, height: 28, color: "#a5b4fc", hoverColor: "#818cf8", gradient: ["#c7d2fe", "#a5b4fc"] },
  { bomId: "bypass_diode", label: "Bypass Diode", yOffset: 230, height: 28, color: "#fde047", hoverColor: "#facc15", gradient: ["#fef08a", "#fde047"] },
  { bomId: "frame", label: "Frame (Al)", yOffset: 274, height: 22, color: "#94a3b8", hoverColor: "#64748b", gradient: ["#cbd5e1", "#94a3b8"] },
  { bomId: "module_size", label: "Module Size / Output", yOffset: 312, height: 18, color: "#67e8f9", hoverColor: "#22d3ee", gradient: ["#a5f3fc", "#67e8f9"] },
]

// Deduplicate: some bomIds appear multiple times (encapsulation, cell area). We handle dialogs by bomId.
const UNIQUE_LAYERS = LAYER_CONFIG.filter((l, i, arr) => arr.findIndex(a => a.bomId === l.bomId) === i)

export function ExplodedModuleView({ selectedChanges, onToggleChange }: ExplodedModuleViewProps) {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const [openComponent, setOpenComponent] = useState<string | null>(null)

  const activeComponent = BOM_COMPONENTS.find(c => c.id === openComponent)

  // Severity per component
  const componentSeverities = useMemo(() => {
    const map: Record<string, Severity | null> = {}
    for (const comp of BOM_COMPONENTS) {
      const selected = comp.categories.filter(c => selectedChanges.includes(c.id))
      map[comp.id] = selected.length > 0 ? getMaxSeverity(selected.map(s => s.severity)) : null
    }
    return map
  }, [selectedChanges])

  const selectedCountMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const comp of BOM_COMPONENTS) {
      map[comp.id] = comp.categories.filter(c => selectedChanges.includes(c.id)).length
    }
    return map
  }, [selectedChanges])

  // Severity border color for SVG
  const getSvgSeverityStroke = (bomId: string) => {
    const sev = componentSeverities[bomId]
    if (!sev) return null
    switch (sev) {
      case "minor": return "#3b82f6"
      case "major": return "#f59e0b"
      case "full_requalification": return "#ef4444"
    }
  }

  const svgWidth = 720
  const svgHeight = 360
  const moduleX = 200
  const moduleWidth = 260

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Click any layer to select design changes per IEC TS 62915:2023 Table A.1. Severity color coding: <span className="text-blue-600 font-semibold">Minor</span> | <span className="text-amber-600 font-semibold">Major</span> | <span className="text-red-600 font-semibold">Full Requalification</span>
      </div>

      <div className="border rounded-xl bg-gradient-to-b from-slate-50 to-white p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-3xl mx-auto"
          style={{ minWidth: 500 }}
        >
          <defs>
            {LAYER_CONFIG.map((layer, i) => (
              <linearGradient key={`grad-${i}`} id={`layer-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={layer.gradient[0]} />
                <stop offset="100%" stopColor={layer.gradient[1]} />
              </linearGradient>
            ))}
            {/* shadow filter */}
            <filter id="layerShadow" x="-5%" y="-10%" width="110%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
            <filter id="layerHoverShadow" x="-5%" y="-10%" width="110%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Title */}
          <text x={svgWidth / 2} y="18" textAnchor="middle" className="text-xs" fill="#64748b" fontSize="11" fontWeight="600">
            EXPLODED PV MODULE CROSS-SECTION (Click layer to configure)
          </text>

          {/* Dashed center line */}
          <line x1={moduleX + moduleWidth / 2} y1="25" x2={moduleX + moduleWidth / 2} y2={svgHeight - 10} stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1" />

          {/* Layers */}
          {LAYER_CONFIG.map((layer, i) => {
            const isHovered = hoveredLayer === layer.bomId
            const severity = componentSeverities[layer.bomId]
            const strokeColor = getSvgSeverityStroke(layer.bomId)
            const count = selectedCountMap[layer.bomId] || 0
            const y = layer.yOffset + 28

            // Certain layers are narrower / offset for visual variety
            let lx = moduleX
            let lw = moduleWidth
            if (layer.bomId === "junction_box") { lx = moduleX + moduleWidth - 70; lw = 70 }
            if (layer.bomId === "bypass_diode") { lx = moduleX + moduleWidth - 65; lw = 40 }
            if (layer.bomId === "edge_seal") { lx = moduleX - 8; lw = moduleWidth + 16 }
            if (layer.bomId === "frame") { lx = moduleX - 12; lw = moduleWidth + 24 }
            if (layer.bomId === "module_size") { lx = moduleX - 16; lw = moduleWidth + 32 }
            // Cell layers share same Y, show as overlay subdivisions
            if (layer.bomId === "cell_layout") { lx = moduleX + 10; lw = moduleWidth - 20 }
            if (layer.bomId === "interconnect") { lx = moduleX + 20; lw = moduleWidth - 40 }

            // Label position: alternate left/right
            const labelOnLeft = i % 2 === 0
            const labelX = labelOnLeft ? moduleX - 16 : moduleX + moduleWidth + 16
            const labelAnchor = labelOnLeft ? "end" : "start"
            const arrowStartX = labelOnLeft ? moduleX - 4 : moduleX + moduleWidth + 4
            const arrowEndX = labelOnLeft ? lx + 2 : lx + lw - 2

            // Skip drawing overlapping cell sublayers as separate rect - combine into one region
            const skipDraw = layer.bomId === "cell_layout" || layer.bomId === "interconnect"

            return (
              <g
                key={`${layer.bomId}-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLayer(layer.bomId)}
                onMouseLeave={() => setHoveredLayer(null)}
                onClick={() => setOpenComponent(layer.bomId)}
                style={{ transition: "transform 0.2s" }}
              >
                {/* Layer rectangle */}
                {!skipDraw && (
                  <rect
                    x={lx}
                    y={y}
                    width={lw}
                    height={layer.height}
                    rx={4}
                    ry={4}
                    fill={`url(#layer-grad-${i})`}
                    stroke={strokeColor || (isHovered ? layer.hoverColor : "#e2e8f0")}
                    strokeWidth={strokeColor ? 3 : isHovered ? 2.5 : 1.5}
                    filter={isHovered ? "url(#layerHoverShadow)" : "url(#layerShadow)"}
                    opacity={isHovered ? 1 : 0.92}
                  >
                    {isHovered && (
                      <animate attributeName="opacity" values="0.92;1;0.92" dur="1.5s" repeatCount="indefinite" />
                    )}
                  </rect>
                )}

                {/* Inner label on rect */}
                {!skipDraw && layer.height >= 20 && (
                  <text
                    x={lx + lw / 2}
                    y={y + layer.height / 2 + 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#334155"
                    pointerEvents="none"
                  >
                    {layer.label}
                  </text>
                )}

                {/* Call-out label with arrow */}
                {!skipDraw && (
                  <>
                    <line
                      x1={arrowStartX}
                      y1={y + layer.height / 2}
                      x2={arrowEndX}
                      y2={y + layer.height / 2}
                      stroke={isHovered ? layer.hoverColor : "#94a3b8"}
                      strokeWidth={isHovered ? 1.5 : 1}
                      strokeDasharray={isHovered ? "" : "3 2"}
                      markerEnd=""
                    />
                    {/* Arrow head */}
                    <polygon
                      points={labelOnLeft
                        ? `${arrowEndX},${y + layer.height / 2 - 3} ${arrowEndX + 6},${y + layer.height / 2} ${arrowEndX},${y + layer.height / 2 + 3}`
                        : `${arrowEndX},${y + layer.height / 2 - 3} ${arrowEndX - 6},${y + layer.height / 2} ${arrowEndX},${y + layer.height / 2 + 3}`
                      }
                      fill={isHovered ? layer.hoverColor : "#94a3b8"}
                    />
                    {/* Label text */}
                    <text
                      x={labelX}
                      y={y + layer.height / 2 - 3}
                      textAnchor={labelAnchor}
                      fontSize="9.5"
                      fontWeight={isHovered ? "700" : "500"}
                      fill={isHovered ? layer.hoverColor : "#475569"}
                    >
                      {layer.label}
                    </text>
                    {/* Clause ref */}
                    <text
                      x={labelX}
                      y={y + layer.height / 2 + 9}
                      textAnchor={labelAnchor}
                      fontSize="7.5"
                      fill="#94a3b8"
                    >
                      {BOM_COMPONENTS.find(c => c.id === layer.bomId)?.clause || ""}
                    </text>
                    {/* Selection count badge */}
                    {count > 0 && (
                      <>
                        <rect
                          x={labelOnLeft ? labelX - 28 : labelX}
                          y={y + layer.height / 2 + 14}
                          width={26}
                          height={14}
                          rx={7}
                          fill={strokeColor || "#3b82f6"}
                          opacity={0.9}
                        />
                        <text
                          x={labelOnLeft ? labelX - 15 : labelX + 13}
                          y={y + layer.height / 2 + 24}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="700"
                          fill="white"
                        >
                          {count} sel
                        </text>
                      </>
                    )}
                  </>
                )}
              </g>
            )
          })}

          {/* Vertical spacing indicators */}
          {[44, 78, 126, 160, 200, 230, 274, 312].map((y, i) => (
            <line key={`spacer-${i}`} x1={moduleX + moduleWidth / 2 - 20} y1={y + 24} x2={moduleX + moduleWidth / 2 + 20} y2={y + 24} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      {/* Component Change Detail Dialog */}
      <Dialog open={!!openComponent} onOpenChange={(open) => { if (!open) setOpenComponent(null) }}>
        {activeComponent && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div>
                <DialogTitle className="text-base">{activeComponent.name}</DialogTitle>
                <DialogDescription className="text-xs">
                  IEC TS 62915:2023 Clause {activeComponent.clause} — Select applicable design changes
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-2 mt-2">
              {activeComponent.categories.map(cat => {
                const isChecked = selectedChanges.includes(cat.id)
                const sevColor = getSeverityColor(cat.severity)
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? `${sevColor.bg} ${sevColor.border} border-2`
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => onToggleChange(cat.id)}
                  >
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isChecked ? `${sevColor.border} ${sevColor.bg}` : "border-gray-300"
                    }`}>
                      {isChecked && <CheckCircle className={`h-4 w-4 ${sevColor.text}`} />}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm">{cat.label}</span>
                    </div>
                    <Badge className={`${sevColor.bg} ${sevColor.text} text-[10px] flex-shrink-0`}>
                      {sevColor.label}
                    </Badge>
                  </div>
                )
              })}
            </div>

            {/* Required tests for this component */}
            <div className="mt-4 pt-3 border-t">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                Required tests for {activeComponent.name} changes:
              </h4>
              <div className="flex flex-wrap gap-1">
                {activeComponent.requiredTests.map(testId => {
                  const test = TEST_DEFINITIONS[testId]
                  if (!test) return null
                  const isMST = testId.startsWith("MST")
                  return (
                    <Badge key={testId} variant="outline" className={`text-[10px] font-mono ${
                      isMST ? "border-red-200 text-red-600" : "border-blue-200 text-blue-600"
                    }`}>
                      {test.mqt || test.mst}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setOpenComponent(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
