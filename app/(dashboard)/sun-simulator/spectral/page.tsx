// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClassificationBadge from "@/components/sun-simulator/ClassificationBadge";
import SpectralChart from "@/components/sun-simulator/SpectralChart";
import {
  calculateSpectralMatch,
  AM15G_REFERENCE,
  type SpectralDataPoint,
  type SpectralMatchResult,
} from "@/lib/sun-simulator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";

// Realistic AM1.5G-like sample data with slight variations
const DEFAULT_SPECTRAL = `300,0.03
320,0.18
340,0.42
360,0.55
380,0.78
400,1.08
410,1.26
420,1.42
430,1.55
440,1.65
450,1.72
460,1.74
470,1.77
480,1.80
490,1.82
500,1.83
510,1.81
520,1.79
530,1.77
540,1.74
550,1.71
560,1.69
570,1.67
580,1.65
590,1.63
600,1.60
610,1.58
620,1.56
630,1.53
640,1.51
650,1.49
660,1.47
670,1.44
680,1.40
690,1.36
700,1.30
710,1.29
720,1.28
730,1.27
740,1.26
750,1.24
760,1.23
770,1.22
780,1.20
790,1.16
800,1.10
810,1.07
820,1.04
830,1.01
840,0.99
850,0.96
860,0.94
870,0.92
880,0.90
890,0.87
900,0.84
910,0.70
920,0.55
930,0.22
940,0.18
950,0.16
960,0.55
970,0.65
980,0.72
990,0.73
1000,0.71
1010,0.69
1020,0.67
1030,0.65
1040,0.63
1050,0.61
1060,0.58
1070,0.56
1080,0.54
1090,0.52
1100,0.49
1120,0.40
1150,0.30
1180,0.20
1200,0.15`;

export default function SpectralPage() {
  const [text, setText] = useState(DEFAULT_SPECTRAL);
  const [data, setData] = useState<SpectralDataPoint[] | null>(null);
  const [result, setResult] = useState<SpectralMatchResult | null>(null);

  function handleCalculate() {
    const lines = text.trim().split("\n");
    const parsed: SpectralDataPoint[] = lines
      .map((l) => {
        const parts = l.split(",").map((s) => parseFloat(s.trim()));
        return parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])
          ? { wavelength: parts[0], irradiance: parts[1] }
          : null;
      })
      .filter(Boolean) as SpectralDataPoint[];

    if (parsed.length > 0) {
      setData(parsed);
      setResult(calculateSpectralMatch(parsed));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Spectral Match Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Detailed spectral irradiance distribution classification per IEC 60904-9 Ed.3
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spectral Irradiance Data</CardTitle>
          <CardDescription>
            Enter wavelength (nm) and irradiance (W/m2/nm) pairs, one per line, comma-separated.
            Sample AM1.5G-like data is pre-loaded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="w-full h-64 font-mono text-sm border rounded-md p-3 bg-background"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={handleCalculate}>Analyze Spectral Match</Button>
        </CardContent>
      </Card>

      {data && result && (
        <>
          {/* Spectrum Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Measured vs AM1.5G Reference Spectrum</CardTitle>
              <CardDescription>
                Blue = Measured spectrum, Red dashed = AM1.5G reference. Shaded regions indicate wavelength bands.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpectralChart data={data} result={result} />
            </CardContent>
          </Card>

          {/* Band Ratio Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Band Ratio Analysis</CardTitle>
              <CardDescription>
                Ratio of measured to reference fraction per wavelength band. Threshold lines show A+ and A limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <ClassificationBadge grade={result.grade} size="lg" label="Spectral Grade" />
                <div className="text-sm space-y-1">
                  <p>Mean Ratio: {result.meanRatio.toFixed(4)}</p>
                  <p>Min: {result.minRatio.toFixed(4)} | Max: {result.maxRatio.toFixed(4)}</p>
                  <p>Weighted Deviation: {result.weightedDeviationPct.toFixed(2)}%</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={result.intervals.map((iv) => ({
                    band: iv.band,
                    ratio: iv.ratio,
                    inSpecAPlus: iv.inSpecAPlus,
                    inSpecA: iv.inSpecA,
                    inSpecB: iv.inSpecB,
                  }))}
                  margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="band" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 2]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v.toFixed(4)} />
                  {/* A+ thresholds */}
                  <ReferenceLine y={1.125} stroke="#10b981" strokeDasharray="5 5" label={{ value: "A+ upper (1.125)", fill: "#10b981", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={0.875} stroke="#10b981" strokeDasharray="5 5" label={{ value: "A+ lower (0.875)", fill: "#10b981", fontSize: 10, position: "right" }} />
                  {/* A thresholds */}
                  <ReferenceLine y={1.25} stroke="#eab308" strokeDasharray="3 3" label={{ value: "A upper (1.25)", fill: "#eab308", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={0.75} stroke="#eab308" strokeDasharray="3 3" label={{ value: "A lower (0.75)", fill: "#eab308", fontSize: 10, position: "right" }} />
                  {/* Perfect match */}
                  <ReferenceLine y={1.0} stroke="#6b7280" strokeDasharray="2 2" />
                  <Bar dataKey="ratio" name="Ratio">
                    {result.intervals.map((iv, i) => (
                      <Cell
                        key={i}
                        fill={iv.inSpecAPlus ? "#10b981" : iv.inSpecA ? "#22c55e" : iv.inSpecB ? "#eab308" : iv.inSpecC ? "#f97316" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ratio Table */}
          <Card>
            <CardHeader>
              <CardTitle>Band Ratio Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wavelength Band</TableHead>
                    <TableHead className="text-right">Measured Fraction (%)</TableHead>
                    <TableHead className="text-right">AM1.5G Reference (%)</TableHead>
                    <TableHead className="text-right">Ratio</TableHead>
                    <TableHead className="text-center">A+</TableHead>
                    <TableHead className="text-center">A</TableHead>
                    <TableHead className="text-center">B</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.intervals.map((iv) => {
                    const bandGrade = iv.inSpecAPlus ? "A+" : iv.inSpecA ? "A" : iv.inSpecB ? "B" : iv.inSpecC ? "C" : "Fail";
                    return (
                      <TableRow key={iv.band}>
                        <TableCell className="font-mono font-medium">{iv.band}</TableCell>
                        <TableCell className="text-right font-mono">{iv.measuredFraction.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{iv.referenceFraction.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{iv.ratio.toFixed(4)}</TableCell>
                        <TableCell className="text-center">
                          <span className={iv.inSpecAPlus ? "text-emerald-600 font-bold" : "text-red-400"}>
                            {iv.inSpecAPlus ? "Pass" : "Fail"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={iv.inSpecA ? "text-green-600 font-bold" : "text-red-400"}>
                            {iv.inSpecA ? "Pass" : "Fail"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={iv.inSpecB ? "text-yellow-600 font-bold" : "text-red-400"}>
                            {iv.inSpecB ? "Pass" : "Fail"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <ClassificationBadge grade={bandGrade} size="sm" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
