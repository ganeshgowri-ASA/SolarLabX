import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

/**
 * Export data to Excel (.xlsx) file
 * @param data Array of objects to export
 * @param filename Filename without extension
 * @param sheetName Optional sheet name (default: "Sheet1")
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = "Sheet1"
): void {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Auto-size columns
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

/**
 * Export multiple sheets to a single Excel file
 * @param sheets Array of { name, data } objects
 * @param filename Filename without extension
 */
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

/**
 * Export data to CSV file
 * @param data Array of objects to export
 * @param filename Filename without extension
 */
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
          // Escape values containing commas, quotes, or newlines
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
