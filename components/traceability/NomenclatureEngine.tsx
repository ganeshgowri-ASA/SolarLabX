"use client"

import React, { useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Search, FileText, Copy, CheckCircle2 } from "lucide-react"
import {
  ROUTINE_TESTS,
  ACCELERATED_TESTS,
  generateOMRFilename,
} from "@/lib/data/omr-route-card-v2-data"
import type { OMRRouteCardV2 } from "@/lib/data/omr-route-card-v2-data"

// ============================================================================
// Nomenclature Engine: Auto-generate filenames, hover preview, CSV export,
// IEC code validation
// ============================================================================

interface NomenclatureEngineProps {
  cards: OMRRouteCardV2[]
}

interface FilenameEntry {
  cardId: string
  projectId: string
  moduleId: string
  acceleratedTest: string
  acceleratedTestName: string
  routineTest: string
  routineTestName: string
  prePost: "Pre" | "Post"
  setNo: string
  status: string
  date: string
  filename: string
  iecValid: boolean
}

const VALID_IEC_CODES: Set<string> = new Set([
  ...ROUTINE_TESTS.map((r) => r.code),
  ...ACCELERATED_TESTS.map((a) => a.code),
])

function validateIECCode(code: string): boolean {
  return VALID_IEC_CODES.has(code)
}

export function NomenclatureEngine({ cards }: NomenclatureEngineProps) {
  const [search, setSearch] = useState("")
  const [filterModule, setFilterModule] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  // Generate all filenames from bubble matrix entries that are not empty
  const allFilenames = useMemo(() => {
    const entries: FilenameEntry[] = []

    cards.forEach((card) => {
      card.bubbleMatrix
        .filter((b) => b.status !== "empty")
        .forEach((bubble) => {
          const atInfo = ACCELERATED_TESTS.find((a) => a.code === bubble.acceleratedTest)
          const rtInfo = ROUTINE_TESTS.find((r) => r.code === bubble.routineTest)

          const filename = generateOMRFilename(
            card.projectId,
            card.moduleId,
            bubble.acceleratedTest,
            bubble.routineTest,
            "Post",
            "Set1",
            bubble.date ? new Date(bubble.date) : new Date()
          )

          entries.push({
            cardId: card.id,
            projectId: card.projectId,
            moduleId: card.moduleId,
            acceleratedTest: bubble.acceleratedTest,
            acceleratedTestName: atInfo?.name || bubble.acceleratedTest,
            routineTest: bubble.routineTest,
            routineTestName: rtInfo?.name || bubble.routineTest,
            prePost: "Post",
            setNo: "Set1",
            status: bubble.status,
            date: bubble.date || new Date().toISOString().split("T")[0],
            filename,
            iecValid:
              validateIECCode(bubble.routineTest) &&
              validateIECCode(bubble.acceleratedTest),
          })
        })
    })

    return entries
  }, [cards])

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return allFilenames.filter((e) => {
      const matchesSearch =
        !search ||
        e.filename.toLowerCase().includes(search.toLowerCase()) ||
        e.moduleId.toLowerCase().includes(search.toLowerCase()) ||
        e.routineTest.toLowerCase().includes(search.toLowerCase()) ||
        e.acceleratedTest.toLowerCase().includes(search.toLowerCase())
      const matchesModule = filterModule === "all" || e.moduleId === filterModule
      const matchesStatus = filterStatus === "all" || e.status === filterStatus
      return matchesSearch && matchesModule && matchesStatus
    })
  }, [allFilenames, search, filterModule, filterStatus])

  const uniqueModules = useMemo(
    () => Array.from(new Set(cards.map((c) => c.moduleId))),
    [cards]
  )

  const handleCopyFilename = useCallback((idx: number, filename: string) => {
    navigator.clipboard.writeText(filename).catch(() => {
      // Fallback: create temp input
      const el = document.createElement("textarea")
      el.value = filename
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    })
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }, [])

  const handleExportCSV = useCallback(() => {
    const header =
      "CardID,ProjectID,ModuleID,AcceleratedTest,RoutineTest,PrePost,SetNo,Status,Date,Filename,IEC_Valid\n"
    const rows = filteredEntries
      .map(
        (e) =>
          `${e.cardId},${e.projectId},${e.moduleId},${e.acceleratedTest},${e.routineTest},${e.prePost},${e.setNo},${e.status},${e.date},${e.filename},${e.iecValid}`
      )
      .join("\n")

    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `omr_nomenclature_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredEntries])

  // Filename format breakdown
  const formatParts = [
    { label: "ProjectID", example: "PRJ2026001", color: "text-blue-600" },
    { label: "ModuleID", example: "MOD-SP-450-A01", color: "text-emerald-600" },
    { label: "AccelTest", example: "TC200", color: "text-purple-600" },
    { label: "RoutineTest", example: "STC", color: "text-amber-600" },
    { label: "Pre/Post", example: "Post", color: "text-red-600" },
    { label: "SetNo", example: "Set1", color: "text-cyan-600" },
    { label: "Date", example: "20260318", color: "text-gray-600" },
  ]

  return (
    <div className="space-y-4">
      {/* Format Reference */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-4">
          <p className="text-sm font-semibold mb-2">IEC Filename Convention</p>
          <div className="flex flex-wrap items-center gap-0.5 font-mono text-sm">
            {formatParts.map((part, i) => (
              <React.Fragment key={part.label}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={`${part.color} font-bold cursor-help bg-white px-1 py-0.5 rounded border`}
                      >
                        {part.example}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-bold">{part.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {i < formatParts.length - 1 && <span className="text-gray-400">_</span>}
              </React.Fragment>
            ))}
            <span className="text-gray-600">.pdf</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Format: {"{ProjectID}_{ModuleID}_{AccelTest}_{RoutineTest}_{PrePost}_{SetNo}_{Date}.pdf"}
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search filenames, modules, tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {uniqueModules.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="fail">Fail</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xl font-bold">{allFilenames.length}</p>
              <p className="text-xs text-muted-foreground">Total Filenames</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xl font-bold">
                {allFilenames.filter((f) => f.iecValid).length}
              </p>
              <p className="text-xs text-muted-foreground">IEC Valid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <Download className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xl font-bold">{filteredEntries.length}</p>
              <p className="text-xs text-muted-foreground">Filtered Results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filename Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generated Filenames</CardTitle>
          <CardDescription>
            Auto-generated on bubble fill. Click to copy. Hover for breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Accel Test</TableHead>
                  <TableHead>Routine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>IEC</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, idx) => (
                  <TableRow key={`${entry.cardId}-${entry.acceleratedTest}-${entry.routineTest}`}>
                    <TableCell className="font-mono text-xs font-bold">
                      {entry.moduleId}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-xs cursor-help">
                              {entry.acceleratedTest}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{entry.acceleratedTestName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-xs cursor-help">
                              {entry.routineTest}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{entry.routineTestName}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          entry.status === "pass"
                            ? "border-emerald-400 text-emerald-700"
                            : entry.status === "fail"
                            ? "border-red-400 text-red-700"
                            : "border-amber-400 text-amber-700"
                        }`}
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{entry.date}</TableCell>
                    <TableCell>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-mono text-[10px] cursor-help text-blue-600 hover:underline">
                              {entry.filename}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-sm">
                            <div className="text-xs space-y-1">
                              <p className="font-bold">Filename Breakdown:</p>
                              <p>
                                <span className="text-blue-400">Project:</span> {entry.projectId}
                              </p>
                              <p>
                                <span className="text-emerald-400">Module:</span> {entry.moduleId}
                              </p>
                              <p>
                                <span className="text-purple-400">Accel:</span>{" "}
                                {entry.acceleratedTest} ({entry.acceleratedTestName})
                              </p>
                              <p>
                                <span className="text-amber-400">Routine:</span>{" "}
                                {entry.routineTest} ({entry.routineTestName})
                              </p>
                              <p>
                                <span className="text-red-400">Phase:</span> {entry.prePost}
                              </p>
                              <p>
                                <span className="text-cyan-400">Set:</span> {entry.setNo}
                              </p>
                              <p>
                                <span className="text-gray-400">Date:</span> {entry.date}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {entry.iecValid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <span className="text-red-500 text-xs">!</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleCopyFilename(idx, entry.filename)}
                      >
                        {copiedIdx === idx ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No filenames generated yet. Fill bubbles in the matrix to auto-generate.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
