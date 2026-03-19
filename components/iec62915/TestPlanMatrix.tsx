// @ts-nocheck
"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Download, Filter, ClipboardList } from "lucide-react"
import {
  TEST_DEFINITIONS, TEST_SEQUENCES,
  getRequiredTestsForChanges, getAffectedSequences,
  estimateTotalCost, estimatePersonnelHours,
  type TestDefinition,
} from "@/lib/iec62915-data"

interface TestPlanMatrixProps {
  selectedChanges: string[]
}

// Supplier/model mapping for equipment
const EQUIPMENT_SUPPLIERS: Record<string, string> = {
  "Class A+ Solar Simulator": "Wavelabs SINUS-2100 / Pasan HighLIGHT",
  "Solar simulator": "Pasan HighLIGHT III-c",
  "Solar simulator (200 W/m² capable)": "Wavelabs SINUS-2100",
  "IV Tracer": "Keysight BenchVue IV / Sinton FCT-450",
  "IV tracer": "Keysight BenchVue IV",
  "Reference cell": "Fraunhofer ISE certified",
  "Hipot tester": "Vitrek 95x Series",
  "Insulation resistance meter": "Megger MIT2500",
  "Environmental chamber (TC)": "Weiss WK3-1000/70 / Angelantoni DY-1000",
  "Environmental chamber (HF)": "Weiss WK3-1000/70",
  "Environmental chamber (DH)": "Angelantoni DY-1500",
  "Environmental chamber": "CTS C-40/1000",
  "UV chamber": "Atlas UVTest / Q-Lab QUV",
  "UV radiometer": "Kipp & Zonen UV-S-AB-T",
  "Temperature controller": "Eurotherm 3504",
  "Temperature-controlled chamber": "Weiss WK3-340",
  "Mechanical load tester": "TUV SUD ML-3600 / Berger MLT-3000",
  "Dynamic load tester": "Berger MLT-3000 DML",
  "Pneumatic system": "Festo ADVU series",
  "Hail gun": "Custom IEC 61215 hail launcher",
  "Ice ball maker": "Custom mold system",
  "Velocity sensor": "Photron FASTCAM",
  "IR camera": "FLIR T1020 / InfraTec HD820",
  "Thermocouples": "Omega T-type / K-type",
  "Data logger": "Keysight 34972A / Agilent",
  "Pyranometer": "Kipp & Zonen CMP11",
  "Pull/torque tester": "Mecmesin MultiTest-dV",
  "Force gauge": "Mecmesin AFG-500N",
  "Power supply": "Keysight N8900 Series",
  "High-voltage power supply": "Spellman SL Series",
  "Wet leakage tester": "Custom per IEC 61215",
  "Wetting agent": "Triton X-100 solution",
  "Peel tester (180°/90°)": "Instron 5944 / Zwick Z005",
  "Mechanical stress tester": "Zwick Z100",
  "Test finger (IEC 61032)": "IEC 61032 standard probe",
  "Ground bond tester": "Associated Research 3705A",
  "Impulse voltage generator": "Haefely PSURGE 30",
  "Thermal chamber": "Weiss WK3-340",
  "Fire test apparatus": "Custom per IEC 61730-2",
  "Spreading flame burner": "IEC 61730-2 specified",
  "Impact tester": "Custom per IEC 61730-2",
  "Steel ball": "227g steel ball per standard",
  "Cut tester": "Custom per IEC 61730-2",
  "Insulation tester": "Megger MIT2500",
  "Load bank": "Simplex Titan 500kW",
  "EL camera": "Greateyes GE 1024 1024 BI",
  "Inspection table": "Lab standard",
  "Magnifier (10×)": "Standard 10x loupe",
  "Magnifier": "Standard 10x loupe",
  "Shading devices": "Custom cell shading masks",
  "Light soaking system or outdoor rack": "In-house light soaking / Outdoor rack",
  "Outdoor test rack": "Custom rack per IEC 61215",
  "Outdoor exposure rack": "Custom rack per IEC 61215",
  "Pressure gauge": "Ashcroft digital gauge",
  "Surface resistance meter": "Keithley 6517B",
  "Surfactant solution": "IEC 61730-2 specified",
  "Mounting jig": "Lab custom",
  "Temperature/humidity controller": "Watlow F4T",
}

export function TestPlanMatrix({ selectedChanges }: TestPlanMatrixProps) {
  const [standardFilter, setStandardFilter] = useState<string>("all")

  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTestIds), [requiredTestIds])

  const tests = useMemo(() => {
    return requiredTestIds
      .map(id => TEST_DEFINITIONS[id])
      .filter(Boolean)
      .filter(t => {
        if (standardFilter === "61215") return t.standard === "IEC 61215-2" || t.standard === "Both"
        if (standardFilter === "61730") return t.standard === "IEC 61730-2" || t.standard === "Both"
        return true
      })
  }, [requiredTestIds, standardFilter])

  const totalCost = useMemo(() => estimateTotalCost(requiredTestIds), [requiredTestIds])
  const totalPersonnel = useMemo(() => estimatePersonnelHours(requiredTestIds), [requiredTestIds])
  const totalDuration = useMemo(() => tests.reduce((s, t) => s + t.durationHours, 0), [tests])
  const totalEquipHours = useMemo(() => tests.reduce((s, t) => s + t.durationHours, 0), [tests])

  if (selectedChanges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No design changes selected.</p>
          <p className="text-xs text-muted-foreground mt-1">Go to the Design Change Wizard tab to select BoM changes.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-blue-600">{tests.length}</div>
            <div className="text-xs text-muted-foreground">Total Tests</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-purple-600">{affectedSequences.join(", ")}</div>
            <div className="text-xs text-muted-foreground">Sequences</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-amber-600">{totalDuration.toLocaleString()}h</div>
            <div className="text-xs text-muted-foreground">Total Duration</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-green-600">{totalPersonnel.toLocaleString()}h</div>
            <div className="text-xs text-muted-foreground">Person-Hours</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-cyan-600">{totalEquipHours.toLocaleString()}h</div>
            <div className="text-xs text-muted-foreground">Equipment Hours</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-2xl font-bold text-red-600">${totalCost.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Est. Cost</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Standard:</span>
          <Select value={standardFilter} onValueChange={setStandardFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Standards</SelectItem>
              <SelectItem value="61215">IEC 61215-2 (MQT)</SelectItem>
              <SelectItem value="61730">IEC 61730-2 (MST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => {
            const equipRate = 75
            const mpRate = 50
            const rows = tests.map(t => [
              t.mqt || t.mst, t.name, t.standard,
              t.sequences.filter(s => affectedSequences.includes(s)).join(", "),
              t.samplesStandalone,
              t.equipment.join("; "),
              t.equipment.map(e => EQUIPMENT_SUPPLIERS[e] || "").join("; "),
              t.personnel,
              t.durationHours,
              equipRate, t.durationHours * equipRate,
              mpRate, t.durationHours * t.personnel * mpRate,
              t.costEstimateUSD,
              t.description,
            ])
            const header = "Test ID,Test Name,Standard,Sequences,Samples,Equipment,Supplier/Model,Manpower (technicians),Equipment Hours,Cost/Equip-hr ($/hr),Equipment Cost ($),Cost/Manpower-hr ($/hr),Manpower Cost ($),Total Cost ($),Description"
            const csv = [header, ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n")
            const blob = new Blob([csv], { type: "text/csv" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url; a.download = "iec62915_test_plan.csv"; a.click()
            URL.revokeObjectURL(url)
          }}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Test Matrix Table with new columns */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2.5 px-3 font-semibold w-20">Test ID</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Test Name</th>
                  <th className="text-left py-2.5 px-3 font-semibold w-24">Standard</th>
                  <th className="text-center py-2.5 px-3 font-semibold w-24">Sequence</th>
                  <th className="text-center py-2.5 px-3 font-semibold w-20">Samples</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Equipment Name</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Supplier / Model</th>
                  <th className="text-center py-2.5 px-3 font-semibold w-16">Manpower</th>
                  <th className="text-center py-2.5 px-3 font-semibold w-20">Equip Hrs</th>
                  <th className="text-right py-2.5 px-3 font-semibold w-20">$/Equip-hr</th>
                  <th className="text-right py-2.5 px-3 font-semibold w-20">$/MP-hr</th>
                  <th className="text-right py-2.5 px-3 font-semibold w-20">Cost</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => {
                  const activeSeqs = test.sequences.filter(s => affectedSequences.includes(s))
                  const isMST = test.id.startsWith("MST")
                  const equipRate = 75
                  const mpRate = 50
                  return (
                    <tr key={test.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={`font-mono text-[10px] ${
                          isMST ? "border-red-300 text-red-700 bg-red-50" : "border-blue-300 text-blue-700 bg-blue-50"
                        }`}>
                          {test.mqt || test.mst}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium">{test.name}</div>
                        <div className="text-muted-foreground text-[10px] mt-0.5 max-w-xs truncate">{test.description}</div>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{test.standard}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex gap-0.5 justify-center">
                          {activeSeqs.map(s => {
                            const seq = TEST_SEQUENCES.find(sq => sq.id === s)
                            return (
                              <span key={s} className="inline-block w-5 h-5 rounded text-[10px] font-bold text-white flex items-center justify-center"
                                style={{ backgroundColor: seq?.color || "#999" }}>
                                {s}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{test.samplesStandalone}</td>
                      <td className="py-2 px-3">
                        <div className="text-[10px] text-muted-foreground max-w-[160px]">
                          {test.equipment.map((eq, i) => (
                            <div key={i} className="truncate">{eq}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[10px] text-muted-foreground max-w-[160px]">
                          {test.equipment.map((eq, i) => (
                            <div key={i} className="truncate">{EQUIPMENT_SUPPLIERS[eq] || "-"}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{test.personnel}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        {test.durationHours >= 24
                          ? `${(test.durationHours / 24).toFixed(0)}d`
                          : `${test.durationHours}h`
                        }
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">${equipRate}</td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">${mpRate}</td>
                      <td className="py-2 px-3 text-right font-mono text-green-700">${test.costEstimateUSD.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-muted/30 font-semibold">
                  <td className="py-2.5 px-3" colSpan={7}>TOTAL</td>
                  <td className="py-2.5 px-3 text-center font-mono">{totalPersonnel}h</td>
                  <td className="py-2.5 px-3 text-center font-mono">{totalDuration >= 24 ? `${(totalDuration / 24).toFixed(0)}d` : `${totalDuration}h`}</td>
                  <td className="py-2.5 px-3" colSpan={2}></td>
                  <td className="py-2.5 px-3 text-right font-mono text-green-700">${totalCost.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
