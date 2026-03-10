// @ts-nocheck
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { reportTemplateLibrary } from "@/lib/template-library-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  section: string;
  required: boolean;
}

interface BrandingConfig {
  labName: string;
  labAddress: string;
  accreditationNumber: string;
  accreditationBody: string;
  logoPlacement: "left" | "center" | "right";
  headerColor: string;
  footerText: string;
  showAccreditationLogo: boolean;
  showConfidentialityNotice: boolean;
}

interface SignatureConfig {
  id: string;
  role: string;
  name: string;
  designation: string;
  required: boolean;
}

interface AutoPopulateConfig {
  pullFromLIMS: boolean;
  pullEquipmentData: boolean;
  pullEnvironmentalData: boolean;
  pullUncertaintyBudget: boolean;
  pullPreviousResults: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TemplateCustomizer() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(reportTemplateLibrary[0]?.id || "");
  const [activeSection, setActiveSection] = useState<"fields" | "sections" | "branding" | "signatures" | "auto">("fields");

  // Custom fields
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: "cf-1", name: "Client PO Number", type: "text", section: "Cover Page", required: false },
    { id: "cf-2", name: "Project Reference", type: "text", section: "Cover Page", required: true },
    { id: "cf-3", name: "Module Batch ID", type: "text", section: "Module Identification", required: false },
  ]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<CustomField["type"]>("text");
  const [newFieldSection, setNewFieldSection] = useState("");

  // Conditional sections
  const [conditionalSections, setConditionalSections] = useState<Record<string, boolean>>({
    bifacial_data: false,
    recovery_test: false,
    fire_classification: true,
    iv_curves: true,
    el_images: true,
    spectral_data: false,
  });

  // Branding
  const [branding, setBranding] = useState<BrandingConfig>({
    labName: "SolarLabX Testing & Certification",
    labAddress: "Plot No. 45, Solar Park Road, Bengaluru 560001, India",
    accreditationNumber: "NABL/TC-1234",
    accreditationBody: "NABL (National Accreditation Board for Testing and Calibration Laboratories)",
    logoPlacement: "left",
    headerColor: "#f97316",
    footerText: "This report shall not be reproduced except in full, without written approval of the laboratory.",
    showAccreditationLogo: true,
    showConfidentialityNotice: true,
  });

  // Signatures
  const [signatures, setSignatures] = useState<SignatureConfig[]>([
    { id: "sig-1", role: "Prepared By", name: "", designation: "Sr. Lab Technician", required: true },
    { id: "sig-2", role: "Reviewed By", name: "", designation: "Lab Manager", required: true },
    { id: "sig-3", role: "Approved By", name: "", designation: "Lab Director", required: true },
    { id: "sig-4", role: "Quality Assurance", name: "", designation: "QA Manager", required: false },
  ]);

  // Auto-populate
  const [autoPopulate, setAutoPopulate] = useState<AutoPopulateConfig>({
    pullFromLIMS: true,
    pullEquipmentData: true,
    pullEnvironmentalData: true,
    pullUncertaintyBudget: true,
    pullPreviousResults: false,
  });

  const selectedTemplate = reportTemplateLibrary.find((t) => t.id === selectedTemplateId);

  function addCustomField() {
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }
    const id = `cf-${Date.now()}`;
    setCustomFields([...customFields, { id, name: newFieldName, type: newFieldType, section: newFieldSection || "Custom", required: false }]);
    setNewFieldName("");
    toast.success(`Field "${newFieldName}" added`);
  }

  function removeCustomField(id: string) {
    setCustomFields(customFields.filter((f) => f.id !== id));
    toast.info("Custom field removed");
  }

  function addSignature() {
    const id = `sig-${Date.now()}`;
    setSignatures([...signatures, { id, role: "", name: "", designation: "", required: false }]);
  }

  function removeSignature(id: string) {
    setSignatures(signatures.filter((s) => s.id !== id));
  }

  function handleSaveConfig() {
    toast.success("Template customization saved successfully");
  }

  function handleExportPDF() {
    toast.success("PDF preview generated with custom branding");
  }

  const sectionNav = [
    { key: "fields" as const, label: "Custom Fields" },
    { key: "sections" as const, label: "Conditional Sections" },
    { key: "branding" as const, label: "Branding & Layout" },
    { key: "signatures" as const, label: "Digital Signatures" },
    { key: "auto" as const, label: "Auto-Populate" },
  ];

  return (
    <div className="space-y-4">
      {/* Template selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Customize Template</CardTitle>
          <CardDescription>Select a base template and customize fields, sections, branding, and signatures</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <label className="text-sm font-medium block mb-1">Base Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {reportTemplateLibrary.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                ))}
              </select>
            </div>
            {selectedTemplate && (
              <div className="flex gap-2">
                <Badge variant="outline">{selectedTemplate.standard}</Badge>
                <Badge className="bg-green-100 text-green-800 text-xs">{selectedTemplate.sections.length} sections</Badge>
                <Badge className="bg-blue-100 text-blue-800 text-xs">{selectedTemplate.fields.length} fields</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section nav */}
      <div className="flex gap-1 border-b pb-0">
        {sectionNav.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
              activeSection === s.key
                ? "bg-background border border-b-0 border-border text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ======================= CUSTOM FIELDS ======================= */}
      {activeSection === "fields" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Custom Field</CardTitle>
              <CardDescription>Add fields beyond the standard template to capture additional data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm font-medium block mb-1">Field Name</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g., Client Reference Number"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as CustomField["type"])}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="textarea">Text Area</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Section</label>
                  <input
                    type="text"
                    value={newFieldSection}
                    onChange={(e) => setNewFieldSection(e.target.value)}
                    placeholder="e.g., Cover Page"
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-40"
                  />
                </div>
                <Button onClick={addCustomField}>Add Field</Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing custom fields */}
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Field Name</th>
                  <th className="p-2 text-left font-medium">Type</th>
                  <th className="p-2 text-left font-medium">Section</th>
                  <th className="p-2 text-left font-medium">Required</th>
                  <th className="p-2 text-left font-medium w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {customFields.map((field) => (
                  <tr key={field.id} className="border-b last:border-0">
                    <td className="p-2 font-medium">{field.name}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">{field.type}</Badge>
                    </td>
                    <td className="p-2 text-muted-foreground">{field.section}</td>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={() => {
                          setCustomFields(customFields.map((f) =>
                            f.id === field.id ? { ...f, required: !f.required } : f
                          ));
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="p-2">
                      <Button variant="outline" size="sm" className="text-xs h-7 text-red-600" onClick={() => removeCustomField(field.id)}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {customFields.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      No custom fields added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= CONDITIONAL SECTIONS ======================= */}
      {activeSection === "sections" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conditional Sections</CardTitle>
            <CardDescription>Enable or disable optional report sections based on test requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(conditionalSections).map(([key, enabled]) => {
                const labels: Record<string, { title: string; desc: string }> = {
                  bifacial_data: { title: "Bifacial Module Data", desc: "Include rear-side measurements and bifaciality factor for bifacial modules" },
                  recovery_test: { title: "Recovery Test (PID)", desc: "Include post-PID recovery measurement data and analysis" },
                  fire_classification: { title: "Fire Classification", desc: "Include fire test results and classification per IEC 61730" },
                  iv_curves: { title: "I-V Curve Plots", desc: "Include forward and reverse I-V characteristic curve plots" },
                  el_images: { title: "EL / IR Images", desc: "Include electroluminescence and infrared imaging results" },
                  spectral_data: { title: "Spectral Response Data", desc: "Include detailed spectral response measurements and graphs" },
                };
                const info = labels[key] || { title: key, desc: "" };
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <p className="text-sm font-medium">{info.title}</p>
                      <p className="text-xs text-muted-foreground">{info.desc}</p>
                    </div>
                    <button
                      onClick={() => setConditionalSections({ ...conditionalSections, [key]: !enabled })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        enabled ? "bg-primary" : "bg-gray-300"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                        enabled ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================= BRANDING ======================= */}
      {activeSection === "branding" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lab Branding & Layout</CardTitle>
              <CardDescription>Configure lab logo, header, footer, and accreditation marks for PDF export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Lab Name</label>
                  <input
                    type="text"
                    value={branding.labName}
                    onChange={(e) => setBranding({ ...branding, labName: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Accreditation Number</label>
                  <input
                    type="text"
                    value={branding.accreditationNumber}
                    onChange={(e) => setBranding({ ...branding, accreditationNumber: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Lab Address</label>
                <input
                  type="text"
                  value={branding.labAddress}
                  onChange={(e) => setBranding({ ...branding, labAddress: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Accreditation Body</label>
                <input
                  type="text"
                  value={branding.accreditationBody}
                  onChange={(e) => setBranding({ ...branding, accreditationBody: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Logo Placement</label>
                  <select
                    value={branding.logoPlacement}
                    onChange={(e) => setBranding({ ...branding, logoPlacement: e.target.value as BrandingConfig["logoPlacement"] })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Header Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={branding.headerColor}
                      onChange={(e) => setBranding({ ...branding, headerColor: e.target.value })}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">{branding.headerColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Footer Text</label>
                <textarea
                  value={branding.footerText}
                  onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={branding.showAccreditationLogo}
                    onChange={() => setBranding({ ...branding, showAccreditationLogo: !branding.showAccreditationLogo })}
                    className="rounded"
                  />
                  Show Accreditation Logo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={branding.showConfidentialityNotice}
                    onChange={() => setBranding({ ...branding, showConfidentialityNotice: !branding.showConfidentialityNotice })}
                    className="rounded"
                  />
                  Show Confidentiality Notice
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Header Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <div
                  className="flex items-center gap-4 pb-3 border-b-2"
                  style={{ borderBottomColor: branding.headerColor }}
                >
                  <div className={cn(
                    "flex-1",
                    branding.logoPlacement === "center" && "text-center",
                    branding.logoPlacement === "right" && "text-right"
                  )}>
                    <div
                      className="w-16 h-16 rounded-md flex items-center justify-center text-white font-bold text-xs"
                      style={{
                        backgroundColor: branding.headerColor,
                        display: "inline-flex",
                      }}
                    >
                      LAB LOGO
                    </div>
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-bold text-sm">{branding.labName}</p>
                    <p className="text-xs text-muted-foreground">{branding.labAddress}</p>
                    {branding.showAccreditationLogo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Accreditation: {branding.accreditationNumber}
                      </p>
                    )}
                  </div>
                </div>
                {branding.showConfidentialityNotice && (
                  <p className="text-[10px] text-muted-foreground mt-2 italic">{branding.footerText}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================= DIGITAL SIGNATURES ======================= */}
      {activeSection === "signatures" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signature Chain Configuration</CardTitle>
              <CardDescription>Configure the approval workflow and digital signature blocks for the report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {signatures.map((sig, idx) => (
                <div key={sig.id} className="flex gap-3 items-center p-3 rounded-md border">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid gap-2 md:grid-cols-3">
                    <input
                      type="text"
                      value={sig.role}
                      onChange={(e) => {
                        const updated = [...signatures];
                        updated[idx] = { ...sig, role: e.target.value };
                        setSignatures(updated);
                      }}
                      placeholder="Role (e.g., Prepared By)"
                      className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <input
                      type="text"
                      value={sig.name}
                      onChange={(e) => {
                        const updated = [...signatures];
                        updated[idx] = { ...sig, name: e.target.value };
                        setSignatures(updated);
                      }}
                      placeholder="Name (optional - filled at signing)"
                      className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <input
                      type="text"
                      value={sig.designation}
                      onChange={(e) => {
                        const updated = [...signatures];
                        updated[idx] = { ...sig, designation: e.target.value };
                        setSignatures(updated);
                      }}
                      placeholder="Designation"
                      className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={sig.required}
                      onChange={() => {
                        const updated = [...signatures];
                        updated[idx] = { ...sig, required: !sig.required };
                        setSignatures(updated);
                      }}
                      className="rounded"
                    />
                    Required
                  </label>
                  <Button variant="outline" size="sm" className="text-xs h-7 text-red-600 shrink-0" onClick={() => removeSignature(sig.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addSignature} className="w-full">
                + Add Signature Step
              </Button>
            </CardContent>
          </Card>

          {/* Signature preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Signature Block Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {signatures.map((sig) => (
                  <div key={sig.id} className="border rounded-md p-3 w-48 text-center">
                    <div className="h-12 border-b border-dashed border-gray-300 mb-2" />
                    <p className="text-xs font-medium">{sig.role || "Role"}</p>
                    <p className="text-xs text-muted-foreground">{sig.designation || "Designation"}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Date: ___________</p>
                    {sig.required && (
                      <Badge className="text-[10px] mt-1 bg-blue-50 text-blue-700">Required</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================= AUTO-POPULATE ======================= */}
      {activeSection === "auto" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Auto-Populate Configuration</CardTitle>
            <CardDescription>Configure automatic data population from LIMS and other modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {([
              { key: "pullFromLIMS" as const, title: "Pull Test Data from LIMS", desc: "Automatically populate test results, sample data, and test conditions from the LIMS module" },
              { key: "pullEquipmentData" as const, title: "Pull Equipment Data", desc: "Auto-fill equipment identification, calibration status, and traceability information" },
              { key: "pullEnvironmentalData" as const, title: "Pull Environmental Conditions", desc: "Auto-fill lab temperature, humidity, and atmospheric pressure from monitoring system" },
              { key: "pullUncertaintyBudget" as const, title: "Pull Uncertainty Budget", desc: "Auto-populate measurement uncertainty values from the Uncertainty Calculator module" },
              { key: "pullPreviousResults" as const, title: "Pull Previous Test Results", desc: "Include historical comparison data from previous tests on the same module type" },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-md border">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  onClick={() => setAutoPopulate({ ...autoPopulate, [item.key]: !autoPopulate[item.key] })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    autoPopulate[item.key] ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                    autoPopulate[item.key] ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSaveConfig}>Save Configuration</Button>
        <Button variant="outline" onClick={handleExportPDF}>Preview PDF</Button>
      </div>
    </div>
  );
}
