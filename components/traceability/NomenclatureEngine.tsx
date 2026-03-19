"use client"

import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tag,
  Copy,
  RefreshCw,
  BookOpen,
  Hash,
  FileCode,
} from "lucide-react"
import { toast } from "sonner"

// ============================================================================
// Nomenclature rules per standard
// ============================================================================

interface NomenclatureRule {
  standard: string
  prefix: string
  fields: { key: string; label: string; maxLength: number; options?: string[] }[]
  separator: string
  example: string
  description: string
}

const nomenclatureRules: NomenclatureRule[] = [
  {
    standard: "IEC 61215",
    prefix: "DQ",
    fields: [
      { key: "lab", label: "Lab Code", maxLength: 4, options: ["SPVT", "NREL", "TUV", "BIS"] },
      { key: "year", label: "Year", maxLength: 4 },
      { key: "seq", label: "Sequence", maxLength: 4 },
      { key: "module", label: "Module Type", maxLength: 3, options: ["MCS", "MCM", "TFM", "BFM"] },
      { key: "set", label: "Test Set", maxLength: 2, options: ["S1", "S2", "S3", "S4"] },
      { key: "stage", label: "Stage", maxLength: 3, options: ["Pre", "Pst", "Int"] },
    ],
    separator: "-",
    example: "DQ-SPVT-2026-0001-MCS-S1-Pre",
    description: "Design Qualification per IEC 61215 Ed.2",
  },
  {
    standard: "IEC 61730",
    prefix: "SQ",
    fields: [
      { key: "lab", label: "Lab Code", maxLength: 4, options: ["SPVT", "NREL", "TUV", "BIS"] },
      { key: "year", label: "Year", maxLength: 4 },
      { key: "seq", label: "Sequence", maxLength: 4 },
      { key: "class", label: "Safety Class", maxLength: 2, options: ["CA", "CB", "CC"] },
      { key: "set", label: "Test Set", maxLength: 2, options: ["S1", "S2", "S3"] },
      { key: "stage", label: "Stage", maxLength: 3, options: ["Pre", "Pst", "Int"] },
    ],
    separator: "-",
    example: "SQ-SPVT-2026-0001-CA-S1-Pre",
    description: "Safety Qualification per IEC 61730 Ed.2",
  },
  {
    standard: "IEC 61853",
    prefix: "ER",
    fields: [
      { key: "lab", label: "Lab Code", maxLength: 4, options: ["SPVT", "NREL", "TUV", "BIS"] },
      { key: "year", label: "Year", maxLength: 4 },
      { key: "seq", label: "Sequence", maxLength: 4 },
      { key: "part", label: "Part", maxLength: 2, options: ["P1", "P2", "P3", "P4"] },
      { key: "cond", label: "Condition", maxLength: 3, options: ["STC", "LIC", "HTC", "NOM"] },
    ],
    separator: "-",
    example: "ER-SPVT-2026-0001-P1-STC",
    description: "Energy Rating per IEC 61853",
  },
  {
    standard: "IEC 60904",
    prefix: "IV",
    fields: [
      { key: "lab", label: "Lab Code", maxLength: 4, options: ["SPVT", "NREL", "TUV", "BIS"] },
      { key: "year", label: "Year", maxLength: 4 },
      { key: "seq", label: "Sequence", maxLength: 4 },
      { key: "type", label: "Test Type", maxLength: 3, options: ["STC", "LIC", "HTC"] },
      { key: "rep", label: "Repetition", maxLength: 2, options: ["R1", "R2", "R3"] },
    ],
    separator: "-",
    example: "IV-SPVT-2026-0001-STC-R1",
    description: "I-V Characterization per IEC 60904",
  },
]

// ============================================================================
// Nomenclature Generator Component
// ============================================================================

export function NomenclatureEngine() {
  const [selectedStandard, setSelectedStandard] = useState(nomenclatureRules[0].standard)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    year: "2026",
    seq: "0001",
  })
  const [history, setHistory] = useState<{ code: string; standard: string; timestamp: string }[]>([])

  const rule = nomenclatureRules.find((r) => r.standard === selectedStandard)!

  const generatedCode = useMemo(() => {
    const parts = [rule.prefix]
    for (const field of rule.fields) {
      const val = fieldValues[field.key]
      if (val) {
        parts.push(val)
      } else {
        parts.push("_".repeat(field.maxLength))
      }
    }
    return parts.join(rule.separator)
  }, [rule, fieldValues])

  const isComplete = rule.fields.every((f) => fieldValues[f.key]?.trim())

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
    toast.success("Copied to clipboard")
  }

  const handleGenerate = () => {
    if (!isComplete) {
      toast.error("Fill all fields before generating")
      return
    }
    setHistory((prev) => [
      { code: generatedCode, standard: selectedStandard, timestamp: new Date().toISOString() },
      ...prev,
    ])
    toast.success(`Generated: ${generatedCode}`)
  }

  const handleReset = () => {
    setFieldValues({ year: "2026", seq: "0001" })
  }

  return (
    <div className="space-y-4">
      {/* Generator */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Nomenclature Generator
            </CardTitle>
            <CardDescription>
              ISO-compliant naming for route cards, samples, and test reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Standard</Label>
              <Select
                value={selectedStandard}
                onValueChange={(v) => {
                  setSelectedStandard(v)
                  handleReset()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nomenclatureRules.map((r) => (
                    <SelectItem key={r.standard} value={r.standard}>
                      {r.standard} — {r.prefix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {rule.fields.map((field) => (
                <div key={field.key}>
                  <Label className="text-xs">{field.label}</Label>
                  {field.options ? (
                    <Select
                      value={fieldValues[field.key] || ""}
                      onValueChange={(v) => handleFieldChange(field.key, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={fieldValues[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      maxLength={field.maxLength}
                      placeholder={field.label}
                      className="font-mono"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Generated Code Preview */}
            <div className="bg-gray-50 border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Generated Code</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-mono font-bold tracking-wider">{generatedCode}</p>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={!isComplete} className="flex-1">
                <Hash className="mr-2 h-4 w-4" />
                Generate & Save
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reference Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Nomenclature Reference
            </CardTitle>
            <CardDescription>Standard naming patterns and examples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nomenclatureRules.map((r) => (
                <div key={r.standard} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{r.standard}</Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      Prefix: {r.prefix}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{r.description}</p>
                  <div className="bg-gray-50 px-2 py-1 rounded">
                    <p className="font-mono text-sm">{r.example}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.fields.map((f) => (
                      <Badge key={f.key} variant="secondary" className="text-[10px]">
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Generated Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Standard</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono font-bold">{item.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.standard}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(item.code)
                          toast.success("Copied")
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
