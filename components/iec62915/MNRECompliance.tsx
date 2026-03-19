// @ts-nocheck
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle, Circle, AlertTriangle, FileText, Shield, Users, Building2, BookOpen,
} from "lucide-react"
import {
  MNRE_CHECKLIST,
  BOM_COMPONENTS,
  getRequiredTestsForChanges,
  getMaxSeverity,
  getSeverityColor,
  type MNRECheckItem,
} from "@/lib/iec62915-data"

interface MNREComplianceProps {
  selectedChanges: string[]
}

type GuidelineMode = "both" | "iec62915" | "mnre"

// MNRE-specific BoM change requirements (beyond IEC 62915)
const MNRE_BOM_REQUIREMENTS = [
  { component: "Cell", change: "Cell manufacturer/technology change", mnreAction: "Full re-testing + BIS re-registration + ALMM re-listing", bisRef: "IS 14286:2023 Clause 4" },
  { component: "Encapsulant", change: "EVA/POE material or manufacturer change", mnreAction: "Re-testing (TC, DH, HF, UV sequences) + BIS update", bisRef: "IS 14286:2023 Clause 5" },
  { component: "Backsheet", change: "Backsheet material or manufacturer change", mnreAction: "Re-testing (TC, DH, UV, Fire) + BIS update", bisRef: "IS 14286:2023 Clause 5" },
  { component: "Glass", change: "Glass type/thickness/manufacturer change", mnreAction: "Re-testing (Mechanical, Hail, TC) + BIS update", bisRef: "IS 14286:2023 Clause 5" },
  { component: "Junction Box", change: "JB design/manufacturer change", mnreAction: "Safety re-testing (MST) + BIS update", bisRef: "IS 14286:2023 / IEC 62790" },
  { component: "Frame", change: "Frame profile/material change", mnreAction: "Mechanical load re-testing + BIS update", bisRef: "IS 14286:2023 Clause 5" },
]

export function MNRECompliance({ selectedChanges }: MNREComplianceProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [guidelineMode, setGuidelineMode] = useState<GuidelineMode>("both")

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])

  const overallSeverity = useMemo(() => {
    if (selectedChanges.length === 0) return null
    const severities = BOM_COMPONENTS.flatMap(c =>
      c.categories.filter(cat => selectedChanges.includes(cat.id)).map(cat => cat.severity)
    )
    return severities.length > 0 ? getMaxSeverity(severities) : null
  }, [selectedChanges])

  // Filter checklist based on mode
  const filteredChecklist = useMemo(() => {
    if (guidelineMode === "iec62915") {
      // Show only IEC 62915 specific items (Standards, Re-testing, Product Family)
      return MNRE_CHECKLIST.filter(i => ["Standards", "Re-testing", "Product Family", "Documentation"].includes(i.category))
    }
    if (guidelineMode === "mnre") {
      // Show only MNRE/BIS specific items (Registration, Lab Requirements, Sampling)
      return MNRE_CHECKLIST.filter(i => ["Registration", "Lab Requirements", "Sampling", "Documentation"].includes(i.category))
    }
    return MNRE_CHECKLIST
  }, [guidelineMode])

  // Group checklist by category
  const grouped = useMemo(() => {
    const map: Record<string, MNRECheckItem[]> = {}
    for (const item of filteredChecklist) {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    }
    return Object.entries(map)
  }, [filteredChecklist])

  const totalRequired = filteredChecklist.filter(i => i.status === "required").length
  const checkedRequired = filteredChecklist.filter(i => i.status === "required" && checkedItems.has(i.id)).length
  const completionPct = totalRequired > 0 ? Math.round((checkedRequired / totalRequired) * 100) : 0

  const CATEGORY_ICONS: Record<string, any> = {
    Registration: Building2,
    Standards: BookOpen,
    Sampling: Users,
    Documentation: FileText,
    "Re-testing": Shield,
    "Lab Requirements": Shield,
    "Product Family": BookOpen,
  }

  return (
    <div className="space-y-6">
      {/* Guideline Mode Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-semibold">Guideline Framework:</span>
        {(["both", "iec62915", "mnre"] as GuidelineMode[]).map(mode => (
          <Button
            key={mode}
            variant={guidelineMode === mode ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setGuidelineMode(mode)}
          >
            {mode === "both" ? "IEC 62915 + MNRE" : mode === "iec62915" ? "IEC 62915 Only" : "MNRE/BIS Only"}
          </Button>
        ))}
      </div>

      {/* MNRE BoM Change Guidelines (only when MNRE or Both) */}
      {guidelineMode !== "iec62915" && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              MNRE BoM Change Requirements
            </CardTitle>
            <CardDescription className="text-xs">
              India-specific requirements: BIS registration (IS 14286), ALMM listing, mandatory re-testing for component changes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-orange-100/50">
                    <th className="text-left py-2.5 px-3 font-semibold">Component</th>
                    <th className="text-left py-2.5 px-3 font-semibold">Change Type</th>
                    <th className="text-left py-2.5 px-3 font-semibold">MNRE Required Action</th>
                    <th className="text-left py-2.5 px-3 font-semibold">BIS Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {MNRE_BOM_REQUIREMENTS.map((req, i) => {
                    // Highlight if this component has changes selected
                    const isAffected = BOM_COMPONENTS.some(c =>
                      c.name.toLowerCase().includes(req.component.toLowerCase()) &&
                      c.categories.some(cat => selectedChanges.includes(cat.id))
                    )
                    return (
                      <tr key={i} className={`border-b ${isAffected ? "bg-orange-100" : "hover:bg-muted/30"}`}>
                        <td className="py-2 px-3 font-medium">
                          {req.component}
                          {isAffected && <Badge className="ml-1 bg-orange-200 text-orange-800 text-[9px]">AFFECTED</Badge>}
                        </td>
                        <td className="py-2 px-3">{req.change}</td>
                        <td className="py-2 px-3 text-orange-700 font-medium">{req.mnreAction}</td>
                        <td className="py-2 px-3 font-mono text-muted-foreground">{req.bisRef}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{filteredChecklist.length}</div>
            <div className="text-xs text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-red-600">{totalRequired}</div>
            <div className="text-xs text-muted-foreground">Required</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className={`text-2xl font-bold ${completionPct === 100 ? "text-green-600" : "text-amber-600"}`}>{completionPct}%</div>
            <div className="text-xs text-muted-foreground">Compliance</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{requiredTestIds.length}</div>
            <div className="text-xs text-muted-foreground">Tests Needed</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            {overallSeverity ? (
              <Badge className={`${getSeverityColor(overallSeverity).bg} ${getSeverityColor(overallSeverity).text}`}>
                {getSeverityColor(overallSeverity).label}
              </Badge>
            ) : (
              <Badge variant="outline">No Changes</Badge>
            )}
            <div className="text-xs text-muted-foreground mt-1">Impact Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground w-40">
              {guidelineMode === "iec62915" ? "IEC 62915" : guidelineMode === "mnre" ? "MNRE/BIS" : "Combined"} Compliance
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${completionPct === 100 ? "bg-green-500" : "bg-amber-500"}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold">{checkedRequired}/{totalRequired}</span>
          </div>
        </CardContent>
      </Card>

      {/* Checklist by category */}
      {grouped.map(([category, items]) => {
        const CatIcon = CATEGORY_ICONS[category] || FileText
        const catChecked = items.filter(i => checkedItems.has(i.id)).length
        return (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CatIcon className="h-4 w-4 text-muted-foreground" />
                {category}
                <Badge variant="outline" className="text-[10px] ml-auto">{catChecked}/{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map(item => {
                  const isChecked = checkedItems.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked ? "bg-green-50 border-green-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => toggleCheck(item.id)}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isChecked
                          ? <CheckCircle className="h-5 w-5 text-green-600" />
                          : <Circle className="h-5 w-5 text-gray-300" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{item.requirement}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              item.status === "required" ? "border-red-300 text-red-700 bg-red-50"
                              : item.status === "conditional" ? "border-amber-300 text-amber-700 bg-amber-50"
                              : "border-blue-300 text-blue-700 bg-blue-50"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono">Ref: {item.reference}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Product Family Rules */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Product Family Rules &amp; Exemptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-xs text-amber-800">
            <div>
              <span className="font-semibold">Product Family Definition:</span> Modules sharing the same cell technology, construction type (glass-backsheet, glass-glass), encapsulant type, and critical materials. All variants must use identical BoM except for number of cells (fewer-cell variants).
            </div>
            <div>
              <span className="font-semibold">Fewer-Cell Variant Exemption:</span> If a module has fewer cells than the type-tested model but is otherwise identical, it may qualify with reduced testing scope (mechanical loads MQT 16/17/20 only). The higher-power model&apos;s test results cover the variant for all other tests.
            </div>
            <div>
              <span className="font-semibold">Retesting Triggers:</span> Any change to BoM components (Clause 4.2) requires notification to the certification body within 30 days. The IEC TS 62915 Table A.1 matrix determines which tests must be repeated. Full requalification is required for semiconductor material changes or construction class changes.
            </div>
            {guidelineMode !== "iec62915" && (
              <div>
                <span className="font-semibold">MNRE/BIS Specific:</span> Change notification to BIS within 30 days is mandatory. Failure to notify may result in suspension of BIS registration and ALMM listing. All re-testing must be at NABL-accredited labs recognized by BIS for PV testing scope.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
