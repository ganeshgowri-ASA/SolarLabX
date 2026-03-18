// @ts-nocheck
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export function MNRECompliance({ selectedChanges }: MNREComplianceProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])

  // Overall severity for selected changes
  const overallSeverity = useMemo(() => {
    if (selectedChanges.length === 0) return null
    const severities = BOM_COMPONENTS.flatMap(c =>
      c.categories.filter(cat => selectedChanges.includes(cat.id)).map(cat => cat.severity)
    )
    return severities.length > 0 ? getMaxSeverity(severities) : null
  }, [selectedChanges])

  // Group checklist by category
  const grouped = useMemo(() => {
    const map: Record<string, MNRECheckItem[]> = {}
    for (const item of MNRE_CHECKLIST) {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    }
    return Object.entries(map)
  }, [])

  const totalRequired = MNRE_CHECKLIST.filter(i => i.status === "required").length
  const checkedRequired = MNRE_CHECKLIST.filter(i => i.status === "required" && checkedItems.has(i.id)).length
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
      {/* Compliance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{MNRE_CHECKLIST.length}</div>
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
            <span className="text-xs font-semibold text-muted-foreground w-40">MNRE/BIS Compliance</span>
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
            Product Family Rules & Exemptions
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
            <div>
              <span className="font-semibold">Change Notification:</span> Manufacturers must maintain a change log and notify BIS/NABL lab within 30 days of any BoM change. Failure to notify may result in suspension of BIS registration and ALMM listing.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
