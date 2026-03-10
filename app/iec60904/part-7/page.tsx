"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DocumentHeader from "@/components/iec60904/DocumentHeader";
import SpectralResponseChart from "@/components/iec60904/SpectralResponseChart";
import { generateDocNumber, calculateSpectralMismatch, AM15G_SPECTRUM, type SpectralMismatchResult } from "@/lib/iec60904";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";

const DEFAULT_DUT_SR = `400,0.15
450,0.22
500,0.30
550,0.38
600,0.44
650,0.48
700,0.52
750,0.55
800,0.56
850,0.55
900,0.50
950,0.40
1000,0.28
1050,0.15
1100,0.05`;

const DEFAULT_REF_SR = `400,0.18
450,0.25
500,0.32
550,0.39
600,0.44
650,0.47
700,0.50
750,0.52
800,0.53
850,0.50
900,0.44
950,0.35
1000,0.22
1050,0.10
1100,0.03`;

const DEFAULT_MEAS_SPECTRUM = `400,1.05
450,1.70
500,1.80
550,1.68
600,1.60
650,1.50
700,1.28
750,1.24
800,1.08
850,0.95
900,0.82
950,0.15
1000,0.70
1050,0.60
1100,0.48`;

function parseCSV(text: string): { wavelength: number; value: number }[] {
  return text.trim().split("\n").map((l) => {
    const p = l.split(",").map((s) => parseFloat(s.trim()));
    return p.length >= 2 ? { wavelength: p[0], value: p[1] } : null;
  }).filter(Boolean) as { wavelength: number; value: number }[];
}

export default function Part7Page() {
  const [docNumber] = useState(() => generateDocNumber(7, "protocol"));
  const [dutSRText, setDutSRText] = useState(DEFAULT_DUT_SR);
  const [refSRText, setRefSRText] = useState(DEFAULT_REF_SR);
  const [measSpectrumText, setMeasSpectrumText] = useState(DEFAULT_MEAS_SPECTRUM);
  const [result, setResult] = useState<SpectralMismatchResult | null>(null);

  function handleCalculate() {
    const dutSR = parseCSV(dutSRText).map((d) => ({ wavelength: d.wavelength, response: d.value }));
    const refSR = parseCSV(refSRText).map((d) => ({ wavelength: d.wavelength, response: d.value }));
    const measSpectrum = parseCSV(measSpectrumText).map((d) => ({ wavelength: d.wavelength, irradiance: d.value }));
    const refSpectrum = AM15G_SPECTRUM;

    if (dutSR.length > 1 && refSR.length > 1 && measSpectrum.length > 1) {
      setResult(calculateSpectralMismatch(refSpectrum, measSpectrum, dutSR, refSR));
    }
  }

  const dutSRData = parseCSV(dutSRText);
  const refSRData = parseCSV(refSRText);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-7: Spectral Mismatch</h1>
        <p className="text-muted-foreground mt-1">Computation of spectral mismatch correction factor M</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={7} title="Spectral Mismatch Protocol" standard="IEC 60904-7 Ed.4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold text-sm">Spectral Mismatch Factor Formula</h3>
                <p className="font-mono text-sm">M = [∫E_ref·SR_dut dλ × ∫E_meas·SR_ref dλ] / [∫E_meas·SR_dut dλ × ∫E_ref·SR_ref dλ]</p>
                <p className="text-xs text-muted-foreground mt-2">
                  E_ref = AM1.5G reference spectrum | E_meas = measured simulator spectrum<br />
                  SR_dut = spectral responsivity of DUT | SR_ref = spectral responsivity of reference cell
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Required Data</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Reference spectrum (AM1.5G per IEC 60904-3)</li>
                  <li>Measured simulator spectral irradiance</li>
                  <li>Spectral responsivity of the DUT (device under test)</li>
                  <li>Spectral responsivity of the reference cell</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Application</h3>
                <p className="text-sm">The corrected short-circuit current is: <span className="font-mono">Isc_corrected = Isc_measured × M</span></p>
                <p className="text-sm text-muted-foreground">
                  If M is close to 1.000, the spectral mismatch is negligible. Values of M between 0.98 and 1.02 are typical for well-matched reference cells.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Spectral Data Input</CardTitle>
              <CardDescription>Enter spectral responsivity and measured spectrum data (wavelength nm, value)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>DUT Spectral Responsivity (nm, A/W)</Label>
                  <textarea className="w-full h-40 font-mono text-sm border rounded-md p-3 bg-background mt-1" value={dutSRText} onChange={(e) => setDutSRText(e.target.value)} />
                </div>
                <div>
                  <Label>Reference Cell SR (nm, A/W)</Label>
                  <textarea className="w-full h-40 font-mono text-sm border rounded-md p-3 bg-background mt-1" value={refSRText} onChange={(e) => setRefSRText(e.target.value)} />
                </div>
                <div>
                  <Label>Measured Spectrum (nm, W/m²/nm)</Label>
                  <textarea className="w-full h-40 font-mono text-sm border rounded-md p-3 bg-background mt-1" value={measSpectrumText} onChange={(e) => setMeasSpectrumText(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleCalculate}>Calculate Mismatch Factor M</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Spectral Comparison</CardTitle>
              <CardDescription>Reference vs measured spectrum and DUT vs reference SR comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">DUT vs Reference Spectral Responsivity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="wavelength" type="number" domain={[350, 1150]} tick={{ fontSize: 11 }}
                      label={{ value: "Wavelength (nm)", position: "insideBottom", offset: -5 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: "SR (A/W)", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Line data={dutSRData.map((d) => ({ wavelength: d.wavelength, response: d.value }))}
                      type="monotone" dataKey="response" stroke="#2563eb" name="DUT SR" dot={false} strokeWidth={2} />
                    <Line data={refSRData.map((d) => ({ wavelength: d.wavelength, response: d.value }))}
                      type="monotone" dataKey="response" stroke="#dc2626" name="Ref Cell SR" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {result && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted col-span-2 md:col-span-1">
                    <div className="text-xs text-muted-foreground">Mismatch Factor M</div>
                    <div className="font-bold font-mono text-xl">{result.M.toFixed(4)}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">∫Eref·SRdut</div>
                    <div className="font-bold font-mono text-sm">{result.numerator1.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">∫Emeas·SRref</div>
                    <div className="font-bold font-mono text-sm">{result.numerator2.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">∫Emeas·SRdut</div>
                    <div className="font-bold font-mono text-sm">{result.denominator1.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground">∫Eref·SRref</div>
                    <div className="font-bold font-mono text-sm">{result.denominator2.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={7} title="Spectral Mismatch Report" standard="IEC 60904-7 Ed.4" />
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Spectral Mismatch Factor (M)</TableCell><TableCell className="font-mono font-bold">{result.M.toFixed(4)}</TableCell></TableRow>
                      <TableRow><TableCell>∫E_ref · SR_dut dλ (Numerator 1)</TableCell><TableCell className="font-mono">{result.numerator1.toFixed(4)}</TableCell></TableRow>
                      <TableRow><TableCell>∫E_meas · SR_ref dλ (Numerator 2)</TableCell><TableCell className="font-mono">{result.numerator2.toFixed(4)}</TableCell></TableRow>
                      <TableRow><TableCell>∫E_meas · SR_dut dλ (Denominator 1)</TableCell><TableCell className="font-mono">{result.denominator1.toFixed(4)}</TableCell></TableRow>
                      <TableRow><TableCell>∫E_ref · SR_ref dλ (Denominator 2)</TableCell><TableCell className="font-mono">{result.denominator2.toFixed(4)}</TableCell></TableRow>
                      <TableRow><TableCell>Correction to Isc</TableCell><TableCell className="font-mono">{((result.M - 1) * 100).toFixed(2)}%</TableCell></TableRow>
                    </TableBody>
                  </Table>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60904-7 Ed.4 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Calculate mismatch factor first to view results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
