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
import StatusBadge from "@/components/iec60904/StatusBadge";
import CalibrationChainViz from "@/components/iec60904/CalibrationChainViz";
import { generateDocNumber, calculateEnNumber, evaluateComparison, type CalibrationComparison } from "@/lib/iec60904";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const SAMPLE_LABS = [
  { name: "Lab A (NREL)", id: "LAB-A", value: 134.2, uncertainty: 0.8 },
  { name: "Lab B (PTB)", id: "LAB-B", value: 134.5, uncertainty: 0.9 },
  { name: "Lab C (AIST)", id: "LAB-C", value: 133.8, uncertainty: 1.0 },
  { name: "Lab D (In-house)", id: "LAB-D", value: 135.1, uncertainty: 1.5 },
  { name: "Lab E (Partner)", id: "LAB-E", value: 133.2, uncertainty: 1.2 },
];

export default function Part4Page() {
  const [docNumber] = useState(() => generateDocNumber(4, "protocol"));
  const [refValue, setRefValue] = useState("134.3");
  const [refUncertainty, setRefUncertainty] = useState("0.5");
  const [labs, setLabs] = useState(SAMPLE_LABS);
  const [results, setResults] = useState<CalibrationComparison[] | null>(null);
  const [newLabName, setNewLabName] = useState("");
  const [newLabValue, setNewLabValue] = useState("");
  const [newLabUnc, setNewLabUnc] = useState("");

  function handleEvaluate() {
    const rv = parseFloat(refValue) || 134.3;
    const ru = parseFloat(refUncertainty) || 0.5;
    setResults(evaluateComparison(labs, rv, ru));
  }

  function handleAddLab() {
    if (!newLabName || !newLabValue) return;
    setLabs([...labs, { name: newLabName, id: `LAB-${labs.length + 1}`, value: parseFloat(newLabValue) || 0, uncertainty: parseFloat(newLabUnc) || 1.0 }]);
    setNewLabName(""); setNewLabValue(""); setNewLabUnc("");
  }

  const traceabilityChain = [
    "SI Units (W, m², K)",
    "World Photovoltaic Scale (WPVS)",
    "Primary Calibration Lab (NREL/PTB/AIST)",
    "Secondary Calibration Lab",
    "Working Reference Cell",
    "Test Laboratory Measurement",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-4: Calibration Traceability</h1>
        <p className="text-muted-foreground mt-1">Procedures for establishing calibration traceability and inter-laboratory comparisons</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={4} title="Calibration Traceability Protocol" standard="IEC 60904-4 Ed.1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Calibration Traceability Chain</h3>
                <CalibrationChainViz chain={traceabilityChain} />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Inter-Laboratory Comparison Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>En number (normalized error) shall be calculated for each participating lab</li>
                  <li>|En| ≤ 1.0 indicates satisfactory performance</li>
                  <li>|En| &gt; 1.0 requires investigation and corrective action</li>
                  <li>At least 3 laboratories should participate for meaningful comparison</li>
                  <li>Same reference device shall circulate between laboratories</li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm mb-2">En Number Formula</h3>
                <p className="font-mono text-sm">En = |x_lab - x_ref| / √(U_lab² + U_ref²)</p>
                <p className="text-xs text-muted-foreground mt-1">where U_lab and U_ref are expanded uncertainties (k=2)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Inter-Laboratory Comparison Data</CardTitle>
              <CardDescription>Enter reference value and participating lab results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Reference Value (mA)</Label><Input value={refValue} onChange={(e) => setRefValue(e.target.value)} className="font-mono" /></div>
                <div><Label>Reference Uncertainty (mA, k=2)</Label><Input value={refUncertainty} onChange={(e) => setRefUncertainty(e.target.value)} className="font-mono" /></div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lab</TableHead>
                    <TableHead>Measured Value (mA)</TableHead>
                    <TableHead>Uncertainty (mA, k=2)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labs.map((lab, i) => (
                    <TableRow key={i}>
                      <TableCell>{lab.name}</TableCell>
                      <TableCell className="font-mono">{lab.value}</TableCell>
                      <TableCell className="font-mono">{lab.uncertainty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div><Label>Lab Name</Label><Input value={newLabName} onChange={(e) => setNewLabName(e.target.value)} placeholder="Lab F" /></div>
                <div><Label>Value (mA)</Label><Input value={newLabValue} onChange={(e) => setNewLabValue(e.target.value)} placeholder="134.0" className="font-mono" /></div>
                <div><Label>Uncertainty (mA)</Label><Input value={newLabUnc} onChange={(e) => setNewLabUnc(e.target.value)} placeholder="1.0" className="font-mono" /></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAddLab}>Add Lab</Button>
                <Button onClick={handleEvaluate}>Evaluate Comparison</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>En Number Analysis</CardTitle>
              <CardDescription>Normalized error evaluation for inter-laboratory comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {results ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results.map((r) => ({ lab: r.labName, en: r.enNumber }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="lab" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, "auto"]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => v.toFixed(3)} />
                      <ReferenceLine y={1} stroke="#ef4444" strokeDasharray="5 5" label="En = 1.0" />
                      <Bar dataKey="en" name="|En|">
                        {results.map((r, i) => (
                          <Cell key={i} fill={r.pass ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lab</TableHead>
                        <TableHead>Measured</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>|En|</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((r) => (
                        <TableRow key={r.labId}>
                          <TableCell>{r.labName}</TableCell>
                          <TableCell className="font-mono">{r.measuredValue} ± {r.uncertainty} mA</TableCell>
                          <TableCell className="font-mono">{r.referenceValue} mA</TableCell>
                          <TableCell className="font-mono">{r.enNumber.toFixed(3)}</TableCell>
                          <TableCell><StatusBadge status={r.pass ? "pass" : "fail"} size="sm" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">Enter data and click &quot;Evaluate Comparison&quot; to see analysis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={4} title="Inter-Laboratory Comparison Report" standard="IEC 60904-4 Ed.1" />
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="font-bold text-2xl text-primary">{results.length}</div>
                      <div className="text-xs text-muted-foreground">Labs Compared</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="font-bold text-2xl text-emerald-500">{results.filter((r) => r.pass).length}</div>
                      <div className="text-xs text-muted-foreground">Satisfactory (|En| ≤ 1)</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="font-bold text-2xl text-red-500">{results.filter((r) => !r.pass).length}</div>
                      <div className="text-xs text-muted-foreground">Unsatisfactory</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60904-4 Ed.1 | ISO/IEC 17025 compliant</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Run analysis first to view results.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
