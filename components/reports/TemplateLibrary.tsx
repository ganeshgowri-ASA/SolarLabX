"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Template data
interface TemplateField {
  name: string;
  type: "text" | "number" | "date" | "pass_fail" | "select" | "textarea";
  required: boolean;
}

interface ReportTemplateItem {
  id: string;
  name: string;
  standard: string;
  category: string;
  description: string;
  version: string;
  lastUpdated: string;
  author: string;
  status: "published" | "draft" | "archived";
  testCount: number;
  fields: TemplateField[];
  sections: string[];
  changelog: { version: string; date: string; changes: string }[];
}

const templateCategories = [
  { id: "all", label: "All Templates" },
  { id: "qualification", label: "Qualification Tests" },
  { id: "safety", label: "Safety Tests" },
  { id: "energy", label: "Energy Rating" },
  { id: "environmental", label: "Environmental Tests" },
  { id: "calibration", label: "Calibration" },
  { id: "custom", label: "Custom" },
] as const;

const templates: ReportTemplateItem[] = [
  {
    id: "tpl-61215",
    name: "IEC 61215 Design Qualification Report",
    standard: "IEC 61215:2021",
    category: "qualification",
    description: "Complete design qualification and type approval test report for crystalline silicon PV modules. Covers all MQT 01-17 tests per test sequences A-D.",
    version: "3.2",
    lastUpdated: "2026-02-15",
    author: "Dr. Ganesh Kumar",
    status: "published",
    testCount: 17,
    fields: [
      { name: "Report Number", type: "text", required: true },
      { name: "Module Type", type: "text", required: true },
      { name: "Manufacturer", type: "text", required: true },
      { name: "Model Number", type: "text", required: true },
      { name: "Serial Numbers", type: "textarea", required: true },
      { name: "Cell Technology", type: "select", required: true },
      { name: "Nominal Power", type: "number", required: true },
      { name: "Test Date From", type: "date", required: true },
      { name: "Test Date To", type: "date", required: true },
    ],
    sections: [
      "Cover Page & Lab Accreditation",
      "Module Identification & Description",
      "Test Sequence Summary",
      "Pre-test Characterization (I-V, Visual, Insulation)",
      "Individual Test Results (MQT 01-17)",
      "Post-test Characterization",
      "Degradation Summary Table",
      "Pass/Fail Verdict per MQT",
      "Measurement Uncertainty Statement",
      "Equipment Used & Calibration Status",
      "Environmental Conditions Log",
      "Photographs & EL Images",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "3.2", date: "2026-02-15", changes: "Added MQT 17 static mechanical load section" },
      { version: "3.1", date: "2026-01-10", changes: "Updated uncertainty statement format per NABL guidelines" },
      { version: "3.0", date: "2025-12-01", changes: "Aligned with IEC 61215:2021 edition" },
      { version: "2.0", date: "2025-06-15", changes: "Added EL imaging annex" },
    ],
  },
  {
    id: "tpl-61730",
    name: "IEC 61730 Safety Qualification Report",
    standard: "IEC 61730:2016",
    category: "safety",
    description: "Safety qualification test report for PV modules covering MST 01-12 per IEC 61730-2. Includes construction evaluation and safety classification.",
    version: "2.4",
    lastUpdated: "2026-02-20",
    author: "Dr. Ganesh Kumar",
    status: "published",
    testCount: 12,
    fields: [
      { name: "Report Number", type: "text", required: true },
      { name: "Module Type", type: "text", required: true },
      { name: "Manufacturer", type: "text", required: true },
      { name: "Application Class", type: "select", required: true },
      { name: "Max System Voltage", type: "number", required: true },
      { name: "Fire Class", type: "select", required: true },
    ],
    sections: [
      "Cover Page & Lab Accreditation",
      "Module Construction Details",
      "Material Bill & Safety Data Sheets",
      "Application Classification (Class A/B/C)",
      "Individual Safety Test Results (MST 01-12)",
      "Construction Evaluation Checklist",
      "Safety Label Compliance",
      "System Voltage Category",
      "Fire Classification",
      "Measurement Uncertainty",
      "Equipment & Calibration",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "2.4", date: "2026-02-20", changes: "Added fire class documentation section" },
      { version: "2.3", date: "2026-01-05", changes: "Updated MST 12 fire test section" },
      { version: "2.0", date: "2025-09-01", changes: "Major revision for IEC 61730-2:2016 Amd 1" },
    ],
  },
  {
    id: "tpl-61853",
    name: "IEC 61853 Energy Rating Report",
    standard: "IEC 61853:2018",
    category: "energy",
    description: "Energy rating test report including power matrix, spectral response, angular response, temperature coefficients, and CSER calculation per 6 reference climates.",
    version: "1.5",
    lastUpdated: "2026-03-01",
    author: "Priya Sharma",
    status: "published",
    testCount: 5,
    fields: [
      { name: "Report Number", type: "text", required: true },
      { name: "Module Type", type: "text", required: true },
      { name: "Manufacturer", type: "text", required: true },
      { name: "Rated Power", type: "number", required: true },
      { name: "Cell Technology", type: "select", required: true },
    ],
    sections: [
      "Cover Page & Lab Accreditation",
      "Module Identification",
      "Power Rating Matrix (28-point, Clause 7)",
      "Spectral Response Data (Clause 9)",
      "Angle of Incidence Modifier (Clause 10)",
      "Temperature Coefficients (Clause 11)",
      "CSER Calculation (Clause 8)",
      "Climate-Specific Energy Yield (6 climates)",
      "Power Matrix Heat Map Visualization",
      "Measurement Uncertainty",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "1.5", date: "2026-03-01", changes: "Added power matrix heatmap visualization" },
      { version: "1.4", date: "2026-01-20", changes: "Improved CSER calculation methodology section" },
      { version: "1.0", date: "2025-08-01", changes: "Initial release" },
    ],
  },
  {
    id: "tpl-61701",
    name: "IEC 61701 Salt Mist Corrosion Report",
    standard: "IEC 61701:2020",
    category: "environmental",
    description: "Salt mist corrosion test report covering severity levels 1-6 for coastal and marine environment qualification.",
    version: "1.2",
    lastUpdated: "2026-01-25",
    author: "Priya Sharma",
    status: "published",
    testCount: 2,
    fields: [
      { name: "Report Number", type: "text", required: true },
      { name: "Module Type", type: "text", required: true },
      { name: "Manufacturer", type: "text", required: true },
      { name: "Severity Level", type: "select", required: true },
      { name: "Number of Cycles", type: "number", required: true },
    ],
    sections: [
      "Cover Page & Lab Accreditation",
      "Module Identification",
      "Test Severity & Cycle Program",
      "Salt Solution Parameters (pH, concentration)",
      "Environmental Conditions Log",
      "I-V Results Per Cycle Interval",
      "Visual Inspection Per Cycle",
      "Corrosion Assessment",
      "Post-Test Insulation & Leakage",
      "Degradation Summary",
      "Equipment & Calibration",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "1.2", date: "2026-01-25", changes: "Added intermediate I-V measurement table" },
      { version: "1.0", date: "2025-10-01", changes: "Initial release" },
    ],
  },
  {
    id: "tpl-60904",
    name: "IEC 60904 Measurement Report",
    standard: "IEC 60904",
    category: "calibration",
    description: "PV device measurement report covering I-V characteristics, reference device requirements, spectral mismatch correction, and sun simulator classification.",
    version: "2.1",
    lastUpdated: "2026-02-05",
    author: "Dr. Ganesh Kumar",
    status: "published",
    testCount: 6,
    fields: [
      { name: "Report Number", type: "text", required: true },
      { name: "Device Type", type: "select", required: true },
      { name: "Manufacturer", type: "text", required: true },
      { name: "Simulator Class", type: "select", required: true },
    ],
    sections: [
      "Cover Page & Lab Accreditation",
      "Device Identification",
      "Solar Simulator Classification (60904-9)",
      "Reference Cell Calibration Status",
      "I-V Measurement Results (60904-1)",
      "Spectral Mismatch Correction (60904-7)",
      "Spectral Irradiance Data (60904-3)",
      "Measurement Uncertainty",
      "Equipment & Calibration",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "2.1", date: "2026-02-05", changes: "Updated for IEC 60904-9 Ed.3 classification" },
      { version: "2.0", date: "2025-11-15", changes: "Added spectral mismatch section" },
    ],
  },
  {
    id: "tpl-62716",
    name: "IEC 62716 Ammonia Corrosion Report",
    standard: "IEC 62716:2013",
    category: "environmental",
    description: "Ammonia corrosion resistance test report for PV modules used in agricultural environments.",
    version: "1.1",
    lastUpdated: "2026-01-10",
    author: "Priya Sharma",
    status: "published",
    testCount: 1,
    fields: [
      { name: "Report Number", type: "text", required: true },
      { name: "Module Type", type: "text", required: true },
      { name: "Manufacturer", type: "text", required: true },
      { name: "Exposure Duration", type: "number", required: true },
    ],
    sections: [
      "Cover Page & Lab Accreditation",
      "Module Identification",
      "Test Chamber Configuration",
      "NH3 Concentration & Environmental Log",
      "Cycle Program & Duration",
      "I-V Results Per Cycle",
      "Visual Inspection Per Cycle",
      "Post-Test Insulation & Leakage",
      "Degradation Summary",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "1.1", date: "2026-01-10", changes: "Added NH3 concentration monitoring chart" },
      { version: "1.0", date: "2025-07-01", changes: "Initial release" },
    ],
  },
  {
    id: "tpl-cal-cert",
    name: "ISO 17025 Calibration Certificate",
    standard: "ISO/IEC 17025:2017",
    category: "calibration",
    description: "Accredited calibration certificate for reference cells, pyranometers, and measurement instruments. NABL/ILAC compliant.",
    version: "2.5",
    lastUpdated: "2026-02-28",
    author: "Dr. Ganesh Kumar",
    status: "published",
    testCount: 0,
    fields: [
      { name: "Certificate Number", type: "text", required: true },
      { name: "Instrument ID", type: "text", required: true },
      { name: "Instrument Type", type: "select", required: true },
      { name: "Calibration Method", type: "text", required: true },
      { name: "Calibration Date", type: "date", required: true },
      { name: "Due Date", type: "date", required: true },
    ],
    sections: [
      "Certificate Header & Accreditation Mark",
      "Instrument Identification",
      "Customer Details",
      "Calibration Method & Procedure",
      "Environmental Conditions",
      "Measurement Results & Uncertainty",
      "Traceability Statement",
      "Calibration Interval Recommendation",
      "Authorized Signatory",
    ],
    changelog: [
      { version: "2.5", date: "2026-02-28", changes: "Updated NABL accreditation scope reference" },
      { version: "2.0", date: "2025-10-01", changes: "Revised for ISO 17025:2017" },
    ],
  },
  {
    id: "tpl-custom",
    name: "Custom Report Template",
    standard: "Custom",
    category: "custom",
    description: "Blank customizable template for creating reports not covered by standard templates. Build your own sections and fields.",
    version: "1.0",
    lastUpdated: "2026-03-05",
    author: "System",
    status: "published",
    testCount: 0,
    fields: [
      { name: "Report Title", type: "text", required: true },
      { name: "Report Number", type: "text", required: true },
      { name: "Standard Reference", type: "text", required: false },
    ],
    sections: [
      "Cover Page",
      "Introduction & Scope",
      "Custom Sections (user-defined)",
      "Results",
      "Conclusion",
      "Approval & Signatures",
    ],
    changelog: [
      { version: "1.0", date: "2026-03-05", changes: "Initial release" },
    ],
  },
];

export function TemplateLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showChangelog, setShowChangelog] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templates.filter((t) => {
      const matchCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.standard.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  const previewTemplate = previewId ? templates.find((t) => t.id === previewId) : null;

  return (
    <div className="space-y-4">
      {/* Category tabs + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-56 ml-auto"
        />
      </div>

      {/* Template preview panel */}
      {previewTemplate && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{previewTemplate.name}</CardTitle>
                <CardDescription>{previewTemplate.standard} - v{previewTemplate.version}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPreviewId(null)}>
                Close Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Sections */}
              <div>
                <p className="text-sm font-medium mb-2">Report Sections ({previewTemplate.sections.length})</p>
                <div className="space-y-1 rounded-md border p-3 max-h-60 overflow-y-auto">
                  {previewTemplate.sections.map((section, idx) => (
                    <div key={section} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-muted-foreground w-5">{idx + 1}.</span>
                      <span>{section}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div>
                <p className="text-sm font-medium mb-2">Required Fields ({previewTemplate.fields.length})</p>
                <div className="space-y-1 rounded-md border p-3 max-h-60 overflow-y-auto">
                  {previewTemplate.fields.map((field) => (
                    <div key={field.name} className="flex items-center justify-between text-sm">
                      <span>{field.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                        {field.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Version history */}
            <div>
              <p className="text-sm font-medium mb-2">Version History</p>
              <div className="space-y-2 rounded-md border p-3">
                {previewTemplate.changelog.map((entry) => (
                  <div key={entry.version} className="flex items-start gap-3 text-sm">
                    <Badge variant="outline" className="shrink-0">v{entry.version}</Badge>
                    <span className="text-xs text-muted-foreground shrink-0">{entry.date}</span>
                    <span className="text-muted-foreground">{entry.changes}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => toast.success(`Template "${previewTemplate.name}" selected for report generation`)}>
                Use This Template
              </Button>
              <Button variant="outline" onClick={() => toast.info("Template PDF export started")}>
                Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tpl) => (
          <Card
            key={tpl.id}
            className={cn(
              "hover:shadow-md transition-all cursor-pointer",
              previewId === tpl.id && "ring-2 ring-primary"
            )}
            onClick={() => setPreviewId(previewId === tpl.id ? null : tpl.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">{tpl.standard}</Badge>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px]">v{tpl.version}</Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      tpl.status === "published" && "bg-green-100 text-green-800",
                      tpl.status === "draft" && "bg-yellow-100 text-yellow-800",
                      tpl.status === "archived" && "bg-gray-100 text-gray-500",
                    )}
                  >
                    {tpl.status}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-base mt-2">{tpl.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{tpl.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{tpl.sections.length} sections</span>
                <span>{tpl.fields.length} fields</span>
                {tpl.testCount > 0 && <span>{tpl.testCount} tests</span>}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">By {tpl.author}</span>
                <span className="text-muted-foreground">{tpl.lastUpdated}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success(`Template "${tpl.name}" selected`);
                  }}
                >
                  Use Template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewId(tpl.id);
                  }}
                >
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No templates match the current filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
