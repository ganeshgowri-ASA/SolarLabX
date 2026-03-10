// @ts-nocheck
"use client";

import React from "react";
import type { UncertaintyBudget } from "@/lib/uncertainty";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UncertaintyBudgetTableProps {
  budget: UncertaintyBudget;
}

export default function UncertaintyBudgetTable({ budget }: UncertaintyBudgetTableProps) {
  const maxPct = Math.max(...budget.components.map((c) => c.percentageContribution), 1);

  function getBarColor(pct: number): string {
    if (pct > 50) return "bg-red-500";
    if (pct > 25) return "bg-orange-500";
    if (pct > 10) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">u(xi)</TableHead>
          <TableHead className="text-right">ci</TableHead>
          <TableHead className="text-right">ci^2 u^2(xi)</TableHead>
          <TableHead className="w-[180px]">% Contribution</TableHead>
          <TableHead>Distribution</TableHead>
          <TableHead className="text-right">DOF</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budget.components.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium text-sm">{c.name}</TableCell>
            <TableCell>
              <Badge variant={c.type === "typeA" ? "outline" : "secondary"}>
                {c.type === "typeA" ? "A" : "B"}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">{c.value.toFixed(4)}</TableCell>
            <TableCell className="text-right font-mono text-sm">
              {c.standardUncertainty.toFixed(6)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {c.sensitivityCoefficient.toFixed(2)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {c.varianceContribution.toExponential(3)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getBarColor(c.percentageContribution)}`}
                    style={{ width: `${(c.percentageContribution / maxPct) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-12 text-right">
                  {c.percentageContribution.toFixed(1)}%
                </span>
              </div>
            </TableCell>
            <TableCell className="capitalize text-sm">{c.distribution}</TableCell>
            <TableCell className="text-right font-mono text-sm">
              {c.degreesOfFreedom === Infinity ? "\u221E" : c.degreesOfFreedom}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="font-semibold">
            Combined Standard Uncertainty uc
          </TableCell>
          <TableCell className="text-right font-mono font-semibold">
            {budget.combinedStandardUncertainty.toFixed(6)}
          </TableCell>
          <TableCell colSpan={5} />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
