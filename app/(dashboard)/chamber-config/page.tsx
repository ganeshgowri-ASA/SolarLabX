// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STANDARD_TEST_PROFILES } from "@/lib/chamber";
import {
  Thermometer,
  Droplets,
  Sun,
  Snowflake,
  Settings,
  BarChart3,
  Clock,
  IndianRupee,
  Box,
  Info,
  AlertCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const testTypeIcons: Record<string, React.ReactNode> = {
  TC: <Thermometer className="h-5 w-5 text-red-500" />,
  HF: <Snowflake className="h-5 w-5 text-blue-500" />,
  DH: <Droplets className="h-5 w-5 text-cyan-500" />,
  UV: <Sun className="h-5 w-5 text-yellow-500" />,
  "TC+HF": <Thermometer className="h-5 w-5 text-purple-500" />,
  "UV+TC+HF+DH": <Sun className="h-5 w-5 text-orange-500" />,
};

const savedConfigs = [
  {
    id: "1",
    name: "Standard TC Chamber",
    volume: "14.784 m\u00b3",
    cost: "\u20b972.8L",
    testTypes: ["TC"],
    date: "2026-03-05",
  },
  {
    id: "2",
    name: "Combined TC+HF Chamber",
    volume: "14.784 m\u00b3",
    cost: "\u20b980.8L",
    testTypes: ["TC", "HF"],
    date: "2026-03-07",
  },
  {
    id: "3",
    name: "Full Suite UV Chamber",
    volume: "18.900 m\u00b3",
    cost: "\u20b9108.5L",
    testTypes: ["UV", "TC", "HF", "DH"],
    date: "2026-03-08",
  },
];

export default function ChamberConfigPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chamber Configurator</h1>
        <p className="text-muted-foreground mt-2">
          Configure environmental test chambers for PV module testing per IEC 61215, 61730, and related standards.
          Design chamber specifications, calculate costs, and compare configurations.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/chamber-config/configure">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Configure New Chamber</CardTitle>
                  <CardDescription>
                    Design a custom environmental test chamber with interactive controls
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Configuration</Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/chamber-config/compare">
          <Card className="cursor-pointer hover:border-primary transition-colors h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Compare Configurations</CardTitle>
                  <CardDescription>
                    Side-by-side comparison of two chamber configurations with charts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Open Comparison</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Standard Test Profiles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Standard Test Profiles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STANDARD_TEST_PROFILES.map((profile) => (
            <Card key={profile.testType}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testTypeIcons[profile.testType]}
                    <CardTitle className="text-base">{profile.testType}</CardTitle>
                  </div>
                  <Badge variant="secondary">{profile.standard}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{profile.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{profile.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{profile.params.tempMin}°C to {profile.params.tempMax}°C</span>
                  </div>
                </div>
                {profile.params.humidityMax > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Droplets className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Humidity: {profile.params.humidityMax}% RH</span>
                  </div>
                )}
                {profile.params.uvIntensity > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>UV: {profile.params.uvIntensity} W/m²</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Configurations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Configurations</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {savedConfigs.map((config) => (
            <Card key={config.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{config.name}</CardTitle>
                <CardDescription>Saved on {config.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {config.testTypes.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Box className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{config.volume}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{config.cost}</span>
                  </div>
                </div>
                <Link href="/chamber-config/configure">
                  <Button variant="ghost" size="sm" className="w-full mt-1">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* IEC Standard Chamber Requirements */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          IEC Standard Environmental Chamber Requirements
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Damp Heat */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-base">Damp Heat (DH) — IEC 61215 MQT 13</CardTitle>
              </div>
              <CardDescription>Accelerated moisture ingress and corrosion test</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="text-xs font-medium">Temperature</TableCell><TableCell className="text-xs">85°C ± 2°C</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Relative Humidity</TableCell><TableCell className="text-xs">85% ± 5% RH</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Duration</TableCell><TableCell className="text-xs">1000 hours (standard) / 2000 hours (extended)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Ramp Rate</TableCell><TableCell className="text-xs">Stabilize within 2 hours of reaching setpoint</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Sample Loading</TableCell><TableCell className="text-xs">Module tilted 5-90° from vertical, air circulation maintained</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Measurements</TableCell><TableCell className="text-xs">Pmax, insulation resistance, visual inspection pre/post</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Pass Criteria</TableCell><TableCell className="text-xs font-semibold text-green-700">Pmax degradation ≤ 5%, wet leakage current pass, no major visual defects</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Thermal Cycling */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-red-500" />
                <CardTitle className="text-base">Thermal Cycling (TC) — IEC 61215 MQT 11</CardTitle>
              </div>
              <CardDescription>Thermal fatigue and solder joint reliability test</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="text-xs font-medium">Low Temperature</TableCell><TableCell className="text-xs">-40°C ± 2°C</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">High Temperature</TableCell><TableCell className="text-xs">85°C ± 2°C</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Ramp Rate</TableCell><TableCell className="text-xs">≤ 100°C/hr maximum (typically 80-100°C/hr)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Dwell Time</TableCell><TableCell className="text-xs">≥ 10 minutes at each extreme</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Cycle Count</TableCell><TableCell className="text-xs">200 cycles (TC200) or 50 cycles (TC50 per sequence)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Cycle Duration</TableCell><TableCell className="text-xs">~3 hours per cycle (with ramp and dwell)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Current Injection</TableCell><TableCell className="text-xs">Isc applied during test (IEC 61215:2021)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Pass Criteria</TableCell><TableCell className="text-xs font-semibold text-green-700">Pmax degradation ≤ 5%, no open circuits, visual pass</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Humidity Freeze */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">Humidity Freeze (HF) — IEC 61215 MQT 12</CardTitle>
              </div>
              <CardDescription>Thermal shock with moisture penetration test</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="text-xs font-medium">High Temperature</TableCell><TableCell className="text-xs">85°C ± 2°C</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">High Humidity</TableCell><TableCell className="text-xs">85% ± 5% RH (at high temp phase)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Low Temperature</TableCell><TableCell className="text-xs">-40°C ± 2°C (no humidity control)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Ramp Rate</TableCell><TableCell className="text-xs">≤ 100°C/hr maximum</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Dwell at 85°C/85%RH</TableCell><TableCell className="text-xs">≥ 20 hours</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Dwell at -40°C</TableCell><TableCell className="text-xs">≥ 30 minutes (minimum)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Cycle Count</TableCell><TableCell className="text-xs">10 cycles (HF10)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Pass Criteria</TableCell><TableCell className="text-xs font-semibold text-green-700">Pmax degradation ≤ 5%, wet leakage pass, no delamination</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* UV Preconditioning */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-base">UV Preconditioning — IEC 61215 MQT 10</CardTitle>
              </div>
              <CardDescription>UV degradation screening of encapsulant and backsheet</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="text-xs font-medium">Wavelength Range</TableCell><TableCell className="text-xs">280 - 400 nm (UVA + UVB)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Total UV Dose</TableCell><TableCell className="text-xs">15 kWh/m² UVA (280-320nm) + 5 kWh/m² UVB (320-400nm)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">UV Irradiance</TableCell><TableCell className="text-xs">100-250 W/m² (adjustable, measured at test plane)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Module Temperature</TableCell><TableCell className="text-xs">60°C ± 5°C (module surface)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Duration</TableCell><TableCell className="text-xs">~120-200 hours (depending on UV intensity)</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Uniformity</TableCell><TableCell className="text-xs">UV irradiance uniformity ≤ ± 15% across test plane</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Measurement</TableCell><TableCell className="text-xs">UV radiometer calibrated per ISO 17025, traceable</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs font-medium">Pass Criteria</TableCell><TableCell className="text-xs font-semibold text-green-700">No delamination, yellowing index ΔYI ≤ 5, Pmax ≤ 5% degradation</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chamber Tolerance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Chamber Tolerance Summary (IEC 61215:2021 / IEC 61730:2023)
          </CardTitle>
          <CardDescription>
            Critical control parameters and their allowable tolerances for accredited testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Test Type</TableHead>
                <TableHead className="text-xs">Parameter</TableHead>
                <TableHead className="text-xs">Setpoint</TableHead>
                <TableHead className="text-xs">Tolerance</TableHead>
                <TableHead className="text-xs">Measurement Instrument</TableHead>
                <TableHead className="text-xs">Cal. Interval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { test: "DH", param: "Temperature", setpoint: "85°C", tolerance: "± 2°C", instrument: "Calibrated PT100 (Class A)", cal: "12 months" },
                { test: "DH", param: "Humidity", setpoint: "85% RH", tolerance: "± 5% RH", instrument: "Capacitive RH sensor (± 1.5%)", cal: "12 months" },
                { test: "TC", param: "Low Temp", setpoint: "-40°C", tolerance: "± 2°C", instrument: "Calibrated PT100 (Class A)", cal: "12 months" },
                { test: "TC", param: "High Temp", setpoint: "85°C", tolerance: "± 2°C", instrument: "Calibrated PT100 (Class A)", cal: "12 months" },
                { test: "TC", param: "Ramp Rate", setpoint: "100°C/hr", tolerance: "max (not exceeded)", instrument: "PLC ramp controller + PT100", cal: "12 months" },
                { test: "HF", param: "Low Temp", setpoint: "-40°C", tolerance: "± 2°C", instrument: "Calibrated PT100 (Class A)", cal: "12 months" },
                { test: "HF", param: "High Temp", setpoint: "85°C", tolerance: "± 2°C", instrument: "Calibrated PT100 (Class A)", cal: "12 months" },
                { test: "HF", param: "Humidity", setpoint: "85% RH", tolerance: "± 5% RH", instrument: "Capacitive RH sensor (± 1.5%)", cal: "12 months" },
                { test: "UV", param: "Wavelength", setpoint: "280-400nm", tolerance: "per lamp specification", instrument: "UV radiometer (ISO 17025)", cal: "12 months" },
                { test: "UV", param: "Total Dose", setpoint: "15 kWh/m²", tolerance: "Measured (integrated)", instrument: "UV integrating radiometer", cal: "12 months" },
                { test: "UV", param: "Module Temp", setpoint: "60°C", tolerance: "± 5°C", instrument: "Thermocouple / PT100", cal: "12 months" },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell><Badge variant="outline" className="text-xs">{row.test}</Badge></TableCell>
                  <TableCell className="text-xs font-medium">{row.param}</TableCell>
                  <TableCell className="text-xs font-mono">{row.setpoint}</TableCell>
                  <TableCell className="text-xs font-mono font-semibold text-primary">{row.tolerance}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.instrument}</TableCell>
                  <TableCell className="text-xs">{row.cal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
