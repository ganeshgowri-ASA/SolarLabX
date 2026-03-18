// @ts-nocheck
"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Package, Wand2, ClipboardList, GitBranch, CalendarDays, ShieldCheck,
  Download, FileText, Printer,
} from "lucide-react"
import { DesignChangeWizard } from "@/components/iec62915/DesignChangeWizard"
import { TestPlanMatrix } from "@/components/iec62915/TestPlanMatrix"
import { SampleFlowChart } from "@/components/iec62915/SampleFlowChart"
import { BudgetTimeline } from "@/components/iec62915/BudgetTimeline"
import { MNRECompliance } from "@/components/iec62915/MNRECompliance"
import {
  BOM_COMPONENTS, TEST_DEFINITIONS,
  getRequiredTestsForChanges, getAffectedSequences,
  estimateTotalCost, estimateSamplesNeeded, getMaxSeverity, getSeverityColor,
  type Severity,
} from "@/lib/iec62915-data"

export default function IEC62915Page() {
  const [selectedChanges, setSelectedChanges] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("wizard")

  const handleToggleChange = useCallback((id: string) => {
    setSelectedChanges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }, [])

  // Summary stats
  const requiredTests = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTests), [requiredTests])
  const totalCost = useMemo(() => estimateTotalCost(requiredTests), [requiredTests])
  const samples = useMemo(() => estimateSamplesNeeded(requiredTests), [requiredTests])

  const overallSeverity: Severity | null = useMemo(() => {
    if (selectedChanges.length === 0) return null
    const severities = BOM_COMPONENTS.flatMap(c =>
      c.categories.filter(cat => selectedChanges.includes(cat.id)).map(cat => cat.severity)
    )
    return severities.length > 0 ? getMaxSeverity(severities) : null
  }, [selectedChanges])

  const componentsAffected = useMemo(() => {
    return BOM_COMPONENTS.filter(c => c.categories.some(cat => selectedChanges.includes(cat.id))).length
  }, [selectedChanges])

  // Generate printable report
  const handleGenerateReport = () => {
    const tests = requiredTests.map(id => TEST_DEFINITIONS[id]).filter(Boolean)
    const lines = [
      "IEC TS 62915:2023 — Design Change Assessment Report",
      "=" .repeat(55),
      `Date: ${new Date().toISOString().split("T")[0]}`,
      `Changes Selected: ${selectedChanges.length}`,
      `Components Affected: ${componentsAffected}`,
      `Overall Severity: ${overallSeverity ? getSeverityColor(overallSeverity).label : "None"}`,
      `Required Tests: ${requiredTests.length}`,
      `Affected Sequences: ${affectedSequences.join(", ")}`,
      `Estimated Cost: $${totalCost.toLocaleString()}`,
      `Modules Needed: ${samples.iec61215} (IEC 61215) + ${samples.iec61730} (IEC 61730)`,
      "",
      "SELECTED DESIGN CHANGES",
      "-".repeat(40),
    ]
    for (const comp of BOM_COMPONENTS) {
      const compChanges = comp.categories.filter(c => selectedChanges.includes(c.id))
      if (compChanges.length === 0) continue
      lines.push(`\n[${comp.clause}] ${comp.name}:`)
      compChanges.forEach(c => lines.push(`  - ${c.label} (${getSeverityColor(c.severity).label})`))
    }
    lines.push("", "REQUIRED TESTS", "-".repeat(40))
    tests.forEach(t => {
      lines.push(`${t.mqt || t.mst || t.id} | ${t.name} | ${t.standard} | Seq: ${t.sequences.join(",")} | ${t.durationHours}h | $${t.costEstimateUSD}`)
    })

    const blob = new Blob([lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `IEC62915_Assessment_${new Date().toISOString().split("T")[0]}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            IEC TS 62915:2023 — Design Change Assessment
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive tool for PV module BoM change impact analysis, test plan generation, and compliance tracking
          </p>
        </div>
        <div className="flex gap-2">
          {selectedChanges.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleGenerateReport}>
              <Printer className="h-3.5 w-3.5" />
              Generate Report
            </Button>
          )}
          {selectedChanges.length > 0 && (
            <Button
              variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700"
              onClick={() => setSelectedChanges([])}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {selectedChanges.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card className="py-1.5">
            <CardContent className="pt-2 pb-1 text-center">
              <div className="text-lg font-bold text-blue-600">{selectedChanges.length}</div>
              <div className="text-[10px] text-muted-foreground">Changes</div>
            </CardContent>
          </Card>
          <Card className="py-1.5">
            <CardContent className="pt-2 pb-1 text-center">
              <div className="text-lg font-bold text-purple-600">{componentsAffected}</div>
              <div className="text-[10px] text-muted-foreground">Components</div>
            </CardContent>
          </Card>
          <Card className="py-1.5">
            <CardContent className="pt-2 pb-1 text-center">
              <div className="text-lg font-bold text-amber-600">{requiredTests.length}</div>
              <div className="text-[10px] text-muted-foreground">Tests</div>
            </CardContent>
          </Card>
          <Card className="py-1.5">
            <CardContent className="pt-2 pb-1 text-center">
              <div className="text-lg font-bold text-cyan-600">{affectedSequences.join(",")}</div>
              <div className="text-[10px] text-muted-foreground">Sequences</div>
            </CardContent>
          </Card>
          <Card className="py-1.5">
            <CardContent className="pt-2 pb-1 text-center">
              <div className="text-lg font-bold text-green-600">${totalCost.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Est. Cost</div>
            </CardContent>
          </Card>
          <Card className="py-1.5">
            <CardContent className="pt-2 pb-1 text-center">
              {overallSeverity && (
                <Badge className={`${getSeverityColor(overallSeverity).bg} ${getSeverityColor(overallSeverity).text} text-[10px]`}>
                  {getSeverityColor(overallSeverity).label}
                </Badge>
              )}
              <div className="text-[10px] text-muted-foreground mt-0.5">Severity</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="wizard" className="text-xs gap-1.5 py-2">
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Design Change</span> Wizard
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs gap-1.5 py-2">
            <ClipboardList className="h-3.5 w-3.5" />
            Test Plan <span className="hidden sm:inline">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="flow" className="text-xs gap-1.5 py-2">
            <GitBranch className="h-3.5 w-3.5" />
            Sample <span className="hidden sm:inline">Flow</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-xs gap-1.5 py-2">
            <CalendarDays className="h-3.5 w-3.5" />
            Budget <span className="hidden sm:inline">& Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="mnre" className="text-xs gap-1.5 py-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            MNRE <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="mt-4">
          <DesignChangeWizard selectedChanges={selectedChanges} onToggleChange={handleToggleChange} />
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <TestPlanMatrix selectedChanges={selectedChanges} />
        </TabsContent>

        <TabsContent value="flow" className="mt-4">
          <SampleFlowChart selectedChanges={selectedChanges} />
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <BudgetTimeline selectedChanges={selectedChanges} />
        </TabsContent>

        <TabsContent value="mnre" className="mt-4">
          <MNRECompliance selectedChanges={selectedChanges} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
