"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileSpreadsheet, Database, Plus, Trash2, CheckCircle2 } from "lucide-react";
import type { IECStandard } from "@/lib/data/data-analysis-data";

interface RawDataImportProps {
  standard: IECStandard;
}

interface ManualRow {
  id: string;
  values: Record<string, string>;
}

const fieldsPerStandard: Record<string, string[]> = {
  "IEC 61215": ["Irradiance (W/m²)", "Cell Temp (°C)", "Voc (V)", "Isc (A)", "Pmax (W)", "FF"],
  "IEC 61730": ["Resistance (MΩ)", "Voltage (V)", "Leakage (µA)", "Temp (°C)", "Humidity (%)"],
  "IEC 61853": ["Irradiance (W/m²)", "Mod Temp (°C)", "Power (W)", "Voc (V)", "Isc (A)", "FF"],
  "IEC 60891": ["V (V)", "I (A)", "Irradiance (W/m²)", "Temp (°C)"],
  "IEC 60904": ["Wavelength (nm)", "Irradiance", "SR (A/W)", "Mismatch Factor"],
};

export function RawDataImport({ standard }: RawDataImportProps) {
  const [importMode, setImportMode] = useState<"upload" | "manual" | "equipment">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; date: string }[]>([]);
  const [manualRows, setManualRows] = useState<ManualRow[]>([]);

  const fields = fieldsPerStandard[standard] || [];

  const handleFileSimulate = () => {
    const newFile = {
      name: `RD-${standard.replace("IEC ", "")}-TEST-2026-${String(uploadedFiles.length + 1).padStart(3, "0")}.csv`,
      size: `${(Math.random() * 500 + 50).toFixed(1)} KB`,
      date: new Date().toISOString().split("T")[0],
    };
    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const addManualRow = () => {
    const row: ManualRow = {
      id: crypto.randomUUID(),
      values: Object.fromEntries(fields.map((f) => [f, ""])),
    };
    setManualRows((prev) => [...prev, row]);
  };

  const removeManualRow = (id: string) => {
    setManualRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={importMode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setImportMode("upload")}
        >
          <Upload className="mr-2 h-4 w-4" /> CSV/Excel Upload
        </Button>
        <Button
          variant={importMode === "manual" ? "default" : "outline"}
          size="sm"
          onClick={() => setImportMode("manual")}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Manual Entry
        </Button>
        <Button
          variant={importMode === "equipment" ? "default" : "outline"}
          size="sm"
          onClick={() => setImportMode("equipment")}
        >
          <Database className="mr-2 h-4 w-4" /> Equipment Data Link
        </Button>
      </div>

      {importMode === "upload" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">File Upload</CardTitle>
            <CardDescription>Upload CSV or Excel files with raw test data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={handleFileSimulate}
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">CSV, XLSX, XLS (max 50MB)</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Uploaded Files</Label>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} · {file.date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Uploaded
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Data Format</Label>
                <Select defaultValue="auto">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="csv">CSV (Comma-separated)</SelectItem>
                    <SelectItem value="tsv">TSV (Tab-separated)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Delimiter</Label>
                <Select defaultValue="comma">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Comma (,)</SelectItem>
                    <SelectItem value="semicolon">Semicolon (;)</SelectItem>
                    <SelectItem value="tab">Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {importMode === "manual" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Manual Data Entry</CardTitle>
            <CardDescription>Enter data points manually for {standard}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    {fields.map((f) => (
                      <TableHead key={f} className="min-w-[120px]">{f}</TableHead>
                    ))}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualRows.map((row, idx) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      {fields.map((f) => (
                        <TableCell key={f}>
                          <Input
                            className="h-8 text-sm"
                            type="number"
                            step="any"
                            placeholder="0.00"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeManualRow(row.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="outline" size="sm" onClick={addManualRow}>
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
          </CardContent>
        </Card>
      )}

      {importMode === "equipment" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Equipment Data Link</CardTitle>
            <CardDescription>
              Pull data directly from connected equipment systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Equipment</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ss001">EQ-SS-001 · Pasan SunSim 3C</SelectItem>
                    <SelectItem value="iv002">EQ-IV-002 · Keithley 2400 SMU</SelectItem>
                    <SelectItem value="tc003">EQ-TC-003 · Weiss WK3 Chamber</SelectItem>
                    <SelectItem value="ir004">EQ-IR-004 · FLIR T640</SelectItem>
                    <SelectItem value="el005">EQ-EL-005 · Greateyes EL Camera</SelectItem>
                    <SelectItem value="hv006">EQ-HV-006 · Hipotronics HD100</SelectItem>
                    <SelectItem value="sp008">EQ-SP-008 · Ocean Optics HR4000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Date Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="date" className="flex-1" />
                  <Input type="date" className="flex-1" />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm">Test Run ID</Label>
              <Input className="mt-1" placeholder="e.g., RUN-2026-0315-001" />
            </div>
            <Button size="sm">
              <Database className="mr-2 h-4 w-4" /> Fetch Equipment Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
