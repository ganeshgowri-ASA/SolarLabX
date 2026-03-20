// @ts-nocheck
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

// ─── CSV Export ──────────────────────────────────────────────────────────────

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          const str = String(val ?? "")
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        })
        .join(",")
    ),
  ]

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  })
  saveAs(blob, `${filename}.csv`)
}

// ─── Excel Export ────────────────────────────────────────────────────────────

export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = "Sheet1"
): void {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? "").length)
    )
    return { wch: Math.min(maxLen + 2, 40) }
  })
  worksheet["!cols"] = colWidths

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, `${filename}.xlsx`)
}

export function exportToExcelMultiSheet(
  sheets: { name: string; data: Record<string, unknown>[] }[],
  filename: string
): void {
  const workbook = XLSX.utils.book_new()
  sheets.forEach(({ name, data }) => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...data.map((row) => String(row[key] ?? "").length)
      )
      return { wch: Math.min(maxLen + 2, 40) }
    })
    worksheet["!cols"] = colWidths
    XLSX.utils.book_append_sheet(workbook, worksheet, name)
  })

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, `${filename}.xlsx`)
}

// ─── Word (DOCX) Export ──────────────────────────────────────────────────────

export async function exportToWord(
  data: Record<string, unknown>[],
  filename: string,
  options: {
    title: string
    standard?: string
    description?: string
  }
): Promise<void> {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle } = await import("docx")

  if (data.length === 0) return
  const headers = Object.keys(data[0])

  const borderNone = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
  const cellBorders = { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone }

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          borders: cellBorders,
          shading: { fill: "1E3A5F" },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, bold: true, color: "FFFFFF", size: 18, font: "Calibri" })],
            }),
          ],
        })
    ),
  })

  const dataRows = data.map(
    (row, idx) =>
      new TableRow({
        children: headers.map(
          (h) =>
            new TableCell({
              borders: cellBorders,
              shading: idx % 2 === 0 ? { fill: "F5F5F5" } : undefined,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(row[h] ?? ""), size: 18, font: "Calibri" })],
                }),
              ],
            })
        ),
      })
  )

  const children: any[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: options.title, bold: true, color: "1E3A5F", font: "Calibri" })],
    }),
  ]

  if (options.standard) {
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Standard: ", bold: true, size: 20, font: "Calibri" }),
          new TextRun({ text: options.standard, size: 20, font: "Calibri" }),
        ],
      })
    )
  }

  if (options.description) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: options.description, size: 20, font: "Calibri", italics: true })],
      })
    )
  }

  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: `Generated: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}`, size: 18, font: "Calibri", color: "666666" }),
      ],
    }),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    })
  )

  const doc = new Document({
    sections: [{ children }],
  })

  const buffer = await Packer.toBlob(doc)
  saveAs(buffer, `${filename}.docx`)
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

export async function exportToPDF(
  data: Record<string, unknown>[],
  filename: string,
  options: {
    title: string
    standard?: string
    description?: string
    orientation?: "portrait" | "landscape"
  }
): Promise<void> {
  const { default: jsPDF } = await import("jspdf")

  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const isLandscape = (options.orientation ?? (headers.length > 6 ? "landscape" : "portrait")) === "landscape"

  const doc = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "mm", format: "a4" })
  const pageW = isLandscape ? 297 : 210
  const pageH = isLandscape ? 210 : 297
  const margin = 15
  const usableW = pageW - margin * 2

  // Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(30, 58, 95)
  doc.text(options.title, margin, 20)

  let y = 28
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)

  if (options.standard) {
    doc.text(`Standard: ${options.standard}`, margin, y)
    y += 5
  }
  if (options.description) {
    doc.text(options.description, margin, y)
    y += 5
  }
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}`, margin, y)
  y += 8

  // Table
  const colW = usableW / headers.length
  const rowH = 7
  const fontSize = Math.min(8, Math.max(5, 180 / (headers.length * 3)))

  // Header row
  doc.setFillColor(30, 58, 95)
  doc.rect(margin, y, usableW, rowH, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(fontSize)
  doc.setTextColor(255, 255, 255)
  headers.forEach((h, i) => {
    doc.text(h, margin + i * colW + 1, y + 5, { maxWidth: colW - 2 })
  })
  y += rowH

  // Data rows
  doc.setFont("helvetica", "normal")
  doc.setFontSize(fontSize)

  data.forEach((row, idx) => {
    if (y + rowH > pageH - 15) {
      doc.addPage()
      y = 15
      // Repeat header on new page
      doc.setFillColor(30, 58, 95)
      doc.rect(margin, y, usableW, rowH, "F")
      doc.setFont("helvetica", "bold")
      doc.setTextColor(255, 255, 255)
      headers.forEach((h, i) => {
        doc.text(h, margin + i * colW + 1, y + 5, { maxWidth: colW - 2 })
      })
      y += rowH
      doc.setFont("helvetica", "normal")
    }

    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, y, usableW, rowH, "F")
    }
    doc.setTextColor(30, 30, 30)
    headers.forEach((h, i) => {
      const val = String(row[h] ?? "")
      doc.text(val, margin + i * colW + 1, y + 5, { maxWidth: colW - 2 })
    })
    y += rowH
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text(`SolarLabX — ${options.title}`, margin, pageH - 8)
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin - 20, pageH - 8)
  }

  doc.save(`${filename}.pdf`)
}

// ─── Export All Formats Helper ───────────────────────────────────────────────

export interface ExportConfig {
  data: Record<string, unknown>[]
  filename: string
  title: string
  standard?: string
  description?: string
  sheetName?: string
  orientation?: "portrait" | "landscape"
}

export function handleExport(format: "csv" | "excel" | "word" | "pdf", config: ExportConfig): void {
  const { data, filename, title, standard, description, sheetName, orientation } = config
  switch (format) {
    case "csv":
      exportToCSV(data, filename)
      break
    case "excel":
      exportToExcel(data, filename, sheetName)
      break
    case "word":
      exportToWord(data, filename, { title, standard, description })
      break
    case "pdf":
      exportToPDF(data, filename, { title, standard, description, orientation })
      break
  }
}
