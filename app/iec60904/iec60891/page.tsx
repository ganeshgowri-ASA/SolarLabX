"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DocumentHeader from "@/components/iec60904/DocumentHeader";
import IVCurveChart from "@/components/iec60904/IVCurveChart";
import { generateDocNumber, type IVDataPoint } from "@/lib/iec60904";
import {
  translateProcedure1, translateProcedure2, translateProcedure3,
  determineRsFromSlope, determineRsFromTwoCurves,
  type TranslationResult, type RsDeterminationResult,
} from "@/lib/iec60891";

const SAMPLE_IV = `0.000,9.450
4.000,9.445
8.000,9.430
12.00,9.400
16.00,9.350
20.00,9.260
24.00,9.100
28.00,8.810
30.00,8.580
32.00,8.150
34.00,7.300
36.00,5.300
37.50,2.500
38.50,0.000`;

const SAMPLE_IV_LOW = `0.000,5.680
4.000,5.675
8.000,5.665
12.00,5.645
16.00,5.610
20.00,5.560
24.00,5.470
28.00,5.300
30.00,5.180
32.00,4.950
34.00,4.450
35.50,3.200
36.50,1.500
37.00,0.000`;

function parseIV(text: string): IVDataPoint[] {
  return text.trim().split("\n").map((l) => {
    const p = l.split(",").map((s) => parseFloat(s.trim()));
    return p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]) ? { voltage: p[0], current: p[1] } : null;
  }).filter(Boolean) as IVDataPoint[];
}

export default function IEC60891Page() {
  const [docNumber] = useState(() => generateDocNumber(1, "analysis"));

  // Common inputs
  const [ivText, setIvText] = useState(SAMPLE_IV);
  const [measG, setMeasG] = useState("800");
  const [measT, setMeasT] = useState("35");
  const [targetG, setTargetG] = useState("1000");
  const [targetT, setTargetT] = useState("25");

  // Procedure 1 params
  const [p1Alpha, setP1Alpha] = useState("0.05");
  const [p1Beta, setP1Beta] = useState("-0.31");
  const [p1Kappa, setP1Kappa] = useState("0.004");
  const [p1AlphaRel, setP1AlphaRel] = useState(true);
  const [p1BetaRel, setP1BetaRel] = useState(true);

  // Procedure 2 params
  const [p2RefIsc1, setP2RefIsc1] = useState("7.560");
  const [p2RefIsc2, setP2RefIsc2] = useState("9.450");
  const [p2Beta, setP2Beta] = useState("-0.118");
  const [p2Rs, setP2Rs] = useState("0.45");

  // Procedure 3
  const [ivTextLow, setIvTextLow] = useState(SAMPLE_IV_LOW);
  const [p3GLow, setP3GLow] = useState("600");
  const [p3GHigh, setP3GHigh] = useState("800");

  // Results
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [rsResult, setRsResult] = useState<RsDeterminationResult | null>(null);

  function handleProcedure1() {
    const ivData = parseIV(ivText);
    if (ivData.length < 2) return;
    setTranslationResult(translateProcedure1(
      { ivData, measuredIrradiance: parseFloat(measG), measuredTemperature: parseFloat(measT), targetIrradiance: parseFloat(targetG), targetTemperature: parseFloat(targetT) },
      { alpha: parseFloat(p1Alpha), beta: parseFloat(p1Beta), kappa: parseFloat(p1Kappa), alphaIsRelative: p1AlphaRel, betaIsRelative: p1BetaRel }
    ));
  }

  function handleProcedure2() {
    const ivData = parseIV(ivText);
    if (ivData.length < 2) return;
    setTranslationResult(translateProcedure2(
      { ivData, measuredIrradiance: parseFloat(measG), measuredTemperature: parseFloat(measT), targetIrradiance: parseFloat(targetG), targetTemperature: parseFloat(targetT) },
      { refIsc1: parseFloat(p2RefIsc1), refIsc2: parseFloat(p2RefIsc2), beta: parseFloat(p2Beta), rs: parseFloat(p2Rs) }
    ));
  }

  function handleProcedure3() {
    const ivDataHigh = parseIV(ivText);
    const ivDataLow = parseIV(ivTextLow);
    if (ivDataHigh.length < 2 || ivDataLow.length < 2) return;
    setTranslationResult(translateProcedure3({
      ivDataLow, ivDataHigh,
      gLow: parseFloat(p3GLow), gHigh: parseFloat(p3GHigh),
      tLow: parseFloat(measT), tHigh: parseFloat(measT),
      targetIrradiance: parseFloat(targetG), targetTemperature: parseFloat(targetT),
    }));
  }

  function handleDetermineRs() {
    const ivData = parseIV(ivText);
    if (ivData.length < 2) return;
    setRsResult(determineRsFromSlope(ivData));
  }

  function handleDetermineRsTwoCurves() {
    const iv1 = parseIV(ivTextLow);
    const iv2 = parseIV(ivText);
    if (iv1.length < 2 || iv2.length < 2) return;
    setRsResult(determineRsFromTwoCurves(iv1, iv2, parseFloat(p3GLow), parseFloat(p3GHigh)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60891: I-V Curve Translation</h1>
        <p className="text-muted-foreground mt-1">
          Procedures for temperature and irradiance corrections of measured I-V characteristics
        </p>
      </div>

      <Tabs defaultValue="protocol">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="data">Data Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="protocol">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={0} title="I-V Translation Protocol" standard="IEC 60891 Ed.2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold">Three Translation Procedures</h3>

                <div className="border rounded-lg p-4 space-y-2">
                  <Badge>Procedure 1</Badge>
                  <p className="text-sm font-semibold">Using Temperature Coefficients</p>
                  <p className="text-xs text-muted-foreground">
                    Translates I-V curve using known temperature coefficients (α for Isc, β for Voc) and curve correction factor κ.
                    Best when accurate temperature coefficients are available from manufacturer data.
                  </p>
                  <p className="font-mono text-xs">I₂ = I₁ + Isc₁(G₂/G₁ - 1) + α(T₂-T₁)</p>
                  <p className="font-mono text-xs">V₂ = V₁ - κ(I₂-I₁) + β(T₂-T₁)</p>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <Badge>Procedure 2</Badge>
                  <p className="text-sm font-semibold">Using Reference Device</p>
                  <p className="text-xs text-muted-foreground">
                    Uses a matched reference device measured simultaneously at both conditions.
                    The Isc ratio from the reference cell corrects the DUT I-V curve.
                  </p>
                  <p className="font-mono text-xs">I₂ = I₁ × (Isc_ref₂ / Isc_ref₁)</p>
                  <p className="font-mono text-xs">V₂ = V₁ + β(T₂-T₁) - Rs(I₂-I₁)</p>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <Badge>Procedure 3</Badge>
                  <p className="text-sm font-semibold">Interpolation</p>
                  <p className="text-xs text-muted-foreground">
                    Interpolates between two I-V curves measured at different conditions.
                    No temperature coefficients needed - purely data-driven.
                  </p>
                  <p className="font-mono text-xs">I(G_target) = I(G_low) + f × [I(G_high) - I(G_low)]</p>
                  <p className="font-mono text-xs">f = (G_target - G_low) / (G_high - G_low)</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Rs Determination Methods</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Slope method:</strong> From dV/dI near Voc on the I-V curve</li>
                  <li><strong>Two-curve method:</strong> From voltage shift between curves at different irradiances</li>
                  <li><strong>Iterative fitting:</strong> Minimize translation error by optimizing Rs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>I-V Curve Translation Data</CardTitle>
              <CardDescription>Enter measured I-V data and translation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Measured G (W/m²)</Label><Input value={measG} onChange={(e) => setMeasG(e.target.value)} className="font-mono" /></div>
                <div><Label>Measured T (°C)</Label><Input value={measT} onChange={(e) => setMeasT(e.target.value)} className="font-mono" /></div>
                <div><Label>Target G (W/m²)</Label><Input value={targetG} onChange={(e) => setTargetG(e.target.value)} className="font-mono" /></div>
                <div><Label>Target T (°C)</Label><Input value={targetT} onChange={(e) => setTargetT(e.target.value)} className="font-mono" /></div>
              </div>

              <div>
                <Label>I-V Curve Data (V, A CSV)</Label>
                <textarea className="w-full h-32 font-mono text-sm border rounded-md p-3 bg-background mt-1" value={ivText} onChange={(e) => setIvText(e.target.value)} />
              </div>

              <Tabs defaultValue="proc1">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="proc1">Procedure 1</TabsTrigger>
                  <TabsTrigger value="proc2">Procedure 2</TabsTrigger>
                  <TabsTrigger value="proc3">Procedure 3</TabsTrigger>
                  <TabsTrigger value="rs">Rs Methods</TabsTrigger>
                </TabsList>

                <TabsContent value="proc1" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div><Label>α (Isc coeff, {p1AlphaRel ? '%' : 'A'}/°C)</Label><Input value={p1Alpha} onChange={(e) => setP1Alpha(e.target.value)} className="font-mono" /></div>
                    <div><Label>β (Voc coeff, {p1BetaRel ? '%' : 'V'}/°C)</Label><Input value={p1Beta} onChange={(e) => setP1Beta(e.target.value)} className="font-mono" /></div>
                    <div><Label>κ (curve factor, Ω)</Label><Input value={p1Kappa} onChange={(e) => setP1Kappa(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={p1AlphaRel} onChange={(e) => setP1AlphaRel(e.target.checked)} /> α is relative (%/°C)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={p1BetaRel} onChange={(e) => setP1BetaRel(e.target.checked)} /> β is relative (%/°C)
                    </label>
                  </div>
                  <Button onClick={handleProcedure1}>Translate (Procedure 1)</Button>
                </TabsContent>

                <TabsContent value="proc2" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><Label>Ref Isc at G₁ (A)</Label><Input value={p2RefIsc1} onChange={(e) => setP2RefIsc1(e.target.value)} className="font-mono" /></div>
                    <div><Label>Ref Isc at G₂ (A)</Label><Input value={p2RefIsc2} onChange={(e) => setP2RefIsc2(e.target.value)} className="font-mono" /></div>
                    <div><Label>β_Voc (V/°C)</Label><Input value={p2Beta} onChange={(e) => setP2Beta(e.target.value)} className="font-mono" /></div>
                    <div><Label>Rs (Ω)</Label><Input value={p2Rs} onChange={(e) => setP2Rs(e.target.value)} className="font-mono" /></div>
                  </div>
                  <Button onClick={handleProcedure2}>Translate (Procedure 2)</Button>
                </TabsContent>

                <TabsContent value="proc3" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Lower G (W/m²)</Label><Input value={p3GLow} onChange={(e) => setP3GLow(e.target.value)} className="font-mono" /></div>
                    <div><Label>Upper G (W/m²)</Label><Input value={p3GHigh} onChange={(e) => setP3GHigh(e.target.value)} className="font-mono" /></div>
                  </div>
                  <div>
                    <Label>Lower Irradiance I-V Curve (V, A CSV)</Label>
                    <textarea className="w-full h-32 font-mono text-sm border rounded-md p-3 bg-background mt-1" value={ivTextLow} onChange={(e) => setIvTextLow(e.target.value)} />
                  </div>
                  <Button onClick={handleProcedure3}>Translate (Procedure 3)</Button>
                </TabsContent>

                <TabsContent value="rs" className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Button onClick={handleDetermineRs}>Rs from Slope (Single Curve)</Button>
                    <Button variant="outline" onClick={handleDetermineRsTwoCurves}>Rs from Two Curves</Button>
                  </div>
                  {rsResult && (
                    <Card>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="text-center p-3 rounded-lg bg-muted">
                            <div className="text-xs text-muted-foreground">Rs</div>
                            <div className="font-bold font-mono text-xl">{rsResult.rs.toFixed(4)} Ω</div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{rsResult.method}</p>
                            <p className="text-xs text-muted-foreground">{rsResult.details}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Translation Visualization</CardTitle>
              <CardDescription>Original vs translated I-V curve comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {translationResult ? (
                <>
                  <IVCurveChart
                    data={translationResult.originalData}
                    translatedData={translationResult.translatedData}
                    showPower
                    height={400}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Procedure</div>
                      <div className="font-bold text-sm">{translationResult.procedure.split(" ")[0]} {translationResult.procedure.split(" ")[1]}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">ΔT</div>
                      <div className="font-bold font-mono">{translationResult.deltaT.toFixed(1)} °C</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">ΔG</div>
                      <div className="font-bold font-mono">{translationResult.deltaG.toFixed(0)} W/m²</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Correction</div>
                      <div className="font-bold text-xs">{translationResult.correctionApplied}</div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Point</TableHead>
                        <TableHead>V_orig (V)</TableHead>
                        <TableHead>I_orig (A)</TableHead>
                        <TableHead>V_trans (V)</TableHead>
                        <TableHead>I_trans (A)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {translationResult.originalData.slice(0, 15).map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="font-mono">{p.voltage.toFixed(3)}</TableCell>
                          <TableCell className="font-mono">{p.current.toFixed(4)}</TableCell>
                          <TableCell className="font-mono">{translationResult.translatedData[i]?.voltage.toFixed(3)}</TableCell>
                          <TableCell className="font-mono">{translationResult.translatedData[i]?.current.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">Select a procedure and click translate to see results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={0} title="I-V Translation Report" standard="IEC 60891 Ed.2" />
            </CardHeader>
            <CardContent>
              {translationResult ? (
                <div className="space-y-4">
                  <Table>
                    <TableBody>
                      <TableRow><TableCell>Procedure</TableCell><TableCell className="font-mono">{translationResult.procedure}</TableCell></TableRow>
                      <TableRow><TableCell>Temperature Correction</TableCell><TableCell className="font-mono">{translationResult.deltaT.toFixed(1)} °C</TableCell></TableRow>
                      <TableRow><TableCell>Irradiance Correction</TableCell><TableCell className="font-mono">{translationResult.deltaG.toFixed(0)} W/m²</TableCell></TableRow>
                      <TableRow><TableCell>Parameters Used</TableCell><TableCell className="font-mono text-xs">{translationResult.correctionApplied}</TableCell></TableRow>
                      <TableRow><TableCell>Original Data Points</TableCell><TableCell className="font-mono">{translationResult.originalData.length}</TableCell></TableRow>
                      <TableRow><TableCell>Translated Data Points</TableCell><TableCell className="font-mono">{translationResult.translatedData.length}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                  {rsResult && (
                    <Table>
                      <TableBody>
                        <TableRow><TableCell>Rs Determination Method</TableCell><TableCell className="font-mono">{rsResult.method}</TableCell></TableRow>
                        <TableRow><TableCell>Rs Value</TableCell><TableCell className="font-mono">{rsResult.rs.toFixed(4)} Ω</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  )}
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60891 Ed.2 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Perform a translation first to view results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
