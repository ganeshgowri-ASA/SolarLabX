// @ts-nocheck
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, ArrowDown, ArrowRight, CheckCircle, Circle } from "lucide-react"
import {
  TEST_SEQUENCES, TEST_DEFINITIONS,
  getRequiredTestsForChanges, getAffectedSequences,
  estimateSamplesNeeded,
} from "@/lib/iec62915-data"

interface SampleFlowChartProps {
  selectedChanges: string[]
}

function FlowNode({ label, sub, color, active, highlight }: {
  label: string; sub?: string; color: string; active: boolean; highlight?: boolean
}) {
  return (
    <div className={`rounded-lg border-2 px-3 py-2 text-center transition-all ${
      active
        ? `${highlight ? "ring-2 ring-offset-1 ring-amber-400" : ""} border-current shadow-sm`
        : "border-gray-200 bg-gray-50 opacity-40"
    }`} style={{ borderColor: active ? color : undefined, color: active ? color : undefined }}>
      <div className="text-xs font-bold">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}

function FlowArrow({ vertical }: { vertical?: boolean }) {
  return vertical
    ? <div className="flex justify-center py-1"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>
    : <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
}

export function SampleFlowChart({ selectedChanges }: SampleFlowChartProps) {
  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTestIds), [requiredTestIds])
  const samples = useMemo(() => estimateSamplesNeeded(requiredTestIds), [requiredTestIds])

  if (selectedChanges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No design changes selected.</p>
          <p className="text-xs text-muted-foreground mt-1">Select BoM changes in the Design Change Wizard to see the sample flow.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sample summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{samples.iec61215}</div>
            <div className="text-xs text-muted-foreground">IEC 61215 Modules</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-red-600">{samples.iec61730}</div>
            <div className="text-xs text-muted-foreground">IEC 61730 Modules</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{samples.iec61215 + samples.iec61730}</div>
            <div className="text-xs text-muted-foreground">Total Modules</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{affectedSequences.length}/5</div>
            <div className="text-xs text-muted-foreground">Active Sequences</div>
          </CardContent>
        </Card>
      </div>

      {/* IEC 61215 Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-blue-500" />
            IEC 61215 — Design Qualification Test Flow (8 Modules)
          </CardTitle>
          <CardDescription className="text-xs">
            Highlighted sequences are required for your selected design changes. Grayed-out sequences are not needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Initial measurements */}
            <div className="flex justify-center">
              <FlowNode
                label="Initial Measurements"
                sub="Visual (MQT 01) + Pmax (MQT 02) + Insulation (MQT 03) + Wet leakage (MQT 15)"
                color="#6b7280"
                active={true}
              />
            </div>
            <FlowArrow vertical />
            <div className="flex justify-center">
              <FlowNode label="Stabilization (MQT 19)" sub="Light soaking until ±2% Pmax" color="#6b7280" active={true} />
            </div>
            <FlowArrow vertical />

            {/* Sequence branches */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {TEST_SEQUENCES.map(seq => {
                const isActive = affectedSequences.includes(seq.id)
                const seqTests = seq.tests
                  .filter(t => requiredTestIds.includes(t))
                  .map(t => TEST_DEFINITIONS[t])
                  .filter(Boolean)

                return (
                  <div key={seq.id} className="space-y-2">
                    <FlowNode
                      label={`${seq.name}`}
                      sub={`Modules ${seq.modules61215.join(", ")}`}
                      color={seq.color}
                      active={isActive}
                      highlight={isActive}
                    />
                    {isActive && (
                      <div className="space-y-1 pl-2 border-l-2" style={{ borderColor: seq.color }}>
                        {seqTests.map(test => (
                          <div key={test.id} className="flex items-center gap-1.5 text-[10px]">
                            <CheckCircle className="h-3 w-3 flex-shrink-0" style={{ color: seq.color }} />
                            <span className="font-mono">{test.mqt || test.mst}</span>
                            <span className="text-muted-foreground truncate">{test.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!isActive && (
                      <div className="text-[10px] text-muted-foreground/50 text-center italic py-2">
                        Not required
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <FlowArrow vertical />
            {/* Final measurements */}
            <div className="flex justify-center">
              <FlowNode
                label="Final Measurements"
                sub="Visual (MQT 01) + Pmax (MQT 02) + Insulation (MQT 03) + Wet leakage (MQT 15)"
                color="#6b7280"
                active={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IEC 61730 Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-red-500" />
            IEC 61730 — Safety Qualification Test Flow (10+ Modules)
          </CardTitle>
          <CardDescription className="text-xs">
            Safety tests run in parallel with IEC 61215 sequences on additional modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <FlowNode label="Initial Safety Inspection" sub="MST 01 Visual + MST 11 Dielectric + MST 12 Wet Leakage" color="#6b7280" active={true} />
            </div>
            <FlowArrow vertical />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Construction evaluation */}
              <div className="space-y-2">
                <FlowNode
                  label="Construction Evaluation"
                  sub="MST 03, MST 13, MST 14, MST 16"
                  color="#8b5cf6"
                  active={requiredTestIds.some(t => ["MST_03", "MST_13", "MST_14", "MST_16"].includes(t))}
                  highlight={requiredTestIds.some(t => ["MST_03", "MST_13", "MST_14", "MST_16"].includes(t))}
                />
              </div>
              {/* Fire test */}
              <div className="space-y-2">
                <FlowNode
                  label="Fire Test (MST 17)"
                  sub="3 modules · Spreading flame"
                  color="#ef4444"
                  active={requiredTestIds.includes("MST_17")}
                  highlight={requiredTestIds.includes("MST_17")}
                />
              </div>
              {/* Mechanical/Environmental safety */}
              <div className="space-y-2">
                <FlowNode
                  label="Mechanical Safety"
                  sub="MST 26, MST 34, MST 35, MST 36"
                  color="#f59e0b"
                  active={requiredTestIds.some(t => ["MST_26", "MST_34", "MST_35", "MST_36"].includes(t))}
                  highlight={requiredTestIds.some(t => ["MST_26", "MST_34", "MST_35", "MST_36"].includes(t))}
                />
              </div>
            </div>

            {/* Diode safety */}
            {requiredTestIds.some(t => ["MST_22", "MST_25"].includes(t)) && (
              <>
                <FlowArrow vertical />
                <div className="flex justify-center">
                  <FlowNode
                    label="Bypass Diode Safety"
                    sub="MST 22 Thermal + MST 25 Reverse Current"
                    color="#eab308"
                    active={true}
                    highlight={true}
                  />
                </div>
              </>
            )}

            <FlowArrow vertical />
            <div className="flex justify-center">
              <FlowNode label="Final Safety Evaluation" sub="MST 01 + MST 11 + MST 12 (post-test)" color="#6b7280" active={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="font-semibold">Legend:</span>
            {TEST_SEQUENCES.map(seq => (
              <div key={seq.id} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: seq.color }} />
                <span>{seq.name}: {seq.description.split("—")[0].trim()}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-gray-300" />
              <span>Not required (grayed out)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
