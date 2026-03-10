"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import type { IECStandard } from "@/lib/data/data-analysis-data";
import { generateValidationResults } from "@/lib/data/data-analysis-data";

interface DataValidationProps {
  standard: IECStandard;
}

const statusConfig = {
  pass: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", label: "Pass" },
  fail: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Fail" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", label: "Warning" },
  pending: { icon: Clock, color: "text-gray-500", bg: "bg-gray-50", label: "Pending" },
} as const;

export function DataValidation({ standard }: DataValidationProps) {
  const results = useMemo(() => generateValidationResults(standard), [standard]);

  const passCount = results.filter((r) => r.status === "pass").length;
  const warnCount = results.filter((r) => r.status === "warning").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const total = results.length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{passCount}</p>
              <p className="text-xs text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{warnCount}</p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{failCount}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Completeness</p>
            <div className="flex items-center gap-2">
              <Progress value={passRate} className="flex-1 h-2" />
              <span className="text-sm font-medium">{passRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Validation Results</CardTitle>
          <CardDescription>
            Range checks, outlier detection, and completeness verification for {standard}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Measured Value</TableHead>
                <TableHead>Acceptable Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => {
                const cfg = statusConfig[result.status];
                const Icon = cfg.icon;
                return (
                  <TableRow key={result.field}>
                    <TableCell className="font-medium">{result.field}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {typeof result.value === "number" ? result.value.toFixed(3) : result.value}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {result.expectedRange
                        ? `${result.expectedRange[0]} – ${result.expectedRange[1]}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${cfg.color} ${cfg.bg} border-0`}>
                        <Icon className="mr-1 h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.message}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
