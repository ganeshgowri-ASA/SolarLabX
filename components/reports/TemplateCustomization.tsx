"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox" | "file";
  required: boolean;
  placeholder: string;
  options?: string[];
  section: string;
}

interface ConditionalSection {
  id: string;
  name: string;
  condition: string;
  enabled: boolean;
}

interface SignatorySlot {
  id: string;
  role: string;
  name: string;
  title: string;
  enabled: boolean;
}

interface BrandingConfig {
  labName: string;
  accreditationNumber: string;
  address: string;
  phone: string;
  email: string;
  showLogo: boolean;
  showAccreditationMark: boolean;
  headerColor: string;
  footerText: string;
}

type CustomizationTab = "fields" | "sections" | "branding" | "signatures" | "autopopulate";

// Initial data
const defaultCustomFields: CustomField[] = [
  { id: "cf-001", name: "Client Reference Number", type: "text", required: false, placeholder: "Client PO or reference", section: "Header" },
  { id: "cf-002", name: "BIS License Number", type: "text", required: false, placeholder: "BIS registration number", section: "Header" },
  { id: "cf-003", name: "Module Dimensions (L×W×H)", type: "text", required: false, placeholder: "e.g. 2094×1038×40 mm", section: "Module Info" },
  { id: "cf-004", name: "Cell Count", type: "number", required: false, placeholder: "e.g. 72", section: "Module Info" },
  { id: "cf-005", name: "Encapsulant Material", type: "select", required: false, placeholder: "Select material", options: ["EVA", "POE", "TPO", "Silicone"], section: "Module Info" },
  { id: "cf-006", name: "Backsheet Type", type: "select", required: false, placeholder: "Select type", options: ["TPT", "KPK", "KPE", "Glass-Glass", "Other"], section: "Module Info" },
  { id: "cf-007", name: "Ambient Temperature During Test", type: "number", required: false, placeholder: "°C", section: "Environmental" },
  { id: "cf-008", name: "Relative Humidity", type: "number", required: false, placeholder: "%RH", section: "Environmental" },
  { id: "cf-009", name: "Additional Observations", type: "textarea", required: false, placeholder: "Any additional notes...", section: "Results" },
  { id: "cf-010", name: "Attach Supporting Documents", type: "file", required: false, placeholder: "Upload files", section: "Annexure" },
];

const defaultConditionalSections: ConditionalSection[] = [
  { id: "cs-001", name: "EL Imaging Annex", condition: "When visual defects are found or when EL imaging is performed", enabled: true },
  { id: "cs-002", name: "IR Thermography Annex", condition: "When hot-spot or thermal tests are performed", enabled: true },
  { id: "cs-003", name: "Extended Test Results (TC400/TC600)", condition: "When extended qualification testing is requested", enabled: false },
  { id: "cs-004", name: "PID Test Results", condition: "When PID testing is included in scope", enabled: false },
  { id: "cs-005", name: "LeTID Test Results", condition: "When LeTID testing is included in scope", enabled: false },
  { id: "cs-006", name: "Bifacial Module Characterization", condition: "When module is bifacial type", enabled: false },
  { id: "cs-007", name: "NABL Accreditation Scope Statement", condition: "When report is issued under NABL accreditation", enabled: true },
  { id: "cs-008", name: "BIS Conformity Statement", condition: "When BIS certification is applicable", enabled: false },
  { id: "cs-009", name: "Deviation / Non-Conformity Report", condition: "When test deviations or non-conformities are recorded", enabled: true },
  { id: "cs-010", name: "Customer-Specific Requirements", condition: "When customer provides additional requirements beyond IEC standard", enabled: false },
];

const defaultSignatories: SignatorySlot[] = [
  { id: "sig-1", role: "Prepared By", name: "", title: "Lab Technician", enabled: true },
  { id: "sig-2", role: "Reviewed By", name: "", title: "Lab Manager", enabled: true },
  { id: "sig-3", role: "Approved By", name: "", title: "Lab Director", enabled: true },
  { id: "sig-4", role: "Technical Reviewer", name: "", title: "Quality Manager", enabled: false },
  { id: "sig-5", role: "Client Witness", name: "", title: "Client Representative", enabled: false },
];

const defaultBranding: BrandingConfig = {
  labName: "SolarLabX PV Testing Laboratory",
  accreditationNumber: "NABL/TC-XXXX",
  address: "Solar Testing Facility, Industrial Area, India",
  phone: "+91-XXX-XXXXXXX",
  email: "lab@solarlabx.com",
  showLogo: true,
  showAccreditationMark: true,
  headerColor: "#1e3a5f",
  footerText: "This report shall not be reproduced except in full without written approval from the laboratory.",
};

const autoPopulateFields = [
  { id: "ap-001", source: "LIMS", field: "Module Serial Numbers", description: "Pull from sample registration", enabled: true },
  { id: "ap-002", source: "LIMS", field: "I-V Test Results (Pmax, Isc, Voc, FF)", description: "Pull from test execution records", enabled: true },
  { id: "ap-003", source: "LIMS", field: "Insulation Resistance Values", description: "Pull from insulation test records", enabled: true },
  { id: "ap-004", source: "LIMS", field: "Equipment Used & Calibration Dates", description: "Pull from equipment registry", enabled: true },
  { id: "ap-005", source: "LIMS", field: "Environmental Conditions (T, RH)", description: "Pull from chamber data logs", enabled: true },
  { id: "ap-006", source: "LIMS", field: "Test Dates & Durations", description: "Pull from test execution timeline", enabled: true },
  { id: "ap-007", source: "Uncertainty", field: "Measurement Uncertainty Values", description: "Pull from uncertainty calculator module", enabled: true },
  { id: "ap-008", source: "Vision AI", field: "EL/IR Defect Images & Annotations", description: "Pull from Vision AI detection results", enabled: false },
  { id: "ap-009", source: "Sun Sim", field: "Solar Simulator Classification Data", description: "Pull from Sun Simulator module", enabled: false },
  { id: "ap-010", source: "QMS", field: "Document Control Number & Revision", description: "Pull from QMS document registry", enabled: true },
];

export function TemplateCustomization() {
  const [activeTab, setActiveTab] = useState<CustomizationTab>("fields");
  const [customFields, setCustomFields] = useState<CustomField[]>(defaultCustomFields);
  const [conditionalSections, setConditionalSections] = useState<ConditionalSection[]>(defaultConditionalSections);
  const [signatories, setSignatories] = useState<SignatorySlot[]>(defaultSignatories);
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [autoPopulate, setAutoPopulate] = useState(autoPopulateFields);

  // New field form state
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<CustomField["type"]>("text");
  const [newFieldSection, setNewFieldSection] = useState("Header");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const tabs: { key: CustomizationTab; label: string }[] = [
    { key: "fields", label: "Custom Fields" },
    { key: "sections", label: "Conditional Sections" },
    { key: "branding", label: "Branding" },
    { key: "signatures", label: "Digital Signatures" },
    { key: "autopopulate", label: "Auto-Populate" },
  ];

  const fieldSections = Array.from(new Set(customFields.map((f) => f.section)));

  function addCustomField() {
    if (!newFieldName.trim()) {
      toast.error("Field name is required");
      return;
    }
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      name: newFieldName,
      type: newFieldType,
      required: newFieldRequired,
      placeholder: "",
      section: newFieldSection,
    };
    setCustomFields([...customFields, newField]);
    setNewFieldName("");
    setNewFieldRequired(false);
    toast.success(`Field "${newFieldName}" added`);
  }

  function removeField(id: string) {
    setCustomFields(customFields.filter((f) => f.id !== id));
    toast.success("Field removed");
  }

  function toggleConditionalSection(id: string) {
    setConditionalSections(
      conditionalSections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function toggleSignatory(id: string) {
    setSignatories(
      signatories.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function toggleAutoPopulate(id: string) {
    setAutoPopulate(
      autoPopulate.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Template Customization</CardTitle>
          <CardDescription>
            Customize report templates with custom fields, conditional sections, branding, signatures, and auto-populate settings.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
              activeTab === tab.key
                ? "bg-background border border-b-0 border-border text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom Fields */}
      {activeTab === "fields" && (
        <div className="space-y-4">
          {/* Add new field */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Custom Field</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="text-sm font-medium block mb-1">Field Name</label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g. Customer PO Number"
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-56"
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
                    <option value="select">Dropdown</option>
                    <option value="textarea">Multi-line Text</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Section</label>
                  <select
                    value={newFieldSection}
                    onChange={(e) => setNewFieldSection(e.target.value)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {fieldSections.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm h-9">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="rounded"
                  />
                  Required
                </label>
                <Button size="sm" onClick={addCustomField}>Add Field</Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing fields grouped by section */}
          {fieldSections.map((section) => {
            const sectionFields = customFields.filter((f) => f.section === section);
            return (
              <Card key={section}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{section}</CardTitle>
                  <CardDescription className="text-xs">{sectionFields.length} fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sectionFields.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-2 rounded-md border bg-muted/20">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{field.name}</span>
                          <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                          {field.required && (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700">Required</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 text-xs"
                          onClick={() => removeField(field.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Conditional Sections */}
      {activeTab === "sections" && (
        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conditional Report Sections</CardTitle>
              <CardDescription>
                Enable or disable report sections based on test conditions and scope requirements.
              </CardDescription>
            </CardHeader>
          </Card>
          {conditionalSections.map((section) => (
            <Card key={section.id} className={cn(!section.enabled && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{section.name}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          section.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {section.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Condition: {section.condition}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleConditionalSection(section.id)}
                    className="shrink-0"
                  >
                    {section.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => toast.success("Conditional sections saved")}>Save Configuration</Button>
          </div>
        </div>
      )}

      {/* Branding */}
      {activeTab === "branding" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Report Branding & Lab Identity</CardTitle>
              <CardDescription>
                Customize report header, footer, and lab branding elements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium block mb-1">Laboratory Name</label>
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
                <div>
                  <label className="text-sm font-medium block mb-1">Address</label>
                  <input
                    type="text"
                    value={branding.address}
                    onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Phone</label>
                  <input
                    type="text"
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Email</label>
                  <input
                    type="text"
                    value={branding.email}
                    onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Header Accent Color</label>
                  <div className="flex items-center gap-2">
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
                <label className="text-sm font-medium block mb-1">Footer Text (Disclaimer)</label>
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
                    checked={branding.showLogo}
                    onChange={(e) => setBranding({ ...branding, showLogo: e.target.checked })}
                    className="rounded"
                  />
                  Show Lab Logo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={branding.showAccreditationMark}
                    onChange={(e) => setBranding({ ...branding, showAccreditationMark: e.target.checked })}
                    className="rounded"
                  />
                  Show NABL/ILAC Accreditation Mark
                </label>
              </div>

              {/* Preview */}
              <div className="border rounded-md p-4 mt-4">
                <p className="text-xs text-muted-foreground mb-2">Report Header Preview</p>
                <div className="border rounded-md overflow-hidden">
                  <div className="p-3 text-white text-sm" style={{ backgroundColor: branding.headerColor }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{branding.labName}</p>
                        <p className="text-xs opacity-80">{branding.address}</p>
                      </div>
                      <div className="text-right text-xs">
                        {branding.showAccreditationMark && (
                          <p className="font-medium">{branding.accreditationNumber}</p>
                        )}
                        <p className="opacity-80">{branding.phone}</p>
                        <p className="opacity-80">{branding.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 bg-muted/30 text-xs text-muted-foreground text-center">
                    {branding.footerText}
                  </div>
                </div>
              </div>

              <Button onClick={() => toast.success("Branding settings saved")}>Save Branding</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Digital Signatures */}
      {activeTab === "signatures" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signature Configuration</CardTitle>
              <CardDescription>
                Configure the approval chain for report sign-off. Enable or disable signature slots as needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {signatories.map((sig, idx) => (
                <div
                  key={sig.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-md border",
                    sig.enabled ? "bg-background" : "bg-muted/30 opacity-60"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid gap-3 md:grid-cols-3">
                    <div>
                      <label className="text-xs text-muted-foreground block">Role</label>
                      <span className="text-sm font-medium">{sig.role}</span>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Name</label>
                      <input
                        type="text"
                        value={sig.name}
                        onChange={(e) =>
                          setSignatories(
                            signatories.map((s) => (s.id === sig.id ? { ...s, name: e.target.value } : s))
                          )
                        }
                        placeholder="Enter name..."
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        disabled={!sig.enabled}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Title</label>
                      <input
                        type="text"
                        value={sig.title}
                        onChange={(e) =>
                          setSignatories(
                            signatories.map((s) => (s.id === sig.id ? { ...s, title: e.target.value } : s))
                          )
                        }
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        disabled={!sig.enabled}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSignatory(sig.id)}
                    className="shrink-0"
                  >
                    {sig.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Signature Block Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {signatories
                  .filter((s) => s.enabled)
                  .map((sig) => (
                    <div key={sig.id} className="border rounded-md p-3 text-center">
                      <div className="h-16 border-b border-dashed border-gray-300 mb-2 flex items-end justify-center">
                        <span className="text-xs text-muted-foreground italic">Signature</span>
                      </div>
                      <p className="text-sm font-medium">{sig.name || "(Name)"}</p>
                      <p className="text-xs text-muted-foreground">{sig.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{sig.role}</p>
                      <p className="text-xs text-muted-foreground">Date: ___________</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => toast.success("Signature configuration saved")}>Save Signatures</Button>
        </div>
      )}

      {/* Auto-Populate */}
      {activeTab === "autopopulate" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Auto-Populate Configuration</CardTitle>
              <CardDescription>
                Configure which data fields are automatically populated from other SolarLabX modules when generating reports.
              </CardDescription>
            </CardHeader>
          </Card>

          {["LIMS", "Uncertainty", "Vision AI", "Sun Sim", "QMS"].map((source) => {
            const sourceFields = autoPopulate.filter((a) => a.source === source);
            if (sourceFields.length === 0) return null;
            return (
              <Card key={source}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Source: {source} Module
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sourceFields.map((ap) => (
                    <div
                      key={ap.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md border",
                        ap.enabled ? "bg-background" : "bg-muted/20 opacity-60"
                      )}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ap.field}</p>
                        <p className="text-xs text-muted-foreground">{ap.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            ap.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {ap.enabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAutoPopulate(ap.id)}
                        >
                          {ap.enabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-2 pt-2">
            <Button onClick={() => toast.success("Auto-populate settings saved")}>Save Configuration</Button>
            <Button variant="outline" onClick={() => toast.info("Testing auto-populate connections...")}>
              Test Connections
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
