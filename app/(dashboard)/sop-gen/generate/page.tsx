"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOPForm, SOPGenerateParams } from "@/components/sop/SOPForm";

interface GeneratedSOP {
  title: string;
  sections: {
    purpose: string;
    scope: string;
    references: string;
    definitions: string;
    responsibilities: string;
    procedure: string;
    records: string;
    revisionHistory: string;
  };
}

export default function GenerateSOPPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSOP, setGeneratedSOP] = useState<GeneratedSOP | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (params: SOPGenerateParams) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedSOP(null);

    try {
      const response = await fetch("/api/sop/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "SOP generation failed");
      }

      const data = await response.json();
      setGeneratedSOP(data.sop);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      // Show demo SOP on error
      setGeneratedSOP({
        title: params.title,
        sections: {
          purpose: `To establish a standardized procedure for performing ${params.clause} testing in accordance with ${params.standard} at ${params.labName}. This SOP ensures consistent, reliable, and traceable test results that meet accreditation requirements.`,
          scope: `This procedure applies to all ${params.standard} ${params.clause} testing activities conducted at ${params.labName}. It covers sample preparation, test execution, data recording, and result reporting.`,
          references: `${params.standard}, ISO/IEC 17025:2017, Laboratory Quality Manual, Equipment Calibration Records, Safety Data Sheets for chemicals used.`,
          definitions: `DUT: Device Under Test\nSTC: Standard Test Conditions (25C, 1000 W/m2, AM1.5G)\nMU: Measurement Uncertainty\nNCR: Non-Conformance Report\nCAPA: Corrective and Preventive Action`,
          responsibilities: `Lab Director: Approve SOP and authorize testing.\nLab Manager: Ensure resources, review results, maintain equipment.\nSenior Technician: Execute tests, calibrate instruments, train junior staff.\nTechnician: Perform routine testing under supervision, record data.\nQuality Manager: Verify compliance, conduct internal audits.`,
          procedure: `1. Pre-Test Preparation\n   1.1 Verify DUT identification matches test request\n   1.2 Confirm equipment calibration status is current\n   1.3 Check environmental conditions meet requirements\n   1.4 Review test parameters with Lab Manager\n\n2. Test Setup\n   2.1 Position DUT per ${params.standard} requirements\n   2.2 Connect measurement instruments\n   2.3 Allow thermal stabilization (minimum 30 minutes)\n   2.4 Verify all safety interlocks are functional\n\n3. Test Execution\n   3.1 Record initial environmental conditions\n   3.2 Execute test sequence per ${params.clause}\n   3.3 Monitor and record parameters at specified intervals\n   3.4 Document any anomalies or deviations\n\n4. Post-Test Activities\n   4.1 Disconnect DUT and return to storage\n   4.2 Calculate results with measurement uncertainty\n   4.3 Compare results against acceptance criteria\n   4.4 Complete test report and submit for review`,
          records: `F-TEST-001: Test Request Form\nF-TEST-002: Environmental Conditions Log\nF-TEST-003: Raw Data Recording Sheet\nF-TEST-004: Test Report Template\nF-CAL-001: Equipment Calibration Certificate`,
          revisionHistory: `v1.0 (${new Date().toISOString().split("T")[0]}): Initial AI-generated draft - Requires technical review and approval`,
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate SOP</h1>
        <p className="text-muted-foreground mt-1">
          Use AI to generate a Standard Operating Procedure from IEC/ISO standards
        </p>
      </div>

      <SOPForm onGenerate={handleGenerate} isGenerating={isGenerating} />

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {error} (Showing demo SOP below)
        </div>
      )}

      {generatedSOP && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated SOP: {generatedSOP.title}</h2>
          {[
            { key: "purpose", title: "1. Purpose" },
            { key: "scope", title: "2. Scope" },
            { key: "references", title: "3. References" },
            { key: "definitions", title: "4. Definitions" },
            { key: "responsibilities", title: "5. Responsibilities" },
            { key: "procedure", title: "6. Procedure" },
            { key: "records", title: "7. Records" },
            { key: "revisionHistory", title: "8. Revision History" },
          ].map((section) => (
            <Card key={section.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedSOP.sections[section.key as keyof typeof generatedSOP.sections]}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
