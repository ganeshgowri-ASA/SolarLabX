// @ts-nocheck
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  "": "Home",
  lims: "LIMS",
  qms: "QMS",
  audit: "Audit",
  projects: "Projects",
  uncertainty: "Uncertainty",
  "vision-ai": "Vision AI",
  "sop-gen": "SOP Generator",
  reports: "Reports",
  "sun-simulator": "Sun Simulator",
  "chamber-config": "Chamber Config",
  procurement: "Procurement",
  customer: "Customer",
  "test-flow": "Test Flow",
  equipment: "Equipment",
  manpower: "Manpower",
  "data-analysis": "Data Analysis",
  statistics: "Statistics",
  traceability: "Traceability",
  rca: "RCA",
  complaints: "Complaints",
  chatbot: "Chatbot",
  iec62915: "IEC 62915",
  samples: "Samples",
  tests: "Tests",
  labels: "Labels",
  capa: "CAPA",
  documents: "Documents",
  compliance: "Compliance",
  plans: "Plans",
  findings: "Findings",
  car: "CAR / 8D",
  vendors: "Vendors",
  rfq: "RFQ",
  po: "Purchase Orders",
  templates: "Templates",
  generate: "Generate",
  classify: "Classify",
  spc: "SPC Charts",
  spectral: "Spectral",
  uniformity: "Uniformity",
  stability: "Stability",
  detect: "Detect",
  results: "Results",
  analytics: "Analytics",
  calculator: "Calculator",
  budget: "Budget",
  compare: "Compare",
  configure: "Configure",
  new: "New",
  "iec-full": "IEC Full Report",
  "certification-project": "Certification Project",
  "customer-summary": "Customer Summary",
  flowcharts: "Flowcharts",
  "iec-guidelines": "IEC Guidelines",
  "iv-curve": "IV Curve",
  "nmot-noct": "NMOT/NOCT",
  "route-cards": "Route Cards",
  "electrical-safety": "Electrical Safety",
  "bom-changes": "BoM Changes",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumbs on root/dashboard
  if (segments.length === 0) return null;

  // Filter out dynamic segments (those that look like IDs)
  const breadcrumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const isDynamic = /^[0-9a-f-]{8,}$/.test(segment) || /^\[/.test(segment);
    const label = isDynamic
      ? "Detail"
      : labelMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label, isLast: idx === segments.length - 1 };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-orange-400 transition-colors"
      >
        <Home className="h-3 w-3" />
        <span>Home</span>
      </Link>
      {breadcrumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-gray-600" />
          {crumb.isLast ? (
            <span className="text-gray-300 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-orange-400 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
