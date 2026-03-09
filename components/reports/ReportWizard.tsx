"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { REPORT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ReportWizardProps {
  onGenerate: (params: ReportGenerateParams) => void;
  isGenerating: boolean;
}

export interface ReportGenerateParams {
  reportType: string;
  moduleId: string;
  manufacturer: string;
  moduleModel: string;
  serialNumber: string;
  testRequestNumber: string;
  additionalNotes: string;
}

const steps = [
  { id: 1, label: "Report Type" },
  { id: 2, label: "Module Details" },
  { id: 3, label: "Test Information" },
  { id: 4, label: "Review & Generate" },
];

export function ReportWizard({ onGenerate, isGenerating }: ReportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportType, setReportType] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [moduleModel, setModuleModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [testRequestNumber, setTestRequestNumber] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const selectedType = REPORT_TYPES.find((t) => t.id === reportType);

  const handleGenerate = () => {
    onGenerate({ reportType, moduleId, manufacturer, moduleModel, serialNumber, testRequestNumber, additionalNotes });
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.id)}
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
                {currentStep > step.id ? "+" : step.id}
              </span>
              {step.label}
            </button>
            {i < steps.length - 1 && <div className="w-8 h-0.5 bg-muted mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Report Type */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Report Type</CardTitle>
            <CardDescription>Choose the type of test report to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {REPORT_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                    reportType === type.id ? "ring-2 ring-primary bg-primary/5" : ""
                  )}
                  onClick={() => setReportType(type.id)}
                >
                  <h3 className="font-medium">{type.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Standard: {type.standard}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setCurrentStep(2)} disabled={!reportType}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Module Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
            <CardDescription>Enter the PV module information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Module ID *</label>
                <Input placeholder="e.g., MOD-2026-0145" value={moduleId} onChange={(e) => setModuleId(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Manufacturer *</label>
                <Input placeholder="e.g., SolarTech Industries" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Module Model</label>
                <Input placeholder="e.g., ST-400M" value={moduleModel} onChange={(e) => setModuleModel(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Serial Number</label>
                <Input placeholder="e.g., SN-20260145-001" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!moduleId || !manufacturer}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Test Information */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>Additional test details and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Test Request Number</label>
              <Input placeholder="e.g., TR-2026-0042" value={testRequestNumber} onChange={(e) => setTestRequestNumber(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Additional Notes</label>
              <Textarea
                placeholder="Any special conditions, deviations, or notes..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button onClick={() => setCurrentStep(4)}>Next</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
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
                  <span className="text-sm text-muted-foreground">Report Type</span>
                  <p className="font-medium">{selectedType?.label}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Module ID</span>
                  <p className="font-medium">{moduleId}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Manufacturer</span>
                  <p className="font-medium">{manufacturer}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Module Model</span>
                  <p className="font-medium">{moduleModel || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Serial Number</span>
                  <p className="font-medium">{serialNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Test Request</span>
                  <p className="font-medium">{testRequestNumber || "N/A"}</p>
                </div>
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
