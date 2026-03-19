// @ts-nocheck
"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import {
  BOM_COMPONENTS, TEST_DEFINITIONS, TEST_SEQUENCES,
  getRequiredTestsForChanges, getAffectedSequences,
  estimateTotalCost, estimatePersonnelHours, estimateSamplesNeeded,
  estimateTotalDuration, getSeverityColor, getMaxSeverity,
  type Severity,
} from "@/lib/iec62915-data"

interface ReportExporterProps {
  selectedChanges: string[]
}

export function ReportExporter({ selectedChanges }: ReportExporterProps) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null)

  const requiredTestIds = useMemo(() => getRequiredTestsForChanges(selectedChanges), [selectedChanges])
  const affectedSequences = useMemo(() => getAffectedSequences(requiredTestIds), [requiredTestIds])
  const totalCost = useMemo(() => estimateTotalCost(requiredTestIds), [requiredTestIds])
  const totalPersonnel = useMemo(() => estimatePersonnelHours(requiredTestIds), [requiredTestIds])
  const samples = useMemo(() => estimateSamplesNeeded(requiredTestIds), [requiredTestIds])
  const longestPath = useMemo(() => estimateTotalDuration(requiredTestIds), [requiredTestIds])

  const overallSeverity: Severity | null = useMemo(() => {
    if (selectedChanges.length === 0) return null
    const severities = BOM_COMPONENTS.flatMap(c =>
      c.categories.filter(cat => selectedChanges.includes(cat.id)).map(cat => cat.severity)
    )
    return severities.length > 0 ? getMaxSeverity(severities) : null
  }, [selectedChanges])

  const handleExportExcel = useCallback(async () => {
    setExporting("excel")
    try {
      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()
      const dateStr = new Date().toISOString().split("T")[0]

      // Sheet 1: Executive Summary
      const summaryData = [
        ["IEC TS 62915:2023 - Design Change Assessment Report"],
        ["Generated", dateStr],
        [""],
        ["EXECUTIVE SUMMARY"],
        ["Total Design Changes", selectedChanges.length],
        ["Overall Severity", overallSeverity ? getSeverityColor(overallSeverity).label : "None"],
        ["Required Tests", requiredTestIds.length],
        ["Affected Sequences", affectedSequences.join(", ")],
        ["Est. Total Cost", `$${totalCost.toLocaleString()}`],
        ["Est. Duration (Critical Path)", `${Math.ceil(longestPath / 168)} weeks`],
        ["Total Personnel Hours", totalPersonnel],
        ["Modules Needed (IEC 61215)", samples.iec61215],
        ["Modules Needed (IEC 61730)", samples.iec61730],
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, ws1, "Executive Summary")

      // Sheet 2: Selected Changes
      const changesHeader = ["Component", "Clause", "Change Description", "Severity"]
      const changesRows = []
      for (const comp of BOM_COMPONENTS) {
        const compChanges = comp.categories.filter(c => selectedChanges.includes(c.id))
        for (const change of compChanges) {
          changesRows.push([comp.name, comp.clause, change.label, getSeverityColor(change.severity).label])
        }
      }
      const ws2 = XLSX.utils.aoa_to_sheet([changesHeader, ...changesRows])
      XLSX.utils.book_append_sheet(wb, ws2, "Selected Changes")

      // Sheet 3: Test Plan
      const testHeader = ["Test ID", "Test Name", "Standard", "Sequences", "Samples", "Equipment", "Duration (h)", "Personnel", "Cost ($)", "Description"]
      const testRows = requiredTestIds.map(id => {
        const t = TEST_DEFINITIONS[id]
        if (!t) return []
        return [
          t.mqt || t.mst || t.id, t.name, t.standard,
          t.sequences.filter(s => affectedSequences.includes(s)).join(", "),
          t.samplesStandalone, t.equipment.join("; "),
          t.durationHours, t.personnel, t.costEstimateUSD, t.description,
        ]
      }).filter(r => r.length > 0)
      const ws3 = XLSX.utils.aoa_to_sheet([testHeader, ...testRows])
      XLSX.utils.book_append_sheet(wb, ws3, "Test Plan Matrix")

      // Sheet 4: Sample Flow
      const flowHeader = ["Sequence", "Description", "Modules (61215)", "Modules (61730)", "Active Tests", "Status"]
      const flowRows = TEST_SEQUENCES.map(seq => [
        seq.name, seq.description,
        seq.modules61215.join(", "), seq.modules61730.join(", "),
        seq.tests.filter(t => requiredTestIds.includes(t)).map(t => TEST_DEFINITIONS[t]?.mqt || TEST_DEFINITIONS[t]?.mst || t).join(", "),
        affectedSequences.includes(seq.id) ? "ACTIVE" : "Not Required",
      ])
      const ws4 = XLSX.utils.aoa_to_sheet([flowHeader, ...flowRows])
      XLSX.utils.book_append_sheet(wb, ws4, "Sample Flow")

      // Sheet 5: Cost Breakdown
      const costHeader = ["Category", "Quantity", "Unit Cost", "Total"]
      const costRows = [
        ["Test Fees (Lab)", `${requiredTestIds.length} tests`, "-", `$${totalCost.toLocaleString()}`],
        ["Sample Modules (IEC 61215)", `${samples.iec61215} modules`, "$150", `$${(samples.iec61215 * 150).toLocaleString()}`],
        ["Sample Modules (IEC 61730)", `${samples.iec61730} modules`, "$150", `$${(samples.iec61730 * 150).toLocaleString()}`],
        ["Personnel", `${totalPersonnel}h`, "$50/h", `$${(totalPersonnel * 50).toLocaleString()}`],
        ["Shipping & Handling", "1 lot", "$500", "$500"],
        ["Report & Documentation", "1 lot", "$1,000", "$1,000"],
        ["", "", "GRAND TOTAL", `$${(totalCost + (samples.iec61215 + samples.iec61730) * 150 + totalPersonnel * 50 + 1500).toLocaleString()}`],
      ]
      const ws5 = XLSX.utils.aoa_to_sheet([costHeader, ...costRows])
      XLSX.utils.book_append_sheet(wb, ws5, "Cost Breakdown")

      // Sheet 6: Timeline
      const timelineHeader = ["Phase", "Duration (weeks)", "Start Week", "End Week", "Critical Path"]
      let cumWeek = 0
      const phases = [
        { name: "Design Review", weeks: 3 },
        { name: "Sample Procurement", weeks: 4 },
        { name: "IEC Testing", weeks: Math.max(8, Math.ceil(longestPath / 168)) },
        { name: "Report Generation", weeks: 2 },
        { name: "CB Review", weeks: 3 },
        { name: "BIS Registration", weeks: 6 },
        { name: "ALMM Listing", weeks: 10 },
        { name: "Production Clearance", weeks: 1 },
      ]
      const timelineRows = phases.map(p => {
        const row = [p.name, p.weeks, cumWeek, cumWeek + p.weeks, ["IEC Testing", "BIS Registration", "ALMM Listing"].includes(p.name) ? "YES" : ""]
        cumWeek += p.weeks
        return row
      })
      const ws6 = XLSX.utils.aoa_to_sheet([timelineHeader, ...timelineRows])
      XLSX.utils.book_append_sheet(wb, ws6, "Certification Timeline")

      XLSX.writeFile(wb, `IEC62915_Assessment_Report_${dateStr}.xlsx`)
    } finally {
      setExporting(null)
    }
  }, [selectedChanges, requiredTestIds, affectedSequences, totalCost, totalPersonnel, samples, longestPath, overallSeverity])

  const handleExportPDF = useCallback(async () => {
    setExporting("pdf")
    try {
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const dateStr = new Date().toISOString().split("T")[0]
      let y = 15

      const addPageIfNeeded = (needed: number) => {
        if (y + needed > 275) {
          pdf.addPage()
          y = 15
        }
      }

      // Title page
      pdf.setFontSize(18)
      pdf.setTextColor(30, 64, 175)
      pdf.text("IEC TS 62915:2023", pageWidth / 2, y, { align: "center" })
      y += 8
      pdf.setFontSize(14)
      pdf.text("Design Change Assessment Report", pageWidth / 2, y, { align: "center" })
      y += 8
      pdf.setFontSize(9)
      pdf.setTextColor(100)
      pdf.text(`Generated: ${dateStr}`, pageWidth / 2, y, { align: "center" })
      y += 12

      // TOC
      pdf.setFontSize(12)
      pdf.setTextColor(0)
      pdf.text("Table of Contents", 14, y)
      y += 7
      pdf.setFontSize(9)
      const tocItems = [
        "1. Executive Summary",
        "2. Selected Design Changes",
        "3. Test Plan Matrix",
        "4. Sample Requirements",
        "5. Cost Estimate",
        "6. Certification Timeline",
      ]
      tocItems.forEach(item => {
        pdf.text(item, 18, y)
        y += 5
      })
      y += 8

      // 1. Executive Summary
      pdf.setFontSize(12)
      pdf.setTextColor(30, 64, 175)
      pdf.text("1. Executive Summary", 14, y)
      y += 7
      pdf.setFontSize(9)
      pdf.setTextColor(0)

      const summaryLines = [
        `Total Design Changes: ${selectedChanges.length}`,
        `Overall Severity: ${overallSeverity ? getSeverityColor(overallSeverity).label : "None"}`,
        `Required Tests: ${requiredTestIds.length}`,
        `Affected Sequences: ${affectedSequences.join(", ")}`,
        `Estimated Total Cost: $${totalCost.toLocaleString()}`,
        `Estimated Duration: ${Math.ceil(longestPath / 168)} weeks (critical path)`,
        `Personnel Hours: ${totalPersonnel.toLocaleString()}h`,
        `Modules Needed: ${samples.iec61215} (IEC 61215) + ${samples.iec61730} (IEC 61730)`,
      ]
      summaryLines.forEach(line => {
        pdf.text(line, 18, y)
        y += 5
      })
      y += 6

      // 2. Selected Design Changes
      addPageIfNeeded(30)
      pdf.setFontSize(12)
      pdf.setTextColor(30, 64, 175)
      pdf.text("2. Selected Design Changes", 14, y)
      y += 7
      pdf.setFontSize(8)
      pdf.setTextColor(0)

      for (const comp of BOM_COMPONENTS) {
        const compChanges = comp.categories.filter(c => selectedChanges.includes(c.id))
        if (compChanges.length === 0) continue
        addPageIfNeeded(15 + compChanges.length * 5)
        pdf.setFontSize(9)
        pdf.setTextColor(60)
        pdf.text(`[${comp.clause}] ${comp.name}`, 18, y)
        y += 5
        pdf.setFontSize(8)
        pdf.setTextColor(0)
        compChanges.forEach(c => {
          pdf.text(`  - ${c.label} (${getSeverityColor(c.severity).label})`, 22, y)
          y += 4.5
        })
        y += 3
      }

      // 3. Test Plan Matrix
      addPageIfNeeded(20)
      pdf.setFontSize(12)
      pdf.setTextColor(30, 64, 175)
      pdf.text("3. Test Plan Matrix", 14, y)
      y += 7

      // Table header
      pdf.setFontSize(7)
      pdf.setFillColor(30, 64, 175)
      pdf.setTextColor(255)
      pdf.rect(14, y, pageWidth - 28, 6, "F")
      const cols = [14, 34, 80, 110, 135, 155, 175]
      const headers = ["Test ID", "Test Name", "Standard", "Sequences", "Duration", "Cost ($)"]
      headers.forEach((h, i) => pdf.text(h, cols[i] + 1, y + 4.5))
      y += 7
      pdf.setTextColor(0)

      requiredTestIds.forEach(id => {
        const t = TEST_DEFINITIONS[id]
        if (!t) return
        addPageIfNeeded(6)
        if (y % 2 === 0) {
          pdf.setFillColor(245, 247, 250)
          pdf.rect(14, y - 1, pageWidth - 28, 5, "F")
        }
        pdf.text(t.mqt || t.mst || t.id, cols[0] + 1, y + 3)
        pdf.text(t.name.slice(0, 28), cols[1] + 1, y + 3)
        pdf.text(t.standard, cols[2] + 1, y + 3)
        pdf.text(t.sequences.filter(s => affectedSequences.includes(s)).join(","), cols[3] + 1, y + 3)
        pdf.text(`${t.durationHours}h`, cols[4] + 1, y + 3)
        pdf.text(`$${t.costEstimateUSD.toLocaleString()}`, cols[5] + 1, y + 3)
        y += 5
      })
      y += 8

      // 5. Cost Estimate
      addPageIfNeeded(40)
      pdf.setFontSize(12)
      pdf.setTextColor(30, 64, 175)
      pdf.text("5. Cost Estimate", 14, y)
      y += 7
      pdf.setFontSize(8)
      pdf.setTextColor(0)

      const grandTotal = totalCost + (samples.iec61215 + samples.iec61730) * 150 + totalPersonnel * 50 + 1500
      const costLines = [
        `Test Fees: $${totalCost.toLocaleString()}`,
        `Sample Modules: $${((samples.iec61215 + samples.iec61730) * 150).toLocaleString()}`,
        `Personnel: $${(totalPersonnel * 50).toLocaleString()}`,
        `Shipping & Handling: $500`,
        `Report & Documentation: $1,000`,
        `GRAND TOTAL: $${grandTotal.toLocaleString()}`,
      ]
      costLines.forEach(line => {
        pdf.text(line, 18, y)
        y += 5
      })
      y += 6

      // 6. Certification Timeline
      addPageIfNeeded(50)
      pdf.setFontSize(12)
      pdf.setTextColor(30, 64, 175)
      pdf.text("6. Certification Timeline", 14, y)
      y += 7
      pdf.setFontSize(8)
      pdf.setTextColor(0)

      let cw = 0
      const timelinePhases = [
        { name: "Design Review", weeks: 3 },
        { name: "Sample Procurement", weeks: 4 },
        { name: "IEC Testing", weeks: Math.max(8, Math.ceil(longestPath / 168)) },
        { name: "Report Generation", weeks: 2 },
        { name: "CB Review", weeks: 3 },
        { name: "BIS Registration", weeks: 6 },
        { name: "ALMM Listing", weeks: 10 },
        { name: "Production Clearance", weeks: 1 },
      ]
      timelinePhases.forEach(p => {
        pdf.text(`${p.name}: Week ${cw} - Week ${cw + p.weeks} (${p.weeks} weeks)`, 18, y)
        y += 5
        cw += p.weeks
      })
      pdf.text(`Total: ${cw} weeks (~${(cw / 4.33).toFixed(1)} months)`, 18, y)

      pdf.save(`IEC62915_Assessment_Report_${dateStr}.pdf`)
    } finally {
      setExporting(null)
    }
  }, [selectedChanges, requiredTestIds, affectedSequences, totalCost, totalPersonnel, samples, longestPath, overallSeverity])

  if (selectedChanges.length === 0) return null

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExportExcel} disabled={!!exporting}>
        {exporting === "excel" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
        Export Excel
      </Button>
      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleExportPDF} disabled={!!exporting}>
        {exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
        Export PDF
      </Button>
    </div>
  )
}
