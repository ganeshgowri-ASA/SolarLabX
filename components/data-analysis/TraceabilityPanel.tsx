// @ts-nocheck
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Link2,
  ShieldCheck,
  Clock,
  User,
  FileText,
  ArrowRight,
} from "lucide-react";
import type { EquipmentRef, UncertaintyComponent, AuditEntry } from "@/lib/data/data-analysis-data";

interface TraceabilityPanelProps {
  reportNumber: string;
  rawDataFileId: string;
  equipmentUsed: EquipmentRef[];
  uncertaintyBudget: UncertaintyComponent[];
  auditTrail: AuditEntry[];
}

export function TraceabilityPanel({
  reportNumber,
  rawDataFileId,
  equipmentUsed,
  uncertaintyBudget,
  auditTrail,
}: TraceabilityPanelProps) {
  const combinedUncertainty = Math.sqrt(
    uncertaintyBudget.reduce((sum, c) => sum + c.contribution, 0)
  );
  const expandedUncertainty = combinedUncertainty * 2;

  return (
    <div className="space-y-4">
      {/* Traceability Chain */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Traceability Chain
          </CardTitle>
          <CardDescription>
            Complete chain from raw data to final result per ISO 17025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <FileText className="mr-1 h-3 w-3" /> {rawDataFileId}
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Equipment ({equipmentUsed.length})
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Analysis Method
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Result ± U
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {reportNumber}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Equipment & Calibration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Equipment & Calibration Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Cal. Certificate</TableHead>
                <TableHead>Cal. Date</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentUsed.map((eq) => (
                <TableRow key={eq.equipmentId}>
                  <TableCell className="font-mono text-sm">{eq.equipmentId}</TableCell>
                  <TableCell className="text-sm">{eq.equipmentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 font-mono text-xs">
                      {eq.calCertNumber}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{eq.calDate}</TableCell>
                  <TableCell className="text-sm">{eq.calNextDue}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        eq.calStatus === "valid"
                          ? "text-green-600 bg-green-50 border-green-200"
                          : eq.calStatus === "expiring_soon"
                          ? "text-amber-600 bg-amber-50 border-amber-200"
                          : "text-red-600 bg-red-50 border-red-200"
                      }
                    >
                      {eq.calStatus === "valid"
                        ? "Valid"
                        : eq.calStatus === "expiring_soon"
                        ? "Expiring Soon"
                        : "Expired"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Uncertainty Budget */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Measurement Uncertainty (GUM)</CardTitle>
          <CardDescription>
            Auto-calculated per Guide to Uncertainty in Measurement methodology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Distribution</TableHead>
                <TableHead className="text-right">u(xi) %</TableHead>
                <TableHead className="text-right">ci</TableHead>
                <TableHead className="text-right">Contribution %²</TableHead>
                <TableHead className="text-right">DoF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uncertaintyBudget.map((comp, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{comp.source}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={comp.type === "A" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}>
                      Type {comp.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{comp.distribution}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{comp.standardUncertainty.toFixed(3)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{comp.sensitivityCoefficient.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{comp.contribution.toFixed(4)}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{comp.degreesOfFreedom === Infinity ? "∞" : comp.degreesOfFreedom}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <div className="flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Combined Uncertainty (uc): </span>
              <span className="font-mono font-medium">{combinedUncertainty.toFixed(4)} %</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expanded Uncertainty (U, k=2): </span>
              <span className="font-mono font-bold text-primary">{expandedUncertainty.toFixed(4)} %</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" /> Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditTrail.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {entry.user}
                    {entry.field && (
                      <>
                        {" · "}
                        <span className="font-mono">{entry.field}</span>: {entry.oldValue} → {entry.newValue}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
