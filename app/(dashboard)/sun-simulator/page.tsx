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
    </div>
  );
}
