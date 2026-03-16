// @ts-nocheck
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { UNCERTAINTY_TEMPLATES } from "@/lib/uncertainty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportToWord, exportToExcel } from "@/components/reports/TemplateExportToolbar";
import { SixBoundDiagram } from "@/components/uncertainty/SixBoundDiagram";
import { UNCERTAINTY_6BOUND_CONFIGS, STANDARD_COVERAGE_FACTORS, getConfigByTemplateId } from "@/lib/data/uncertainty-6bound-data";
import { BarChart3 } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "I-V Measurement": "bg-blue-100 text-blue-800",
  Spectral: "bg-purple-100 text-purple-800",
  Temperature: "bg-red-100 text-red-800",
  Irradiance: "bg-amber-100 text-amber-800",
};

export default function TemplatesPage() {
  const categories = Array.from(new Set(UNCERTAINTY_TEMPLATES.map((t) => t.category)));
  const [sixBoundOpen, setSixBoundOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

  const openSixBound = (templateId: string) => {
    const config = getConfigByTemplateId(templateId);
    if (config) {
      setSelectedConfig(config);
      setSixBoundOpen(true);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Uncertainty Templates</h1>
          <p className="text-muted-foreground mt-1">
            Pre-built uncertainty budget templates for common solar PV measurements.
            Select a template to start a new budget with pre-configured components.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToWord({
            reportNo: "SLX-UNC-TEMPLATES-2026", title: "Uncertainty Budget Templates", subtitle: "Pre-built templates for solar PV measurements",
            standard: "GUM JCGM 100:2008 / ISO/IEC 17025:2017", date: new Date().toISOString().slice(0, 10),
            purpose: "Pre-built uncertainty budget templates for common solar PV measurement parameters per GUM methodology.",
            tables: UNCERTAINTY_TEMPLATES.map(t => ({
              title: `${t.name} (${t.category})`,
              headers: ["Component", "Type", "Distribution", "Default Uncertainty", "Sensitivity Coeff."],
              rows: t.components.map(c => [c.name, c.type, c.distribution, String(c.defaultUncertainty), String(c.sensitivityCoefficient)]),
            })),
          })}>Word</Button>
          <Button variant="outline" onClick={() => exportToExcel({
            reportNo: "SLX-UNC-TEMPLATES-2026", title: "Uncertainty Budget Templates", subtitle: "Pre-built templates for solar PV measurements",
            standard: "GUM JCGM 100:2008", date: new Date().toISOString().slice(0, 10),
            tables: UNCERTAINTY_TEMPLATES.map(t => ({
              title: t.name.length > 31 ? t.name.slice(0, 31) : t.name,
              headers: ["Component", "Type", "Distribution", "Default Uncertainty", "Sensitivity Coeff.", "Category"],
              rows: t.components.map(c => [c.name, c.type, c.distribution, String(c.defaultUncertainty), String(c.sensitivityCoefficient), c.category || ""]),
            })),
          })}>Excel</Button>
          <Link href="/uncertainty"><Button variant="outline">Back to Dashboard</Button></Link>
        </div>
      </div>

      {/* 6-Bound Diagram Dialog */}
      <Dialog open={sixBoundOpen} onOpenChange={setSixBoundOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>6-Bound Uncertainty Visualization</DialogTitle>
          </DialogHeader>
          {selectedConfig && (
            <SixBoundDiagram
              measurand={selectedConfig.measurand}
              measuredValue={selectedConfig.typicalValue}
              unit={selectedConfig.unit}
              combinedUncertainty={selectedConfig.typicalUc}
              coverageFactors={STANDARD_COVERAGE_FACTORS}
              standardRef={selectedConfig.standardRef}
              testType={selectedConfig.testType}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Templates grouped by category */}
      {categories.map((category) => {
        const templates = UNCERTAINTY_TEMPLATES.filter((t) => t.category === category);
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{category}</h2>
              <Badge variant="secondary">{templates.length} template{templates.length > 1 ? "s" : ""}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Measurand</div><div className="font-medium text-right">{template.measurand}</div>
                      <div>Components</div><div className="font-medium text-right">{template.components.length}</div>
                      <div>Type A</div><div className="font-medium text-right">{template.components.filter((c) => c.type === "typeA").length}</div>
                      <div>Type B</div><div className="font-medium text-right">{template.components.filter((c) => c.type === "typeB").length}</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Components:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.components.slice(0, 4).map((c, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {c.name.length > 20 ? c.name.slice(0, 18) + "..." : c.name}
                          </Badge>
                        ))}
                        {template.components.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{template.components.length - 4} more</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link href={`/uncertainty/calculator?template=${template.id}`} className="flex-1">
                      <Button className="w-full" size="sm">Use Template</Button>
                    </Link>
                    {getConfigByTemplateId(template.id) && (
                      <Button variant="outline" size="sm" onClick={() => openSixBound(template.id)}>
                        <BarChart3 className="h-4 w-4 mr-1" />6-Bound
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
