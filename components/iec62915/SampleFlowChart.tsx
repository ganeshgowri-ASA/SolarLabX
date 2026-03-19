// @ts-nocheck
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, ArrowDown, ArrowRight, CheckCircle, Circle } from "lucide-react"
import {
  TEST_SEQUENCES, TEST_DEFINITIONS,
  getRequiredTestsForChanges, getAffectedSequences,
  estimateSamplesNeeded,
} from "@/lib/iec62915-data"

interface SampleFlowChartProps {
  selectedChanges: string[]
}

type FlowViewMode = "combined" | "iec61215" | "iec61730"

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
  const [viewMode, setViewMode] = useState<FlowViewMode>("combined")
  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTestIds), [requiredTestIds])
  const samples = useMemo(() => estimateSamplesNeeded(requiredTestIds), [requiredTestIds])

  // Combined sharing: for combined testing, modules are shared between 61215 and 61730
  const combinedModules = useMemo(() => {
    // In combined testing, modules 1-8 are shared for both IEC 61215 + 61730
    // Additional 2-4 modules for safety-only tests (fire, breakage)
    const shared = Math.min(samples.iec61215, 8)
    const safetyOnly = Math.max(0, samples.iec61730 - shared)
    return { shared, safetyOnly, total: shared + safetyOnly }
  }, [samples])

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
      {/* View mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">View:</span>
        {(["combined", "iec61215", "iec61730"] as FlowViewMode[]).map(mode => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setViewMode(mode)}
          >
            {mode === "combined" ? "Combined 61215+61730" : mode === "iec61215" ? "IEC 61215 Only" : "IEC 61730 Only"}
          </Button>
        ))}
      </div>

      {/* Sample summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
        <Card className="text-center py-2 border-green-200 bg-green-50/30">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{combinedModules.shared}</div>
            <div className="text-xs text-muted-foreground">Shared (Combined)</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{combinedModules.safetyOnly}</div>
            <div className="text-xs text-muted-foreground">Safety-Only</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{affectedSequences.length}/5</div>
            <div className="text-xs text-muted-foreground">Active Sequences</div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Flow (IEC 61215 + 61730 + IEC 62915 / MNRE paths) */}
      {viewMode === "combined" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-green-500" />
              Combined IEC 61215 + IEC 61730 Sample Flow
            </CardTitle>
            <CardDescription className="text-xs">
              Module sharing across sequences A-E. Shared modules undergo both design qualification and safety tests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sample receipt */}
              <div className="flex justify-center">
                <FlowNode
                  label={`Sample Receipt: ${combinedModules.total} Modules`}
                  sub={`${combinedModules.shared} shared (61215+61730) + ${combinedModules.safetyOnly} safety-only`}
                  color="#059669"
                  active={true}
                />
              </div>
              <FlowArrow vertical />

              {/* Initial measurements - shared */}
              <div className="flex justify-center">
                <FlowNode
                  label="Initial Measurements (Shared)"
                  sub="MQT 01 + MQT 02 + MQT 03 + MQT 15 + MST 01 + MST 11 + MST 12"
                  color="#6b7280"
                  active={true}
                />
              </div>
              <FlowArrow vertical />
              <div className="flex justify-center">
                <FlowNode label="Stabilization (MQT 19)" sub="Light soaking until +/-2% Pmax" color="#6b7280" active={true} />
              </div>
              <FlowArrow vertical />

              {/* Sequence branches with shared modules */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {TEST_SEQUENCES.map(seq => {
                  const isActive = affectedSequences.includes(seq.id)
                  const seqTests = seq.tests
                    .filter(t => requiredTestIds.includes(t))
                    .map(t => TEST_DEFINITIONS[t])
                    .filter(Boolean)

                  // Determine if modules are shared
                  const mqtTests = seqTests.filter(t => t.id.startsWith("MQT"))
                  const mstTests = seqTests.filter(t => t.id.startsWith("MST"))

                  return (
                    <div key={seq.id} className="space-y-2">
                      <FlowNode
                        label={`${seq.name}`}
                        sub={`Modules ${seq.modules61215.join(",")} (shared)`}
                        color={seq.color}
                        active={isActive}
                        highlight={isActive}
                      />
                      {isActive && (
                        <div className="space-y-0.5">
                          {/* IEC 61215 tests */}
                          {mqtTests.length > 0 && (
                            <div className="pl-2 border-l-2 border-blue-300 space-y-0.5">
                              <div className="text-[9px] font-semibold text-blue-600 mb-0.5">IEC 61215:</div>
                              {mqtTests.map(test => (
                                <div key={test.id} className="flex items-center gap-1 text-[10px]">
                                  <CheckCircle className="h-2.5 w-2.5 flex-shrink-0 text-blue-500" />
                                  <span className="font-mono">{test.mqt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* IEC 61730 tests */}
                          {mstTests.length > 0 && (
                            <div className="pl-2 border-l-2 border-red-300 space-y-0.5 mt-1">
                              <div className="text-[9px] font-semibold text-red-600 mb-0.5">IEC 61730:</div>
                              {mstTests.map(test => (
                                <div key={test.id} className="flex items-center gap-1 text-[10px]">
                                  <CheckCircle className="h-2.5 w-2.5 flex-shrink-0 text-red-500" />
                                  <span className="font-mono">{test.mst}</span>
                                </div>
                              ))}
                            </div>
                          )}
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
              <div className="flex justify-center">
                <FlowNode
                  label="Final Measurements (Shared)"
                  sub="MQT 01 + MQT 02 + MQT 03 + MQT 15 + MST 01 + MST 11 + MST 12"
                  color="#6b7280"
                  active={true}
                />
              </div>

              {/* IEC 62915 vs MNRE paths */}
              <FlowArrow vertical />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardContent className="py-3">
                    <div className="text-xs font-semibold text-blue-700 mb-2">IEC 62915 Path (International)</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-blue-500" /> Test report generation</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-blue-500" /> CB/Certification body review</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-blue-500" /> Updated IEC certificate</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-blue-500" /> IECEE CB scheme recognition</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-orange-200 bg-orange-50/30">
                  <CardContent className="py-3">
                    <div className="text-xs font-semibold text-orange-700 mb-2">MNRE Path (India Market)</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-orange-500" /> Test at NABL-accredited lab</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-orange-500" /> BIS registration update (IS 14286)</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-orange-500" /> ALMM listing update</div>
                      <div className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-orange-500" /> QCO compliance verification</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* IEC 61215 Only Flow */}
      {viewMode === "iec61215" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-500" />
              IEC 61215 — Design Qualification Test Flow (8 Modules)
            </CardTitle>
            <CardDescription className="text-xs">
              Highlighted sequences are required for your selected design changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                <FlowNode label="Stabilization (MQT 19)" sub="Light soaking until +/-2% Pmax" color="#6b7280" active={true} />
              </div>
              <FlowArrow vertical />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {TEST_SEQUENCES.map(seq => {
                  const isActive = affectedSequences.includes(seq.id)
                  const seqTests = seq.tests
                    .filter(t => requiredTestIds.includes(t) && t.startsWith("MQT"))
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
      )}

      {/* IEC 61730 Only Flow */}
      {viewMode === "iec61730" && (
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
                <div className="space-y-2">
                  <FlowNode
                    label="Construction Evaluation"
                    sub="MST 03, MST 13, MST 14, MST 16"
                    color="#8b5cf6"
                    active={requiredTestIds.some(t => ["MST_03", "MST_13", "MST_14", "MST_16"].includes(t))}
                    highlight={requiredTestIds.some(t => ["MST_03", "MST_13", "MST_14", "MST_16"].includes(t))}
                  />
                </div>
                <div className="space-y-2">
                  <FlowNode
                    label="Fire Test (MST 17)"
                    sub="3 modules - Spreading flame"
                    color="#ef4444"
                    active={requiredTestIds.includes("MST_17")}
                    highlight={requiredTestIds.includes("MST_17")}
                  />
                </div>
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
      )}

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="font-semibold">Legend:</span>
            {TEST_SEQUENCES.map(seq => (
              <div key={seq.id} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: seq.color }} />
                <span>{seq.name}: {seq.description.split(" — ")[0].trim()}</span>
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
