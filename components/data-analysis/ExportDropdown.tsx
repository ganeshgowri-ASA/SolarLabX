// @ts-nocheck
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { handleExport, type ExportConfig } from "@/lib/export-utils"

interface ExportDropdownProps {
  config: ExportConfig
}

export function ExportDropdown({ config }: ExportDropdownProps) {
  const [exporting, setExporting] = useState<string | null>(null)

  const doExport = async (format: "csv" | "excel" | "word" | "pdf") => {
    setExporting(format)
    try {
      await handleExport(format, config)
    } finally {
      setTimeout(() => setExporting(null), 500)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Export format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => doExport("csv")} className="text-xs gap-2 cursor-pointer">
          <FileText className="h-3.5 w-3.5 text-green-600" />
          {exporting === "csv" ? "Exporting..." : "CSV (.csv)"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport("excel")} className="text-xs gap-2 cursor-pointer">
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          {exporting === "excel" ? "Exporting..." : "Excel (.xlsx)"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport("word")} className="text-xs gap-2 cursor-pointer">
          <FileText className="h-3.5 w-3.5 text-blue-600" />
          {exporting === "word" ? "Exporting..." : "Word (.docx)"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport("pdf")} className="text-xs gap-2 cursor-pointer">
          <File className="h-3.5 w-3.5 text-red-600" />
          {exporting === "pdf" ? "Exporting..." : "PDF (.pdf)"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
