// @ts-nocheck
"use client"

import { useState, RefObject } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, FileText, Table2, Printer, Loader2 } from "lucide-react"

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

export function ExportToolbar({
  printRef,
  reportNumber,
  reportTitle,
  allResults,
  isPrintVisible,
  setIsPrintVisible,
}: ExportToolbarProps) {
  const [loading, setLoading] = useState<string | null>(null)

  // ── PDF Export via jsPDF + html2canvas ──────────────────────────────────────
  const exportPDF = async () => {
    setLoading("pdf")
    let wasHidden = false
    try {
      if (!isPrintVisible) {
        wasHidden = true
        setIsPrintVisible(true)
        // Wait for React render + charts to fully paint
        await new Promise((r) => setTimeout(r, 900))
      }
      const element = printRef.current
      if (!element) throw new Error("Print element not found")

      const { default: html2canvas } = await import("html2canvas")
      const { jsPDF } = await import("jspdf")

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
      const pW = pdf.internal.pageSize.getWidth()
      const pH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const headerH = 14
      const footerH = 12
      const contentH = pH - headerH - footerH - margin
      const contentW = pW - margin * 2
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
        // Footer line + text
        pdf.setDrawColor(180, 180, 180)
        pdf.line(margin, pH - footerH, pW - margin, pH - footerH)
        pdf.setFontSize(6.5)
        pdf.setTextColor(120, 120, 120)
        pdf.text(
          "ISO/IEC 17025:2017 Compliant | Confidential – Not to be reproduced except in full",
          margin,
          pH - footerH + 5
        )
        pdf.text(`Page ${pageNum} of ${totalPages}`, pW - margin, pH - footerH + 5, {
          align: "right",
        })
      }

      // First page
      addHeaderFooter(1)
      pdf.addImage(imgData, "JPEG", margin, imgStartY, contentW, totalImgH)

      // Subsequent pages
      for (let i = 2; i <= totalPages; i++) {
        pdf.addPage()
        addHeaderFooter(i)
        const yOffset = imgStartY - (i - 1) * contentH
        pdf.addImage(imgData, "JPEG", margin, yOffset, contentW, totalImgH)
      }

      pdf.save(`${reportNumber}_TRF_Report.pdf`)
    } catch (err) {
      console.error("PDF export error:", err)
      alert(
        "PDF export failed. Please use 'Print → Save as PDF' as a fallback, or toggle 'Show Full Report' before exporting."
      )
    } finally {
      if (wasHidden) setIsPrintVisible(false)
      setLoading(null)
    }
  }

  // ── Excel Export via xlsx (already installed) ───────────────────────────────
  const exportExcel = async () => {
    setLoading("excel")
    try {
      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()

      // Summary sheet
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
      // Set column widths
      wsSummary["!cols"] = [
        { wch: 4 }, { wch: 14 }, { wch: 20 }, { wch: 42 },
        { wch: 18 }, { wch: 12 }, { wch: 8 },
      ]
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary")

      // Per-standard sheets
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

      XLSX.writeFile(wb, `${reportNumber}_Test_Data.xlsx`)
    } catch (err) {
      console.error("Excel export error:", err)
      alert("Excel export failed.")
    } finally {
      setLoading(null)
    }
  }

  // ── Word Export via docx + file-saver ──────────────────────────────────────
  const exportWord = async () => {
    setLoading("word")
    try {
      const {
        Document, Packer, Paragraph, Table, TableRow, TableCell,
        TextRun, HeadingLevel, WidthType, AlignmentType,
      } = await import("docx")
      const { saveAs } = await import("file-saver")

      const cell = (text: string, bold = false, color?: string, fill?: string) =>
        new TableCell({
          ...(fill ? { shading: { fill } } : {}),
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text, bold, color: color || "000000" })],
            }),
          ],
        })

      const headerRow = new TableRow({
        tableHeader: true,
        children: ["#", "Standard", "Clause", "Test Name", "Technician", "Date", "Result"].map(
          (h) =>
            new TableCell({
              shading: { fill: "1E3A8A" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18 })],
                }),
              ],
            })
        ),
      })

      const dataRows = allResults.map(
        (r, i) =>
          new TableRow({
            children: [
              cell(String(i + 1)),
              cell(r.standard),
              cell(r.clause),
              cell(r.testName, true),
              cell(r.technician),
              cell(r.date),
              new TableCell({
                shading: { fill: r.pass ? "D1FAE5" : "FEE2E2" },
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

      const passCount = allResults.filter((r) => r.pass).length
      const failCount = allResults.length - passCount
      const overallPass = failCount === 0

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "PHOTOVOLTAIC MODULE TEST REPORT", bold: true, size: 40 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: reportTitle, size: 28, color: "1E3A8A" })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Report No: ${reportNumber}   |   Date: ${new Date().toLocaleDateString("en-IN")}`,
                    size: 20,
                    color: "666666",
                  }),
                ],
              }),
              new Paragraph({ children: [new TextRun("")] }),
              new Paragraph({
                children: [new TextRun({ text: "TEST RESULTS SUMMARY", bold: true, size: 26 })],
                heading: HeadingLevel.HEADING_1,
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [headerRow, ...dataRows],
              }),
              new Paragraph({ children: [new TextRun("")] }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Overall Result: ${overallPass ? "PASS" : "FAIL"}   (${passCount} passed, ${failCount} failed)`,
                    bold: true,
                    size: 24,
                    color: overallPass ? "16A34A" : "DC2626",
                  }),
                ],
              }),
              new Paragraph({ children: [new TextRun("")] }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "This report is issued in accordance with ISO/IEC 17025:2017. Results relate only to the samples tested.",
                    size: 18,
                    color: "999999",
                    italics: true,
                  }),
                ],
              }),
            ],
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${reportNumber}_TRF.docx`)
    } catch (err) {
      console.error("Word export error:", err)
      alert("Word export failed. Check that docx and file-saver packages are installed.")
    } finally {
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
        title="Generate proper PDF with cover page, headers, footers, and page numbers"
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
        title="Export editable Word document with test results table"
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
        title="Export Excel with summary sheet + per-standard sheets"
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
