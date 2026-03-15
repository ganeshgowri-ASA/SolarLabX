// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { UNCERTAINTY_TEMPLATES } from "@/lib/uncertainty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { exportToWord, exportToExcel } from "@/components/reports/TemplateExportToolbar";

const CATEGORY_COLORS: Record<string, string> = {
  "I-V Measurement": "bg-blue-100 text-blue-800",
  Spectral: "bg-purple-100 text-purple-800",
  Temperature: "bg-red-100 text-red-800",
  Irradiance: "bg-amber-100 text-amber-800",
};

export default function TemplatesPage() {
  const categories = Array.from(new Set(UNCERTAINTY_TEMPLATES.map((t) => t.category)));

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
          })}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Word
          </Button>
          <Button variant="outline" onClick={() => exportToExcel({
            reportNo: "SLX-UNC-TEMPLATES-2026", title: "Uncertainty Budget Templates", subtitle: "Pre-built templates for solar PV measurements",
            standard: "GUM JCGM 100:2008", date: new Date().toISOString().slice(0, 10),
            tables: UNCERTAINTY_TEMPLATES.map(t => ({
              title: t.name.length > 31 ? t.name.slice(0, 31) : t.name,
              headers: ["Component", "Type", "Distribution", "Default Uncertainty", "Sensitivity Coeff.", "Category"],
              rows: t.components.map(c => [c.name, c.type, c.distribution, String(c.defaultUncertainty), String(c.sensitivityCoefficient), c.category || ""]),
            })),
          })}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Excel
          </Button>
          <Link href="/uncertainty">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Templates grouped by category */}
      {categories.map((category) => {
        const templates = UNCERTAINTY_TEMPLATES.filter((t) => t.category === category);
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">{category}</h2>
              <Badge className={CATEGORY_COLORS[category] || "bg-gray-100 text-gray-800"}>
                {templates.length} template{templates.length > 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Measurand</span>
                        <span className="font-medium">{template.measurand}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Components</span>
                        <span className="font-medium">{template.components.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type A</span>
                        <span className="font-medium">
                          {template.components.filter((c) => c.type === "typeA").length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type B</span>
                        <span className="font-medium">
                          {template.components.filter((c) => c.type === "typeB").length}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground font-medium mb-2">Components:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.components.slice(0, 4).map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {c.name.length > 20 ? c.name.slice(0, 18) + "..." : c.name}
                            </Badge>
                          ))}
                          {template.components.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.components.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/uncertainty/calculator?template=${template.id}`}
                      className="w-full"
                    >
                      <Button className="w-full" variant="outline">
                        Use Template
                      </Button>
                    </Link>
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
