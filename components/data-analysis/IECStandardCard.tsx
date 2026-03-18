// @ts-nocheck
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react"

interface CriterionRow {
  parameter: string
  requirement: string
  note?: string
}

interface IECStandardCardProps {
  standard: string
  title: string
  testConditions: string[]
  dosageLevels: string[]
  passCriteria: CriterionRow[]
  failCriteria?: CriterionRow[]
  notes?: string[]
}

export function IECStandardCard({
  standard,
  title,
  testConditions,
  dosageLevels,
  passCriteria,
  failCriteria,
  notes,
}: IECStandardCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="text-sm flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-4 w-4 text-blue-600 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-blue-600 shrink-0" />
          )}
          <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
          <span>IEC Standard &amp; Criteria</span>
          <Badge variant="outline" className="ml-auto text-xs font-mono">
            {standard}
          </Badge>
        </CardTitle>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-4 text-xs">
          {/* Standard Reference */}
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
              Standard Reference
            </h4>
            <p className="text-muted-foreground">{title}</p>
          </div>

          {/* Test Conditions */}
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
              Test Conditions
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {testConditions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Dosage Levels */}
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">
              Dosage / Exposure Levels
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {dosageLevels.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          {/* Pass Criteria Table */}
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">
              Pass Criteria
            </h4>
            <div className="rounded border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-green-50 dark:bg-green-900/20">
                    <th className="text-left p-1.5 font-medium">Parameter</th>
                    <th className="text-left p-1.5 font-medium">Requirement</th>
                    {passCriteria.some((r) => r.note) && (
                      <th className="text-left p-1.5 font-medium">Note</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {passCriteria.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-1.5 font-mono">{row.parameter}</td>
                      <td className="p-1.5">{row.requirement}</td>
                      {passCriteria.some((r) => r.note) && (
                        <td className="p-1.5 text-muted-foreground">
                          {row.note || "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fail Criteria Table */}
          {failCriteria && failCriteria.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                Fail Criteria
              </h4>
              <div className="rounded border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-red-50 dark:bg-red-900/20">
                      <th className="text-left p-1.5 font-medium">
                        Parameter
                      </th>
                      <th className="text-left p-1.5 font-medium">
                        Condition
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {failCriteria.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-1.5 font-mono">{row.parameter}</td>
                        <td className="p-1.5">{row.requirement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {notes && notes.length > 0 && (
            <div className="rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 p-2">
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                Notes
              </h4>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                {notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
