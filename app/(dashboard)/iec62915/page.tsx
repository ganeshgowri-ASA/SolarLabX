// @ts-nocheck
"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Package, Wand2, ClipboardList, GitBranch, CalendarDays, ShieldCheck,
  Download, FileText, Printer, DollarSign, BarChart3,
} from "lucide-react"
import { DesignChangeWizard } from "@/components/iec62915/DesignChangeWizard"
import { TestPlanMatrix } from "@/components/iec62915/TestPlanMatrix"
import { SampleFlowChart } from "@/components/iec62915/SampleFlowChart"
import { BudgetTimeline } from "@/components/iec62915/BudgetTimeline"
import { MNRECompliance } from "@/components/iec62915/MNRECompliance"
import { CostingTab } from "@/components/iec62915/CostingTab"
import { CertificationTimeline } from "@/components/iec62915/CertificationTimeline"
import { ReportExporter } from "@/components/iec62915/ReportExporter"
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
            <ReportExporter selectedChanges={selectedChanges} />
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

      {/* Main Tabs - 7 tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="wizard" className="text-xs gap-1 py-2">
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Design</span> Wizard
          </TabsTrigger>
          <TabsTrigger value="matrix" className="text-xs gap-1 py-2">
            <ClipboardList className="h-3.5 w-3.5" />
            Test <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="flow" className="text-xs gap-1 py-2">
            <GitBranch className="h-3.5 w-3.5" />
            Sample <span className="hidden sm:inline">Flow</span>
          </TabsTrigger>
          <TabsTrigger value="costing" className="text-xs gap-1 py-2">
            <DollarSign className="h-3.5 w-3.5" />
            Costing
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs gap-1 py-2">
            <BarChart3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cert</span> Timeline
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-xs gap-1 py-2">
            <CalendarDays className="h-3.5 w-3.5" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="mnre" className="text-xs gap-1 py-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            MNRE
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

        <TabsContent value="costing" className="mt-4">
          <CostingTab selectedChanges={selectedChanges} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <CertificationTimeline selectedChanges={selectedChanges} />
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
