"use client";

import React from "react";
import { getCoverageFactor } from "@/lib/uncertainty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CoverageFactorProps {
  dof: number;
  probability: number;
}

const T_TABLE: { dof: number | string; k95: number }[] = [
  { dof: 1, k95: 12.71 },
  { dof: 2, k95: 4.303 },
  { dof: 3, k95: 3.182 },
  { dof: 4, k95: 2.776 },
  { dof: 5, k95: 2.571 },
  { dof: 6, k95: 2.447 },
  { dof: 7, k95: 2.365 },
  { dof: 8, k95: 2.306 },
  { dof: 9, k95: 2.262 },
  { dof: 10, k95: 2.228 },
  { dof: 15, k95: 2.131 },
  { dof: 20, k95: 2.086 },
  { dof: 25, k95: 2.060 },
  { dof: 30, k95: 2.042 },
  { dof: 40, k95: 2.021 },
  { dof: 50, k95: 2.009 },
  { dof: 60, k95: 2.000 },
  { dof: 80, k95: 1.990 },
  { dof: 100, k95: 1.984 },
  { dof: "\u221E", k95: 1.960 },
];

export default function CoverageFactor({ dof, probability }: CoverageFactorProps) {
  const k = getCoverageFactor(dof, probability);
  const displayDof = dof === Infinity || dof > 100 ? "\u221E" : dof;

  function isHighlighted(row: { dof: number | string; k95: number }): boolean {
    if (dof === Infinity || dof > 100) return row.dof === "\u221E";
    return row.dof === dof;
  }

  function isNearest(row: { dof: number | string; k95: number }): boolean {
    if (typeof row.dof !== "number") return false;
    if (dof === Infinity || dof > 100) return false;
    const dofs = T_TABLE.filter((r) => typeof r.dof === "number").map((r) => r.dof as number);
    if (dofs.includes(dof)) return false;
    const lower = dofs.filter((d) => d < dof).pop();
    const upper = dofs.find((d) => d > dof);
    return row.dof === lower || row.dof === upper;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Coverage Factor (k)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-blue-600">{k.toFixed(3)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            v_eff = {String(displayDof)}, p = {(probability * 100).toFixed(0)}%
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto border rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">DOF (v)</th>
                <th className="px-3 py-1.5 text-right font-medium">k (95%)</th>
              </tr>
            </thead>
            <tbody>
              {T_TABLE.map((row) => {
                const highlighted = isHighlighted(row);
                const nearest = isNearest(row);
                return (
                  <tr
                    key={String(row.dof)}
                    className={
                      highlighted
                        ? "bg-blue-100 font-semibold text-blue-900"
                        : nearest
                        ? "bg-yellow-50 text-yellow-800"
                        : ""
                    }
                  >
                    <td className="px-3 py-1">{String(row.dof)}</td>
                    <td className="px-3 py-1 text-right">{row.k95.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
