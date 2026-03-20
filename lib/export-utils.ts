// @ts-nocheck
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx"
import jsPDF from "jspdf"

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        if (typeof val === "string" && val.includes(",")) return `"${val}"`
        return val ?? ""
      }).join(",")
    ),
  ].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, `${filename}.csv`)
}

// ─── Excel Export ────────────────────────────────────────────────────────────

export function exportToExcel(
  sheets: { name: string; data: Record<string, any>[] }[],
  filename: string
) {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data)
    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...data.map((r) => String(r[key] ?? "").length)) + 2,
    }))
    ws["!cols"] = colWidths
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31))
  })
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  const blob = new Blob([wbout], { type: "application/octet-stream" })
  saveAs(blob, `${filename}.xlsx`)
}

// ─── Word Export ─────────────────────────────────────────────────────────────

export async function exportToWord(
  title: string,
  sections: {
    heading: string
    content?: string
    tableData?: Record<string, any>[]
  }[],
  filename: string
) {
  const children: any[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Generated: ${new Date().toISOString().split("T")[0]}`, italics: true, size: 20, color: "666666" }),
      ],
      spacing: { after: 200 },
    }),
  ]

  sections.forEach((section) => {
    children.push(
      new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    )

    if (section.content) {
      children.push(
        new Paragraph({
          text: section.content,
          spacing: { after: 150 },
        })
      )
    }

    if (section.tableData && section.tableData.length > 0) {
      const headers = Object.keys(section.tableData[0])
      const headerRow = new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
              width: { size: Math.floor(10000 / headers.length), type: WidthType.DXA },
              shading: { fill: "E8E8E8" },
            })
        ),
      })

      const dataRows = section.tableData.map(
        (row) =>
          new TableRow({
            children: headers.map(
              (h) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: String(row[h] ?? ""), size: 18 })] })],
                  width: { size: Math.floor(10000 / headers.length), type: WidthType.DXA },
                })
            ),
          })
      )

      children.push(
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 10000, type: WidthType.DXA },
        })
      )
    }
  })

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${filename}.docx`)
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

export function exportToPDF(
  title: string,
  sections: {
    heading: string
    content?: string
    tableHeaders?: string[]
    tableRows?: string[][]
  }[],
  filename: string
) {
  const doc = new jsPDF()
  let y = 20

  // Title
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(title, 14, y)
  y += 8
  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toISOString().split("T")[0]}`, 14, y)
  doc.setTextColor(0)
  y += 12

  sections.forEach((section) => {
    if (y > 260) {
      doc.addPage()
      y = 20
    }

    // Section heading
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(section.heading, 14, y)
    y += 7

    // Content
    if (section.content) {
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(section.content, 180)
      doc.text(lines, 14, y)
      y += lines.length * 4.5 + 3
    }

    // Table
    if (section.tableHeaders && section.tableRows) {
      const colWidth = 180 / section.tableHeaders.length
      doc.setFontSize(8)

      // Header row
      doc.setFont("helvetica", "bold")
      doc.setFillColor(232, 232, 232)
      doc.rect(14, y - 3, 180, 6, "F")
      section.tableHeaders.forEach((h, i) => {
        doc.text(h, 15 + i * colWidth, y)
      })
      y += 5

      // Data rows
      doc.setFont("helvetica", "normal")
      section.tableRows.forEach((row) => {
        if (y > 275) {
          doc.addPage()
          y = 20
        }
        row.forEach((cell, i) => {
          doc.text(String(cell), 15 + i * colWidth, y)
        })
        y += 4
      })
      y += 4
    }

    y += 5
  })

  doc.save(`${filename}.pdf`)
}

// ─── Export Buttons Component Helper ─────────────────────────────────────────

export interface ExportableData {
  title: string
  csvData?: Record<string, any>[]
  excelSheets?: { name: string; data: Record<string, any>[] }[]
  wordSections?: { heading: string; content?: string; tableData?: Record<string, any>[] }[]
  pdfSections?: { heading: string; content?: string; tableHeaders?: string[]; tableRows?: string[][] }[]
  filenameBase: string
}
