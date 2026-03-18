// @ts-nocheck
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClassificationBadge from "@/components/sun-simulator/ClassificationBadge";
import type { ClassificationGrade } from "@/lib/sun-simulator";

const gradeThresholds = [
  { parameter: "Spectral Match (ratio)", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
  { parameter: "Non-Uniformity (%)", aPlus: "\u2264 1%", a: "\u2264 2%", b: "\u2264 5%", c: "\u2264 10%" },
  { parameter: "STI (%)", aPlus: "\u2264 0.5%", a: "\u2264 2%", b: "\u2264 5%", c: "\u2264 10%" },
  { parameter: "LTI (%)", aPlus: "\u2264 1%", a: "\u2264 2%", b: "\u2264 5%", c: "\u2264 10%" },
];

interface RecentEntry {
  name: string;
  date: string;
  spectral: ClassificationGrade;
  uniformity: ClassificationGrade;
  temporal: ClassificationGrade;
  overall: ClassificationGrade;
}

const recentClassifications: RecentEntry[] = [
  { name: "Pasan 3c SunSim", date: "2026-03-07", spectral: "A+", uniformity: "A", temporal: "A+", overall: "A" },
  { name: "Halm IX-30", date: "2026-03-05", spectral: "A", uniformity: "A+", temporal: "A", overall: "A" },
  { name: "Eternal Sun 3A+", date: "2026-02-28", spectral: "A+", uniformity: "A+", temporal: "A+", overall: "A+" },
  { name: "Newport Oriel 94063A", date: "2026-02-20", spectral: "B", uniformity: "A", temporal: "A", overall: "B" },
];

const quickActions = [
  { label: "New Classification", href: "/sun-simulator/classify", description: "Full 3-parameter classification" },
  { label: "Spectral Analysis", href: "/sun-simulator/spectral", description: "Detailed spectral match" },
  { label: "Uniformity Mapping", href: "/sun-simulator/uniformity", description: "Spatial non-uniformity" },
  { label: "Stability Check", href: "/sun-simulator/stability", description: "Temporal instability" },
  { label: "SPC Charts", href: "/sun-simulator/spc", description: "Process control & MSA" },
];

export default function SunSimulatorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sun Simulator Classifier</h1>
        <p className="text-muted-foreground mt-1">
          IEC 60904-9 Ed.3 classification of solar simulators - spectral match, spatial uniformity, and temporal stability assessment
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">{action.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Classification Grade Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classification Grade Thresholds</CardTitle>
          <CardDescription>IEC 60904-9 Ed.3 performance requirements per classification grade</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> A+
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> A
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> B
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> C
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeThresholds.map((row) => (
                <TableRow key={row.parameter}>
                  <TableCell className="font-medium">{row.parameter}</TableCell>
                  <TableCell className="text-center text-sm">{row.aPlus}</TableCell>
                  <TableCell className="text-center text-sm">{row.a}</TableCell>
                  <TableCell className="text-center text-sm">{row.b}</TableCell>
                  <TableCell className="text-center text-sm">{row.c}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Classifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Classifications</CardTitle>
          <CardDescription>Latest sun simulator classification results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Simulator</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Spectral</TableHead>
                <TableHead className="text-center">Uniformity</TableHead>
                <TableHead className="text-center">Temporal</TableHead>
                <TableHead className="text-center">Overall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentClassifications.map((entry) => (
                <TableRow key={entry.name}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.date}</TableCell>
                  <TableCell className="text-center">
                    <ClassificationBadge grade={entry.spectral} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <ClassificationBadge grade={entry.uniformity} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <ClassificationBadge grade={entry.temporal} size="sm" />
                  </TableCell>
                  <TableCell className="text-center">
                    <ClassificationBadge grade={entry.overall} size="md" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* IEC 60904-9 Ed.3 Detailed Classification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">IEC 60904-9 Ed.3 Classification Details</CardTitle>
          <CardDescription>
            Comprehensive classification parameters for solar simulator performance assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Spectral Match */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              Spectral Match (IEC 60904-9 Clause 5.2)
            </h3>
            <p className="text-sm text-muted-foreground">
              Ratio of measured spectral irradiance to AM1.5G reference spectrum (IEC 60904-3) in 6 wavelength intervals.
              Each interval ratio must fall within classification limits. The overall spectral classification is determined by the worst interval.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Wavelength Interval (nm)</TableHead>
                  <TableHead className="text-xs text-center">AM1.5G Fraction (%)</TableHead>
                  <TableHead className="text-xs text-center">A+ Range</TableHead>
                  <TableHead className="text-xs text-center">A Range</TableHead>
                  <TableHead className="text-xs text-center">B Range</TableHead>
                  <TableHead className="text-xs text-center">C Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { interval: "400 - 500", fraction: "18.4", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
                  { interval: "500 - 600", fraction: "19.9", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
                  { interval: "600 - 700", fraction: "18.4", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
                  { interval: "700 - 800", fraction: "14.9", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
                  { interval: "800 - 900", fraction: "12.5", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
                  { interval: "900 - 1100", fraction: "15.9", aPlus: "0.875 - 1.125", a: "0.75 - 1.25", b: "0.6 - 1.4", c: "0.4 - 2.0" },
                ].map((row) => (
                  <TableRow key={row.interval}>
                    <TableCell className="text-xs font-mono">{row.interval}</TableCell>
                    <TableCell className="text-xs text-center">{row.fraction}</TableCell>
                    <TableCell className="text-xs text-center text-emerald-700">{row.aPlus}</TableCell>
                    <TableCell className="text-xs text-center text-green-700">{row.a}</TableCell>
                    <TableCell className="text-xs text-center text-yellow-700">{row.b}</TableCell>
                    <TableCell className="text-xs text-center text-orange-700">{row.c}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Spatial Non-Uniformity */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Spatial Non-Uniformity of Irradiance (Clause 5.3)</h3>
            <p className="text-sm text-muted-foreground">
              Measured across the test plane using a matrix of at least 64 positions (8×8 grid).
              Non-uniformity = (Emax - Emin) / (Emax + Emin) × 100%.
              Measurement area must match or exceed the DUT area.
            </p>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { grade: "A+", value: "≤ 1%", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                { grade: "A", value: "≤ 2%", color: "bg-green-50 border-green-200 text-green-800" },
                { grade: "B", value: "≤ 5%", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
                { grade: "C", value: "≤ 10%", color: "bg-orange-50 border-orange-200 text-orange-800" },
              ].map((g) => (
                <div key={g.grade} className={`p-3 rounded-lg border ${g.color}`}>
                  <div className="text-lg font-bold">{g.grade}</div>
                  <div className="text-sm font-mono">{g.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Temporal Instability */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Temporal Instability of Irradiance (Clause 5.4)</h3>
            <p className="text-sm text-muted-foreground">
              Divided into Short-Term Instability (STI) during I-V sweep and Long-Term Instability (LTI) over the measurement period.
              STI = (Emax - Emin) / (Emax + Emin) × 100% during one I-V sweep.
              LTI = variation over multiple consecutive measurements (typically 10 minutes).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold mb-2">Short-Term Instability (STI)</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { grade: "A+", value: "≤ 0.5%", color: "bg-emerald-50 text-emerald-800" },
                    { grade: "A", value: "≤ 2%", color: "bg-green-50 text-green-800" },
                    { grade: "B", value: "≤ 5%", color: "bg-yellow-50 text-yellow-800" },
                    { grade: "C", value: "≤ 10%", color: "bg-orange-50 text-orange-800" },
                  ].map((g) => (
                    <div key={g.grade} className={`p-2 rounded ${g.color}`}>
                      <div className="text-sm font-bold">{g.grade}</div>
                      <div className="text-xs font-mono">{g.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold mb-2">Long-Term Instability (LTI)</h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { grade: "A+", value: "≤ 1%", color: "bg-emerald-50 text-emerald-800" },
                    { grade: "A", value: "≤ 2%", color: "bg-green-50 text-green-800" },
                    { grade: "B", value: "≤ 5%", color: "bg-yellow-50 text-yellow-800" },
                    { grade: "C", value: "≤ 10%", color: "bg-orange-50 text-orange-800" },
                  ].map((g) => (
                    <div key={g.grade} className={`p-2 rounded ${g.color}`}>
                      <div className="text-sm font-bold">{g.grade}</div>
                      <div className="text-xs font-mono">{g.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calibration Requirements</CardTitle>
          <CardDescription>IEC 60904-2 reference device and calibration protocol requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Calibration Protocol</h3>
              <div className="space-y-2">
                {[
                  { item: "Calibration Frequency", value: "Annual recalibration or after any lamp/optics change" },
                  { item: "Reference Standard", value: "IEC 60904-2 compliant reference cell with WPVS calibration" },
                  { item: "Traceability", value: "Traceable to WPVS (World PV Scale) via primary calibration laboratory" },
                  { item: "Spectral Measurement", value: "IEC 60904-7 spectroradiometer, 300-1200nm, ≤ 5nm resolution" },
                  { item: "Uniformity Mapping", value: "Minimum 64 points (8×8 grid) across test plane, ≤ 50mm spacing" },
                  { item: "Temperature Control", value: "Reference cell temperature 25°C ± 2°C during calibration" },
                  { item: "Irradiance Level", value: "1000 W/m² ± 2% (STC condition)" },
                  { item: "Documentation", value: "Certificate with classification, uncertainty budget, and validity period" },
                ].map((req) => (
                  <div key={req.item} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5">{req.item}</Badge>
                    <span className="text-muted-foreground">{req.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Reference Cell Specifications</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Parameter</TableHead>
                    <TableHead className="text-xs">Requirement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { param: "Cell Technology", value: "Mono-Si (matched to DUT technology preferred)" },
                    { param: "Active Area", value: "2×2 cm (minimum), 4 cm² typical" },
                    { param: "Calibration Source", value: "WPVS-calibrated (PTB, NREL, AIST, ISE, ESTI)" },
                    { param: "Calibration Uncertainty", value: "≤ ± 1.0% (k=2) for Isc" },
                    { param: "Temperature Sensor", value: "Pt100 / thermocouple bonded to rear surface" },
                    { param: "Temperature Coefficient", value: "Known α(Isc) and β(Voc), typically α ≈ +0.05%/°C" },
                    { param: "Spectral Response", value: "Measured per IEC 60904-8, matched to DUT SR" },
                    { param: "Encapsulation", value: "Glass-encapsulated, hermetically sealed" },
                    { param: "Connector", value: "4-wire Kelvin connection for low contact resistance" },
                    { param: "Calibration Validity", value: "12 months (or per accreditation scope)" },
                  ].map((row) => (
                    <TableRow key={row.param}>
                      <TableCell className="text-xs font-medium">{row.param}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
