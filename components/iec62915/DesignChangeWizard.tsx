// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Layers, Shield, Cpu, LayoutGrid, Cable, Square, Frame,
  Box, Zap, Maximize2, Scaling, Sparkles, ToggleLeft, ToggleRight,
} from "lucide-react"
import {
  BOM_COMPONENTS, TEST_DEFINITIONS,
  getRequiredTestsForChanges, getSeverityColor, getMaxSeverity,
  type BomComponent, type ChangeCategory, type Severity,
} from "@/lib/iec62915-data"
import { ExplodedModuleView } from "./ExplodedModuleView"

const ICON_MAP: Record<string, any> = {
  Layers, Shield, Cpu, LayoutGrid, Cable, Square, Frame,
  Box, Zap, Maximize2, Scaling, Sparkles,
}

interface DesignChangeWizardProps {
  selectedChanges: string[]
  onToggleChange: (id: string) => void
}

export function DesignChangeWizard({ selectedChanges, onToggleChange }: DesignChangeWizardProps) {
  const [openComponent, setOpenComponent] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"infographic" | "cards">("infographic")

  const activeComponent = BOM_COMPONENTS.find(c => c.id === openComponent)

  const componentSummaries = useMemo(() => {
    return BOM_COMPONENTS.map(comp => {
      const selected = comp.categories.filter(c => selectedChanges.includes(c.id))
      const severity = selected.length > 0
        ? getMaxSeverity(selected.map(s => s.severity))
        : null
      return { ...comp, selectedCount: selected.length, severity }
    })
  }, [selectedChanges])

  const requiredTests = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])

  const totalChanges = selectedChanges.length
  const overallSeverity = useMemo(() => {
    if (totalChanges === 0) return null
    const severities: Severity[] = []
    for (const comp of BOM_COMPONENTS) {
      for (const cat of comp.categories) {
        if (selectedChanges.includes(cat.id)) severities.push(cat.severity)
      }
    }
    return getMaxSeverity(severities)
  }, [selectedChanges, totalChanges])

  return (
    <div className="space-y-6">
      {/* Step indicator & summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Step 1 — Select BoM Components</h3>
          <p className="text-xs text-muted-foreground mt-1">Click a component to define specific design changes per IEC TS 62915:2023 Clause 4.2</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setViewMode(viewMode === "infographic" ? "cards" : "infographic")}
          >
            {viewMode === "infographic" ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
            {viewMode === "infographic" ? "Exploded View" : "Card View"}
          </Button>
          {totalChanges > 0 && overallSeverity && (
            <Badge className={`${getSeverityColor(overallSeverity).bg} ${getSeverityColor(overallSeverity).text} text-xs`}>
              {getSeverityColor(overallSeverity).label}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-mono">
            {totalChanges} change{totalChanges !== 1 ? "s" : ""} · {requiredTests.length} tests required
          </Badge>
        </div>
      </div>

      {/* Exploded Infographic View */}
      {viewMode === "infographic" && (
        <ExplodedModuleView selectedChanges={selectedChanges} onToggleChange={onToggleChange} />
      )}

      {/* Card Grid View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {componentSummaries.map(comp => {
            const Icon = ICON_MAP[comp.icon] || Layers
            const hasChanges = comp.selectedCount > 0
            const sevColor = comp.severity ? getSeverityColor(comp.severity) : null

            return (
              <Card
                key={comp.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  hasChanges
                    ? `${comp.borderColor} border-2 shadow-sm`
                    : "border hover:border-gray-300"
                }`}
                onClick={() => setOpenComponent(comp.id)}
              >
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${comp.bgColor}`}>
                      <Icon className={`h-5 w-5 ${comp.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono text-muted-foreground">{comp.clause}</span>
                        {hasChanges && sevColor && (
                          <Badge className={`${sevColor.bg} ${sevColor.text} text-[10px] px-1.5 py-0`}>
                            {comp.selectedCount}
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold mt-0.5 truncate">{comp.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {comp.categories.length} change categories
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                  {hasChanges && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex flex-wrap gap-1">
                        {comp.categories.filter(c => selectedChanges.includes(c.id)).map(c => (
                          <span key={c.id} className="text-[10px] bg-gray-100 rounded px-1.5 py-0.5 truncate max-w-[200px]">
                            {c.label.slice(0, 40)}{c.label.length > 40 ? "..." : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Selected Tests Preview */}
      {requiredTests.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Auto-populated Required Tests ({requiredTests.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Based on selected design changes per IEC TS 62915:2023 Table A.1
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {requiredTests.map(testId => {
                const test = TEST_DEFINITIONS[testId]
                if (!test) return null
                const isMST = testId.startsWith("MST")
                return (
                  <Badge
                    key={testId}
                    variant="outline"
                    className={`text-[10px] font-mono ${
                      isMST ? "border-red-300 text-red-700 bg-red-50" : "border-blue-300 text-blue-700 bg-blue-50"
                    }`}
                  >
                    {test.mqt || test.mst} - {test.name}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Change Detail Dialog (for card view) */}
      <Dialog open={!!openComponent} onOpenChange={(open) => { if (!open) setOpenComponent(null) }}>
        {activeComponent && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeComponent.bgColor}`}>
                  {(() => { const Icon = ICON_MAP[activeComponent.icon] || Layers; return <Icon className={`h-5 w-5 ${activeComponent.color}`} /> })()}
                </div>
                <div>
                  <DialogTitle className="text-base">{activeComponent.name}</DialogTitle>
                  <DialogDescription className="text-xs">
                    IEC TS 62915:2023 Clause {activeComponent.clause} — Select applicable design changes
                  </DialogDescription>
                </div>
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
