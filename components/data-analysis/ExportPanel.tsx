// @ts-nocheck
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  FileText,
  Printer,
  CheckCircle2,
  Hash,
} from "lucide-react";
import type { IECStandard } from "@/lib/data/data-analysis-data";

interface ExportPanelProps {
  standard: IECStandard;
  existingReportCount: number;
}

export function ExportPanel({ standard, existingReportCount }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState("pdf");
  const stdCode = standard.replace("IEC ", "");
  const year = new Date().getFullYear();
  const seq = String(existingReportCount + 1).padStart(3, "0");
  const reportId = `DA-${stdCode}-${year}-${seq}`;
  const rawDataId = `RD-${stdCode}-TEST-${year}-${seq}`;

  return (
    <div className="space-y-4">
      {/* Document Numbering */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Hash className="h-4 w-4" /> Document Numbering (ISO 17025 & ISO 9001)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Analysis Report ID</p>
              <p className="font-mono font-bold text-primary">{reportId}</p>
              <p className="text-xs text-muted-foreground mt-1">
                DA-[STD]-[YYYY]-[SEQ]
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Raw Data File ID</p>
              <p className="font-mono font-bold text-blue-600">{rawDataId}</p>
              <p className="text-xs text-muted-foreground mt-1">
                RD-[STD]-[TEST]-[YYYY]-[SEQ]
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">Calibration Links</p>
              <p className="font-mono font-bold text-purple-600">CAL-[EQUIP]-{year}-[SEQ]</p>
              <p className="text-xs text-muted-foreground mt-1">
                Auto-linked from equipment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Analysis Report</CardTitle>
          <CardDescription>
            Export comprehensive analysis report following ISO 17025 requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Report Title</Label>
              <Input className="mt-1" defaultValue={`${standard} Analysis Report`} />
            </div>
            <div>
              <Label className="text-sm">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="xlsx">Excel Workbook</SelectItem>
                  <SelectItem value="csv">CSV Data Export</SelectItem>
                  <SelectItem value="json">JSON (Machine-Readable)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm">Include in Report</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                "Raw data summary",
                "Validation results",
                "Analysis charts",
                "Uncertainty budget",
                "Traceability chain",
                "Equipment & calibration details",
                "Audit trail",
                "Acceptance criteria evaluation",
              ].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Prepared By</Label>
              <Input className="mt-1" defaultValue="Dr. Ravi Kumar" />
            </div>
            <div>
              <Label className="text-sm">Approved By</Label>
              <Input className="mt-1" placeholder="Select approver" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button>
              <FileDown className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Report will be generated with ID:{" "}
              <Badge variant="outline" className="font-mono">{reportId}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
