"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ClassificationBadge from "@/components/sun-simulator/ClassificationBadge";
import { WAVELENGTH_BANDS, overallClassification, type ClassificationGrade } from "@/lib/sun-simulator";

const GRADE_ORDER: ClassificationGrade[] = ["A+", "A", "B", "C", "Fail"];

function worstGrade(grades: ClassificationGrade[]): ClassificationGrade {
  return grades.reduce((worst, g) =>
    GRADE_ORDER.indexOf(g) > GRADE_ORDER.indexOf(worst) ? g : worst,
    "A+" as ClassificationGrade
  );
}

function gradeFromRatio(ratio: number): ClassificationGrade {
  if (ratio >= 0.875 && ratio <= 1.125) return "A+";
  if (ratio >= 0.75 && ratio <= 1.25) return "A";
  if (ratio >= 0.6 && ratio <= 1.4) return "B";
  if (ratio >= 0.4 && ratio <= 2.0) return "C";
  return "Fail";
}

function gradeFromNonUniformity(nu: number): ClassificationGrade {
  if (nu <= 1) return "A+";
  if (nu <= 2) return "A";
  if (nu <= 5) return "B";
  if (nu <= 10) return "C";
  return "Fail";
}

function gradeFromSTI(sti: number): ClassificationGrade {
  if (sti <= 0.5) return "A+";
  if (sti <= 2) return "A";
  if (sti <= 5) return "B";
  if (sti <= 10) return "C";
  return "Fail";
}

function gradeFromLTI(lti: number): ClassificationGrade {
  if (lti <= 1) return "A+";
  if (lti <= 2) return "A";
  if (lti <= 5) return "B";
  if (lti <= 10) return "C";
  return "Fail";
}

const GRADE_BORDER: Record<ClassificationGrade, string> = {
  "A+": "border-emerald-500",
  "A": "border-green-500",
  "B": "border-yellow-400",
  "C": "border-orange-500",
  "Fail": "border-red-600",
};

interface FormState {
  simulatorName: string;
  serialNo: string;
  testDate: string;
  irradiance: string;
  bandRatios: string[];
  nonUniformity: string;
  sti: string;
  lti: string;
}

interface ClassifyResult {
  spectralGrade: ClassificationGrade;
  uniformityGrade: ClassificationGrade;
  temporalGrade: ClassificationGrade;
  overallGrade: ClassificationGrade;
  bandResults: { band: string; ratio: number; grade: ClassificationGrade }[];
  nu: number;
  sti: number;
  lti: number;
}

export default function ClassifyPage() {
  const [form, setForm] = useState<FormState>({
    simulatorName: "",
    serialNo: "",
    testDate: new Date().toISOString().slice(0, 10),
    irradiance: "1000",
    bandRatios: ["1.02", "0.98", "1.01", "0.97", "1.03", "0.99"],
    nonUniformity: "1.5",
    sti: "0.8",
    lti: "1.2",
  });

  const [result, setResult] = useState<ClassifyResult | null>(null);

  function classify() {
    const ratios = form.bandRatios.map(parseFloat);
    const bandResults = ratios.map((r, i) => ({
      band: WAVELENGTH_BANDS[i].range,
      ratio: isNaN(r) ? 0 : r,
      grade: gradeFromRatio(isNaN(r) ? 0 : r),
    }));
    const spectralGrade = worstGrade(bandResults.map((b) => b.grade));
    const nu = parseFloat(form.nonUniformity) || 0;
    const sti = parseFloat(form.sti) || 0;
    const lti = parseFloat(form.lti) || 0;
    const uniformityGrade = gradeFromNonUniformity(nu);
    const temporalGrade = worstGrade([gradeFromSTI(sti), gradeFromLTI(lti)]);
    setResult({
      spectralGrade,
      uniformityGrade,
      temporalGrade,
      overallGrade: overallClassification(spectralGrade, uniformityGrade, temporalGrade),
      bandResults,
      nu,
      sti,
      lti,
    });
  }

  function setBandRatio(i: number, val: string) {
    const next = [...form.bandRatios];
    next[i] = val;
    setForm({ ...form, bandRatios: next });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sun-simulator">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IEC 60904-9 Classifier</h1>
          <p className="text-sm text-muted-foreground">
            Full 3-parameter classification: spectral match, spatial uniformity, temporal stability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Simulator Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Simulator Name</Label>
                <Input
                  value={form.simulatorName}
                  onChange={(e) => setForm({ ...form, simulatorName: e.target.value })}
                  placeholder="e.g. Pasan 3c SunSim"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Serial No.</Label>
                <Input
                  value={form.serialNo}
                  onChange={(e) => setForm({ ...form, serialNo: e.target.value })}
                  placeholder="SN-12345"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Test Date</Label>
                <Input
                  type="date"
                  value={form.testDate}
                  onChange={(e) => setForm({ ...form, testDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Irradiance (W/m²)</Label>
                <Input
                  type="number"
                  value={form.irradiance}
                  onChange={(e) => setForm({ ...form, irradiance: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Spectral Band Ratios</CardTitle>
              <CardDescription className="text-xs">
                Measured fraction / AM1.5G reference fraction per wavelength interval (IEC 60904-9 §5.2)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {WAVELENGTH_BANDS.map((band, i) => (
                <div key={band.range} className="flex items-center gap-3">
                  <span className="text-xs font-mono w-24 text-muted-foreground shrink-0">
                    {band.range}
                  </span>
                  <span className="text-xs text-muted-foreground w-12 shrink-0">
                    {band.am15gFraction}%
                  </span>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="3"
                    className="w-28 text-sm"
                    value={form.bandRatios[i]}
                    onChange={(e) => setBandRatio(i, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Uniformity &amp; Stability</CardTitle>
              <CardDescription className="text-xs">
                (E_max − E_min) / (E_max + E_min) × 100 % for each parameter
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Non-Uniformity (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.nonUniformity}
                  onChange={(e) => setForm({ ...form, nonUniformity: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">STI (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.sti}
                  onChange={(e) => setForm({ ...form, sti: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">LTI (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.lti}
                  onChange={(e) => setForm({ ...form, lti: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={classify}>
            Classify Simulator
          </Button>
        </div>

        {/* Results panel */}
        {result ? (
          <div className="space-y-4">
            <Card className={`border-2 ${GRADE_BORDER[result.overallGrade]}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Overall Classification</CardTitle>
                  <ClassificationBadge grade={result.overallGrade} size="lg" />
                </div>
                {(form.simulatorName || form.serialNo) && (
                  <CardDescription>
                    {form.simulatorName}
                    {form.serialNo ? ` · ${form.serialNo}` : ""}
                    {form.testDate ? ` · ${form.testDate}` : ""}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Spectral</p>
                    <ClassificationBadge grade={result.spectralGrade} size="md" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Uniformity</p>
                    <ClassificationBadge grade={result.uniformityGrade} size="md" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Temporal</p>
                    <ClassificationBadge grade={result.temporalGrade} size="md" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Spectral Band Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Band (nm)</TableHead>
                      <TableHead className="text-xs text-right">Ratio</TableHead>
                      <TableHead className="text-xs text-center">Grade</TableHead>
                      <TableHead className="text-xs text-center">In Spec</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.bandResults.map((b) => (
                      <TableRow key={b.band}>
                        <TableCell className="text-xs font-mono">{b.band}</TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          {b.ratio.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center">
                          <ClassificationBadge grade={b.grade} size="sm" />
                        </TableCell>
                        <TableCell className="text-center">
                          {b.grade !== "Fail" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 inline-block" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Uniformity &amp; Stability Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      label: "Non-Uniformity",
                      value: `${result.nu.toFixed(2)}%`,
                      grade: gradeFromNonUniformity(result.nu),
                      limit: "≤ 1% for A+, ≤ 2% for A",
                    },
                    {
                      label: "STI (Short-Term)",
                      value: `${result.sti.toFixed(2)}%`,
                      grade: gradeFromSTI(result.sti),
                      limit: "≤ 0.5% for A+, ≤ 2% for A",
                    },
                    {
                      label: "LTI (Long-Term)",
                      value: `${result.lti.toFixed(2)}%`,
                      grade: gradeFromLTI(result.lti),
                      limit: "≤ 1% for A+, ≤ 2% for A",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{row.label}</p>
                        <p className="text-xs text-muted-foreground">{row.limit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono">{row.value}</span>
                        <ClassificationBadge grade={row.grade} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 rounded-lg border-2 border-dashed text-muted-foreground">
            <div className="text-center space-y-2">
              <p className="font-medium">Enter parameters and click Classify</p>
              <p className="text-sm">IEC 60904-9 Ed.3 results will appear here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
