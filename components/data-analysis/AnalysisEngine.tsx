// @ts-nocheck
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { IECStandard } from "@/lib/data/data-analysis-data";

interface AnalysisEngineProps {
  standard: IECStandard;
}

// Results data per standard
const analysisResults: Record<string, { title: string; description: string; parameters: { name: string; value: string; unit: string; limit: string; status: "pass" | "fail" | "info"; trend?: "up" | "down" | "stable" }[] }> = {
  "IEC 61215": {
    title: "Design Qualification Analysis",
    description: "Power degradation, EL/IR correlation, IV curve overlay, temperature correction",
    parameters: [
      { name: "Initial Pmax (STC)", value: "401.5", unit: "W", limit: "≥ 400 W (nameplate)", status: "pass", trend: "stable" },
      { name: "Final Pmax (post TC200)", value: "392.3", unit: "W", limit: "≤ 5% degradation", status: "pass", trend: "down" },
      { name: "Power Degradation", value: "2.29", unit: "%", limit: "< 5%", status: "pass", trend: "down" },
      { name: "Voc Change", value: "-0.8", unit: "%", limit: "< 5%", status: "pass", trend: "down" },
      { name: "Isc Change", value: "-0.3", unit: "%", limit: "< 5%", status: "pass", trend: "down" },
      { name: "FF Change", value: "-1.2", unit: "%", limit: "< 5%", status: "pass", trend: "down" },
      { name: "EL Image Defect Correlation", value: "0.15", unit: "% area", limit: "< 2% cell area affected", status: "pass" },
      { name: "IR Hotspot ΔT", value: "8.2", unit: "°C", limit: "< 20°C above cell avg", status: "pass" },
      { name: "Temperature Coefficient (γ)", value: "-0.35", unit: "%/°C", limit: "Info", status: "info" },
    ],
  },
  "IEC 61730": {
    title: "Safety Qualification Analysis",
    description: "Insulation resistance trending, partial discharge, dielectric withstand",
    parameters: [
      { name: "Insulation Resistance (dry)", value: "452.1", unit: "MΩ", limit: "≥ 40 MΩ·m²", status: "pass", trend: "stable" },
      { name: "Insulation Resistance (wet)", value: "185.3", unit: "MΩ", limit: "≥ 40 MΩ·m²", status: "pass", trend: "stable" },
      { name: "Dielectric Withstand (2000V + 4×Voc)", value: "PASS", unit: "", limit: "No breakdown", status: "pass" },
      { name: "Leakage Current", value: "12.5", unit: "µA", limit: "< 50 µA", status: "pass", trend: "stable" },
      { name: "Partial Discharge Level", value: "3.2", unit: "pC", limit: "< 10 pC", status: "pass", trend: "stable" },
      { name: "Impulse Voltage (8kV)", value: "PASS", unit: "", limit: "No flashover", status: "pass" },
      { name: "Ground Continuity", value: "0.08", unit: "Ω", limit: "< 0.1 Ω", status: "pass", trend: "stable" },
      { name: "Temperature Rise", value: "15.3", unit: "°C", limit: "< 50°C above ambient", status: "pass" },
    ],
  },
  "IEC 61853": {
    title: "Energy Rating Analysis",
    description: "Power matrix, spectral correction, NMOT determination",
    parameters: [
      { name: "Pmax at STC (1000 W/m², 25°C)", value: "401.2", unit: "W", limit: "Info", status: "info" },
      { name: "NMOT (Nominal Module Operating Temp)", value: "43.2", unit: "°C", limit: "Info", status: "info" },
      { name: "Annual Energy Yield (Subtropical)", value: "678.5", unit: "kWh/kWp", limit: "Info", status: "info" },
      { name: "Low-Light Performance (200 W/m²)", value: "96.8", unit: "% of linear", limit: "> 90%", status: "pass" },
      { name: "Temperature Coefficient Pmax (γ)", value: "-0.35", unit: "%/°C", limit: "Info", status: "info" },
      { name: "Spectral Correction Factor", value: "1.012", unit: "", limit: "0.95 – 1.05", status: "pass" },
      { name: "Angular Loss Factor (IAM)", value: "0.96", unit: "", limit: "> 0.90", status: "pass" },
      { name: "Power Matrix Points Valid", value: "28/28", unit: "", limit: "100%", status: "pass" },
    ],
  },
  "IEC 60891": {
    title: "I-V Curve Translation Analysis",
    description: "Procedures 1, 2, 3 for temperature/irradiance correction",
    parameters: [
      { name: "Procedure Used", value: "Procedure 1", unit: "", limit: "Info", status: "info" },
      { name: "Series Resistance (Rs)", value: "0.35", unit: "Ω", limit: "Info (device-specific)", status: "info" },
      { name: "κ (kappa)", value: "0.0012", unit: "Ω/°C", limit: "Info", status: "info" },
      { name: "α (Isc temp coeff)", value: "0.0004", unit: "A/°C", limit: "Info", status: "info" },
      { name: "β (Voc temp coeff)", value: "-0.12", unit: "V/°C", limit: "Info", status: "info" },
      { name: "Translation Error (Pmax)", value: "0.32", unit: "%", limit: "< 0.5%", status: "pass" },
      { name: "Translation Error (Isc)", value: "0.15", unit: "%", limit: "< 0.5%", status: "pass" },
      { name: "Translation Error (Voc)", value: "0.28", unit: "%", limit: "< 0.5%", status: "pass" },
      { name: "Irradiance Range Tested", value: "200–1100", unit: "W/m²", limit: "Info", status: "info" },
      { name: "Temperature Range Tested", value: "15–75", unit: "°C", limit: "Info", status: "info" },
    ],
  },
  "IEC 60904": {
    title: "Reference Device Calibration & Measurement Analysis",
    description: "Spectral mismatch, linearity, calibration (60904-1 through 60904-13)",
    parameters: [
      { name: "Spectral Mismatch Factor (M)", value: "1.012", unit: "", limit: "0.98 – 1.02", status: "pass" },
      { name: "Reference Cell Isc (calibrated)", value: "0.1023", unit: "A", limit: "Info", status: "info" },
      { name: "Linearity (R²)", value: "0.9989", unit: "", limit: "> 0.998", status: "pass" },
      { name: "Spatial Non-Uniformity (Class A+)", value: "0.8", unit: "%", limit: "≤ 1%", status: "pass" },
      { name: "Temporal Instability (Class A+)", value: "0.3", unit: "%", limit: "≤ 0.5%", status: "pass" },
      { name: "Spectral Match 400–500nm", value: "0.98", unit: "", limit: "0.75–1.25 (Class A+)", status: "pass" },
      { name: "Spectral Match 500–600nm", value: "1.01", unit: "", limit: "0.75–1.25 (Class A+)", status: "pass" },
      { name: "Spectral Match 600–700nm", value: "0.99", unit: "", limit: "0.75–1.25 (Class A+)", status: "pass" },
      { name: "Spectral Match 700–800nm", value: "1.03", unit: "", limit: "0.75–1.25 (Class A+)", status: "pass" },
      { name: "Spectral Match 800–1100nm", value: "0.96", unit: "", limit: "0.75–1.25 (Class A+)", status: "pass" },
      { name: "Calibration Uncertainty (k=2)", value: "±1.2", unit: "%", limit: "Info", status: "info" },
    ],
  },
};

export function AnalysisEngine({ standard }: AnalysisEngineProps) {
  const data = analysisResults[standard];
  if (!data) return null;

  const passCount = data.parameters.filter((p) => p.status === "pass").length;
  const failCount = data.parameters.filter((p) => p.status === "fail").length;
  const total = data.parameters.filter((p) => p.status !== "info").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{data.title}</CardTitle>
              <CardDescription>{data.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              {total > 0 && (
                <Badge variant="outline" className={failCount === 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                  {failCount === 0 ? "ALL PASS" : `${failCount} FAIL`}
                </Badge>
              )}
              <Badge variant="outline">
                {passCount}/{total} criteria met
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Acceptance Criteria</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.parameters.map((param) => (
                <TableRow key={param.name}>
                  <TableCell className="font-medium text-sm">{param.name}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{param.value}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{param.unit}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{param.limit}</TableCell>
                  <TableCell>
                    {param.trend === "up" && <ArrowUp className="h-4 w-4 text-green-600" />}
                    {param.trend === "down" && <ArrowDown className="h-4 w-4 text-amber-600" />}
                    {param.trend === "stable" && <Minus className="h-4 w-4 text-gray-400" />}
                    {!param.trend && <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {param.status === "pass" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Pass
                      </Badge>
                    )}
                    {param.status === "fail" && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <XCircle className="mr-1 h-3 w-3" /> Fail
                      </Badge>
                    )}
                    {param.status === "info" && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-600">Info</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
