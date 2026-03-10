// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DocumentHeader from "@/components/iec60904/DocumentHeader";
import SpectralResponseChart from "@/components/iec60904/SpectralResponseChart";
import { generateDocNumber, analyzeSpectralResponsivity, AM15G_SPECTRUM, type SpectralResponsivityResult } from "@/lib/iec60904";

const DEFAULT_SR_DATA = `350,0.02
400,0.15
450,0.24
500,0.32
550,0.40
600,0.46
650,0.50
700,0.54
750,0.56
800,0.57
850,0.56
900,0.52
950,0.44
1000,0.32
1050,0.18
1100,0.06
1150,0.01`;

export default function Part8Page() {
  const [docNumber] = useState(() => generateDocNumber(8, "protocol"));
  const [srText, setSrText] = useState(DEFAULT_SR_DATA);
  const [result, setResult] = useState<SpectralResponsivityResult | null>(null);

  function handleAnalyze() {
    const lines = srText.trim().split("\n");
    const data = lines.map((l) => {
      const p = l.split(",").map((s) => parseFloat(s.trim()));
      return p.length >= 2 ? { wavelength: p[0], response: p[1] } : null;
    }).filter(Boolean) as { wavelength: number; response: number }[];
    if (data.length > 1) {
      setResult(analyzeSpectralResponsivity(data));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-8: Spectral Responsivity</h1>
        <p className="text-muted-foreground mt-1">Measurement of spectral responsivity of a PV device</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={8} title="Spectral Responsivity Protocol" standard="IEC 60904-8 Ed.3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Differential Spectral Responsivity (DSR) Method</h3>
                <p className="text-sm text-muted-foreground">
                  Spectral responsivity is measured by illuminating the device with bias light plus chopped monochromatic
                  light. The differential response at each wavelength gives the spectral responsivity in A/W.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Procedure</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Set up monochromator with calibrated detector</li>
                  <li>Apply bias light to DUT (equivalent to ~1 sun)</li>
                  <li>Chop monochromatic beam at known frequency</li>
                  <li>Scan wavelength range (300-1200 nm for c-Si)</li>
                  <li>Measure AC component of DUT current at each wavelength</li>
                  <li>Calculate SR(λ) = I_dut(λ) / E_mono(λ) [A/W]</li>
                  <li>Validate with integrated Jsc vs measured Isc</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Required Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {["Monochromator", "Bias Light Source", "Chopper", "Lock-in Amplifier", "Calibrated Detector", "DUT Fixture"].map((eq) => (
                    <Badge key={eq} variant="outline">{eq}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Spectral Responsivity Data</CardTitle>
              <CardDescription>Enter wavelength (nm) and spectral responsivity (A/W) as CSV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-48 font-mono text-sm border rounded-md p-3 bg-background"
                value={srText}
                onChange={(e) => setSrText(e.target.value)}
              />
              <Button onClick={handleAnalyze}>Analyze Spectral Responsivity</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Spectral Responsivity Analysis</CardTitle>
              <CardDescription>Wavelength-dependent response curve with AM1.5G overlay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result ? (
                <>
                  <SpectralResponseChart
                    data={result.data}
                    referenceData={AM15G_SPECTRUM}
                    height={400}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Peak Wavelength</div>
                      <div className="font-bold font-mono">{result.peakWavelength} nm</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Peak SR</div>
                      <div className="font-bold font-mono">{result.peakResponse.toFixed(3)} A/W</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Est. Bandgap</div>
                      <div className="font-bold font-mono">{result.bandgap.toFixed(2)} eV</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Integrated Jsc</div>
                      <div className="font-bold font-mono">{result.integratedCurrent.toFixed(2)} A/m²</div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">Enter SR data and click analyze.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={8} title="Spectral Responsivity Report" standard="IEC 60904-8 Ed.3" />
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wavelength (nm)</TableHead>
                        <TableHead>SR (A/W)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.data.map((d) => (
                        <TableRow key={d.wavelength}>
                          <TableCell className="font-mono">{d.wavelength}</TableCell>
                          <TableCell className="font-mono">{d.response.toFixed(4)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Table>
                    <TableBody>
                      <TableRow><TableCell>Peak Response</TableCell><TableCell className="font-mono">{result.peakResponse.toFixed(4)} A/W at {result.peakWavelength} nm</TableCell></TableRow>
                      <TableRow><TableCell>Estimated Bandgap</TableCell><TableCell className="font-mono">{result.bandgap.toFixed(3)} eV</TableCell></TableRow>
                      <TableRow><TableCell>Integrated Jsc (AM1.5G)</TableCell><TableCell className="font-mono">{result.integratedCurrent.toFixed(2)} A/m²</TableCell></TableRow>
                    </TableBody>
                  </Table>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60904-8 Ed.3 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Analyze data first to view results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
