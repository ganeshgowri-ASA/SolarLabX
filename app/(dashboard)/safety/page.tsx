// @ts-nocheck
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, AlertTriangle, Flame, HardHat, MapPin, Bell,
  CheckCircle2, XCircle, Clock, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────── reusable mini-table ───────── */
function DataTable({ columns, rows }: { columns: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2 text-left font-semibold text-gray-600 whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/60">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-gray-700 whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", colors[color] || colors.gray)}>{label}</span>;
}

/* ───────── sample data ───────── */
const hiraData = [
  ["HIRA-001", "Flash Tester Operation", "Electrical shock from high-voltage bias", <Badge key="h1" label="High" color="red" />, "Interlock guards, insulated gloves, SOP-EL-003", <Badge key="h1s" label="Medium" color="yellow" />],
  ["HIRA-002", "Thermal Cycling Chamber", "Burns from heated surfaces (200°C)", <Badge key="h2" label="High" color="red" />, "Warning labels, heat-resistant gloves, auto-shutdown", <Badge key="h2s" label="Low" color="green" />],
  ["HIRA-003", "UV Exposure Testing", "UV radiation to eyes/skin", <Badge key="h3" label="Medium" color="yellow" />, "UV goggles, full-sleeve lab coat, enclosure", <Badge key="h3s" label="Low" color="green" />],
  ["HIRA-004", "Damp Heat Chamber", "Slip hazard near condensation", <Badge key="h4" label="Medium" color="yellow" />, "Anti-slip mats, drainage, signage", <Badge key="h4s" label="Low" color="green" />],
  ["HIRA-005", "Module Handling (1.2m x 2m)", "Musculoskeletal injury – heavy lifting", <Badge key="h5" label="Medium" color="yellow" />, "Vacuum lifter, 2-person rule, training", <Badge key="h5s" label="Low" color="green" />],
  ["HIRA-006", "EL Imaging Dark Room", "Trip hazard in low-light area", <Badge key="h6" label="Low" color="green" />, "Glow-in-dark floor tape, emergency lighting", <Badge key="h6s" label="Low" color="green" />],
];

const safetyAudits = [
  ["SA-2026-001", "2026-01-15", "Lab Floor A – Flash Tester Area", "Ganesh R.", "3 / 1 / 0", <Badge key="sa1" label="Closed" color="green" />],
  ["SA-2026-002", "2026-02-10", "Thermal Chamber Zone", "Priya S.", "2 / 2 / 1", <Badge key="sa2" label="Open" color="yellow" />],
  ["SA-2026-003", "2026-03-05", "Module Storage & Handling Bay", "Arjun K.", "1 / 0 / 0", <Badge key="sa3" label="Closed" color="green" />],
  ["SA-2026-004", "2026-03-20", "Chemical Storage (IPA/Flux)", "Meena T.", "4 / 3 / 0", <Badge key="sa4" label="In Progress" color="blue" />],
];

const mockDrills = [
  ["MD-2026-001", "Fire Evacuation", "2026-01-25", "All Zones", "45 staff", "2 min 30 sec", <Badge key="md1" label="Pass" color="green" />],
  ["MD-2026-002", "Chemical Spill", "2026-02-18", "Chemical Store", "12 staff", "4 min 15 sec", <Badge key="md2" label="Pass" color="green" />],
  ["MD-2026-003", "Electrical Emergency", "2026-03-10", "Lab Floor A", "18 staff", "3 min 00 sec", <Badge key="md3" label="Needs Improvement" color="yellow" />],
];

const fireChecklist = [
  ["Fire extinguishers serviced (quarterly)", "2026-03-01", <Badge key="f1" label="OK" color="green" />],
  ["Smoke detectors tested", "2026-03-01", <Badge key="f2" label="OK" color="green" />],
  ["Emergency exits unobstructed", "2026-03-15", <Badge key="f3" label="OK" color="green" />],
  ["Fire alarm system functional", "2026-03-01", <Badge key="f4" label="OK" color="green" />],
  ["Evacuation route maps posted", "2026-02-20", <Badge key="f5" label="OK" color="green" />],
  ["Sprinkler system inspection", "2026-01-10", <Badge key="f6" label="Due" color="yellow" />],
  ["Fire blankets in chemical area", "2026-03-10", <Badge key="f7" label="OK" color="green" />],
  ["Emergency lighting battery backup", "2026-02-28", <Badge key="f8" label="Fail" color="red" />],
];

const ppeZones = [
  ["Zone A – Flash Tester", "Safety shoes, Anti-static wrist strap, Insulated gloves", <Badge key="p1" label="Compliant" color="green" />],
  ["Zone B – Thermal Chambers", "Heat-resistant gloves, Safety goggles, Lab coat", <Badge key="p2" label="Compliant" color="green" />],
  ["Zone C – UV Test Area", "UV goggles, Full-sleeve coat, Face shield", <Badge key="p3" label="1 Finding" color="yellow" />],
  ["Zone D – Module Handling", "Safety shoes, Hard hat, Back support belt", <Badge key="p4" label="Compliant" color="green" />],
  ["Zone E – Chemical Storage", "Chemical gloves, Splash goggles, Apron, Respirator", <Badge key="p5" label="Compliant" color="green" />],
];

const safetyWarnings = [
  { id: "SW-001", date: "2026-03-18", zone: "Zone A", severity: "Critical", message: "Interlock bypass detected on Flash Tester #2 – Immediate lockout required", status: "Active" },
  { id: "SW-002", date: "2026-03-15", zone: "Zone E", severity: "Warning", message: "IPA solvent stock below safety threshold – reorder needed", status: "Active" },
  { id: "SW-003", date: "2026-03-10", zone: "Zone B", severity: "Info", message: "Thermal chamber TC-03 door seal wear – schedule replacement", status: "Acknowledged" },
  { id: "SW-004", date: "2026-03-05", zone: "Zone D", severity: "Warning", message: "Forklift certification expired for 2 operators", status: "Resolved" },
];

/* ───────── page ───────── */
export default function SafetyEHSPage() {
  const [tab, setTab] = useState("hira");

  const tabs = [
    { value: "hira", label: "HIRA", icon: AlertTriangle },
    { value: "audit", label: "Safety Audit", icon: Shield },
    { value: "drills", label: "Mock Drills", icon: Bell },
    { value: "fire", label: "Fire Safety", icon: Flame },
    { value: "ppe", label: "PPE & Zones", icon: HardHat },
    { value: "warnings", label: "Warnings", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety & EHS</h1>
          <p className="text-sm text-gray-500 mt-1">Environment, Health & Safety management for Solar PV Lab</p>
        </div>
        <div className="flex gap-3">
          <div className="card !py-2 !px-4 text-center">
            <p className="text-xs text-gray-500">Open Hazards</p>
            <p className="text-xl font-bold text-red-600">2</p>
          </div>
          <div className="card !py-2 !px-4 text-center">
            <p className="text-xs text-gray-500">Incidents (YTD)</p>
            <p className="text-xl font-bold text-orange-600">1</p>
          </div>
          <div className="card !py-2 !px-4 text-center">
            <p className="text-xs text-gray-500">Days Since Last Incident</p>
            <p className="text-xl font-bold text-green-600">47</p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-6">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-1.5 text-xs">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* HIRA */}
        <TabsContent value="hira" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Hazard Identification & Risk Assessment</h2>
          <DataTable
            columns={["ID", "Activity", "Hazard", "Initial Risk", "Controls", "Residual Risk"]}
            rows={hiraData}
          />
        </TabsContent>

        {/* Safety Audit */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Safety Audit Log</h2>
          <DataTable
            columns={["Audit ID", "Date", "Area", "Auditor", "NC / OFI / Obs", "Status"]}
            rows={safetyAudits}
          />
        </TabsContent>

        {/* Mock Drills */}
        <TabsContent value="drills" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Mock Drill Records</h2>
          <DataTable
            columns={["Drill ID", "Type", "Date", "Zone", "Participants", "Response Time", "Result"]}
            rows={mockDrills}
          />
        </TabsContent>

        {/* Fire Safety */}
        <TabsContent value="fire" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Fire Safety Checklist</h2>
          <DataTable
            columns={["Check Item", "Last Checked", "Status"]}
            rows={fireChecklist}
          />
        </TabsContent>

        {/* PPE & Zones */}
        <TabsContent value="ppe" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">PPE Requirements & Zone Safety</h2>
          <DataTable
            columns={["Zone", "Required PPE", "Compliance"]}
            rows={ppeZones}
          />
        </TabsContent>

        {/* Safety Warnings */}
        <TabsContent value="warnings" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold">Active Safety Warnings</h2>
          <div className="space-y-3">
            {safetyWarnings.map((w) => (
              <div
                key={w.id}
                className={cn(
                  "rounded-lg border p-4 flex items-start gap-4",
                  w.severity === "Critical" ? "border-red-300 bg-red-50" :
                  w.severity === "Warning" ? "border-yellow-300 bg-yellow-50" :
                  "border-blue-200 bg-blue-50"
                )}
              >
                <AlertTriangle className={cn(
                  "h-5 w-5 mt-0.5 shrink-0",
                  w.severity === "Critical" ? "text-red-600" :
                  w.severity === "Warning" ? "text-yellow-600" : "text-blue-600"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{w.id}</span>
                    <Badge label={w.severity} color={w.severity === "Critical" ? "red" : w.severity === "Warning" ? "yellow" : "blue"} />
                    <Badge label={w.status} color={w.status === "Active" ? "red" : w.status === "Acknowledged" ? "yellow" : "green"} />
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{w.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{w.zone} · {w.date}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
