// @ts-nocheck
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts"
import { Zap, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { IECStandardCard } from "./IECStandardCard"
import { ExportDropdown } from "./ExportDropdown"

// ─── Demo Data ──────────────────────────────────────────────────────────────

const MODULES = [
  { id: "DB-001", voltClass: "1000V", impulseV: 6.0, impulseResult: "pass", withstandV: 3000, withstandType: "AC", duration: 60, leakageCurrent: 8.2, breakdown: false, result: "pass" },
  { id: "DB-002", voltClass: "1000V", impulseV: 6.0, impulseResult: "pass", withstandV: 3000, withstandType: "AC", duration: 60, leakageCurrent: 12.5, breakdown: false, result: "pass" },
  { id: "DB-003", voltClass: "1500V", impulseV: 8.0, impulseResult: "pass", withstandV: 4500, withstandType: "AC", duration: 60, leakageCurrent: 15.8, breakdown: false, result: "pass" },
  { id: "DB-004", voltClass: "1500V", impulseV: 8.0, impulseResult: "pass", withstandV: 4500, withstandType: "AC", duration: 60, leakageCurrent: 42.3, breakdown: false, result: "fail" },
  { id: "DB-005", voltClass: "1000V", impulseV: 6.0, impulseResult: "pass", withstandV: 3000, withstandType: "AC", duration: 60, leakageCurrent: 6.1, breakdown: false, result: "pass" },
  { id: "DB-006", voltClass: "1500V", impulseV: 8.0, impulseResult: "fail", withstandV: 4500, withstandType: "AC", duration: 60, leakageCurrent: 85.0, breakdown: true, result: "fail" },
  { id: "DB-007", voltClass: "1000V", impulseV: 6.0, impulseResult: "pass", withstandV: 4240, withstandType: "DC", duration: 60, leakageCurrent: 9.8, breakdown: false, result: "pass" },
  { id: "DB-008", voltClass: "1500V", impulseV: 8.0, impulseResult: "pass", withstandV: 6360, withstandType: "DC", duration: 60, leakageCurrent: 18.2, breakdown: false, result: "pass" },
]

// Voltage ramp data for representative module
const VOLTAGE_RAMP_DATA = [
  { voltage: 0, leakage: 0.0 },
  { voltage: 500, leakage: 0.8 },
  { voltage: 1000, leakage: 1.5 },
  { voltage: 1500, leakage: 2.8 },
  { voltage: 2000, leakage: 4.2 },
  { voltage: 2500, leakage: 6.1 },
  { voltage: 3000, leakage: 8.2 },
  { voltage: 3500, leakage: 11.5 },
  { voltage: 4000, leakage: 16.8 },
  { voltage: 4500, leakage: 24.0 },
  { voltage: 5000, leakage: 35.2 },
  { voltage: 5500, leakage: 52.0 },
  { voltage: 6000, leakage: 78.5 },
]

export function DielectricBreakdownTab() {
  const leakageBarData = useMemo(() => {
    return MODULES.map((m) => ({
      module: m.id,
      leakage: m.leakageCurrent,
      impulseV: m.impulseV,
      withstandV: m.withstandV / 1000,
      result: m.result,
    }))
  }, [])

  const maxLeakage = Math.max(...MODULES.map((m) => m.leakageCurrent))
  const passCount = MODULES.filter((m) => m.result === "pass").length
  const breakdownCount = MODULES.filter((m) => m.breakdown).length

  return (
    <div className="space-y-4">
      <IECStandardCard
        standard="IEC 61730 MST 14 / MST 22"
        title="Dielectric breakdown and withstand voltage tests for PV module safety"
        testConditions={[
          "MST 14 — Impulse voltage test: 1.2/50 μs waveform, positive and negative polarity",
          "MST 22 — Dielectric withstand: Applied between active circuits and accessible parts",
          "Test voltage depends on system voltage class (1000V or 1500V)",
          "Leakage current measured during withstand test (1 min duration)",
        ]}
        dosageLevels={[
          "1000V class: Impulse 6 kV, Withstand 3000V AC or 4240V DC",
          "1500V class: Impulse 8 kV, Withstand 4500V AC or 6360V DC",
          "Duration: 60 seconds for withstand test",
          "Impulse: 3 positive + 3 negative pulses",
        ]}
        passCriteria={[
          { parameter: "Impulse voltage", requirement: "No breakdown or flashover", note: "6 pulses total" },
          { parameter: "Dielectric withstand", requirement: "No breakdown during 60s", note: "AC or DC" },
          { parameter: "Leakage current", requirement: "≤ 25 μA (AC) or ≤ 10 μA (DC) for 1000V class", note: "During withstand" },
          { parameter: "Insulation", requirement: "No tracking, arcing, or surface degradation", note: "Visual check" },
        ]}
        failCriteria={[
          { parameter: "Dielectric breakdown", requirement: "Any breakdown or flashover event" },
          { parameter: "Excessive leakage", requirement: "Leakage current exceeds class-specific limits" },
        ]}
        notes={[
          "MST 14 tests transient overvoltage resistance (lightning, switching surges)",
          "MST 22 verifies continuous insulation integrity under normal operating voltage stress",
          "Both tests are mandatory for IEC 61730 safety certification (Class II insulation)",
        ]}
      />

      <div className="flex justify-end">
        <ExportDropdown
          config={{
            data: MODULES.map((m) => ({
              "Module ID": m.id,
              "Voltage Class": m.voltClass,
              "Impulse Voltage (kV)": m.impulseV,
              "Impulse Result": m.impulseResult.toUpperCase(),
              "Withstand Voltage (V)": m.withstandV,
              "Withstand Type": m.withstandType,
              "Duration (s)": m.duration,
              "Leakage Current (μA)": m.leakageCurrent,
              "Breakdown": m.breakdown ? "YES" : "NO",
              Result: m.result.toUpperCase(),
            })),
            filename: "IEC61730_Dielectric_Tests",
            title: "IEC 61730 MST 14/MST 22 Dielectric Test Results",
            standard: "IEC 61730 MST 14 / MST 22",
            description: "Impulse voltage and dielectric withstand test results",
            sheetName: "Dielectric Tests",
          }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Max Test Voltage</CardDescription>
            <div className="text-2xl font-bold text-blue-600">8 kV</div>
            <p className="text-xs text-muted-foreground">Impulse (1500V class)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Max Leakage Current</CardDescription>
            <div className={`text-2xl font-bold ${maxLeakage > 25 ? "text-red-600" : "text-green-600"}`}>
              {maxLeakage.toFixed(1)} μA
            </div>
            <p className="text-xs text-muted-foreground">During withstand test</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Breakdowns Detected</CardDescription>
            <div className={`text-2xl font-bold ${breakdownCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {breakdownCount}
            </div>
            <p className="text-xs text-muted-foreground">Out of {MODULES.length} modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <CardDescription>Overall Pass/Fail</CardDescription>
            <div className={`text-2xl font-bold ${passCount === MODULES.length ? "text-green-600" : "text-amber-600"}`}>
              {passCount}/{MODULES.length}
            </div>
            <p className="text-xs text-muted-foreground">{MODULES.length - passCount} failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leakage Current Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Leakage Current per Module
            </CardTitle>
            <CardDescription className="text-xs">During dielectric withstand test (60s)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leakageBarData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="module" tick={{ fontSize: 9 }} />
                <YAxis label={{ value: "Leakage (μA)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v} μA`} />
                <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "25 μA limit", fill: "#ef4444", fontSize: 9 }} />
                <Bar dataKey="leakage" name="Leakage Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Voltage Ramp Curve */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Leakage vs Applied Voltage (Representative)
            </CardTitle>
            <CardDescription className="text-xs">DB-001 voltage ramp characterization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={VOLTAGE_RAMP_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="voltage" label={{ value: "Applied Voltage (V)", position: "insideBottom", offset: -5, fontSize: 9 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: "Leakage (μA)", angle: -90, position: "insideLeft", fontSize: 9 }} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v} μA`} />
                <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="6 3" label={{ value: "25 μA limit", fill: "#ef4444", fontSize: 9 }} />
                <ReferenceLine x={3000} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "3kV test", fill: "#f59e0b", fontSize: 9 }} />
                <Line type="monotone" dataKey="leakage" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Leakage Current" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Dielectric Test Results</CardTitle>
          <CardDescription className="text-xs">IEC 61730 MST 14 (Impulse) &amp; MST 22 (Withstand)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-3 text-left font-semibold">Module ID</th>
                  <th className="py-2 px-2 text-center font-semibold">Voltage Class</th>
                  <th className="py-2 px-2 text-right font-semibold">Impulse (kV)</th>
                  <th className="py-2 px-2 text-center font-semibold">Impulse Result</th>
                  <th className="py-2 px-2 text-right font-semibold">Withstand (V)</th>
                  <th className="py-2 px-2 text-center font-semibold">Type</th>
                  <th className="py-2 px-2 text-right font-semibold">Duration (s)</th>
                  <th className="py-2 px-2 text-right font-semibold">Leakage (μA)</th>
                  <th className="py-2 px-2 text-center font-semibold">Breakdown</th>
                  <th className="py-2 text-center font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr key={m.id} className={`border-b hover:bg-muted/50 ${m.result === "fail" ? "bg-red-50/60" : ""}`}>
                    <td className="py-1.5 pr-3 font-mono font-semibold">{m.id}</td>
                    <td className="py-1.5 px-2 text-center">
                      <Badge variant="outline" className="text-xs">{m.voltClass}</Badge>
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">{m.impulseV}</td>
                    <td className="py-1.5 px-2 text-center">
                      <Badge variant={m.impulseResult === "pass" ? "outline" : "destructive"} className="text-xs">
                        {m.impulseResult.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono">{m.withstandV}</td>
                    <td className="py-1.5 px-2 text-center font-mono">{m.withstandType}</td>
                    <td className="py-1.5 px-2 text-right font-mono">{m.duration}</td>
                    <td className={`py-1.5 px-2 text-right font-mono font-semibold ${m.leakageCurrent > 25 ? "text-red-600" : "text-green-600"}`}>
                      {m.leakageCurrent}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {m.breakdown ? (
                        <span className="text-red-600 font-bold">YES</span>
                      ) : (
                        <span className="text-green-600">NO</span>
                      )}
                    </td>
                    <td className="py-1.5 text-center">
                      <Badge variant={m.result === "pass" ? "outline" : "destructive"} className="text-xs">
                        {m.result === "pass" ? "PASS" : "FAIL"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* IEC Reference Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-3 pb-3">
          <div className="text-xs text-amber-800">
            <span className="font-semibold">IEC 61730 MST 14 &amp; MST 22:</span>{" "}
            These safety-critical tests verify the electrical insulation integrity of PV modules.
            MST 14 (impulse voltage) simulates transient overvoltages from lightning strikes or switching surges
            using a 1.2/50 μs waveform at 6 kV (1000V class) or 8 kV (1500V class).
            MST 22 (dielectric withstand) applies continuous high voltage for 60 seconds to verify
            insulation under sustained stress. Both tests are mandatory for IEC 61730 safety certification
            and IEC 62109 inverter-side compliance. Leakage current limits depend on the test type (AC/DC)
            and system voltage class. Any dielectric breakdown constitutes an immediate failure.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
