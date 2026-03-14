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

      addHeaderFooter(1)
      pdf.addImage(imgData, "JPEG", margin, imgStartY, contentW, totalImgH)

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
        TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle,
        Header, Footer, PageNumber, ShadingType,
      } = await import("docx")
      const { saveAs } = await import("file-saver")

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
          size?: number   // half-points (20 = 10pt, 22 = 11pt, 28 = 14pt)
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
          cellOpts.shading = { type: ShadingType.CLEAR, color: "auto", fill: opts.fill }
        }
        if (opts.colSpan) {
          cellOpts.columnSpan = opts.colSpan
        }
        return new TableCell(cellOpts)
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
              new TextRun({ text: "Issue Date: " + today + "   |   ", size: 16, color: "555555" }),
              new TextRun({
                text: "This report shall not be reproduced except in full without written approval of SolarLabX Testing Laboratory",
                size: 14,
                italics: true,
                color: "666666",
              }),
              new TextRun({ text: "   |   Page ", size: 16, color: "555555" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
              new TextRun({ text: " of ", size: 16, color: "555555" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 }),
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
              shading: { type: ShadingType.CLEAR, color: "auto", fill: "1E3A8A" },
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
              makeCell(String(i + 1), {
                align: AlignmentType.CENTER,
                fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF",
              }),
              makeCell(r.standard, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.clause, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.testName, { bold: true, fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.technician, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              makeCell(r.date, { fill: i % 2 === 0 ? "F9F9F9" : "FFFFFF" }),
              new TableCell({
                shading: {
                  type: ShadingType.CLEAR,
                  color: "auto",
                  fill: r.pass ? "D1FAE5" : "FEE2E2",
                },
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
            shading: { type: ShadingType.CLEAR, color: "auto", fill: "1E3A8A" },
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

      // ── Build the document ──
      const doc = new Document({
        sections: [
          // ── Section 1: Cover page (no header/footer) ──
          {
            properties: {
              page: {
                margin: { top: 1701, bottom: 1701, left: 1701, right: 1701 }, // ~30mm
              },
            },
            children: [
              // Logo placeholder
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 1200, after: 400 },
                children: [
                  new TextRun({ text: "[ Lab Logo ]", size: 20, color: "AAAAAA", italics: true }),
                ],
              }),
              // Lab name
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [
                  new TextRun({ text: LAB_NAME, bold: true, size: 40, color: "1E3A5F" }),
                ],
              }),
              // Divider line (simulated with bordered paragraph)
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1E3A5F", space: 1 } },
                children: [new TextRun({ text: "" })],
              }),
              // Report title
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "TEST REPORT",
                    bold: true,
                    size: 48,   // 24pt
                    color: "1E3A5F",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new TextRun({ text: "PHOTOVOLTAIC MODULE QUALIFICATION", bold: true, size: 28, color: "444444" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
                children: [
                  new TextRun({ text: reportTitle, size: 22, color: "1E3A5F", italics: true }),
                ],
              }),
              // Report details table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
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
                      makeCell(overallPass ? "PASS ✓" : "FAIL ✗", {
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
              // Confidentiality notice
              new Paragraph({
                spacing: { before: 500 },
                alignment: AlignmentType.LEFT,
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFFBEB" },
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
                ["5.", "Conclusions & Certification Statement"],
                ["6.", "Signatories & Authorisation"],
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
                width: { size: 100, type: WidthType.PERCENTAGE },
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
                width: { size: 100, type: WidthType.PERCENTAGE },
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
                    text: overallPass ? "PASS ✓" : "FAIL ✗",
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
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [tableHeaderRow, ...tableDataRows],
              }),

              // ── Section 4: Detailed MQT Results ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "4.  Detailed MQT/MST Results", bold: true, size: 32, color: "1E3A5F" })],
              }),
              ...allResults.flatMap((r, i) => [
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
                      text: "   " + (r.pass ? "✓ PASS" : "✗ FAIL"),
                      bold: true,
                      size: 22,
                      color: r.pass ? "16A34A" : "DC2626",
                    }),
                  ],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        makeCell("Technician", { bold: true, fill: "F5F5F5" }),
                        makeCell(r.technician),
                        makeCell("Test Date", { bold: true, fill: "F5F5F5" }),
                        makeCell(r.date),
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
              ]),

              // ── Section 5: Conclusions ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "5.  Conclusions & Certification Statement", bold: true, size: 32, color: "1E3A5F" })],
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
                  new TextRun({
                    text: `Based on the test results documented in this report, the module under test has `,
                    size: 22,
                  }),
                  new TextRun({
                    text: overallPass ? "PASSED" : "FAILED",
                    bold: true,
                    size: 22,
                    color: overallPass ? "16A34A" : "DC2626",
                  }),
                  new TextRun({
                    text: ` all applicable test requirements. A total of ${passCount} of ${allResults.length} tests passed.`,
                    size: 22,
                  }),
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
                  new TextRun({
                    text: "Note: ",
                    bold: true,
                    size: 20,
                    italics: true,
                  }),
                  new TextRun({
                    text: "This test report relates only to the sample(s) tested and shall not be construed as certification or approval of production. Results apply exclusively to the item(s) submitted for test.",
                    size: 20,
                    italics: true,
                    color: "666666",
                  }),
                ],
              }),

              // ── Section 6: Signatories ──
              new Paragraph({
                pageBreakBefore: true,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 },
                children: [new TextRun({ text: "6.  Signatories & Authorisation", bold: true, size: 32, color: "1E3A5F" })],
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
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
              // Footer disclaimer
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
      saveAs(blob, `${reportNumber}_TRF.docx`)
    } catch (err) {
      console.error("Word export error:", err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Word export failed: ${msg}\n\nPlease ensure the docx and file-saver packages are installed (npm install docx file-saver).`)
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
        title="Generate PDF with cover page, headers, footers, and page numbers"
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
        title="Export editable Word document with cover page, TOC, abbreviations, test results, conclusions and signatories"
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
