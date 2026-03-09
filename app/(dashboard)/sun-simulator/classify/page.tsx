"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClassificationBadge from "@/components/sun-simulator/ClassificationBadge";
import {
  calculateSpectralMatch,
  calculateUniformity,
  calculateTemporalStability,
  overallClassification,
  type SpectralDataPoint,
  type SpectralMatchResult,
  type UniformityResult,
  type TemporalStabilityResult,
  type ClassificationGrade,
} from "@/lib/sun-simulator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const DEFAULT_SPECTRAL_DATA = `400,1.08
420,1.42
440,1.65
460,1.72
480,1.78
500,1.82
520,1.80
540,1.75
560,1.70
580,1.68
600,1.62
620,1.58
640,1.54
660,1.50
680,1.44
700,1.30
720,1.28
740,1.26
760,1.24
780,1.22
800,1.10
820,1.05
840,1.00
860,0.95
880,0.90
900,0.84
920,0.60
940,0.20
960,0.65
980,0.72
1000,0.70
1020,0.66
1040,0.62
1060,0.58
1080,0.54
1100,0.50`;

function generateSampleGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: number[] = [];
    for (let c = 0; c < 5; c++) {
      const distFromCenter = Math.sqrt((r - 2) ** 2 + (c - 2) ** 2);
      row.push(Math.round(1000 - distFromCenter * 5 + (Math.random() - 0.5) * 8));
    }
    grid.push(row);
  }
  return grid;
}

const DEFAULT_STI = "1000.2,1000.5,1000.1,1000.8,1000.3,1000.6,1000.0,1000.4,1000.7,1000.2,1000.5,1000.1,1000.9,1000.3,1000.6,1000.2,1000.4,1000.8,1000.1,1000.5";
const DEFAULT_LTI = "1000.0,999.8,1000.2,1000.5,999.5,1000.1,1000.3,999.7,1000.4,1000.0,999.9,1000.6,999.6,1000.2,1000.1";

const gradeToScore: Record<ClassificationGrade, number> = {
  "A+": 100,
  A: 80,
  B: 60,
  C: 40,
  Fail: 10,
};

export default function ClassifyPage() {
  const [spectralText, setSpectralText] = useState(DEFAULT_SPECTRAL_DATA);
  const [spectralResult, setSpectralResult] = useState<SpectralMatchResult | null>(null);

  const [gridRows, setGridRows] = useState(5);
  const [gridCols, setGridCols] = useState(5);
  const [uniformityGrid, setUniformityGrid] = useState<number[][]>(generateSampleGrid);
  const [uniformityResult, setUniformityResult] = useState<UniformityResult | null>(null);

  const [stiText, setStiText] = useState(DEFAULT_STI);
  const [ltiText, setLtiText] = useState(DEFAULT_LTI);
  const [temporalResult, setTemporalResult] = useState<TemporalStabilityResult | null>(null);

  function handleSpectralCalc() {
    const lines = spectralText.trim().split("\n");
    const data: SpectralDataPoint[] = lines
      .map((l) => {
        const parts = l.split(",").map((s) => parseFloat(s.trim()));
        return parts.length >= 2 ? { wavelength: parts[0], irradiance: parts[1] } : null;
      })
      .filter(Boolean) as SpectralDataPoint[];
    if (data.length > 0) {
      setSpectralResult(calculateSpectralMatch(data));
    }
  }

  function handleUniformityCalc() {
    if (uniformityGrid.length > 0) {
      setUniformityResult(calculateUniformity(uniformityGrid));
    }
  }

  function handleTemporalCalc() {
    const stiVals = stiText.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    const ltiVals = ltiText.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    if (stiVals.length > 1 && ltiVals.length > 1) {
      setTemporalResult(
        calculateTemporalStability(
          stiVals.map((v, i) => ({ time: i * 0.1, irradiance: v })),
          ltiVals.map((v, i) => ({ time: i * 60, irradiance: v }))
        )
      );
    }
  }

  function updateGridCell(r: number, c: number, value: string) {
    const v = parseFloat(value);
    if (isNaN(v)) return;
    const newGrid = uniformityGrid.map((row) => [...row]);
    newGrid[r][c] = v;
    setUniformityGrid(newGrid);
  }

  function regenerateGrid() {
    const grid: number[][] = [];
    for (let r = 0; r < gridRows; r++) {
      const row: number[] = [];
      for (let c = 0; c < gridCols; c++) {
        const cr = (gridRows - 1) / 2;
        const cc = (gridCols - 1) / 2;
        const dist = Math.sqrt((r - cr) ** 2 + (c - cc) ** 2);
        row.push(Math.round(1000 - dist * 4 + (Math.random() - 0.5) * 8));
      }
      grid.push(row);
    }
    setUniformityGrid(grid);
    setUniformityResult(null);
  }

  const overallGrade =
    spectralResult && uniformityResult && temporalResult
      ? overallClassification(spectralResult.grade, uniformityResult.grade, temporalResult.overallGrade)
      : null;

  const radarData =
    spectralResult && uniformityResult && temporalResult
      ? [
          { parameter: "Spectral", score: gradeToScore[spectralResult.grade], grade: spectralResult.grade },
          { parameter: "Uniformity", score: gradeToScore[uniformityResult.grade], grade: uniformityResult.grade },
          { parameter: "STI", score: gradeToScore[temporalResult.stiGrade], grade: temporalResult.stiGrade },
          { parameter: "LTI", score: gradeToScore[temporalResult.ltiGrade], grade: temporalResult.ltiGrade },
        ]
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Full Classification</h1>
        <p className="text-muted-foreground mt-1">
          Complete IEC 60904-9 Ed.3 classification: spectral match, spatial uniformity, and temporal stability
        </p>
      </div>

      <Tabs defaultValue="spectral">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spectral">Spectral Match</TabsTrigger>
          <TabsTrigger value="uniformity">Spatial Uniformity</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Stability</TabsTrigger>
        </TabsList>

        {/* Spectral Tab */}
        <TabsContent value="spectral">
          <Card>
            <CardHeader>
              <CardTitle>Spectral Match Data</CardTitle>
              <CardDescription>Paste wavelength,irradiance CSV data (nm, W/m2/nm)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-48 font-mono text-sm border rounded-md p-3 bg-background"
                value={spectralText}
                onChange={(e) => setSpectralText(e.target.value)}
              />
              <Button onClick={handleSpectralCalc}>Calculate Spectral Match</Button>

              {spectralResult && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-4">
                    <ClassificationBadge grade={spectralResult.grade} size="md" label="Spectral Grade" />
                    <div className="text-sm space-y-1">
                      <p>Weighted Deviation: {spectralResult.weightedDeviationPct.toFixed(2)}%</p>
                      <p>Ratio Range: {spectralResult.minRatio.toFixed(3)} - {spectralResult.maxRatio.toFixed(3)}</p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Band</TableHead>
                        <TableHead>Measured %</TableHead>
                        <TableHead>Reference %</TableHead>
                        <TableHead>Ratio</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spectralResult.intervals.map((iv) => {
                        const bandGrade = iv.inSpecAPlus ? "A+" : iv.inSpecA ? "A" : iv.inSpecB ? "B" : iv.inSpecC ? "C" : "Fail";
                        return (
                          <TableRow key={iv.band}>
                            <TableCell className="font-mono">{iv.band}</TableCell>
                            <TableCell>{iv.measuredFraction.toFixed(2)}</TableCell>
                            <TableCell>{iv.referenceFraction.toFixed(1)}</TableCell>
                            <TableCell className="font-mono">{iv.ratio.toFixed(4)}</TableCell>
                            <TableCell>
                              <ClassificationBadge grade={bandGrade} size="sm" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={spectralResult.intervals.map((iv) => ({ band: iv.band, ratio: iv.ratio }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="band" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 2]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => v.toFixed(4)} />
                      <Bar dataKey="ratio" name="Ratio">
                        {spectralResult.intervals.map((iv, i) => (
                          <Cell
                            key={i}
                            fill={iv.inSpecAPlus ? "#10b981" : iv.inSpecA ? "#22c55e" : iv.inSpecB ? "#eab308" : "#f97316"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Uniformity Tab */}
        <TabsContent value="uniformity">
          <Card>
            <CardHeader>
              <CardTitle>Spatial Uniformity Data</CardTitle>
              <CardDescription>Enter irradiance values measured across the test area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label>Rows</Label>
                  <Input
                    type="number"
                    min={3}
                    max={15}
                    value={gridRows}
                    onChange={(e) => setGridRows(parseInt(e.target.value) || 5)}
                    className="w-20"
                  />
                </div>
                <div>
                  <Label>Cols</Label>
                  <Input
                    type="number"
                    min={3}
                    max={15}
                    value={gridCols}
                    onChange={(e) => setGridCols(parseInt(e.target.value) || 5)}
                    className="w-20"
                  />
                </div>
                <Button variant="outline" onClick={regenerateGrid}>
                  Generate Sample Grid
                </Button>
              </div>

              <div className="overflow-auto">
                <div
                  className="inline-grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${uniformityGrid[0]?.length || 5}, 70px)` }}
                >
                  {uniformityGrid.map((row, ri) =>
                    row.map((val, ci) => (
                      <Input
                        key={`${ri}-${ci}`}
                        type="number"
                        value={val}
                        onChange={(e) => updateGridCell(ri, ci, e.target.value)}
                        className="text-center text-sm h-9 font-mono"
                      />
                    ))
                  )}
                </div>
              </div>

              <Button onClick={handleUniformityCalc}>Calculate Uniformity</Button>

              {uniformityResult && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-4">
                    <ClassificationBadge grade={uniformityResult.grade} size="md" label="Uniformity Grade" />
                    <div className="text-sm space-y-1">
                      <p>Non-Uniformity: {uniformityResult.nonUniformity.toFixed(3)}%</p>
                      <p>Mean: {uniformityResult.mean.toFixed(1)} W/m2 | CV: {uniformityResult.cv.toFixed(2)}%</p>
                      <p>Min: {uniformityResult.min.toFixed(1)} | Max: {uniformityResult.max.toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temporal Tab */}
        <TabsContent value="temporal">
          <Card>
            <CardHeader>
              <CardTitle>Temporal Stability Data</CardTitle>
              <CardDescription>Enter comma-separated irradiance readings over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>STI - Short Term Irradiance Values (W/m2)</Label>
                <textarea
                  className="w-full h-20 font-mono text-sm border rounded-md p-3 bg-background mt-1"
                  value={stiText}
                  onChange={(e) => setStiText(e.target.value)}
                />
              </div>
              <div>
                <Label>LTI - Long Term Irradiance Values (W/m2)</Label>
                <textarea
                  className="w-full h-20 font-mono text-sm border rounded-md p-3 bg-background mt-1"
                  value={ltiText}
                  onChange={(e) => setLtiText(e.target.value)}
                />
              </div>

              <Button onClick={handleTemporalCalc}>Calculate Temporal Stability</Button>

              {temporalResult && (
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-3">
                    <ClassificationBadge grade={temporalResult.stiGrade} size="md" label="STI Grade" />
                    <span className="text-sm">STI: {temporalResult.sti.toFixed(3)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClassificationBadge grade={temporalResult.ltiGrade} size="md" label="LTI Grade" />
                    <span className="text-sm">LTI: {temporalResult.lti.toFixed(3)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ClassificationBadge grade={temporalResult.overallGrade} size="md" label="Temporal" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Overall Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Classification</CardTitle>
          <CardDescription>Combined result based on worst grade across all three parameters</CardDescription>
        </CardHeader>
        <CardContent>
          {overallGrade ? (
            <div className="flex flex-col items-center gap-6">
              <ClassificationBadge grade={overallGrade} size="lg" label="Overall Grade" />

              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <ClassificationBadge grade={spectralResult!.grade} size="md" label="Spectral" />
                </div>
                <div>
                  <ClassificationBadge grade={uniformityResult!.grade} size="md" label="Uniformity" />
                </div>
                <div>
                  <ClassificationBadge grade={temporalResult!.overallGrade} size="md" label="Temporal" />
                </div>
              </div>

              {radarData && (
                <div className="w-full max-w-md">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.3}
                      />
                      <Tooltip formatter={(v: number, _: string, props: any) => [props.payload.grade, "Grade"]} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Complete all three assessments (Spectral, Uniformity, Temporal) to see the overall classification.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
