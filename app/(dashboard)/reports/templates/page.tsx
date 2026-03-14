// @ts-nocheck
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportTemplate } from "@/components/reports/ReportTemplate";
import { REPORT_TYPES } from "@/lib/constants";

const LAB_REPORT_TEMPLATES = [
  {
    id: "pid",
    title: "PID Test Report",
    standard: "IEC TS 62804-1:2015",
    desc: "Potential Induced Degradation – Method A · ±1500 V · 85°C/85%RH · 96 hours",
    badge: "Method A",
    color: "#1e3a5f",
    icon: "⚡",
    sections: ["Cover + Signatures", "Test Sequence", "Module Description", "STC Results (Pre/Post)", "Visual Inspection", "WLC & GCT", "EL Imaging", "PID Parameters"],
  },
  {
    id: "letid",
    title: "LeTID Test Report",
    standard: "IEC CD 61215:2020",
    desc: "Light & Elevated Temperature Induced Degradation · Bifacial Mono-PERC · 75°C/45%RH · 200 hours",
    badge: "Bifacial",
    color: "#0f4c81",
    icon: "🌡",
    sections: ["B-O CID Preconditioning", "Front & Rear STC Results", "Deviation Chains A→B→C", "Reproducibility / Gate Analysis", "EL Pre/Post", "Visual Inspection"],
  },
  {
    id: "cleaning",
    title: "Robotic Cleaning Report",
    standard: "Custom / Project Report",
    desc: "Cleaning Robot Evaluation · 8000 Cycle Simulation · Sand & Dust · Classification A/B/C",
    badge: "Project",
    color: "#065f46",
    icon: "🤖",
    sections: ["Executive Summary", "Scope of Work", "Methodology & Setup", "STC Performance", "EL & IR Analysis", "Reflectance", "Classification System", "Conclusions"],
  },
  {
    id: "stc-flash",
    title: "STC Flash Test Analysis",
    standard: "IEC 60904-1 / IEC 61215-2 MQT06",
    desc: "Multi-stage STC comparison · Nameplate vs Initial vs Stabilised vs Post-test · Reference corrected",
    badge: "Landscape",
    color: "#1e3a5f",
    icon: "📊",
    sections: ["Module-wise STC Cards", "All 6 Parameters", "Deviation Chains (A→B→C)", "Reference Correction", "I-V Curve Placeholder", "Summary Comparison"],
  },
  {
    id: "iec-61215",
    title: "IEC 61215 Design Qualification",
    standard: "IEC 61215:2021 (Ed. 3)",
    desc: "Full Design Qualification & Type Approval · All 19 MQTs · Mono-PERC / Bifacial / Thin-film",
    badge: "19 MQTs",
    color: "#1e3a5f",
    icon: "🏆",
    sections: ["All 19 MQTs Summary", "Module Info", "Measurement Uncertainty", "Equipment List", "Signature Block"],
  },
  {
    id: "iec-61730",
    title: "IEC 61730 Safety Qualification",
    standard: "IEC 61730:2023 (Ed. 2)",
    desc: "Safety Qualification Test · Application Class A · 1500 V System · All 15 MSTs · Fire Class C",
    badge: "15 MSTs",
    color: "#7c2d12",
    icon: "🛡",
    sections: ["All 15 MSTs", "Electrical Safety Details", "Bypass Diode Thermal", "Compliance Statement", "Signature Block"],
  },
  {
    id: "iec-61853",
    title: "IEC 61853 Energy Rating",
    standard: "IEC 61853-1/2/3/4",
    desc: "Power Matrix 7×4 · Temp Coefficients · Climate-Specific Energy Yield · 4 Climate Zones",
    badge: "Power Matrix",
    color: "#5b21b6",
    icon: "⚡",
    sections: ["Power Matrix 7×4 Grid", "Temperature Coefficients", "Energy Yield by Climate", "Spectral Correction", "Signature Block"],
  },
  {
    id: "iec-61701",
    title: "IEC 61701 Salt Mist Corrosion",
    standard: "IEC 61701:2020",
    desc: "Salt Mist Corrosion · Severity S4 (strictest) · 200 hours · 5% NaCl · Coastal/Marine",
    badge: "S4 Level",
    color: "#0e7490",
    icon: "🌊",
    sections: ["Severity Level Reference", "Test Sequence", "Per-Sample Results", "Corrosion Assessment", "Compliance Statement"],
  },
  {
    id: "thermal-cycling",
    title: "Thermal Cycling",
    standard: "IEC 61215-2 MQT 11 (TC200)",
    desc: "200 Cycles · −40°C to +85°C · Identifies fatigue, thermal mismatch, interconnect failures",
    badge: "TC200",
    color: "#b45309",
    icon: "🌡",
    sections: ["Test Conditions", "Pre/Post STC", "Visual & EL", "Equipment", "Conclusions"],
  },
  {
    id: "humidity-freeze",
    title: "Humidity Freeze",
    standard: "IEC 61215-2 MQT 12 (HF10)",
    desc: "10 Cycles · −40°C ↔ 85°C/85%RH · Moisture ingress resistance testing",
    badge: "HF10",
    color: "#1d4ed8",
    icon: "❄",
    sections: ["Test Conditions", "Pre/Post STC", "Visual & EL", "Equipment", "Conclusions"],
  },
  {
    id: "damp-heat",
    title: "Damp Heat",
    standard: "IEC 61215-2 MQT 13 (DH1000)",
    desc: "1000 Hours · 85°C / 85% RH · Long-term humidity resistance · Critical for tropical climates",
    badge: "DH1000",
    color: "#065f46",
    icon: "💧",
    sections: ["Test Conditions", "Pre/Post STC", "Discolouration Note", "Visual & EL", "Conclusions"],
  },
  {
    id: "mechanical-load",
    title: "Dynamic Mechanical Load",
    standard: "IEC 61215-2 MQT 16",
    desc: "±5400 Pa · 3+3 Cycles · Wind & Snow Simulation · Deflection Measurements",
    badge: "5400 Pa",
    color: "#7c3aed",
    icon: "🏗",
    sections: ["Test Conditions", "Pre/Post STC", "Deflection Measurements", "Visual & EL", "Conclusions"],
  },
  {
    id: "hail",
    title: "Hail Impact Test",
    standard: "IEC 61215-2 MQT 17",
    desc: "25 mm Ice Ball · 23 m/s · 11 Impact Positions · Glass & Cell Integrity Assessment",
    badge: "25 mm",
    color: "#dc2626",
    icon: "🧊",
    sections: ["Impact Position Map", "Per-Position Results", "Pre/Post STC", "Visual & EL", "Conclusions"],
  },
  {
    id: "uv-preconditioning",
    title: "UV Preconditioning",
    standard: "IEC 61215-2 MQT 10",
    desc: "15 kWh/m² · 280–400 nm · 60°C · Encapsulant stability · Colorimetry (ΔE*)",
    badge: "15 kWh/m²",
    color: "#6d28d9",
    icon: "☀",
    sections: ["UV Dose Monitoring", "Colorimetry ΔE*", "Pre/Post STC", "Visual & EL", "Conclusions"],
  },
  {
    id: "iec-62788-material",
    title: "Material Testing Report",
    standard: "IEC 62788",
    desc: "Backsheet adhesion peel · Encapsulant gel content · UV cut-off wavelength · Material characterization",
    badge: "Material",
    color: "#0d9488",
    icon: "🧪",
    sections: ["Material Identification", "Backsheet Adhesion", "Gel Content Analysis", "UV Cut-off Measurement", "Conclusion"],
  },
  {
    id: "iec-62938-snow",
    title: "Non-Uniform Snow Load",
    standard: "IEC 62938",
    desc: "Light (1400 Pa) & Heavy (2800 Pa) · Non-uniform load profile · Deflection analysis",
    badge: "Snow",
    color: "#2563eb",
    icon: "❄",
    sections: ["Load Configuration", "Pre/Post STC", "Deflection Data", "Visual & EL", "Conclusions"],
  },
  {
    id: "iec-61345-uv-thinfilm",
    title: "UV Test (Thin-Film)",
    standard: "IEC 61345",
    desc: "50 kWh/m² UV dose · CdTe/CIGS/a-Si · 60°C · Extended UV stability evaluation",
    badge: "Thin-Film",
    color: "#7c3aed",
    icon: "☀",
    sections: ["UV Exposure Setup", "Dose Monitoring", "Pre/Post STC", "Visual & EL", "Conclusions"],
  },
  {
    id: "ul-61730",
    title: "UL 61730 / UL 1703 Safety",
    standard: "UL 61730 / UL 1703",
    desc: "North American Safety · UL Listing · Fire Class A/B/C · Ground Continuity · NEC 690",
    badge: "UL",
    color: "#dc2626",
    icon: "🛡",
    sections: ["UL Marking Verification", "Electrical Safety Tests", "Fire Classification", "Ground Continuity", "Conclusion"],
  },
  {
    id: "is-14286-bis",
    title: "IS 14286 BIS Certification",
    standard: "IS 14286 (BIS)",
    desc: "Indian Bureau of Standards · ISI Mark · ALMM Listing · Performance + Safety Verification",
    badge: "BIS",
    color: "#ea580c",
    icon: "🇮🇳",
    sections: ["BIS Marking Verification", "Performance Tests", "Safety Tests", "BIS Compliance", "Conclusion"],
  },
  {
    id: "iec-62915-bom",
    title: "BoM & Type Test Matrix",
    standard: "IEC 62915",
    desc: "Bill of Materials change assessment · Type test re-test matrix · Component impact classification",
    badge: "BoM",
    color: "#4f46e5",
    icon: "📋",
    sections: ["Original Certification", "BoM Change Summary", "Re-Test Matrix", "Impact Assessment", "Conclusion"],
  },
  {
    id: "calibration",
    title: "Calibration Certificate",
    standard: "ISO/IEC 17025:2017",
    desc: "Equipment calibration · Sun simulator · Chambers · Reference cells · Traceable to NABL/NPL",
    badge: "Cal",
    color: "#7e22ce",
    icon: "🔧",
    sections: ["Instrument Details", "Calibration Method", "Results & Uncertainty", "Traceability", "Cal Interval"],
  },
  {
    id: "uncertainty",
    title: "Measurement Uncertainty",
    standard: "GUM (JCGM 100:2008)",
    desc: "GUM-based uncertainty budget · Type A & B evaluation · Combined & expanded uncertainty · k=2",
    badge: "GUM",
    color: "#0891b2",
    icon: "📐",
    sections: ["Measurand", "Model Equation", "Type A & B Sources", "Uncertainty Budget Table", "Expanded Uncertainty"],
  },
  {
    id: "incoming-inspection",
    title: "Incoming Inspection",
    standard: "Internal SOP",
    desc: "Module receiving checklist · Packaging · Visual · EL baseline · Photo documentation · Disposition",
    badge: "Incoming",
    color: "#059669",
    icon: "📦",
    sections: ["Delivery Details", "Receiving Checklist", "Visual Inspection", "EL Baseline", "Disposition"],
  },
  {
    id: "iec-62782-sand",
    title: "Sand/Dust Abrasion",
    standard: "IEC 62782",
    desc: "Sand abrasion test · DML + abrasion combined · Glass transmittance · Haze measurement",
    badge: "Sand",
    color: "#b45309",
    icon: "🏜",
    sections: ["Abrasion Setup", "DML Parameters", "Pre/Post Transmittance", "Haze Analysis", "Conclusions"],
  },
];

export default function ReportTemplatesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Report Templates</h1>
          <p className="text-muted-foreground mt-1">
            ISO 17025 compliant printable/PDF-exportable report templates for IEC standards and custom tests
          </p>
        </div>
        <Link href="/reports/generate">
          <Button>Generate Report</Button>
        </Link>
      </div>

      {/* ── Lab Report Templates (printable full-page) ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Lab Report Templates</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {LAB_REPORT_TEMPLATES.length} templates · Printable · PDF Export
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {LAB_REPORT_TEMPLATES.map((tpl) => (
            <Link key={tpl.id} href={`/reports/templates/${tpl.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer h-full border-l-4 group" style={{ borderLeftColor: tpl.color }}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{tpl.icon}</span>
                        <Badge
                          className="text-xs font-semibold"
                          style={{ background: tpl.color + "20", color: tpl.color, border: `1px solid ${tpl.color}40` }}
                        >
                          {tpl.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold leading-tight group-hover:text-blue-600 transition-colors">
                        {tpl.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-medium" style={{ color: tpl.color }}>
                    {tpl.standard}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{tpl.desc}</p>
                  <div className="space-y-0.5">
                    {tpl.sections.slice(0, 4).map((s) => (
                      <div key={s} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tpl.color }} />
                        {s}
                      </div>
                    ))}
                    {tpl.sections.length > 4 && (
                      <div className="text-xs text-muted-foreground">+{tpl.sections.length - 4} more sections</div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#f0fdf4", color: "#15803d", fontWeight: "600" }}>
                      🖨 Print / PDF
                    </span>
                    <span className="text-xs text-muted-foreground">ISO 17025</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Generated Report Templates (wizard-based) ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Generated Report Templates</h2>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">
            Wizard-based · Auto-populated from LIMS
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPES.map((type) => (
            <Link key={type.id} href={`/reports/generate?type=${type.id}`}>
              <ReportTemplate templateId={type.id} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
