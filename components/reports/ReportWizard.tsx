"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REPORT_TYPES } from "@/lib/constants";
import { getTestDefinitions, type TestDefinition } from "@/lib/report-test-definitions";
import { cn } from "@/lib/utils";

interface ReportWizardProps {
  onGenerate: (params: ReportGenerateParams) => void;
  isGenerating: boolean;
}

export interface ReportGenerateParams {
  reportType: string;
  reportScope: "complete" | "individual";
  selectedTests: string[];
  moduleId: string;
  manufacturer: string;
  moduleModel: string;
  serialNumber: string;
  ratedPower: string;
  dimensions: string;
  cellType: string;
  numberOfCells: string;
  testRequestNumber: string;
  additionalNotes: string;
}

const steps = [
  { id: 1, label: "Standard & Scope" },
  { id: 2, label: "Module Details" },
  { id: 3, label: "Test Selection" },
  { id: 4, label: "Review & Generate" },
];

export function ReportWizard({ onGenerate, isGenerating }: ReportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportType, setReportType] = useState("");
  const [reportScope, setReportScope] = useState<"complete" | "individual">("complete");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [moduleModel, setModuleModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [ratedPower, setRatedPower] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [cellType, setCellType] = useState("");
  const [numberOfCells, setNumberOfCells] = useState("");
  const [testRequestNumber, setTestRequestNumber] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const selectedType = REPORT_TYPES.find((t) => t.id === reportType);
  const availableTests = reportType ? getTestDefinitions(reportType) : [];

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    );
  };

  const selectAllTests = () => {
    setSelectedTests(availableTests.map((t) => t.id));
  };

  const deselectAllTests = () => {
    setSelectedTests([]);
  };

  const handleGenerate = () => {
    const testsToUse = reportScope === "complete" ? availableTests.map((t) => t.id) : selectedTests;
    onGenerate({
      reportType,
      reportScope,
      selectedTests: testsToUse,
      moduleId,
      manufacturer,
      moduleModel,
      serialNumber,
      ratedPower,
      dimensions,
      cellType,
      numberOfCells,
      testRequestNumber,
      additionalNotes,
    });
  };

  const canProceedStep1 = !!reportType;
  const canProceedStep2 = !!moduleId && !!manufacturer;
  const canProceedStep3 = reportScope === "complete" || selectedTests.length > 0;

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (step.id <= currentStep) setCurrentStep(step.id);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.id
                  ? "bg-green-100 text-green-800"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs border">
                {currentStep > step.id ? "✓" : step.id}
              </span>
              {step.label}
            </button>
            {i < steps.length - 1 && <div className="w-8 h-0.5 bg-muted mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Standard & Scope */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Standard & Report Scope</CardTitle>
            <CardDescription>Choose the IEC standard and whether to generate a complete or individual test report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">IEC Standard</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {REPORT_TYPES.filter((t) => t.id !== "custom").map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      reportType === type.id ? "ring-2 ring-primary bg-primary/5" : ""
                    )}
                    onClick={() => {
                      setReportType(type.id);
                      setSelectedTests([]);
                    }}
                  >
                    <h3 className="font-medium text-sm">{type.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{type.standard}</p>
                    {type.id === reportType && (
                      <p className="text-xs text-primary mt-1">
                        {getTestDefinitions(type.id).length} tests available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {reportType && (
              <div>
                <p className="text-sm font-medium mb-3">Report Scope</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      reportScope === "complete" ? "ring-2 ring-primary bg-primary/5" : ""
                    )}
                    onClick={() => setReportScope("complete")}
                  >
                    <h3 className="font-medium text-sm">Complete Qualification Report</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      All {availableTests.length} tests in the standard — full type approval report
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                      reportScope === "individual" ? "ring-2 ring-primary bg-primary/5" : ""
                    )}
                    onClick={() => setReportScope("individual")}
                  >
                    <h3 className="font-medium text-sm">Individual Test Report</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select specific tests — single test or partial sequence report
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} disabled={!canProceedStep1}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Module Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Module Under Test (MUT) Details</CardTitle>
            <CardDescription>Enter the PV module identification and specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Module ID *</label>
                <Input placeholder="e.g., MOD-2026-0145" value={moduleId} onChange={(e) => setModuleId(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Manufacturer *</label>
                <Input placeholder="e.g., SolarTech Industries" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Module Model</label>
                <Input placeholder="e.g., ST-400M" value={moduleModel} onChange={(e) => setModuleModel(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Serial Number</label>
                <Input placeholder="e.g., SN-20260145-001" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Rated Power (Wp)</label>
                <Input placeholder="e.g., 400 Wp" value={ratedPower} onChange={(e) => setRatedPower(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Dimensions (L × W × H)</label>
                <Input placeholder="e.g., 1755 × 1038 × 35 mm" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Cell Type</label>
                <select
                  value={cellType}
                  onChange={(e) => setCellType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Select cell type...</option>
                  <option value="Mono-PERC">Mono-crystalline PERC</option>
                  <option value="Mono-TOPCon">Mono-crystalline TOPCon</option>
                  <option value="Mono-HJT">Mono-crystalline HJT</option>
                  <option value="Multi-Si">Multi-crystalline Si</option>
                  <option value="CdTe">CdTe Thin Film</option>
                  <option value="CIGS">CIGS Thin Film</option>
                  <option value="Perovskite">Perovskite</option>
                  <option value="Bifacial">Bifacial</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Number of Cells</label>
                <Input placeholder="e.g., 72 (6 × 12)" value={numberOfCells} onChange={(e) => setNumberOfCells(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Test Request Number</label>
              <Input placeholder="e.g., TR-2026-0042" value={testRequestNumber} onChange={(e) => setTestRequestNumber(e.target.value)} />
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!canProceedStep2}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Test Selection */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {reportScope === "complete" ? "Complete Test Sequence" : "Select Tests"}
            </CardTitle>
            <CardDescription>
              {reportScope === "complete"
                ? `All ${availableTests.length} tests will be included in the report`
                : `Select individual tests to include (${selectedTests.length} of ${availableTests.length} selected)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportScope === "individual" && (
              <div className="flex gap-2 mb-2">
                <Button variant="outline" size="sm" onClick={selectAllTests}>Select All</Button>
                <Button variant="outline" size="sm" onClick={deselectAllTests}>Deselect All</Button>
              </div>
            )}

            <div className="grid gap-2">
              {availableTests.map((test) => {
                const isSelected = reportScope === "complete" || selectedTests.includes(test.id);
                return (
                  <div
                    key={test.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      reportScope === "individual" ? "cursor-pointer hover:bg-muted/30" : "",
                      isSelected ? "bg-primary/5 border-primary/30" : ""
                    )}
                    onClick={() => reportScope === "individual" && toggleTest(test.id)}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center text-xs shrink-0",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                    )}>
                      {isSelected && "✓"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{test.clause}</span>
                        <span className="font-medium text-sm">{test.testName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{test.purpose}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {test.resultFields.length} fields
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Additional Notes</label>
              <Textarea
                placeholder="Special conditions, deviations, notes..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={() => setCurrentStep(4)} disabled={!canProceedStep3}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Generate */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Generate</CardTitle>
            <CardDescription>Confirm details before generating the report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Report Type</span>
                  <p className="font-medium text-sm">{selectedType?.label}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Scope</span>
                  <p className="font-medium text-sm">
                    {reportScope === "complete" ? "Complete Qualification" : `Individual (${selectedTests.length} tests)`}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Module ID</span>
                  <p className="font-medium text-sm">{moduleId}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Manufacturer</span>
                  <p className="font-medium text-sm">{manufacturer}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground block">Model / Serial</span>
                  <p className="font-medium text-sm">{moduleModel || "—"} / {serialNumber || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Rated Power</span>
                  <p className="font-medium text-sm">{ratedPower || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Cell Type</span>
                  <p className="font-medium text-sm">{cellType || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Test Request</span>
                  <p className="font-medium text-sm">{testRequestNumber || "Auto-generated"}</p>
                </div>
              </div>
            </div>

            {/* Tests to be included */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Tests to be included:</p>
              <div className="flex flex-wrap gap-1.5">
                {(reportScope === "complete" ? availableTests : availableTests.filter((t) => selectedTests.includes(t.id))).map((t) => (
                  <Badge key={t.id} variant="outline" className="text-xs">{t.clause}: {t.testName}</Badge>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating Report..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
