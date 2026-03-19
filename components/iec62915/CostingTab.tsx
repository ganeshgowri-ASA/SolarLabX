// @ts-nocheck
"use client"

import { useMemo, useCallback, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts"
import { DollarSign, Download, FileSpreadsheet } from "lucide-react"
import {
  TEST_DEFINITIONS,
  getRequiredTestsForChanges, estimateSamplesNeeded,
  estimatePersonnelHours,
} from "@/lib/iec62915-data"

interface CostingTabProps {
  selectedChanges: string[]
}

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

export function CostingTab({ selectedChanges }: CostingTabProps) {
  const [equipmentRate, setEquipmentRate] = useState(75) // $/hr
  const [manpowerRate, setManpowerRate] = useState(50) // $/hr
  const [overheadPct, setOverheadPct] = useState(25) // %

  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const samples = useMemo(() => estimateSamplesNeeded(requiredTestIds), [requiredTestIds])
  const totalPersonnelHours = useMemo(() => estimatePersonnelHours(requiredTestIds), [requiredTestIds])

  // Equipment cost: sum of (durationHours * equipmentRate) per test
  const equipmentBreakdown = useMemo(() => {
    return requiredTestIds.map(id => {
      const t = TEST_DEFINITIONS[id]
      if (!t) return null
      return {
        id,
        name: t.mqt || t.mst || t.id,
        testName: t.name,
        equipment: t.equipment,
        hours: t.durationHours,
        equipCost: t.durationHours * equipmentRate,
        personnelHours: t.durationHours * t.personnel,
        personnelCost: t.durationHours * t.personnel * manpowerRate,
      }
    }).filter(Boolean)
  }, [requiredTestIds, equipmentRate, manpowerRate])

  const totalEquipmentCost = equipmentBreakdown.reduce((s, e) => s + e.equipCost, 0)
  const totalManpowerCost = equipmentBreakdown.reduce((s, e) => s + e.personnelCost, 0)
  const sampleCost = (samples.iec61215 + samples.iec61730) * 150
  const shippingCost = 500
  const reportCost = 1000

  const subtotal = totalEquipmentCost + totalManpowerCost + sampleCost + shippingCost + reportCost
  const overheadCategories = useMemo(() => {
    const base = subtotal
    return {
      facilities: base * (overheadPct / 100) * 0.30,
      supportStaff: base * (overheadPct / 100) * 0.25,
      management: base * (overheadPct / 100) * 0.15,
      consumables: base * (overheadPct / 100) * 0.15,
      calibration: base * (overheadPct / 100) * 0.10,
      admin: base * (overheadPct / 100) * 0.05,
    }
  }, [subtotal, overheadPct])

  const totalOverhead = Object.values(overheadCategories).reduce((s, v) => s + v, 0)
  const grandTotal = subtotal + totalOverhead

  // Pie chart data
  const pieData = useMemo(() => [
    { name: "Equipment", value: Math.round(totalEquipmentCost) },
    { name: "Manpower", value: Math.round(totalManpowerCost) },
    { name: "Samples", value: sampleCost },
    { name: "Shipping", value: shippingCost },
    { name: "Report/Docs", value: reportCost },
    { name: "Facilities OH", value: Math.round(overheadCategories.facilities) },
    { name: "Support Staff OH", value: Math.round(overheadCategories.supportStaff) },
    { name: "Other OH", value: Math.round(overheadCategories.management + overheadCategories.consumables + overheadCategories.calibration + overheadCategories.admin) },
  ].filter(d => d.value > 0), [totalEquipmentCost, totalManpowerCost, sampleCost, overheadCategories])

  const handleExportExcel = useCallback(async () => {
    const XLSX = await import("xlsx")
    const wb = XLSX.utils.book_new()

    // Sheet 1: Equipment cost detail
    const eqRows = equipmentBreakdown.map(e => ({
      "Test ID": e.name,
      "Test Name": e.testName,
      "Equipment": e.equipment.join("; "),
      "Hours": e.hours,
      "Rate ($/hr)": equipmentRate,
      "Equipment Cost ($)": e.equipCost,
    }))
    eqRows.push({ "Test ID": "TOTAL", "Test Name": "", "Equipment": "", "Hours": eqRows.reduce((s, r) => s + r["Hours"], 0), "Rate ($/hr)": equipmentRate, "Equipment Cost ($)": totalEquipmentCost })
    const ws1 = XLSX.utils.json_to_sheet(eqRows)
    XLSX.utils.book_append_sheet(wb, ws1, "Equipment Cost")

    // Sheet 2: Manpower
    const mpRows = equipmentBreakdown.map(e => ({
      "Test ID": e.name,
      "Test Name": e.testName,
      "Personnel-Hours": e.personnelHours,
      "Rate ($/hr)": manpowerRate,
      "Manpower Cost ($)": e.personnelCost,
    }))
    mpRows.push({ "Test ID": "TOTAL", "Test Name": "", "Personnel-Hours": mpRows.reduce((s, r) => s + r["Personnel-Hours"], 0), "Rate ($/hr)": manpowerRate, "Manpower Cost ($)": totalManpowerCost })
    const ws2 = XLSX.utils.json_to_sheet(mpRows)
    XLSX.utils.book_append_sheet(wb, ws2, "Manpower Cost")

    // Sheet 3: Summary
    const summaryRows = [
      { Category: "Equipment Cost", Amount: Math.round(totalEquipmentCost) },
      { Category: "Manpower Cost", Amount: Math.round(totalManpowerCost) },
      { Category: "Sample Modules", Amount: sampleCost },
      { Category: "Shipping & Handling", Amount: shippingCost },
      { Category: "Report & Documentation", Amount: reportCost },
      { Category: `Overheads (${overheadPct}%)`, Amount: Math.round(totalOverhead) },
      { Category: "GRAND TOTAL", Amount: Math.round(grandTotal) },
    ]
    const ws3 = XLSX.utils.json_to_sheet(summaryRows)
    XLSX.utils.book_append_sheet(wb, ws3, "Cost Summary")

    XLSX.writeFile(wb, `IEC62915_Costing_${new Date().toISOString().split("T")[0]}.xlsx`)
  }, [equipmentBreakdown, equipmentRate, manpowerRate, totalEquipmentCost, totalManpowerCost, sampleCost, totalOverhead, grandTotal, overheadPct])

  const handleExportPDF = useCallback(async () => {
    const html2canvas = (await import("html2canvas")).default
    const { jsPDF } = await import("jspdf")
    const el = document.getElementById("costing-tab-content")
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.setFontSize(14)
    pdf.text("IEC 62915 - Costing Report", 14, 15)
    pdf.setFontSize(8)
    pdf.text(`Generated: ${new Date().toISOString().split("T")[0]}`, 14, 21)
    pdf.addImage(imgData, "PNG", 5, 25, pdfWidth - 10, Math.min(pdfHeight, 260))
    pdf.save(`IEC62915_Costing_${new Date().toISOString().split("T")[0]}.pdf`)
  }, [])

  if (selectedChanges.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No design changes selected.</p>
          <p className="text-xs text-muted-foreground mt-1">Select BoM changes in the Design Change Wizard to see costing.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" id="costing-tab-content">
      {/* Rate Configuration */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Rate Configuration</CardTitle>
          <CardDescription className="text-xs">Adjust hourly rates and overhead percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Equipment Rate ($/hr)</label>
              <Input type="number" value={equipmentRate} onChange={e => setEquipmentRate(Number(e.target.value))} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Manpower Rate ($/hr)</label>
              <Input type="number" value={manpowerRate} onChange={e => setManpowerRate(Number(e.target.value))} className="mt-1 h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Overhead (%)</label>
              <Input type="number" value={overheadPct} onChange={e => setOverheadPct(Number(e.target.value))} className="mt-1 h-8 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-xl font-bold text-blue-600">${Math.round(totalEquipmentCost).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Equipment</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-xl font-bold text-purple-600">${Math.round(totalManpowerCost).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Manpower</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-xl font-bold text-amber-600">${Math.round(totalOverhead).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Overheads</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-xl font-bold text-cyan-600">${sampleCost.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Samples</div>
          </CardContent>
        </Card>
        <Card className="text-center py-2">
          <CardContent className="pt-3 pb-0">
            <div className="text-xl font-bold text-green-600">${Math.round(grandTotal).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Grand Total</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Cost Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#999", strokeWidth: 1 }}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Cost"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overhead Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overhead Breakdown ({overheadPct}% of subtotal)</CardTitle>
            <CardDescription className="text-xs">Subtotal: ${Math.round(subtotal).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-2 px-3 font-semibold">Category</th>
                    <th className="text-right py-2 px-3 font-semibold">%</th>
                    <th className="text-right py-2 px-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Facilities (rent, utilities)", pct: 30, val: overheadCategories.facilities },
                    { name: "Support Staff", pct: 25, val: overheadCategories.supportStaff },
                    { name: "Management", pct: 15, val: overheadCategories.management },
                    { name: "Consumables", pct: 15, val: overheadCategories.consumables },
                    { name: "Calibration", pct: 10, val: overheadCategories.calibration },
                    { name: "Admin & Insurance", pct: 5, val: overheadCategories.admin },
                  ].map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2 px-3">{row.name}</td>
                      <td className="py-2 px-3 text-right font-mono">{row.pct}%</td>
                      <td className="py-2 px-3 text-right font-mono">${Math.round(row.val).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-semibold">
                    <td className="py-2 px-3">Total Overhead</td>
                    <td className="py-2 px-3 text-right font-mono">100%</td>
                    <td className="py-2 px-3 text-right font-mono text-amber-700">${Math.round(totalOverhead).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Cost Detail Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Equipment &amp; Manpower Cost Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2.5 px-3 font-semibold">Test</th>
                  <th className="text-left py-2.5 px-3 font-semibold">Equipment</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Equip. Hours</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Equip. Cost</th>
                  <th className="text-center py-2.5 px-3 font-semibold">Person-Hours</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Manpower Cost</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {equipmentBreakdown.map(e => (
                  <tr key={e.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-3">
                      <div className="font-medium">{e.name}</div>
                      <div className="text-muted-foreground text-[10px]">{e.testName}</div>
                    </td>
                    <td className="py-2 px-3 text-[10px] text-muted-foreground max-w-[180px] truncate">{e.equipment.join(", ")}</td>
                    <td className="py-2 px-3 text-center font-mono">{e.hours}</td>
                    <td className="py-2 px-3 text-right font-mono">${e.equipCost.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center font-mono">{e.personnelHours}</td>
                    <td className="py-2 px-3 text-right font-mono">${e.personnelCost.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">${(e.equipCost + e.personnelCost).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold bg-green-50">
                  <td className="py-2.5 px-3" colSpan={3}>TOTAL</td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-700">${Math.round(totalEquipmentCost).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{totalPersonnelHours}h</td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-700">${Math.round(totalManpowerCost).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-green-700">${Math.round(totalEquipmentCost + totalManpowerCost).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Grand Total Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b"><td className="py-1.5 px-3">Equipment Cost</td><td className="py-1.5 px-3 text-right font-mono">${Math.round(totalEquipmentCost).toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-1.5 px-3">Manpower Cost</td><td className="py-1.5 px-3 text-right font-mono">${Math.round(totalManpowerCost).toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-1.5 px-3">Sample Modules ({samples.iec61215} + {samples.iec61730})</td><td className="py-1.5 px-3 text-right font-mono">${sampleCost.toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-1.5 px-3">Shipping &amp; Handling</td><td className="py-1.5 px-3 text-right font-mono">$500</td></tr>
                <tr className="border-b"><td className="py-1.5 px-3">Report &amp; Documentation</td><td className="py-1.5 px-3 text-right font-mono">$1,000</td></tr>
                <tr className="border-b"><td className="py-1.5 px-3 font-semibold">Subtotal</td><td className="py-1.5 px-3 text-right font-mono font-semibold">${Math.round(subtotal).toLocaleString()}</td></tr>
                <tr className="border-b"><td className="py-1.5 px-3">Overheads ({overheadPct}%)</td><td className="py-1.5 px-3 text-right font-mono">${Math.round(totalOverhead).toLocaleString()}</td></tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold text-green-800 text-sm">
                  <td className="py-2.5 px-3">GRAND TOTAL</td>
                  <td className="py-2.5 px-3 text-right font-mono">${Math.round(grandTotal).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExportExcel}>
          <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExportPDF}>
          <Download className="h-3.5 w-3.5" /> Export PDF
        </Button>
      </div>
    </div>
  )
}
