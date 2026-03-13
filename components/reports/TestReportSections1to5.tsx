// @ts-nocheck
"use client";
import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  REPORT_INFO, MODULE_SPECS, IV_COMBINED, VISUAL_ITEMS, INSULATION_TREND,
} from "@/lib/test-report-mock-data";

export function PassBadge({ result }: { result: string }) {
  const isPass = result === "PASS";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${isPass ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
      {isPass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {result}
    </span>
  );
}

export function SectionTitle({ num, title, clause }: { num: number; title: string; clause?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-primary">{num}.</span>
        <h2 className="text-xl font-bold">{title}</h2>
        {clause && <span className="text-sm text-muted-foreground ml-auto">{clause}</span>}
      </div>
      <Separator className="mt-2" />
    </div>
  );
}

export function TRow({ cells, header = false }: { cells: (string | React.ReactNode)[]; header?: boolean }) {
  const Tag = header ? "th" : "td";
  return (
    <tr className={header ? "bg-muted" : "border-b hover:bg-muted/30"}>
      {cells.map((c, i) => (
        <Tag key={i} className={`px-3 py-2 text-left text-sm ${header ? "font-semibold" : ""}`}>{c}</Tag>
      ))}
    </tr>
  );
}

// ── SECTION 1: Cover Page ──────────────────────────────────────────────────────
export function Section1CoverPage() {
  return (
    <section id="section-1" className="mb-10">
      <div className="border-4 border-double border-gray-400 dark:border-gray-600 p-8 rounded-lg bg-white dark:bg-gray-950">
        <div className="text-center mb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">IECEE CB SCHEME · ACCREDITED TEST LABORATORY</div>
          <h1 className="text-3xl font-bold mt-2">TEST REPORT</h1>
          <div className="text-lg font-semibold text-primary mt-1">
            IEC 61215-1:2021 / IEC 61215-1-1:2021<br />
            IEC 61730-1:2023 / IEC 61730-2:2023
          </div>
          <div className="text-sm text-muted-foreground mt-1">Full Sequential Design Qualification &amp; Type Approval</div>
          <div className="mt-2 text-xs text-muted-foreground">{REPORT_INFO.ieceeRef}</div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            ["Report Number", REPORT_INFO.reportNo],
            ["Issue Date", REPORT_INFO.issueDate],
            ["Revision", REPORT_INFO.revision],
            ["Testing Period", REPORT_INFO.testingPeriod],
            ["Test Laboratory", REPORT_INFO.lab],
            ["Accreditation", REPORT_INFO.accreditation],
            ["Laboratory Address", REPORT_INFO.labAddress],
            ["", ""],
            ["Applicant / Manufacturer", `${REPORT_INFO.applicant} / ${REPORT_INFO.manufacturer}`],
            ["Product Family", REPORT_INFO.productFamily],
            ["Model / Type", `${REPORT_INFO.model} — ${REPORT_INFO.type}`],
            ["Rated Power (Pmax)", REPORT_INFO.ratedPower],
            ["Cell Technology", MODULE_SPECS.cellType],
            ["Module Dimensions", REPORT_INFO.dimensions],
            ["Safety Class", REPORT_INFO.safetyClass],
            ["Max System Voltage", REPORT_INFO.maxSystemVoltage],
            ["Application Class", REPORT_INFO.applicationClass],
            ["Fire Rating", REPORT_INFO.fireClass],
          ].map(([k, v], i) => k ? (
            <React.Fragment key={i}>
              <div className="text-muted-foreground font-medium">{k}</div>
              <div className="font-semibold">{v}</div>
            </React.Fragment>
          ) : <div key={i} className="col-span-2 my-1" />)}
        </div>
        <Separator className="my-4" />
        <div className="text-xs text-muted-foreground">
          <strong>Standards Covered:</strong>{" "}
          {REPORT_INFO.standards.join(" · ")}
        </div>
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-300">
          <strong>CONFIDENTIAL</strong> — This report shall not be reproduced except in full without written approval of the issuing laboratory. Names of manufacturers and applicants are anonymised for this template.
        </div>
      </div>
    </section>
  );
}

// ── SECTION 2: Module Description & Construction ──────────────────────────────
export function Section2ModuleDescription() {
  return (
    <section id="section-2" className="mb-10">
      <SectionTitle num={2} title="Module Description & Construction" clause="IEC 61215-1:2021 §4 / OD-2048" />
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Electrical Specifications (STC)</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Peak Power (Pmax)", `${MODULE_SPECS.Pmax} W`],
                  ["Open Circuit Voltage (Voc)", `${MODULE_SPECS.Voc} V`],
                  ["Short Circuit Current (Isc)", `${MODULE_SPECS.Isc} A`],
                  ["Max. Power Voltage (Vmp)", `${MODULE_SPECS.Vmp} V`],
                  ["Max. Power Current (Imp)", `${MODULE_SPECS.Imp} A`],
                  ["Fill Factor (FF)", `${MODULE_SPECS.FF} %`],
                  ["Module Efficiency (η)", `${MODULE_SPECS.efficiency} %`],
                  ["Temp. Coeff. Pmax (γ)", `${MODULE_SPECS.tempCoeffPmax} %/°C`],
                  ["Temp. Coeff. Isc (α)", `+${MODULE_SPECS.tempCoeffIsc} %/°C`],
                  ["Temp. Coeff. Voc (β)", `${MODULE_SPECS.tempCoeffVoc} %/°C`],
                  ["NMOT", MODULE_SPECS.nmot],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-4">{k}</td><td className="py-1 font-semibold">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Physical & Construction Details</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Dimensions (L×W×D)", REPORT_INFO.dimensions],
                  ["Weight", `${MODULE_SPECS.weight} kg`],
                  ["Cell Type", "Mono-Si PERC N-type Bifacial"],
                  ["Cell Count / Config", `${MODULE_SPECS.cellsTotal} cells — ${MODULE_SPECS.cellsConfig}`],
                  ["Electrical Strings", `${MODULE_SPECS.strings} strings × 36 cells`],
                  ["Bypass Diodes", `${MODULE_SPECS.bypassDiodes} × Schottky (IP68 J-box)`],
                  ["Front Cover", MODULE_SPECS.frontGlass],
                  ["Rear Cover", MODULE_SPECS.rearGlass],
                  ["Encapsulant", MODULE_SPECS.encapsulant],
                  ["Frame", MODULE_SPECS.frame],
                  ["Junction Box", MODULE_SPECS.junctionBox],
                  ["Connectors / Cables", MODULE_SPECS.connector],
                  ["Max. System Voltage", REPORT_INFO.maxSystemVoltage],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b"><td className="py-1 text-muted-foreground pr-4">{k}</td><td className="py-1 font-semibold">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader className="pb-2"><CardTitle className="text-base">Construction Cross-Section (Text Diagram)</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-muted p-4 rounded leading-5 overflow-x-auto">{`
  ┌─────────────────────────────────────────────────────────────────────┐
  │  Anodized Al Frame (35 mm) — 6005A-T5                               │
  ├─────────────────────────────────────────────────────────────────────┤
  │  3.2 mm Tempered Low-Iron Glass + AR Coating (Front)                │
  ├─────────────────────────────────────────────────────────────────────┤
  │  EVA Encapsulant (Front)                                            │
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
  │  108 Mono-Si PERC N-type Half-Cut Cells (6×18, bifacial)            │
  │  Interconnect ribbons (flat wire) · String ribbon → J-box          │
  ├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
  │  POE Encapsulant (Rear)                                             │
  ├─────────────────────────────────────────────────────────────────────┤
  │  2.0 mm Tempered Glass (Rear — Bifacial)                            │
  └─────────────────────────────────────────────────────────────────────┘
  Junction Box (IP68) — rear centre, 3 Schottky bypass diodes
  MC4 Connectors — 1200 mm cables, 4 mm² cross-section
  String Layout: 3 parallel strings × 36 cells in series
  Bypass diodes: 1 per string (36-cell shading protection)
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

// ── SECTION 3: Visual Inspection ──────────────────────────────────────────────
export function Section3VisualInspection() {
  return (
    <section id="section-3" className="mb-10">
      <SectionTitle num={3} title="Visual Inspection (MQT 01 / MST 01)" clause="IEC 61215-2:2021 §4.1 / IEC 61730-2:2023 §10.1" />
      <div className="text-sm text-muted-foreground mb-3">
        Inspection performed under illuminance ≥ 1000 lux per IEC 61215-2 §4.1. Module cleaned prior to inspection with deionised water and lint-free cloth. Observations recorded before and after each test sequence.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["#", "Inspection Item", "Pre-Test Observation", "Post-Test Observation", "Criteria", "Verdict"]} />
          </thead>
          <tbody>
            {VISUAL_ITEMS.map((row, i) => (
              <TRow key={i} cells={[
                i + 1,
                row.item,
                row.preResult,
                row.postResult,
                "No defects (per Annex A IEC 61215-2)",
                <PassBadge key="v" result={row.verdict} />,
              ]} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 p-3 border rounded bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
        <strong>Overall Visual Inspection Result: PASS</strong> — No critical defects found pre- or post-test. Slight yellowing of encapsulant noted post-sequence (ΔE &lt; 3.0, within acceptable limits per laboratory practice).
      </div>
    </section>
  );
}

// ── SECTION 4: STC Performance ────────────────────────────────────────────────
const STC_TABLE = [
  { param: "Pmax (W)", pre: "399.8", post: "393.1", delta: "−1.68%", limit: "<5%", result: "PASS" },
  { param: "Isc (A)",  pre: "9.99",  post: "9.87",  delta: "−1.20%", limit: "Report", result: "PASS" },
  { param: "Voc (V)",  pre: "49.20", post: "48.97", delta: "−0.47%", limit: "Report", result: "PASS" },
  { param: "Imp (A)",  pre: "9.48",  post: "9.37",  delta: "−1.16%", limit: "Report", result: "PASS" },
  { param: "Vmp (V)",  pre: "42.15", post: "41.96", delta: "−0.45%", limit: "Report", result: "PASS" },
  { param: "FF (%)",   pre: "81.3",  post: "81.1",  delta: "−0.25%", limit: "Report", result: "PASS" },
];

export function Section4STCPerformance() {
  return (
    <section id="section-4" className="mb-10">
      <SectionTitle num={4} title="STC Performance Measurement (MQT 06)" clause="IEC 61215-2:2021 §4.6 / IEC 60904-1" />
      <div className="text-sm text-muted-foreground mb-3">
        Conditions: G = 1000 W/m², T<sub>cell</sub> = 25 ± 1 °C, AM1.5G (IEC 60904-3). Simulator classification A+A+A+ per IEC 60904-9. Uncertainty ± 2.3% (k=2). IV curve measured sweep: forward bias, 100 ms.
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Pre/Post STC Comparison</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Parameter", "Pre-Test", "Post-Test", "Change", "Limit", "Result"]} /></thead>
              <tbody>
                {STC_TABLE.map((r) => (
                  <TRow key={r.param} cells={[r.param, r.pre, r.post, r.delta, r.limit, <PassBadge key="v" result={r.result} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Nameplate vs Measured Pmax</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead><TRow header cells={["Item", "Nameplate", "Measured", "Tolerance", "Result"]} /></thead>
              <tbody>
                {[
                  ["Pmax (W)", "400", "399.8", "−0/+5 W", "PASS"],
                  ["Isc (A)", "9.99", "9.99", "±5%", "PASS"],
                  ["Voc (V)", "49.20", "49.20", "±5%", "PASS"],
                  ["Imp (A)", "9.48", "9.48", "±5%", "PASS"],
                  ["Vmp (V)", "42.15", "42.15", "±5%", "PASS"],
                ].map(([p, n, m, t, r]) => (
                  <TRow key={p} cells={[p, n, m, t, <PassBadge key="v" result={r} />]} />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">IV Curve & Power Curve — Pre vs Post (STC)</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={IV_COMBINED} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="V" label={{ value: "Voltage (V)", position: "insideBottomRight", offset: -5 }} />
                <YAxis yAxisId="left" domain={[0, 11]} label={{ value: "Current (A)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 450]} label={{ value: "Power (W)", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="I Pre" stroke="#3b82f6" strokeWidth={2} dot={false} name="I Pre (A)" />
                <Line yAxisId="left" type="monotone" dataKey="I Post" stroke="#93c5fd" strokeWidth={2} dot={false} strokeDasharray="5 3" name="I Post (A)" />
                <Line yAxisId="right" type="monotone" dataKey="P Pre" stroke="#f97316" strokeWidth={2} dot={false} name="P Pre (W)" />
                <Line yAxisId="right" type="monotone" dataKey="P Post" stroke="#fdba74" strokeWidth={2} dot={false} strokeDasharray="5 3" name="P Post (W)" />
                <ReferenceLine yAxisId="right" y={400} stroke="#22c55e" strokeDasharray="4 2" label={{ value: "400W Rated", fill: "#22c55e", fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ── SECTION 5: Insulation Resistance ──────────────────────────────────────────
import { BarChart, Bar } from "recharts";

const INSUL_TABLE = [
  { point: "Initial (before tests)", voltage: "1098 V", resistance: "12 500", area: "1.822", specific: "22 775", result: "PASS" },
  { point: "Post TC200", voltage: "1098 V", resistance: "11 800", area: "1.822", specific: "21 500", result: "PASS" },
  { point: "Post TC400", voltage: "1098 V", resistance: "11 200", area: "1.822", specific: "20 406", result: "PASS" },
  { point: "Post HF10", voltage: "1098 V", resistance: "10 900", area: "1.822", specific: "19 860", result: "PASS" },
  { point: "Post DH1000", voltage: "1098 V", resistance: "9 800", area: "1.822", specific: "17 855", result: "PASS" },
  { point: "Post Hail", voltage: "1098 V", resistance: "10 200", area: "1.822", specific: "18 585", result: "PASS" },
];

export function Section5InsulationResistance() {
  return (
    <section id="section-5" className="mb-10">
      <SectionTitle num={5} title="Insulation Resistance Test (MQT 03 / MST 11)" clause="IEC 61215-2 §4.3 / IEC 61730-2 §10.11" />
      <div className="text-sm text-muted-foreground mb-3">
        Test voltage = 2×Voc + 1000 V = 2×49.2 + 1000 = <strong>1098.4 V DC</strong> (Class II). Duration: 60 s. Acceptance criterion: Insulation resistance × module area ≥ 40 MΩ·m². Measurement per IEC 61215-2 §4.3.
      </div>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border rounded">
          <thead>
            <TRow header cells={["Test Point", "Applied Voltage (V)", "Measured R (MΩ)", "Area (m²)", "R×A (MΩ·m²)", "Criterion (≥ 40 MΩ·m²)", "Result"]} />
          </thead>
          <tbody>
            {INSUL_TABLE.map((r) => (
              <TRow key={r.point} cells={[r.point, r.voltage, r.resistance, r.area, r.specific, "≥ 40 MΩ·m²", <PassBadge key="v" result={r.result} />]} />
            ))}
          </tbody>
        </table>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Insulation Resistance Trend (MΩ·m²) Across Sequence</CardTitle></CardHeader>
        <CardContent>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INSULATION_TREND} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 14000]} label={{ value: "MΩ·m²", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v) => [`${v} MΩ·m²`, "Insulation Resistance"]} />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 3" label={{ value: "Min 40 MΩ·m²", fill: "#ef4444", fontSize: 10 }} />
                <Bar dataKey="value" fill="#3b82f6" name="Insulation Resistance" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">All measured values significantly exceed the 40 MΩ·m² acceptance criterion. Trend shows slight reduction with environmental stress as expected.</p>
        </CardContent>
      </Card>
    </section>
  );
}
