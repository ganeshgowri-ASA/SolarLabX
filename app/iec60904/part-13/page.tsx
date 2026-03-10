// @ts-nocheck
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
import { generateDocNumber, analyzeELResults, type ELDefect, type ELDefectType, type ELAnalysisResult } from "@/lib/iec60904";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const DEFECT_TYPES: { value: ELDefectType; label: string; color: string }[] = [
  { value: "crack", label: "Crack", color: "#ef4444" },
  { value: "inactive_area", label: "Inactive Area", color: "#f97316" },
  { value: "shunt", label: "Shunt", color: "#eab308" },
  { value: "finger_break", label: "Finger Break", color: "#84cc16" },
  { value: "potential_induced_degradation", label: "PID", color: "#8b5cf6" },
  { value: "other", label: "Other", color: "#6b7280" },
];

const SAMPLE_DEFECTS: ELDefect[] = [
  { id: "D1", type: "crack", severity: "major", location: { x: 120, y: 80, width: 30, height: 60 }, description: "Diagonal crack across cell", cellIndex: 5 },
  { id: "D2", type: "inactive_area", severity: "minor", location: { x: 200, y: 150, width: 40, height: 40 }, description: "Small inactive region", cellIndex: 12 },
  { id: "D3", type: "finger_break", severity: "minor", location: { x: 300, y: 60, width: 20, height: 10 }, description: "Broken grid finger", cellIndex: 22 },
  { id: "D4", type: "crack", severity: "minor", location: { x: 50, y: 200, width: 25, height: 45 }, description: "Micro-crack", cellIndex: 8 },
  { id: "D5", type: "shunt", severity: "major", location: { x: 350, y: 180, width: 15, height: 15 }, description: "Hot spot / shunt", cellIndex: 35 },
];

export default function Part13Page() {
  const [docNumber] = useState(() => generateDocNumber(13, "protocol"));
  const [defects, setDefects] = useState(SAMPLE_DEFECTS);
  const [totalCells, setTotalCells] = useState("60");
  const [result, setResult] = useState<ELAnalysisResult | null>(null);

  // New defect entry
  const [newType, setNewType] = useState<ELDefectType>("crack");
  const [newSeverity, setNewSeverity] = useState<"minor" | "major" | "critical">("minor");
  const [newDesc, setNewDesc] = useState("");
  const [newCell, setNewCell] = useState("");

  function handleAnalyze() {
    setResult(analyzeELResults(defects, parseInt(totalCells) || 60));
  }

  function handleAddDefect() {
    const newDefect: ELDefect = {
      id: `D${defects.length + 1}`,
      type: newType,
      severity: newSeverity,
      location: { x: Math.random() * 400, y: Math.random() * 300, width: 20, height: 20 },
      description: newDesc || `${newType} defect`,
      cellIndex: parseInt(newCell) || undefined,
    };
    setDefects([...defects, newDefect]);
    setNewDesc(""); setNewCell("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">IEC 60904-13: Electroluminescence</h1>
        <p className="text-muted-foreground mt-1">EL imaging of PV modules - defect detection and classification</p>
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
              <DocumentHeader docNumber={docNumber} partNumber={13} title="EL Imaging Protocol" standard="IEC 60904-13 Ed.1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Procedure</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Place module in dark room or use darkened enclosure</li>
                  <li>Forward-bias module at Isc (100%) or 10% of Isc</li>
                  <li>Capture EL image using cooled CCD/CMOS camera</li>
                  <li>Acquire at two current levels for contrast comparison</li>
                  <li>Process images: dark frame subtraction, flat-field correction</li>
                  <li>Classify defects by type and severity</li>
                  <li>Compare with initial/baseline images if available</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Defect Classification</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Defect Type</TableHead>
                      <TableHead>EL Appearance</TableHead>
                      <TableHead>Severity Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Crack</TableCell><TableCell>Dark line across cell</TableCell><TableCell>Power loss, potential hot spot</TableCell></TableRow>
                    <TableRow><TableCell>Inactive Area</TableCell><TableCell>Dark region within cell</TableCell><TableCell>Reduced current generation</TableCell></TableRow>
                    <TableRow><TableCell>Shunt</TableCell><TableCell>Bright spot</TableCell><TableCell>Local heating, efficiency loss</TableCell></TableRow>
                    <TableRow><TableCell>Finger Break</TableCell><TableCell>Dark stripe along grid</TableCell><TableCell>Increased series resistance</TableCell></TableRow>
                    <TableRow><TableCell>PID</TableCell><TableCell>Cells near frame darker</TableCell><TableCell>Progressive power degradation</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Required Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {["Cooled CCD Camera", "Dark Room/Enclosure", "DC Power Supply", "Alignment Fixture", "Image Processing Software"].map((eq) => (
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
              <CardTitle>Defect Registry</CardTitle>
              <CardDescription>Log defects found in EL imaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Total Cells in Module</Label>
                <Input value={totalCells} onChange={(e) => setTotalCells(e.target.value)} className="font-mono w-32" />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Cell</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defects.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono">{d.id}</TableCell>
                      <TableCell><Badge variant="outline">{d.type}</Badge></TableCell>
                      <TableCell>
                        <Badge className={d.severity === "critical" ? "bg-red-500" : d.severity === "major" ? "bg-orange-500" : "bg-yellow-500"}>
                          {d.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{d.cellIndex ?? "-"}</TableCell>
                      <TableCell className="text-sm">{d.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
                <div>
                  <Label>Defect Type</Label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as ELDefectType)}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                    {DEFECT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <select value={newSeverity} onChange={(e) => setNewSeverity(e.target.value as "minor" | "major" | "critical")}
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                    <option value="minor">Minor</option>
                    <option value="major">Major</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div><Label>Cell Index</Label><Input value={newCell} onChange={(e) => setNewCell(e.target.value)} placeholder="e.g. 15" className="font-mono" /></div>
                <div><Label>Description</Label><Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description" /></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAddDefect}>Add Defect</Button>
                <Button onClick={handleAnalyze}>Analyze</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>EL Analysis Results</CardTitle>
              <CardDescription>Defect distribution and classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Total Defects</div>
                      <div className="font-bold text-2xl">{result.totalDefects}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Affected Cells</div>
                      <div className="font-bold text-2xl">{result.affectedCellPercentage.toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Critical</div>
                      <div className="font-bold text-2xl text-red-500">{result.defectsBySeverity.critical}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">Overall</div>
                      <StatusBadge status={result.overallGrade} size="md" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Defects by Type</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={DEFECT_TYPES.map((t) => ({ type: t.label, count: result.defectsByType[t.value], color: t.color }))}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="Count">
                          {DEFECT_TYPES.map((t, i) => (
                            <Cell key={i} fill={t.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Severity Distribution</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                        <div className="font-bold text-xl">{result.defectsBySeverity.minor}</div>
                        <div className="text-xs">Minor</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                        <div className="font-bold text-xl">{result.defectsBySeverity.major}</div>
                        <div className="text-xs">Major</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                        <div className="font-bold text-xl">{result.defectsBySeverity.critical}</div>
                        <div className="text-xs">Critical</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-12">Enter defect data and click analyze.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <DocumentHeader docNumber={docNumber} partNumber={13} title="EL Inspection Report" standard="IEC 60904-13 Ed.1" />
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Parameter</TableHead><TableHead>Value</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>Total Defects Found</TableCell><TableCell className="font-mono">{result.totalDefects}</TableCell></TableRow>
                      <TableRow><TableCell>Affected Cells</TableCell><TableCell className="font-mono">{result.affectedCellPercentage.toFixed(1)}%</TableCell></TableRow>
                      <TableRow><TableCell>Critical Defects</TableCell><TableCell className="font-mono">{result.defectsBySeverity.critical}</TableCell></TableRow>
                      <TableRow><TableCell>Major Defects</TableCell><TableCell className="font-mono">{result.defectsBySeverity.major}</TableCell></TableRow>
                      <TableRow><TableCell>Minor Defects</TableCell><TableCell className="font-mono">{result.defectsBySeverity.minor}</TableCell></TableRow>
                      <TableRow><TableCell>Overall Grade</TableCell><TableCell><StatusBadge status={result.overallGrade} size="sm" /></TableCell></TableRow>
                    </TableBody>
                  </Table>
                  <div className="text-xs text-muted-foreground border-t pt-3">
                    <p>Document: {docNumber} | Standard: IEC 60904-13 Ed.1 | ISO/IEC 17025 compliant</p>
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
