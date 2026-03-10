"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Custom field types
interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "file";
  required: boolean;
  placeholder: string;
  options?: string[];
  condition?: string;
}

interface TemplateSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  conditional: boolean;
  conditionField?: string;
  conditionValue?: string;
}

interface BrandingConfig {
  labName: string;
  labLogo: string;
  accreditationLogo: string;
  accreditationNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  headerBg: string;
  footerText: string;
}

interface SignatureConfig {
  id: string;
  role: string;
  name: string;
  title: string;
  department: string;
  signatureType: "digital" | "wet" | "electronic";
  required: boolean;
}

// Default data
const defaultCustomFields: CustomField[] = [
  { id: "cf-1", name: "Client PO Number", type: "text", required: false, placeholder: "Enter PO number" },
  { id: "cf-2", name: "Test Batch ID", type: "text", required: true, placeholder: "e.g. BATCH-2026-001" },
  { id: "cf-3", name: "Module Rated Power (Wp)", type: "number", required: true, placeholder: "e.g. 400" },
  { id: "cf-4", name: "Cell Technology", type: "select", required: true, placeholder: "Select technology", options: ["Mono PERC", "Mono TOPCon", "HJT", "Poly", "Thin Film CdTe", "Thin Film CIGS", "Bifacial"] },
  { id: "cf-5", name: "Number of Cells", type: "number", required: true, placeholder: "e.g. 72" },
  { id: "cf-6", name: "Module Dimensions (L×W×H mm)", type: "text", required: true, placeholder: "e.g. 2094×1038×35" },
  { id: "cf-7", name: "Certification Scope", type: "select", required: false, placeholder: "Select scope", options: ["BIS", "NABL", "IEC CB", "UL", "TUV", "Custom"] },
  { id: "cf-8", name: "Test Start Date", type: "date", required: true, placeholder: "" },
  { id: "cf-9", name: "Test End Date", type: "date", required: false, placeholder: "" },
  { id: "cf-10", name: "Special Instructions", type: "textarea", required: false, placeholder: "Any special testing requirements..." },
  { id: "cf-11", name: "Include EL Images", type: "checkbox", required: false, placeholder: "" },
  { id: "cf-12", name: "Include IR Thermography", type: "checkbox", required: false, placeholder: "" },
];

const defaultSections: TemplateSection[] = [
  { id: "sec-1", name: "Cover Page & Header", enabled: true, order: 1, conditional: false },
  { id: "sec-2", name: "Table of Contents", enabled: true, order: 2, conditional: false },
  { id: "sec-3", name: "Scope & Objective", enabled: true, order: 3, conditional: false },
  { id: "sec-4", name: "Module Under Test (MUT) Details", enabled: true, order: 4, conditional: false },
  { id: "sec-5", name: "Test Sequence Summary", enabled: true, order: 5, conditional: false },
  { id: "sec-6", name: "Visual Inspection Records", enabled: true, order: 6, conditional: false },
  { id: "sec-7", name: "I-V Characterization Data", enabled: true, order: 7, conditional: false },
  { id: "sec-8", name: "EL Imaging Results", enabled: true, order: 8, conditional: true, conditionField: "Include EL Images", conditionValue: "true" },
  { id: "sec-9", name: "IR Thermography Results", enabled: true, order: 9, conditional: true, conditionField: "Include IR Thermography", conditionValue: "true" },
  { id: "sec-10", name: "Environmental Test Results", enabled: true, order: 10, conditional: false },
  { id: "sec-11", name: "Mechanical Test Results", enabled: true, order: 11, conditional: false },
  { id: "sec-12", name: "Uncertainty Statement", enabled: true, order: 12, conditional: false },
  { id: "sec-13", name: "Equipment & Calibration List", enabled: true, order: 13, conditional: false },
  { id: "sec-14", name: "Conclusion & Verdict", enabled: true, order: 14, conditional: false },
  { id: "sec-15", name: "Annexures", enabled: false, order: 15, conditional: false },
  { id: "sec-16", name: "Signatures & Approval", enabled: true, order: 16, conditional: false },
];

const defaultBranding: BrandingConfig = {
  labName: "SolarLabX Testing Laboratory",
  labLogo: "/logo.png",
  accreditationLogo: "/nabl-logo.png",
  accreditationNumber: "TC-XXXX",
  address: "Plot 42, KIADB Industrial Area, Bengaluru - 560058, Karnataka, India",
  phone: "+91 80 2345 6789",
  email: "testing@solarlabx.in",
  website: "www.solarlabx.in",
  primaryColor: "#f97316",
  headerBg: "#1e293b",
  footerText: "This report shall not be reproduced except in full, without the written approval of the laboratory.",
};

const defaultSignatures: SignatureConfig[] = [
  { id: "sig-1", role: "Prepared By", name: "Ravi Kumar", title: "Sr. Lab Technician", department: "Testing Division", signatureType: "digital", required: true },
  { id: "sig-2", role: "Reviewed By", name: "Priya Sharma", title: "Lab Manager", department: "Quality Assurance", signatureType: "digital", required: true },
  { id: "sig-3", role: "Approved By", name: "Dr. Anand Mehta", title: "Lab Director", department: "Technical Direction", signatureType: "digital", required: true },
  { id: "sig-4", role: "Quality Head", name: "Rajesh Patel", title: "Quality Manager", department: "QMS", signatureType: "electronic", required: false },
];

type SubTab = "fields" | "sections" | "branding" | "signatures" | "auto-populate";

const subTabs: { key: SubTab; label: string }[] = [
  { key: "fields", label: "Custom Fields" },
  { key: "sections", label: "Conditional Sections" },
  { key: "branding", label: "Branding" },
  { key: "signatures", label: "Digital Signatures" },
  { key: "auto-populate", label: "Auto-Populate" },
];

export default function TemplateCustomizationTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("fields");
  const [customFields, setCustomFields] = useState<CustomField[]>(defaultCustomFields);
  const [sections, setSections] = useState<TemplateSection[]>(defaultSections);
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [signatures, setSignatures] = useState<SignatureConfig[]>(defaultSignatures);

  // Auto-populate data source options
  const autoPopulateSources = [
    { field: "Module ID", source: "LIMS Sample Registry", status: "connected" as const },
    { field: "Manufacturer", source: "LIMS Sample Details", status: "connected" as const },
    { field: "Model Number", source: "LIMS Sample Details", status: "connected" as const },
    { field: "Test Results", source: "LIMS Test Execution", status: "connected" as const },
    { field: "Equipment List", source: "LIMS Equipment Registry", status: "connected" as const },
    { field: "Calibration Status", source: "LIMS Equipment Calibration", status: "connected" as const },
    { field: "Uncertainty Values", source: "Uncertainty Calculator", status: "connected" as const },
    { field: "I-V Curve Data", source: "Sun Simulator Module", status: "partial" as const },
    { field: "Defect Images", source: "Vision AI Module", status: "partial" as const },
    { field: "SOP References", source: "SOP Generator", status: "connected" as const },
    { field: "Weather Data", source: "External Weather API", status: "disconnected" as const },
    { field: "Client Details", source: "Project Management", status: "connected" as const },
  ];

  const handleToggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const handleMoveSection = (id: string, direction: "up" | "down") => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[target]] = [copy[target], copy[idx]];
      return copy.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const handleRemoveField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    toast.info("Custom field removed");
  };

  const handleAddField = () => {
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: "New Custom Field",
      type: "text",
      required: false,
      placeholder: "Enter value...",
    };
    setCustomFields((prev) => [...prev, newField]);
    toast.success("New custom field added");
  };

  const handleToggleSignature = (id: string) => {
    setSignatures((prev) => prev.map((s) => (s.id === id ? { ...s, required: !s.required } : s)));
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 border-b pb-0">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors",
              activeSubTab === tab.key
                ? "bg-background border border-b-0 border-border text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CUSTOM FIELDS EDITOR */}
      {activeSubTab === "fields" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Custom Fields Editor</CardTitle>
                  <CardDescription>Define additional data fields for your report templates</CardDescription>
                </div>
                <Button size="sm" onClick={handleAddField}>Add Field</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Field Name</th>
                      <th className="p-2 text-left font-medium w-24">Type</th>
                      <th className="p-2 text-left font-medium w-20">Required</th>
                      <th className="p-2 text-left font-medium">Placeholder / Options</th>
                      <th className="p-2 text-left font-medium w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customFields.map((field) => (
                      <tr key={field.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-2 font-medium">{field.name}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                        </td>
                        <td className="p-2">
                          {field.required ? (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">No</Badge>
                          )}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {field.options ? field.options.join(", ") : field.placeholder || "—"}
                        </td>
                        <td className="p-2">
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-red-600 hover:text-red-800" onClick={() => handleRemoveField(field.id)}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Field Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Field Preview</CardTitle>
              <CardDescription>Preview how custom fields appear in the report form</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {customFields.slice(0, 8).map((field) => (
                  <div key={field.id}>
                    <label className="text-sm font-medium block mb-1">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        placeholder={field.placeholder}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
                      />
                    ) : field.type === "checkbox" ? (
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        {field.placeholder || "Enable"}
                      </label>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CONDITIONAL SECTIONS */}
      {activeSubTab === "sections" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Report Section Builder</CardTitle>
              <CardDescription>Enable, disable, and reorder report sections. Drag sections or use arrows to reorder.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md border transition-colors",
                      section.enabled ? "bg-background" : "bg-muted/50 opacity-60"
                    )}
                  >
                    {/* Order */}
                    <span className="text-xs text-muted-foreground w-6 text-center">{section.order}</span>

                    {/* Move buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground leading-none"
                        onClick={() => handleMoveSection(section.id, "up")}
                      >
                        ▲
                      </button>
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground leading-none"
                        onClick={() => handleMoveSection(section.id, "down")}
                      >
                        ▼
                      </button>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggleSection(section.id)}
                      className={cn(
                        "w-10 h-5 rounded-full transition-colors relative",
                        section.enabled ? "bg-primary" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                          section.enabled ? "left-5" : "left-0.5"
                        )}
                      />
                    </button>

                    {/* Name */}
                    <span className={cn("text-sm font-medium flex-1", !section.enabled && "line-through")}>{section.name}</span>

                    {/* Conditional badge */}
                    {section.conditional && (
                      <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700">
                        Conditional: {section.conditionField} = {section.conditionValue}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => toast.success("Section configuration saved")}>Save Configuration</Button>
            <Button variant="outline" onClick={() => { setSections(defaultSections); toast.info("Sections reset to defaults"); }}>
              Reset to Default
            </Button>
          </div>
        </div>
      )}

      {/* BRANDING CUSTOMIZATION */}
      {activeSubTab === "branding" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lab Branding & Identity</CardTitle>
              <CardDescription>Customize the appearance of generated reports with your laboratory branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Laboratory Name</label>
                  <input
                    type="text"
                    value={branding.labName}
                    onChange={(e) => setBranding((b) => ({ ...b, labName: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Accreditation Number</label>
                  <input
                    type="text"
                    value={branding.accreditationNumber}
                    onChange={(e) => setBranding((b) => ({ ...b, accreditationNumber: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium block mb-1">Address</label>
                  <input
                    type="text"
                    value={branding.address}
                    onChange={(e) => setBranding((b) => ({ ...b, address: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone</label>
                  <input
                    type="text"
                    value={branding.phone}
                    onChange={(e) => setBranding((b) => ({ ...b, phone: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input
                    type="text"
                    value={branding.email}
                    onChange={(e) => setBranding((b) => ({ ...b, email: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Website</label>
                  <input
                    type="text"
                    value={branding.website}
                    onChange={(e) => setBranding((b) => ({ ...b, website: e.target.value }))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                      className="w-10 h-9 rounded cursor-pointer border border-input"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Header Background</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={branding.headerBg}
                      onChange={(e) => setBranding((b) => ({ ...b, headerBg: e.target.value }))}
                      className="w-10 h-9 rounded cursor-pointer border border-input"
                    />
                    <input
                      type="text"
                      value={branding.headerBg}
                      onChange={(e) => setBranding((b) => ({ ...b, headerBg: e.target.value }))}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Footer Disclaimer Text</label>
                <textarea
                  value={branding.footerText}
                  onChange={(e) => setBranding((b) => ({ ...b, footerText: e.target.value }))}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Report Header Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="p-4" style={{ backgroundColor: branding.headerBg }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">{branding.labName}</h3>
                      <p className="text-gray-300 text-xs">{branding.address}</p>
                      <p className="text-gray-300 text-xs">{branding.phone} | {branding.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge style={{ backgroundColor: branding.primaryColor, color: "white" }}>
                        {branding.accreditationNumber}
                      </Badge>
                      <p className="text-gray-300 text-xs mt-1">NABL Accredited</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 text-center">
                  <h4 className="font-bold" style={{ color: branding.primaryColor }}>TEST REPORT</h4>
                  <p className="text-xs text-muted-foreground">Report No: TR-2026-XXXX</p>
                </div>
                <div className="p-2 border-t text-xs text-muted-foreground text-center italic">
                  {branding.footerText}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => toast.success("Branding configuration saved")}>Save Branding</Button>
        </div>
      )}

      {/* DIGITAL SIGNATURES */}
      {activeSubTab === "signatures" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Signature Configuration</CardTitle>
                  <CardDescription>Configure approval chain and digital signature requirements</CardDescription>
                </div>
                <Button size="sm" onClick={() => {
                  setSignatures((prev) => [...prev, {
                    id: `sig-${Date.now()}`,
                    role: "New Role",
                    name: "",
                    title: "",
                    department: "",
                    signatureType: "digital",
                    required: false,
                  }]);
                  toast.success("New signature role added");
                }}>
                  Add Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {signatures.map((sig, idx) => (
                  <div key={sig.id} className="flex items-center gap-4 p-3 rounded-md border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 grid gap-2 md:grid-cols-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Role</label>
                        <p className="text-sm font-medium">{sig.role}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Name</label>
                        <p className="text-sm">{sig.name || "—"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Title</label>
                        <p className="text-sm">{sig.title || "—"}</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Department</label>
                        <p className="text-sm">{sig.department || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px]",
                        sig.signatureType === "digital" ? "bg-blue-50 text-blue-700" :
                        sig.signatureType === "electronic" ? "bg-purple-50 text-purple-700" :
                        "bg-gray-50 text-gray-700"
                      )}>
                        {sig.signatureType}
                      </Badge>
                      <button
                        onClick={() => handleToggleSignature(sig.id)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-colors relative",
                          sig.required ? "bg-primary" : "bg-gray-300"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                            sig.required ? "left-5" : "left-0.5"
                          )}
                        />
                      </button>
                      <span className="text-xs text-muted-foreground w-16">{sig.required ? "Required" : "Optional"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Signature Flow Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Approval Flow Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-0 justify-center py-4">
                {signatures.filter((s) => s.required).map((sig, idx, arr) => (
                  <div key={sig.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-xs font-medium mt-1">{sig.role}</p>
                      <p className="text-[10px] text-muted-foreground">{sig.name}</p>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="w-16 h-0.5 bg-primary mx-2 mt-[-20px]" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => toast.success("Signature configuration saved")}>Save Signatures</Button>
        </div>
      )}

      {/* AUTO-POPULATE FROM TEST DATA */}
      {activeSubTab === "auto-populate" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Auto-Populate Data Sources</CardTitle>
              <CardDescription>Connect report fields to live data from SolarLabX modules for automatic population</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Report Field</th>
                      <th className="p-2 text-left font-medium">Data Source</th>
                      <th className="p-2 text-left font-medium w-28">Status</th>
                      <th className="p-2 text-left font-medium w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoPopulateSources.map((src) => (
                      <tr key={src.field} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-2 font-medium">{src.field}</td>
                        <td className="p-2 text-muted-foreground">{src.source}</td>
                        <td className="p-2">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]",
                              src.status === "connected" ? "bg-green-50 text-green-700" :
                              src.status === "partial" ? "bg-yellow-50 text-yellow-700" :
                              "bg-red-50 text-red-700"
                            )}
                          >
                            {src.status === "connected" ? "Connected" : src.status === "partial" ? "Partial" : "Disconnected"}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => toast.info(`Testing connection to ${src.source}...`)}
                          >
                            Test
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Auto-Populate</CardTitle>
              <CardDescription>Select a module/sample to auto-fill all connected fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Module / Sample ID</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Select module...</option>
                    <option value="MOD-2026-0145">MOD-2026-0145 (SolarTech)</option>
                    <option value="MOD-2026-0142">MOD-2026-0142 (GreenPower)</option>
                    <option value="MOD-2026-0139">MOD-2026-0139 (GreenPower)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Test Standard</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Select standard...</option>
                    <option value="IEC 61215">IEC 61215:2021</option>
                    <option value="IEC 61730">IEC 61730:2016</option>
                    <option value="IEC 61853">IEC 61853:2018</option>
                    <option value="IEC 61701">IEC 61701:2020</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => toast.success("Auto-populating report fields from LIMS data...")}>
                    Auto-Populate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
