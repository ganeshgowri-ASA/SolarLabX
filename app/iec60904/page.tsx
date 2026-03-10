"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart as LineChartIcon, Target, BookOpen, Link2, Thermometer, Shuffle,
  Waves, Sun, TrendingUp, ScanEye, ArrowRightLeft,
} from "lucide-react";

const parts = [
  { part: 1, title: "I-V Characteristics", desc: "Measurement of PV current-voltage characteristics", icon: LineChartIcon, href: "/iec60904/part-1" },
  { part: 2, title: "Reference Devices", desc: "Requirements for PV reference devices", icon: Target, href: "/iec60904/part-2" },
  { part: 3, title: "Measurement Principles", desc: "Measurement principles for terrestrial PV devices with AM1.5G", icon: BookOpen, href: "/iec60904/part-3" },
  { part: 4, title: "Calibration Traceability", desc: "Procedures for establishing calibration traceability", icon: Link2, href: "/iec60904/part-4" },
  { part: 5, title: "Equivalent Cell Temperature", desc: "Determination of ECT from Voc method", icon: Thermometer, href: "/iec60904/part-5" },
  { part: 7, title: "Spectral Mismatch", desc: "Computation of spectral mismatch correction factor M", icon: Shuffle, href: "/iec60904/part-7" },
  { part: 8, title: "Spectral Responsivity", desc: "Measurement of spectral responsivity of a PV device", icon: Waves, href: "/iec60904/part-8" },
  { part: 9, title: "Solar Simulator", desc: "Solar simulator performance requirements & classification", icon: Sun, href: "/iec60904/part-9" },
  { part: 10, title: "Linearity", desc: "Methods of linearity measurement for Isc vs irradiance", icon: TrendingUp, href: "/iec60904/part-10" },
  { part: 13, title: "Electroluminescence", desc: "EL imaging of PV modules for defect detection", icon: ScanEye, href: "/iec60904/part-13" },
];

export default function IEC60904IndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904 - Photovoltaic Devices</h1>
        <p className="text-muted-foreground mt-1">
          Complete test protocols, data entry, and analysis for all parts of IEC 60904
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map((p) => {
          const Icon = p.icon;
          return (
            <Link key={p.part} href={p.href}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="font-mono">Part {p.part}</Badge>
                  </div>
                  <CardTitle className="text-base mt-2">{p.title}</CardTitle>
                  <CardDescription className="text-xs">{p.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}

        {/* IEC 60891 */}
        <Link href="/iec60904/iec60891">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                <Badge variant="secondary" className="font-mono">IEC 60891</Badge>
              </div>
              <CardTitle className="text-base mt-2">I-V Curve Translation</CardTitle>
              <CardDescription className="text-xs">
                Procedures 1-3 for temperature and irradiance corrections
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ISO 17025 Compliance</CardTitle>
          <CardDescription>All protocols follow ISO/IEC 17025 document numbering and traceability requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="font-bold text-2xl text-primary">10</div>
              <div className="text-muted-foreground">Test Parts</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="font-bold text-2xl text-primary">4</div>
              <div className="text-muted-foreground">Tabs per Part</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="font-bold text-2xl text-primary">3</div>
              <div className="text-muted-foreground">Translation Procedures</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <div className="font-bold text-2xl text-primary">ISO 17025</div>
              <div className="text-muted-foreground">Compliant</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
