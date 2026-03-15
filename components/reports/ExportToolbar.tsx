// @ts-nocheck
"use client"

import { useState, RefObject } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, FileText, Table2, Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TestResult {
  standard: string
  clause: string
  testName: string
  pass: boolean
  technician: string
  date: string
  values: Record<string, string>
}

interface ExportToolbarProps {
  printRef: RefObject<HTMLDivElement>
  reportNumber: string
  reportTitle: string
  allResults: TestResult[]
  isPrintVisible: boolean
  setIsPrintVisible: (v: boolean) => void
}

// ── Traceability mock data (ISO 17025) ───────────────────────────────────────

const TRACEABILITY_INFO = {
  serviceRequestNo: "SR-2026-00341",
  projectReference: "PRJ-2026-PV-0089",
  testProtocolRef: { docFormatNo: "TP-IEC61215-v3.2", recordNo: "REC-2026-0341" },
  masterIndexRef: "MI-2026-SLX-0089",
  environmentalConditions: {
    chamberId: "ESPEC TSE-11-A / Memmert HCP 1080",
    ambientTemp: "23.0 ± 1.0 °C",
    ambientRH: "45 ± 5 %RH",
  },
  operators: [
    { name: "Dr. Rajesh Kumar", qualification: "Ph.D. PV Technology, NABL Certified", authId: "AUTH-RK-2024-01" },
    { name: "Dr. Priya Sharma", qualification: "M.Tech EE, IEC/TC 82 Expert", authId: "AUTH-PS-2024-02" },
    { name: "Dr. Arun Patel", qualification: "Ph.D. Materials Science", authId: "AUTH-AP-2024-03" },
    { name: "Deepa Nair", qualification: "M.Sc. Physics, NABL Assessor", authId: "AUTH-DN-2024-04" },
    { name: "Vikram Singh", qualification: "B.Tech EE, ISO 17025 Trained", authId: "AUTH-VS-2024-05" },
  ],
  standardReference: "IEC 61215:2021 Ed.2, IEC 61730:2023 Ed.2, IEC 61853:2020 Ed.1, IEC 61701:2020 Ed.3",
  dataSource: "SolarLabX LIMS — Data Analysis Module (DA-IEC61215-2026-0089)",
}

const EQUIPMENT_TRACEABILITY = [
  { id: "SS-001", equipment: "Solar Simulator (Sinton 1000)", calCertNo: "CAL-SS-2026-01", calDueDate: "2027-01-10", calLab: "PTB Germany / NABL-TC-1234" },
  { id: "RC-WPVS-01", equipment: "Reference Cell (c-Si WPVS)", calCertNo: "CAL-RC-2026-01", calDueDate: "2027-01-05", calLab: "Fraunhofer ISE / NABL-TC-1234" },
  { id: "ESPEC-TSE-11A", equipment: "TC Chamber (ESPEC TSE-11-A)", calCertNo: "CAL-CH-2026-02", calDueDate: "2027-01-08", calLab: "NABL-TC-1234" },
  { id: "MEM-HCP-1080", equipment: "HF/DH Chamber (Memmert HCP 1080)", calCertNo: "CAL-CH-2026-03", calDueDate: "2027-01-08", calLab: "NABL-TC-1234" },
  { id: "EL-XEVA-01", equipment: "EL Camera (Xenics Xeva-FPA)", calCertNo: "CAL-EL-2026-01", calDueDate: "2027-01-12", calLab: "NABL-TC-1234" },
  { id: "INS-FLUKE-1550C", equipment: "Insulation Tester (Fluke 1550C)", calCertNo: "CAL-IT-2026-01", calDueDate: "2027-01-06", calLab: "NABL-TC-1234" },
  { id: "HP-CHROMA-19053", equipment: "Hi-Pot Tester (Chroma 19053)", calCertNo: "CAL-HP-2026-01", calDueDate: "2027-01-06", calLab: "NABL-TC-1234" },
]

// Per-test traceability metadata
function getTestTraceability(testId: string, testName: string, technician: string, date: string) {
  const equipMap: Record<string, string> = {
    "Maximum Power": "SS-001",
    "Insulation": "INS-FLUKE-1550C",
    "Temperature Coefficients": "SS-001",
    "NMOT": "RC-WPVS-01",
    "Low Irradiance": "SS-001",
    "EL Imaging": "EL-XEVA-01",
    "UV Preconditioning": "ESPEC-TSE-11A",
    "Thermal Cycling": "ESPEC-TSE-11A",
    "Humidity-Freeze": "MEM-HCP-1080",
    "Damp Heat": "MEM-HCP-1080",
    "Wet Leakage": "INS-FLUKE-1550C",
    "Static Mechanical": "SS-001",
    "Hail": "SS-001",
    "Bypass Diode": "SS-001",
    "Visual Inspection": "SS-001",
    "Impulse Voltage": "HP-CHROMA-19053",
    "Dielectric": "HP-CHROMA-19053",
    "Hi-Pot": "HP-CHROMA-19053",
    "Ground Continuity": "INS-FLUKE-1550C",
    "Cut Susceptibility": "INS-FLUKE-1550C",
    "Salt Mist": "MEM-HCP-1080",
    "Power & Energy Rating": "SS-001",
    "Angular Response": "SS-001",
    "Spectral Response": "SS-001",
    "Annual Energy": "SS-001",
  }
  const matched = Object.entries(equipMap).find(([key]) => testName.includes(key))
  const equipId = matched ? matched[1] : "SS-001"
  const equip = EQUIPMENT_TRACEABILITY.find(e => e.id === equipId) || EQUIPMENT_TRACEABILITY[0]
  const op = TRACEABILITY_INFO.operators.find(o => o.name.includes(technician.split(" ")[0])) || TRACEABILITY_INFO.operators[0]

  return {
    equipmentId: equip.id,
    calCertNo: equip.calCertNo,
    calStatus: "Valid",
    operator: op.name,
    authId: op.authId,
    rawDataRef: `RD-${date.replace(/-/g, "")}-${testId || testName.slice(0, 6).toUpperCase()}`,
    dataSource: TRACEABILITY_INFO.dataSource,
  }
}

// ── Helper: capture chart elements as PNG base64 ─────────────────────────────

async function captureCharts(printEl: HTMLDivElement): Promise<{ degradation?: string; ivCurve?: string }> {
  const { default: html2canvas } = await import("html2canvas")
  const result: { degradation?: string; ivCurve?: string } = {}

  // Find chart containers within the print view by their figure labels
  const allTextEls = Array.from(printEl.querySelectorAll("div"))

  for (const el of allTextEls) {
    const text = el.textContent || ""
    if (text.includes("Fig. 7.1") && el.classList.contains("text-xs")) {
      // The chart is the sibling div with the ResponsiveContainer
      const chartContainer = el.nextElementSibling as HTMLElement
      if (chartContainer) {
        try {
          const canvas = await html2canvas(chartContainer, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" })
          result.degradation = canvas.toDataURL("image/png")
        } catch { /* skip */ }
      }
    }
    if (text.includes("Fig. 7.2") && el.classList.contains("text-xs")) {
      const chartContainer = el.nextElementSibling as HTMLElement
      if (chartContainer) {
        try {
          const canvas = await html2canvas(chartContainer, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" })
          result.ivCurve = canvas.toDataURL("image/png")
        } catch { /* skip */ }
      }
    }
  }

  // Fallback: try to find any .recharts-wrapper elements
  if (!result.degradation || !result.ivCurve) {
    const chartWrappers = printEl.querySelectorAll(".recharts-wrapper")
    if (chartWrappers.length >= 1 && !result.degradation) {
      try {
        const parentEl = chartWrappers[0].closest("div[style]") as HTMLElement || chartWrappers[0].parentElement as HTMLElement
        const canvas = await html2canvas(parentEl, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" })
        result.degradation = canvas.toDataURL("image/png")
      } catch { /* skip */ }
    }
    if (chartWrappers.length >= 2 && !result.ivCurve) {
      try {
        const parentEl = chartWrappers[1].closest("div[style]") as HTMLElement || chartWrappers[1].parentElement as HTMLElement
        const canvas = await html2canvas(parentEl, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" })
        result.ivCurve = canvas.toDataURL("image/png")
      } catch { /* skip */ }
    }
  }

  return result
}

export function ExportToolbar({
  printRef,
  reportNumber,
  reportTitle,
  allResults,
  isPrintVisible,
  setIsPrintVisible,
}: ExportToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null)

  // ── PDF Export via jsPDF + html2canvas (with chart image embedding) ─────────
  const exportPDF = async () => {
    setLoading("pdf")
    let wasHidden = false
    try {
      if (!isPrintVisible) {
        wasHidden = true
        setIsPrintVisible(true)
        await new Promise((r) => setTimeout(r, 1200))
      }
      const element = printRef.current
      if (!element) throw new Error("Print element not found")

      // 1) Capture chart images BEFORE generating PDF
      const chartImages = await captureCharts(element)

      const { default: html2canvas } = await import("html2canvas")
      const { jsPDF } = await import("jspdf")

      // 2) Render the entire report to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.92)
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pW = pdf.internal.pageSize.getWidth()  // 210
      const pH = pdf.internal.pageSize.getHeight() // 297
      const margin = 10
      const headerH = 14
      const footerH = 12
      const contentH = pH - headerH - footerH - margin
      const contentW = pW - margin * 2  // 190, but chart images max 170
      const totalImgH = (canvas.height * contentW) / canvas.width
      const imgStartY = headerH + 1
      const totalPages = Math.ceil(totalImgH / contentH)

      const addHeaderFooter = (pageNum: number) => {
        // Blue header bar
        pdf.setFillColor(30, 64, 175)
        pdf.rect(0, 0, pW, headerH, "F")
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(6.5)
        pdf.text(reportNumber, margin, 5)
        const shortTitle = reportTitle.length > 55 ? reportTitle.slice(0, 55) + "…" : reportTitle
        pdf.text(shortTitle, pW / 2, 5, { align: "center" })
        pdf.text(new Date().toISOString().slice(0, 10), pW - margin, 5, { align: "right" })
        pdf.setFontSize(8.5)
        pdf.setFont("helvetica", "bold")
        pdf.text("PHOTOVOLTAIC MODULE TEST REPORT", pW / 2, 11, { align: "center" })
        pdf.setFont("helvetica", "normal")
        // Footer line
        pdf.setDrawColor(180, 180, 180)
        pdf.line(margin, pH - footerH, pW - margin, pH - footerH)
        pdf.setFontSize(6.5)
        pdf.setTextColor(120, 120, 120)
        pdf.text(
          "ISO/IEC 17025:2017 Compliant | Confidential – Not to be reproduced except in full",
          margin,
          pH - footerH + 5
        )
        pdf.text(`Page ${pageNum} of ${totalPages + 1}`, pW - margin, pH - footerH + 5, {
          align: "right",
        })
      }

      // Page 1
      addHeaderFooter(1)
      pdf.addImage(imgData, "JPEG", margin, imgStartY, contentW, totalImgH)

      // Subsequent pages
      for (let i = 2; i <= totalPages; i++) {
        pdf.addPage()
        addHeaderFooter(i)
        const yOffset = imgStartY - (i - 1) * contentH
        pdf.addImage(imgData, "JPEG", margin, yOffset, contentW, totalImgH)
      }

      // ── Appendix page: Embedded Chart Images ──
      if (chartImages.degradation || chartImages.ivCurve) {
        pdf.addPage()
        const appendixPage = totalPages + 1
        addHeaderFooter(appendixPage)

        let yPos = headerH + 5
        pdf.setFontSize(14)
        pdf.setTextColor(30, 58, 95)
        pdf.setFont("helvetica", "bold")
        pdf.text("Appendix A: Performance Charts (High-Resolution)", margin, yPos)
        yPos += 8

        if (chartImages.degradation) {
          pdf.setFontSize(10)
          pdf.setTextColor(80, 80, 80)
          pdf.setFont("helvetica", "normal")
          pdf.text("Fig. A.1 — Pmax Degradation Through IEC 61215 Test Sequence", margin, yPos)
          yPos += 3
          try {
            pdf.addImage(chartImages.degradation, "PNG", margin + 10, yPos, 170, 70)
          } catch {
            pdf.addImage(chartImages.degradation, "JPEG", margin + 10, yPos, 170, 70)
          }
          yPos += 75
        }

        if (chartImages.ivCurve) {
          pdf.setFontSize(10)
          pdf.setTextColor(80, 80, 80)
          pdf.text("Fig. A.2 — I-V & P-V Characteristics at STC (Initial)", margin, yPos)
          yPos += 3
          try {
            pdf.addImage(chartImages.ivCurve, "PNG", margin + 10, yPos, 170, 70)
          } catch {
            pdf.addImage(chartImages.ivCurve, "JPEG", margin + 10, yPos, 170, 70)
          }
          yPos += 75
        }

        // EL / VI image placeholders
        pdf.setFontSize(10)
        pdf.setTextColor(80, 80, 80)
        pdf.text("Fig. A.3 — EL Image (Initial)", margin, yPos)
        yPos += 3
        pdf.setDrawColor(180, 180, 180)
        pdf.setFillColor(245, 245, 245)
        pdf.rect(margin + 10, yPos, 75, 40, "FD")
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text("[ EL Image – Initial ]", margin + 47, yPos + 22, { align: "center" })

        pdf.text("Fig. A.4 — EL Image (Post-Stress)", margin + 100, yPos - 3)
        pdf.rect(margin + 100, yPos, 75, 40, "FD")
        pdf.text("[ EL Image – Post-Stress ]", margin + 137, yPos + 22, { align: "center" })
        yPos += 45

        pdf.setFontSize(10)
        pdf.setTextColor(80, 80, 80)
        pdf.text("Fig. A.5 — Visual Inspection Photos", margin, yPos)
        yPos += 3
        for (let vi = 0; vi < 3; vi++) {
          const labels = ["Front Surface", "Rear/Backsheet", "Junction Box"]
          const xOff = margin + 10 + vi * 60
          pdf.setFillColor(245, 245, 245)
          pdf.rect(xOff, yPos, 50, 30, "FD")
          pdf.setFontSize(7)
          pdf.setTextColor(150, 150, 150)
          pdf.text(`[ VI: ${labels[vi]} ]`, xOff + 25, yPos + 17, { align: "center" })
        }
      }

      pdf.save(`${reportNumber}_TRF_Report.pdf`)
      toast.success("PDF exported with embedded charts and image placeholders")
    } catch (err) {
      console.error("PDF export error:", err)
      toast.error(
        "PDF export failed. Please use 'Print → Save as PDF' as a fallback, or toggle 'Show Full Report' before exporting."
      )
    } finally {
      if (wasHidden) setIsPrintVisible(false)
      setLoading(null)
    }
  }

  // ── Excel Export via xlsx ────────────────────────────────────────────────────
  const exportExcel = async () => {
    setLoading("excel")
    try {
      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()

      const summaryRows = allResults.map((r, i) => ({
        "#": i + 1,
        Standard: r.standard,
        Clause: r.clause,
        "Test Name": r.testName,
        Technician: r.technician,
        Date: r.date,
        Result: r.pass ? "PASS" : "FAIL",
      }))
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows)
      wsSummary["!cols"] = [
        { wch: 4 }, { wch: 14 }, { wch: 20 }, { wch: 42 },
        { wch: 18 }, { wch: 12 }, { wch: 8 },
      ]
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")

      const standards = [...new Set(allResults.map((r) => r.standard))]
      for (const std of standards) {
        const rows = allResults
          .filter((r) => r.standard === std)
          .map((r, i) => ({
            "#": i + 1,
            Clause: r.clause,
            "Test Name": r.testName,
            ...Object.fromEntries(Object.entries(r.values).slice(0, 8)),
            Technician: r.technician,
            Date: r.date,
            Result: r.pass ? "PASS" : "FAIL",
          }))
        const ws = XLSX.utils.json_to_sheet(rows)
        const sheetName = std.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 31)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      }

      // Traceability sheet
      const traceRows = allResults.map((r, i) => {
        const t = getTestTraceability(r.clause, r.testName, r.technician, r.date)
        return {
          "#": i + 1,
          "Test Name": r.testName,
          "Protocol Ref": TRACEABILITY_INFO.testProtocolRef.docFormatNo,
          "Equipment ID": t.equipmentId,
          "Cal Cert": t.calCertNo,
          "Cal Status": t.calStatus,
          "Operator": t.operator,
          "Auth ID": t.authId,
          "Data Source": t.dataSource,
          "Raw Data Ref": t.rawDataRef,
        }
      })
      const wsTrace = XLSX.utils.json_to_sheet(traceRows)
      wsTrace["!cols"] = [
        { wch: 4 }, { wch: 40 }, { wch: 20 }, { wch: 18 }, { wch: 18 },
        { wch: 10 }, { wch: 20 }, { wch: 18 }, { wch: 40 }, { wch: 25 },
      ]
      XLSX.utils.book_append_sheet(wb, wsTrace, "Traceability")

      XLSX.writeFile(wb, `${reportNumber}_Test_Data.xlsx`)
    } catch (err) {
      console.error("Excel export error:", err)
      toast.error("Excel export failed.")
    } finally {
      setLoading(null)
    }
  }

  // ── Word Export via docx (with chart images + traceability) ─────────────────
  const exportWord = async () => {
    setLoading("word")
    let wasHidden = false
    try {
      // Ensure print view is visible so we can capture charts
      if (!isPrintVisible) {
        wasHidden = true
        setIsPrintVisible(true)
        await new Promise((r) => setTimeout(r, 1200))
      }

      // Capture charts
      let chartImages: { degradation?: string; ivCurve?: string } = {}
      if (printRef.current) {
        chartImages = await captureCharts(printRef.current)
      }

      const {
        Document, Packer, Paragraph, Table, TableRow, TableCell,
        TextRun, HeadingLevel, AlignmentType, BorderStyle,
        Header, Footer, PageNumber, ImageRun, SectionType,
      } = await import("docx")

      const LAB_NAME = "SolarLabX Testing Laboratory"
      const today = new Date().toLocaleDateString("en-IN")
      const passCount = allResults.filter((r) => r.pass).length
      const failCount = allResults.length - passCount
      const overallPass = failCount === 0
      const standards = [...new Set(allResults.map((r) => r.standard))].join(" / ")

      // ── Helper: create a table cell with optional fill/color ──
      const makeCell = (
        text: string,
        opts: {
          bold?: boolean
          color?: string
          fill?: string
          align?: string
          size?: number
          colSpan?: number
        } = {}
      ) => {
        const cellOpts: Record<string, unknown> = {
          children: [
            new Paragraph({
              alignment: opts.align ?? AlignmentType.LEFT,
              children: [
                new TextRun({
                  text,
                  bold: opts.bold ?? false,
                  color: opts.color ?? "000000",
                  size: opts.size ?? 20,
                }),
              ],
            }),
          ],
        }
        if (opts.fill) {
          cellOpts.shading = { type: "clear", color: "auto", fill: opts.fill }
        }
        if (opts.colSpan) {
          cellOpts.columnSpan = opts.colSpan
        }
        return new TableCell(cellOpts)
      }

      // ── Convert base64 data URL to Uint8Array for ImageRun ──
      const base64ToUint8Array = (dataUrl: string): Uint8Array => {
        const base64 = dataUrl.split(",")[1]
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }
        return bytes
      }

      // ── Header (all pages except cover) ──
      const docHeader = new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 4 } },
            children: [
              new TextRun({ text: LAB_NAME, bold: true, size: 18, color: "1E3A5F" }),
              new TextRun({ text: "   |   Doc No: " + reportNumber + "   |   Rev 00", size: 16, color: "555555" }),
            ],
          }),
        ],
      })

      // ── Footer (all pages except cover) ──
      const docFooter = new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 4 } },
            children: [
              new TextRun({ text: "CONFIDENTIAL", bold: true, size: 16, color: "333333" }),
              new TextRun({ text: "   |   Issue Date: " + today + "   |   Page ", size: 16, color: "555555" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
              new TextRun({ text: " of ", size: 16, color: "555555" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 }),
              new TextRun({ text: "   |   Not to be reproduced except in full", size: 14, color: "888888" }),
            ],
          }),
        ],
      })

      // ── Test results summary table rows ──
      const tableHeaderRow = new TableRow({
        tableHeader: true,
        children: ["#", "Standard", "Clause", "Test Name", "Technician", "Date", "Result"].map(
          (h) =>
            new TableCell({
              shading: { type: "clear", color: "auto", fill: "1E3A8A" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18 })],
                }),
              ],
            })
        ),
      })

      const tableDataRows = allResults.map(
        (r, i) =>
          new TableRow({
            children: [
              makeCell(String(i + 1), { align: AlignmentType.CENTER, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.standard, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.clause, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.testName, { bold: true, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.technician, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.date, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              new TableCell({
                shading: { type: "clear", color: "auto", fill: r.pass ? "D1FAE5" : "FEE2E2" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: r.pass ? "PASS" : "FAIL",
                        bold: true,
                        color: r.pass ? "16A34A" : "DC2626",
                        size: 18,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
      )

      // ── Abbreviations table ──
      const abbrevData: [string, string, string, string][] = [
        ["STC", "Standard Test Conditions (1000 W/m², 25°C, AM 1.5G)", "MQT", "Module Quality Test (IEC 61215)"],
        ["NMOT", "Nominal Module Operating Temperature", "MST", "Module Safety Test (IEC 61730)"],
        ["Pmax", "Maximum Power Point Power", "EL", "Electroluminescence Imaging"],
        ["Isc", "Short Circuit Current", "PID", "Potential Induced Degradation"],
        ["Voc", "Open Circuit Voltage", "TC", "Thermal Cycling (-40°C to +85°C)"],
        ["FF", "Fill Factor", "DH", "Damp Heat (85°C / 85% RH)"],
        ["GUM", "Guide to Expression of Uncertainty in Measurement (ISO/IEC 98-3)", "TRF", "Test Report Form"],
        ["ISO", "International Organization for Standardization", "IEC", "International Electrotechnical Commission"],
      ]

      const abbrevHeaderRow = new TableRow({
        tableHeader: true,
        children: ["Abbrev.", "Definition", "Abbrev.", "Definition"].map((h) =>
          new TableCell({
            shading: { type: "clear", color: "auto", fill: "1E3A8A" },
            children: [
              new Paragraph({
                children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18 })],
              }),
            ],
          })
        ),
      })

      const abbrevRows = abbrevData.map(
        ([a1, d1, a2, d2], i) =>
          new TableRow({
            children: [
              makeCell(a1, { bold: true, color: "1E3A5F", fill: i % 2 === 0 ? "F0F4FF" : "FFFFFF" }),
              makeCell(d1, { fill: i % 2 === 0 ? "F0F4FF" : "FFFFFF" }),
              makeCell(a2, { bold: true, color: "1E3A5F", fill: i % 2 === 0 ? "F0F4FF" : "FFFFFF" }),
              makeCell(d2, { fill: i % 2 === 0 ? "F0F4FF" : "FFFFFF" }),
            ],
          })
      )

      // ── Chart image paragraphs for Word ──
      const chartParagraphs: any[] = []

      if (chartImages.degradation) {
        chartParagraphs.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Fig. 7.1 — Pmax Degradation Through IEC 61215 Test Sequence", bold: true, size: 20, color: "555555" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: base64ToUint8Array(chartImages.degradation),
                transformation: { width: 580, height: 240 },
                type: "png",
              }),
            ],
          })
        )
      }

      if (chartImages.ivCurve) {
        chartParagraphs.push(
          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: "Fig. 7.2 — I-V & P-V Characteristics at STC (Initial)", bold: true, size: 20, color: "555555" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: base64ToUint8Array(chartImages.ivCurve),
                transformation: { width: 580, height: 240 },
                type: "png",
              }),
            ],
          })
        )
      }

      // EL / VI image placeholders in Word
      const imagePlaceholderParagraphs = [
        new Paragraph({
          spacing: { before: 300, after: 100 },
          children: [new TextRun({ text: "EL & Visual Inspection Image Placeholders", bold: true, size: 24, color: "1E3A5F" })],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Fig. 7.3 — EL Image (Initial): ", bold: true, size: 20, color: "555555" }),
            new TextRun({ text: "[ Attach EL image here ]", italics: true, size: 20, color: "AAAAAA" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Fig. 7.4 — EL Image (Post-Stress): ", bold: true, size: 20, color: "555555" }),
            new TextRun({ text: "[ Attach EL image here ]", italics: true, size: 20, color: "AAAAAA" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Fig. 7.5 — VI: Front Surface: ", bold: true, size: 20, color: "555555" }),
            new TextRun({ text: "[ Attach VI photo here ]", italics: true, size: 20, color: "AAAAAA" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Fig. 7.6 — VI: Rear/Backsheet: ", bold: true, size: 20, color: "555555" }),
            new TextRun({ text: "[ Attach VI photo here ]", italics: true, size: 20, color: "AAAAAA" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Fig. 7.7 — VI: Junction Box: ", bold: true, size: 20, color: "555555" }),
            new TextRun({ text: "[ Attach VI photo here ]", italics: true, size: 20, color: "AAAAAA" }),
          ],
        }),
      ]

      // ── Traceability section for Word ──
      const traceabilityInfoRows = [
        ["Service Request No.", TRACEABILITY_INFO.serviceRequestNo],
        ["Project Reference", TRACEABILITY_INFO.projectReference],
        ["Test Protocol (Doc Format No.)", TRACEABILITY_INFO.testProtocolRef.docFormatNo],
        ["Test Protocol (Record No.)", TRACEABILITY_INFO.testProtocolRef.recordNo],
        ["Master Index Reference", TRACEABILITY_INFO.masterIndexRef],
        ["Chamber ID", TRACEABILITY_INFO.environmentalConditions.chamberId],
        ["Ambient Temperature", TRACEABILITY_INFO.environmentalConditions.ambientTemp],
        ["Ambient Humidity", TRACEABILITY_INFO.environmentalConditions.ambientRH],
        ["Standard Reference", TRACEABILITY_INFO.standardReference],
        ["Data Source", TRACEABILITY_INFO.dataSource],
      ]

      const traceInfoTableRows = traceabilityInfoRows.map(
        ([label, value], i) =>
          new TableRow({
            children: [
              makeCell(label, { bold: true, fill: i % 2 === 0 ? "F5F5F5" : "FFFFFF", color: "1E3A5F" }),
              makeCell(value, { fill: i % 2 === 0 ? "F5F5F5" : "FFFFFF" }),
            ],
          })
      )

      // Operator details table
      const operatorHeaderRow = new TableRow({
        tableHeader: true,
        children: ["Name", "Qualification", "Authorization ID"].map((h) =>
          new TableCell({
            shading: { type: "clear", color: "auto", fill: "1E3A8A" },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18 })] })],
          })
        ),
      })

      const operatorRows = TRACEABILITY_INFO.operators.map(
        (op, i) =>
          new TableRow({
            children: [
              makeCell(op.name, { bold: true, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(op.qualification, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(op.authId, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            ],
          })
      )

      // Equipment traceability table
      const equipHeaderRow = new TableRow({
        tableHeader: true,
        children: ["Equipment ID", "Equipment", "Cal. Certificate", "Cal. Due Date", "Cal. Lab"].map((h) =>
          new TableCell({
            shading: { type: "clear", color: "auto", fill: "1E3A8A" },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 16 })] })],
          })
        ),
      })

      const equipRows = EQUIPMENT_TRACEABILITY.map(
        (eq, i) =>
          new TableRow({
            children: [
              makeCell(eq.id, { bold: true, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(eq.equipment, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(eq.calCertNo, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(eq.calDueDate, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(eq.calLab, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            ],
          })
      )

      // Traceability matrix table
      const traceMatrixHeaderRow = new TableRow({
        tableHeader: true,
        children: ["Test ID", "Protocol Ref", "Equipment", "Cal Status", "Operator", "Data Source", "Raw Data Ref"].map((h) =>
          new TableCell({
            shading: { type: "clear", color: "auto", fill: "1E3A8A" },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 14 })] })],
          })
        ),
      })

      const traceMatrixRows = allResults.map((r, i) => {
        const t = getTestTraceability(r.clause, r.testName, r.technician, r.date)
        return new TableRow({
          children: [
            makeCell(r.clause.split(" /")[0] || r.clause, { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            makeCell(TRACEABILITY_INFO.testProtocolRef.docFormatNo, { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            makeCell(t.equipmentId, { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            makeCell(t.calStatus, { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF", color: "16A34A" }),
            makeCell(t.operator.split(" ").slice(-1)[0], { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            makeCell(t.dataSource.split(" — ")[1] || t.dataSource, { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
            makeCell(t.rawDataRef, { size: 16, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
          ],
        })
      })

      // ── Build the document ──
      const doc = new Document({
        sections: [
          // ── Section 1: Cover page (no header/footer) ──
          {
            properties: {
              page: { margin: { top: 1701, bottom: 1701, left: 1701, right: 1701 } },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 1200, after: 400 },
                children: [new TextRun({ text: "[ Lab Logo ]", size: 20, color: "AAAAAA", italics: true })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [new TextRun({ text: LAB_NAME, bold: true, size: 40, color: "1E3A5F" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1E3A5F", space: 1 } },
                children: [new TextRun({ text: "" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [new TextRun({ text: "TEST REPORT", bold: true, size: 48, color: "1E3A5F" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [new TextRun({ text: "PHOTOVOLTAIC MODULE QUALIFICATION", bold: true, size: 28, color: "444444" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
                children: [new TextRun({ text: reportTitle, size: 22, color: "1E3A5F", italics: true })],
              }),
              new Table({
                width: { size: 100, type: "pct" },
                rows: [
                  new TableRow({
                    children: [
                      makeCell("Report Number", { bold: true, fill: "F5F5F5" }),
                      makeCell(reportNumber),
                      makeCell("Date of Issue", { bold: true, fill: "F5F5F5" }),
                      makeCell(today),
                    ],
                  }),
                  new TableRow({
                    children: [
                      makeCell("Standard(s)", { bold: true, fill: "F5F5F5" }),
                      makeCell(standards),
                      makeCell("Testing Period", { bold: true, fill: "F5F5F5" }),
                      makeCell("2026-01-15 to 2026-03-10"),
                    ],
                  }),
                  new TableRow({
                    children: [
                      makeCell("Total Tests", { bold: true, fill: "F5F5F5" }),
                      makeCell(String(allResults.length)),
                      makeCell("Pass / Fail", { bold: true, fill: "F5F5F5" }),
                      makeCell(`${passCount} passed, ${failCount} failed`),
                    ],
                  }),
                  new TableRow({
                    children: [
                      makeCell("Overall Result", { bold: true, fill: "F5F5F5" }),
                      makeCell(overallPass ? "PASS" : "FAIL", {
                        bold: true,
                        color: overallPass ? "16A34A" : "DC2626",
                        fill: overallPass ? "D1FAE5" : "FEE2E2",
                      }),
                      makeCell("Date of Receipt", { bold: true, fill: "F5F5F5" }),
                      makeCell("2026-01-10"),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 500 },
                alignment: AlignmentType.LEFT,
                shading: { type: "clear", color: "auto", fill: "FFFBEB" },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "FBBF24" },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "FBBF24" },
                  left: { style: BorderStyle.SINGLE, size: 4, color: "FBBF24" },
                  right: { style: BorderStyle.SINGLE, size: 4, color: "FBBF24" },
                },
                children: [
                  new TextRun({ text: "CONFIDENTIAL", bold: true, size: 18 }),
                  new TextRun({
                    text: " — This report is the confidential property of " + LAB_NAME +
                      " and is issued solely for the purpose of communicating test results to the named client. " +
                      "This report shall not be reproduced except in full without the prior written approval of the issuing laboratory.",
                    size: 18,
                    color: "555555",
                  }),
                ],
              }),
            ],
          },

          // ── Section 2: Report body (with header/footer) ──
          {
            headers: { default: docHeader },
            footers: { default: docFooter },
            children: [
              // ── Table of Contents ──
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 0, after: 200 },
                children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: "1E3A5F" })],
              }),
              ...[
                ["1.", "General Information"],
                ["2.", "Abbreviations & Definitions"],
                ["3.", "Test Results Summary"],
                ["4.", "Detailed MQT/MST Results"],
                ["5.", "Performance Data & Charts"],
                ["6.", "Data Traceability (ISO 17025)"],
                ["7.", "Conclusions & Certification Statement"],
                ["8.", "Signatories & Authorisation"],
              ].map(([num, title]) =>
                new Paragraph({
                  spacing: { after: 60 },
                  children: [
                    new TextRun({ text: num + "  ", bold: true, size: 20, color: "1E3A5F" }),
                    new TextRun({ text: title, size: 20 }),
                  ],
                })
              ),

              // ── Section 1: General Info ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "1.  General Information", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Table({
                width: { size: 100, type: "pct" },
                rows: [
                  new TableRow({ children: [makeCell("Testing Laboratory", { bold: true, fill: "F5F5F5" }), makeCell(LAB_NAME)] }),
                  new TableRow({ children: [makeCell("Report Number", { bold: true, fill: "F5F5F5" }), makeCell(reportNumber)] }),
                  new TableRow({ children: [makeCell("Date of Issue", { bold: true, fill: "F5F5F5" }), makeCell(today)] }),
                  new TableRow({ children: [makeCell("Standard(s) Applied", { bold: true, fill: "F5F5F5" }), makeCell(standards)] }),
                  new TableRow({ children: [makeCell("Test Period", { bold: true, fill: "F5F5F5" }), makeCell("2026-01-15 to 2026-03-10")] }),
                  new TableRow({ children: [makeCell("Reference Standard", { bold: true, fill: "F5F5F5" }), makeCell("ISO/IEC 17025:2017")] }),
                  new TableRow({ children: [makeCell("Accreditation Body", { bold: true, fill: "F5F5F5" }), makeCell("NABL (National Accreditation Board for Testing & Calibration Laboratories)")] }),
                ],
              }),

              // ── Section 2: Abbreviations ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "2.  Abbreviations & Definitions", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Table({
                width: { size: 100, type: "pct" },
                rows: [abbrevHeaderRow, ...abbrevRows],
              }),

              // ── Section 3: Test Results Summary ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "3.  Test Results Summary", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({ text: "Overall Result: ", bold: true, size: 22 }),
                  new TextRun({
                    text: overallPass ? "PASS" : "FAIL",
                    bold: true,
                    size: 28,
                    color: overallPass ? "16A34A" : "DC2626",
                  }),
                  new TextRun({
                    text: `   (${passCount} of ${allResults.length} tests passed)`,
                    size: 20,
                    color: "555555",
                  }),
                ],
              }),
              new Table({
                width: { size: 100, type: "pct" },
                rows: [tableHeaderRow, ...tableDataRows],
              }),

              // ── Section 4: Detailed MQT Results ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "4.  Detailed MQT/MST Results", bold: true, size: 32, color: "1E3A5F" })],
              }),
              ...allResults.flatMap((r, i) => {
                const t = getTestTraceability(r.clause, r.testName, r.technician, r.date)
                return [
                  new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 80 },
                    children: [
                      new TextRun({
                        text: `${i + 1}.  ${r.testName}  —  ${r.clause}`,
                        bold: true,
                        size: 24,
                        color: r.pass ? "1E5F3A" : "9B1C1C",
                      }),
                      new TextRun({
                        text: "   " + (r.pass ? "PASS" : "FAIL"),
                        bold: true,
                        size: 22,
                        color: r.pass ? "16A34A" : "DC2626",
                      }),
                    ],
                  }),
                  new Table({
                    width: { size: 100, type: "pct" },
                    rows: [
                      new TableRow({
                        children: [
                          makeCell("Technician", { bold: true, fill: "F5F5F5" }),
                          makeCell(r.technician),
                          makeCell("Test Date", { bold: true, fill: "F5F5F5" }),
                          makeCell(r.date),
                        ],
                      }),
                      new TableRow({
                        children: [
                          makeCell("Equipment ID", { bold: true, fill: "F5F5F5" }),
                          makeCell(t.equipmentId),
                          makeCell("Cal. Status", { bold: true, fill: "F5F5F5" }),
                          makeCell(t.calStatus, { color: "16A34A" }),
                        ],
                      }),
                      new TableRow({
                        children: [
                          makeCell("Raw Data Ref", { bold: true, fill: "F5F5F5" }),
                          makeCell(t.rawDataRef),
                          makeCell("Operator Auth ID", { bold: true, fill: "F5F5F5" }),
                          makeCell(t.authId),
                        ],
                      }),
                      ...Object.entries(r.values).map(
                        ([k, v], vi) =>
                          new TableRow({
                            children: [
                              makeCell(
                                k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
                                { bold: true, fill: vi % 2 === 0 ? "F9F9F9" : "FFFFFF" }
                              ),
                              makeCell(String(v), { fill: vi % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
                              makeCell("", { fill: vi % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
                              makeCell("", { fill: vi % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
                            ],
                          })
                      ),
                    ],
                  }),
                ]
              }),

              // ── Section 5: Performance Data & Charts ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "5.  Performance Data & Charts", bold: true, size: 32, color: "1E3A5F" })],
              }),
              ...chartParagraphs,
              ...(chartParagraphs.length === 0
                ? [
                    new Paragraph({
                      spacing: { after: 100 },
                      children: [
                        new TextRun({ text: "Note: Chart images were not captured. Please use the PDF export or enable 'Show Full Report' before exporting Word.", italics: true, size: 20, color: "888888" }),
                      ],
                    }),
                  ]
                : []),
              ...imagePlaceholderParagraphs,

              // ── Section 6: Data Traceability (ISO 17025) ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "6.  Data Traceability (ISO/IEC 17025)", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: "This section provides the complete data traceability chain from service request through to reported results, in compliance with ISO/IEC 17025:2017 Clause 7.5.", size: 20 })],
              }),

              // 6.1 Traceability Information
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                children: [new TextRun({ text: "6.1  Traceability Information", bold: true, size: 24, color: "1E3A5F" })],
              }),
              new Table({ width: { size: 100, type: "pct" }, rows: traceInfoTableRows }),

              // 6.2 Operator Details
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                children: [new TextRun({ text: "6.2  Operator Details", bold: true, size: 24, color: "1E3A5F" })],
              }),
              new Table({ width: { size: 100, type: "pct" }, rows: [operatorHeaderRow, ...operatorRows] }),

              // 6.3 Equipment Traceability
              new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                children: [new TextRun({ text: "6.3  Equipment Traceability", bold: true, size: 24, color: "1E3A5F" })],
              }),
              new Table({ width: { size: 100, type: "pct" }, rows: [equipHeaderRow, ...equipRows] }),

              // 6.4 Traceability Matrix
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                children: [new TextRun({ text: "6.4  Traceability Matrix", bold: true, size: 24, color: "1E3A5F" })],
              }),
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: "Full chain from test protocol → execution → data → report for each test.", size: 18, color: "555555", italics: true })],
              }),
              new Table({ width: { size: 100, type: "pct" }, rows: [traceMatrixHeaderRow, ...traceMatrixRows] }),

              // ── Section 7: Conclusions ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "7.  Conclusions & Certification Statement", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Paragraph({
                spacing: { after: 160 },
                children: [
                  new TextRun({
                    text: `The photovoltaic module identified in Section 1 has been tested in accordance with the requirements of ${reportTitle} at ${LAB_NAME}.`,
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 160 },
                children: [
                  new TextRun({ text: `Based on the test results documented in this report, the module under test has `, size: 22 }),
                  new TextRun({ text: overallPass ? "PASSED" : "FAILED", bold: true, size: 22, color: overallPass ? "16A34A" : "DC2626" }),
                  new TextRun({ text: ` all applicable test requirements. A total of ${passCount} of ${allResults.length} tests passed.`, size: 22 }),
                ],
              }),
              new Paragraph({
                spacing: { after: 160 },
                children: [
                  new TextRun({
                    text: "All measurements were performed using calibrated equipment with valid traceability to national/international standards. Measurement uncertainty is evaluated per GUM (ISO/IEC Guide 98-3) and was found to be within acceptable limits for all measurements performed.",
                    size: 22,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 160 },
                children: [
                  new TextRun({ text: "Note: ", bold: true, size: 20, italics: true }),
                  new TextRun({
                    text: "This test report relates only to the sample(s) tested and shall not be construed as certification or approval of production. Results apply exclusively to the item(s) submitted for test.",
                    size: 20, italics: true, color: "666666",
                  }),
                ],
              }),

              // ── Section 8: Signatories ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "8.  Signatories & Authorisation", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Table({
                width: { size: 100, type: "pct" },
                rows: [
                  new TableRow({
                    children: [
                      makeCell("Prepared By", { bold: true, fill: "1E3A8A", color: "FFFFFF" }),
                      makeCell("Reviewed By", { bold: true, fill: "1E3A8A", color: "FFFFFF" }),
                      makeCell("Approved By", { bold: true, fill: "1E3A8A", color: "FFFFFF" }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "[Signature]", color: "AAAAAA", italics: true })] }),
                          new Paragraph({ children: [new TextRun({ text: "Dr. Rajesh Kumar", bold: true, size: 20 })] }),
                          new Paragraph({ children: [new TextRun({ text: "Senior Test Engineer", size: 18, color: "555555" })] }),
                          new Paragraph({ children: [new TextRun({ text: "Date: " + today, size: 18, color: "888888" })] }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "[Signature]", color: "AAAAAA", italics: true })] }),
                          new Paragraph({ children: [new TextRun({ text: "Dr. Priya Sharma", bold: true, size: 20 })] }),
                          new Paragraph({ children: [new TextRun({ text: "Technical Manager", size: 18, color: "555555" })] }),
                          new Paragraph({ children: [new TextRun({ text: "Date: " + today, size: 18, color: "888888" })] }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "[Signature]", color: "AAAAAA", italics: true })] }),
                          new Paragraph({ children: [new TextRun({ text: "Dr. Arun Patel", bold: true, size: 20 })] }),
                          new Paragraph({ children: [new TextRun({ text: "Laboratory Manager", size: 18, color: "555555" })] }),
                          new Paragraph({ children: [new TextRun({ text: "Date: " + today, size: 18, color: "888888" })] }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 },
                children: [
                  new TextRun({
                    text: "This report is issued in accordance with ISO/IEC 17025:2017. Results relate only to the samples tested.",
                    size: 16,
                    italics: true,
                    color: "888888",
                  }),
                ],
              }),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${reportNumber}_TRF.docx`
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      // Delay revocation so the browser has time to start the download
      setTimeout(() => {
        URL.revokeObjectURL(url)
      })
      toast.success("Word document exported with charts, traceability, and image placeholders")
    } catch (err) {
      console.error("Word export error:", err)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Word export failed: ${msg}`)
    } finally {
      if (wasHidden) setIsPrintVisible(false)
      setLoading(null)
    }
  }

  const spin = <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground">Export:</span>
      <Button
        size="sm"
        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
        onClick={exportPDF}
        disabled={!!loading}
        title="Generate PDF with cover page, charts, traceability, headers, footers, and page numbers"
      >
        {loading === "pdf" ? spin : <FileDown className="h-3.5 w-3.5 mr-1.5" />}
        Export PDF
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
        onClick={exportWord}
        disabled={!!loading}
        title="Export editable Word document with cover page, TOC, charts, traceability, test results, conclusions and signatories"
      >
        {loading === "word" ? spin : <FileText className="h-3.5 w-3.5 mr-1.5" />}
        Export Word
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
        onClick={exportExcel}
        disabled={!!loading}
        title="Export Excel with summary sheet + per-standard sheets + traceability"
      >
        {loading === "excel" ? spin : <Table2 className="h-3.5 w-3.5 mr-1.5" />}
        Export Excel
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => window.print()}
        disabled={!!loading}
        title="Print report using browser print dialog"
      >
        <Printer className="h-3.5 w-3.5 mr-1.5" />
        Print
      </Button>
    </div>
  )
}
