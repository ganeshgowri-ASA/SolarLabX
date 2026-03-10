"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DocumentHeader from "@/components/iec60904/DocumentHeader";
import SpectralResponseChart from "@/components/iec60904/SpectralResponseChart";
import { generateDocNumber, AM15G_SPECTRUM, PART3_CHECKLIST } from "@/lib/iec60904";
import { CheckCircle2, Circle } from "lucide-react";

export default function Part3Page() {
  const [docNumber] = useState(() => generateDocNumber(3, "protocol"));
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  function toggleCheck(id: string) {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = PART3_CHECKLIST.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-3: Measurement Principles</h1>
        <p className="text-muted-foreground mt-1">Measurement principles for terrestrial PV solar devices with AM1.5G reference spectrum</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={3} title="Measurement Principles Protocol" standard="IEC 60904-3 Ed.2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">AM1.5G Reference Spectrum</h3>
                <p className="text-sm text-muted-foreground">
                  The AM1.5G (Global) reference solar spectral irradiance distribution is defined for Standard Test Conditions.
                  Total integrated irradiance: 1000 W/m² over the range 280-4000 nm.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Key Principles</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Measurements shall be performed under the AM1.5G spectrum or corrected using spectral mismatch factor</li>
                  <li>Total irradiance in the measurement plane shall be 1000 W/m² ± 2%</li>
                  <li>Device temperature shall be measured and corrections applied to 25°C</li>
                  <li>Reference device spectral response shall match DUT as closely as possible</li>
                  <li>Environmental conditions shall be recorded during measurement</li>
                </ul>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Condition</TableHead>
                    <TableHead>STC Value</TableHead>
                    <TableHead>Tolerance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Irradiance</TableCell><TableCell>1000 W/m²</TableCell><TableCell>± 2%</TableCell></TableRow>
                  <TableRow><TableCell>Spectrum</TableCell><TableCell>AM1.5G (IEC 60904-3)</TableCell><TableCell>Class A+ or better</TableCell></TableRow>
                  <TableRow><TableCell>Cell Temperature</TableCell><TableCell>25 °C</TableCell><TableCell>± 2 °C</TableCell></TableRow>
                  <TableRow><TableCell>Angle of Incidence</TableCell><TableCell>Normal (0°)</TableCell><TableCell>± 2°</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <CardDescription>Verify measurement procedure compliance with IEC 60904-3 ({completedCount}/{totalCount} completed)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["STC", "Reference", "Correction", "Measurement"].map((category) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm mb-2">{category}</h3>
                    <div className="space-y-2">
                      {PART3_CHECKLIST.filter((c) => c.category === category).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className="flex items-center gap-3 w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          {checklist[item.id] ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>AM1.5G Reference Spectrum</CardTitle>
              <CardDescription>IEC 60904-3 standard reference solar spectral irradiance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SpectralResponseChart
                data={AM15G_SPECTRUM.map((d) => ({ wavelength: d.wavelength, response: d.irradiance }))}
                height={400}
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wavelength (nm)</TableHead>
                    <TableHead>Irradiance (W/m²/nm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AM15G_SPECTRUM.map((d) => (
                    <TableRow key={d.wavelength}>
                      <TableCell className="font-mono">{d.wavelength}</TableCell>
                      <TableCell className="font-mono">{d.irradiance.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={3} title="Measurement Compliance Report" standard="IEC 60904-3 Ed.2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant={completedCount === totalCount ? "default" : "secondary"} className="text-lg px-4 py-1">
                    {completedCount}/{totalCount}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {completedCount === totalCount ? "All requirements met" : "Incomplete - review checklist"}
                  </span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PART3_CHECKLIST.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">{item.label}</TableCell>
                        <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                        <TableCell>
                          {checklist[item.id] ? (
                            <Badge className="bg-emerald-500">Verified</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="text-xs text-muted-foreground border-t pt-3">
                  <p>Document: {docNumber} | Standard: IEC 60904-3 Ed.2 | ISO/IEC 17025 compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
