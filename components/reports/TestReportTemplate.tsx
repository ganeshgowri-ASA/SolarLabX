// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import {
  Section1CoverPage,
  Section2ModuleDescription,
  Section3VisualInspection,
  Section4STCPerformance,
  Section5InsulationResistance,
} from "./TestReportSections1to5";
import {
  Section6WetLeakage,
  Section7GroundContinuity,
  Section8ImpulseVoltage,
  Section9ELImaging,
  Section10ThermalCycling,
} from "./TestReportSections6to10";
import {
  Section11HumidityFreeze,
  Section12DampHeat,
  Section13UVPreconditioning,
  Section14MechanicalLoad,
  Section15HailTest,
} from "./TestReportSections11to15";
import {
  Section16BypassDiodeThermal,
  Section17HotSpotEndurance,
  Section18NMOT,
  Section19Stabilization,
  Section20FullSequenceSummary,
  Section21PIDTest,
  Section22LeTIDTest,
  Section23Conclusion,
} from "./TestReportSections16to23";

const TOC_SECTIONS = [
  { id: "section-1",  label: "1. Cover Page & General Info" },
  { id: "section-2",  label: "2. Module Description" },
  { id: "section-3",  label: "3. Visual Inspection (MQT 01)" },
  { id: "section-4",  label: "4. STC Performance (MQT 06)" },
  { id: "section-5",  label: "5. Insulation Resistance (MQT 03/MST 11)" },
  { id: "section-6",  label: "6. Wet Leakage Current (MQT 15/MST 12)" },
  { id: "section-7",  label: "7. Ground Continuity (MST 13)" },
  { id: "section-8",  label: "8. Impulse Voltage (MST 14)" },
  { id: "section-9",  label: "9. EL Imaging Results" },
  { id: "section-10", label: "10. Thermal Cycling (MQT 11)" },
  { id: "section-11", label: "11. Humidity Freeze (MQT 12)" },
  { id: "section-12", label: "12. Damp Heat (MQT 13)" },
  { id: "section-13", label: "13. UV Preconditioning (MQT 10)" },
  { id: "section-14", label: "14. Mechanical Load (MQT 16)" },
  { id: "section-15", label: "15. Hail Test (MQT 17)" },
  { id: "section-16", label: "16. Bypass Diode Thermal (MQT 18)" },
  { id: "section-17", label: "17. Hot Spot Endurance (MQT 09)" },
  { id: "section-18", label: "18. NMOT Determination (MQT 05)" },
  { id: "section-19", label: "19. Stabilization (MQT 19)" },
  { id: "section-20", label: "20. Full Sequence Summary" },
  { id: "section-21", label: "21. PID Test (IEC TS 62804)" },
  { id: "section-22", label: "22. LeTID Test (IEC TS 63209)" },
  { id: "section-23", label: "23. Conclusion & Certification" },
];

export default function TestReportTemplate() {
  const [activeSection, setActiveSection] = useState("section-1");

  useEffect(() => {
    const sectionEls = TOC_SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "-80px 0px -60% 0px" }
    );
    sectionEls.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 10pt; }
          section { page-break-inside: avoid; }
          h2 { page-break-after: avoid; }
          table { font-size: 9pt; }
        }
        @page { size: A4; margin: 15mm; }
      `}</style>

      {/* Top action bar */}
      <div className="no-print flex items-center justify-between mb-4 p-3 bg-muted rounded-lg border">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Report: SLX-TERF-2024-0047</span>
          <span className="text-xs text-muted-foreground hidden md:block">IEC 61215:2021 + IEC 61730:2023 Full Sequential TERF</span>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">← Back</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button size="sm" onClick={() => { alert("Use Print → Save as PDF in the browser print dialog."); window.print(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* TOC Sidebar */}
        <aside className="no-print w-60 shrink-0">
          <div className="sticky top-4">
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b bg-muted">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contents</span>
              </div>
              <ScrollArea className="h-[calc(100vh-200px)]">
                <nav className="p-2 space-y-0.5">
                  {TOC_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={cn(
                        "w-full text-left px-2 py-1.5 rounded text-xs transition-colors leading-snug",
                        activeSection === sec.id
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {sec.label}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </div>
        </aside>

        {/* Report content */}
        <main className="flex-1 min-w-0">
          <Section1CoverPage />
          <Section2ModuleDescription />
          <Section3VisualInspection />
          <Section4STCPerformance />
          <Section5InsulationResistance />
          <Section6WetLeakage />
          <Section7GroundContinuity />
          <Section8ImpulseVoltage />
          <Section9ELImaging />
          <Section10ThermalCycling />
          <Section11HumidityFreeze />
          <Section12DampHeat />
          <Section13UVPreconditioning />
          <Section14MechanicalLoad />
          <Section15HailTest />
          <Section16BypassDiodeThermal />
          <Section17HotSpotEndurance />
          <Section18NMOT />
          <Section19Stabilization />
          <Section20FullSequenceSummary />
          <Section21PIDTest />
          <Section22LeTIDTest />
          <Section23Conclusion />
        </main>
      </div>
    </>
  );
}
