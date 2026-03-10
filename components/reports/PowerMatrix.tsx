// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IEC_61853_IRRADIANCE_LEVELS, IEC_61853_TEMPERATURE_LEVELS } from "@/lib/report-test-definitions";

interface PowerMatrixProps {
  values?: Record<string, number | null>;
  editable?: boolean;
  onChange?: (values: Record<string, number | null>) => void;
  nominalPower?: number;
}

function key(g: number, t: number) {
  return `${g}_${t}`;
}

export function PowerMatrix({ values = {}, editable = false, onChange, nominalPower }: PowerMatrixProps) {
  const [matrix, setMatrix] = useState<Record<string, number | null>>(() => {
    const init: Record<string, number | null> = {};
    for (const g of IEC_61853_IRRADIANCE_LEVELS) {
      for (const t of IEC_61853_TEMPERATURE_LEVELS) {
        init[key(g, t)] = values[key(g, t)] ?? null;
      }
    }
    return init;
  });

  const handleChange = (g: number, t: number, val: string) => {
    const num = val === "" ? null : parseFloat(val);
    const next = { ...matrix, [key(g, t)]: num };
    setMatrix(next);
    onChange?.(next);
  };

  const getCellColor = (val: number | null) => {
    if (val === null) return "";
    if (!nominalPower) return "";
    const ratio = val / nominalPower;
    if (ratio >= 0.95) return "bg-green-50 text-green-800";
    if (ratio >= 0.7) return "bg-blue-50 text-blue-800";
    if (ratio >= 0.4) return "bg-yellow-50 text-yellow-800";
    return "bg-orange-50 text-orange-800";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">IEC 61853 Power Rating Matrix</CardTitle>
        <CardDescription>
          Power output (W) at various irradiance and temperature combinations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-muted/50 text-left" rowSpan={2}>
                  Irradiance<br />(W/m²)
                </th>
                <th className="border p-2 bg-muted/50 text-center" colSpan={IEC_61853_TEMPERATURE_LEVELS.length}>
                  Module Temperature (°C)
                </th>
              </tr>
              <tr>
                {IEC_61853_TEMPERATURE_LEVELS.map((t) => (
                  <th key={t} className="border p-2 bg-muted/50 text-center font-medium min-w-[80px]">
                    {t} °C
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {IEC_61853_IRRADIANCE_LEVELS.map((g) => (
                <tr key={g}>
                  <td className="border p-2 font-medium bg-muted/30">{g}</td>
                  {IEC_61853_TEMPERATURE_LEVELS.map((t) => {
                    const val = matrix[key(g, t)];
                    return (
                      <td key={t} className={`border p-1 text-center ${getCellColor(val)}`}>
                        {editable ? (
                          <input
                            type="number"
                            step="0.1"
                            className="w-full text-center bg-transparent border-0 outline-none text-sm p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={val ?? ""}
                            onChange={(e) => handleChange(g, t, e.target.value)}
                            placeholder="—"
                          />
                        ) : (
                          <span>{val !== null ? val.toFixed(1) : "—"}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nominalPower && (
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border rounded" /> ≥ 95 % Pnom</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-50 border rounded" /> 70–95 %</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-50 border rounded" /> 40–70 %</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-50 border rounded" /> &lt; 40 %</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
