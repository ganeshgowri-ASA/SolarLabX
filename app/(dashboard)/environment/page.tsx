// @ts-nocheck
"use client";

import React, { useState } from "react";
import {
  Thermometer, Zap, Droplets, GlassWater, MapPin, Activity,
  AlertTriangle, CheckCircle2, Clock, Download, Settings2, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

// ── Zone definitions ──────────────────────────────────────────────
const zones = [
  { id: "FTZ", name: "Flash Test Zone", classification: "ISO 8 / Class 100k", conditions: "25±2°C, 40-60% RH", sensors: 8, status: "green" as const, lastReading: "2026-03-23 14:32:10" },
  { id: "TCZ", name: "Thermal Chamber Zone", classification: "Controlled", conditions: "-40 to +85°C cycling", sensors: 12, status: "green" as const, lastReading: "2026-03-23 14:31:55" },
  { id: "UVZ", name: "UV Exposure Zone", classification: "Controlled", conditions: "60±2°C, UV 15 kWh/m²", sensors: 6, status: "yellow" as const, lastReading: "2026-03-23 14:30:22" },
  { id: "DHZ", name: "Damp Heat Zone", classification: "Controlled", conditions: "85°C, 85±5% RH", sensors: 10, status: "green" as const, lastReading: "2026-03-23 14:32:01" },
  { id: "MLZ", name: "Mechanical Load Zone", classification: "General", conditions: "23±5°C, <70% RH", sensors: 4, status: "green" as const, lastReading: "2026-03-23 14:29:45" },
  { id: "OEZ", name: "Outdoor Exposure Zone", classification: "Uncontrolled", conditions: "Ambient tracking", sensors: 6, status: "red" as const, lastReading: "2026-03-23 14:28:00" },
  { id: "CLZ", name: "Calibration Lab Zone", classification: "ISO 7 / Class 10k", conditions: "23±1°C, 45±5% RH", sensors: 8, status: "green" as const, lastReading: "2026-03-23 14:32:08" },
  { id: "SRZ", name: "Storage / Receiving", classification: "General", conditions: "15-30°C, <70% RH", sensors: 4, status: "yellow" as const, lastReading: "2026-03-23 14:27:30" },
  { id: "GLA", name: "General Lab Area", classification: "General", conditions: "23±5°C, 30-70% RH", sensors: 6, status: "green" as const, lastReading: "2026-03-23 14:31:40" },
];

// ── Power quality sample data ─────────────────────────────────────
const powerData = [
  { zone: "FTZ", voltage: 230.2, frequency: 50.01, thd: 2.8, pf: 0.98, flicker: 0.42, unbalance: 0.6, classification: "Class A", status: "normal" },
  { zone: "TCZ", voltage: 228.5, frequency: 49.98, thd: 5.1, pf: 0.91, flicker: 0.78, unbalance: 1.1, classification: "Class A", status: "attention" },
  { zone: "UVZ", voltage: 231.0, frequency: 50.02, thd: 3.2, pf: 0.96, flicker: 0.55, unbalance: 0.8, classification: "Class S", status: "normal" },
  { zone: "DHZ", voltage: 227.8, frequency: 49.97, thd: 4.6, pf: 0.93, flicker: 0.65, unbalance: 0.9, classification: "Class A", status: "normal" },
  { zone: "MLZ", voltage: 229.9, frequency: 50.00, thd: 2.1, pf: 0.99, flicker: 0.30, unbalance: 0.4, classification: "Class B", status: "normal" },
  { zone: "CLZ", voltage: 230.0, frequency: 50.01, thd: 1.5, pf: 0.99, flicker: 0.22, unbalance: 0.3, classification: "Class A", status: "normal" },
  { zone: "GLA", voltage: 229.5, frequency: 50.00, thd: 3.0, pf: 0.97, flicker: 0.48, unbalance: 0.7, classification: "Class S", status: "normal" },
];

const voltageTrend = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  FTZ: 229 + Math.random() * 3,
  TCZ: 227 + Math.random() * 4,
  CLZ: 229.5 + Math.random() * 1.5,
}));

// ── Temperature sample data ───────────────────────────────────────
const tempData = [
  { zone: "FTZ", ambient: 25.1, equipment: 26.3, dut: 25.0, uniformity: "±0.8°C", status: "normal" },
  { zone: "TCZ", ambient: 24.5, equipment: 82.1, dut: 84.8, uniformity: "±1.2°C", status: "normal" },
  { zone: "UVZ", ambient: 28.3, equipment: 61.5, dut: 59.8, uniformity: "±2.1°C", status: "attention" },
  { zone: "DHZ", ambient: 24.8, equipment: 85.2, dut: 84.9, uniformity: "±0.6°C", status: "normal" },
  { zone: "MLZ", ambient: 23.8, equipment: 24.1, dut: 23.9, uniformity: "±0.5°C", status: "normal" },
  { zone: "OEZ", ambient: 38.2, equipment: 42.5, dut: 41.0, uniformity: "N/A", status: "critical" },
  { zone: "CLZ", ambient: 23.0, equipment: 23.2, dut: 23.1, uniformity: "±0.3°C", status: "normal" },
  { zone: "SRZ", ambient: 27.5, equipment: 28.0, dut: null, uniformity: "±1.8°C", status: "attention" },
  { zone: "GLA", ambient: 24.2, equipment: 24.5, dut: 24.3, uniformity: "±1.0°C", status: "normal" },
];

const tempTrend = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  FTZ: 24.5 + Math.sin(i / 4) * 1.2 + Math.random() * 0.5,
  CLZ: 22.8 + Math.sin(i / 6) * 0.4 + Math.random() * 0.3,
  OEZ: 22 + Math.sin((i - 6) / 3.8) * 10 + Math.random() * 2,
}));

// ── Humidity sample data ──────────────────────────────────────────
const humidityData = [
  { zone: "FTZ", rh: 48.2, dewPoint: 13.8, uniformity: "±2.5%", target: "40-60%", status: "normal" },
  { zone: "TCZ", rh: 35.0, dewPoint: 8.2, uniformity: "±3.0%", target: "<70%", status: "normal" },
  { zone: "UVZ", rh: 42.5, dewPoint: 11.0, uniformity: "±4.0%", target: "30-60%", status: "normal" },
  { zone: "DHZ", rh: 84.2, dewPoint: 81.5, uniformity: "±2.8%", target: "85±5%", status: "normal" },
  { zone: "MLZ", rh: 52.0, dewPoint: 13.0, uniformity: "±3.5%", target: "<70%", status: "normal" },
  { zone: "OEZ", rh: 78.5, dewPoint: 33.8, uniformity: "N/A", target: "Ambient", status: "attention" },
  { zone: "CLZ", rh: 44.8, dewPoint: 10.5, uniformity: "±1.5%", target: "45±5%", status: "normal" },
  { zone: "SRZ", rh: 68.0, dewPoint: 21.2, uniformity: "±4.5%", target: "<70%", status: "attention" },
  { zone: "GLA", rh: 50.5, dewPoint: 13.2, uniformity: "±3.0%", target: "30-70%", status: "normal" },
];

// ── Water quality sample data ─────────────────────────────────────
const waterData = [
  { source: "DI Water Plant", resistivity: 1.2, ph: 6.9, tds: 2.5, conductivity: 0.83, temp: 23.1, use: "Wet Leakage", status: "normal" },
  { source: "RO System A", resistivity: 0.8, ph: 7.1, tds: 5.0, conductivity: 1.25, temp: 22.8, use: "Humidity Freeze", status: "normal" },
  { source: "RO System B", resistivity: 0.6, ph: 7.0, tds: 8.2, conductivity: 1.67, temp: 23.5, use: "Damp Heat", status: "normal" },
  { source: "Chiller Loop", resistivity: 0.4, ph: 7.3, tds: 15.0, conductivity: 2.50, temp: 18.2, use: "Chamber Cooling", status: "attention" },
  { source: "Mains Supply", resistivity: 0.1, ph: 7.5, tds: 120.0, conductivity: 10.0, temp: 25.0, use: "General", status: "normal" },
];

// ── Helpers ───────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const color = status === "green" || status === "normal"
    ? "bg-emerald-500" : status === "yellow" || status === "attention"
    ? "bg-amber-500" : "bg-red-500";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color} mr-2 animate-pulse`} />;
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "normal" ? "default" : status === "attention" ? "secondary" : "destructive";
  const label = status === "normal" ? "Normal" : status === "attention" ? "Attention" : "Critical";
  return <Badge variant={variant} className={
    status === "normal" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    status === "attention" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
    "bg-red-500/10 text-red-400 border-red-500/20"
  }>{label}</Badge>;
}

function zoneName(id: string) {
  return zones.find((z) => z.id === id)?.name ?? id;
}

function exportCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────
export default function EnvironmentMonitoringPage() {
  const [activeTab, setActiveTab] = useState("zones");

  const summary = {
    total: zones.length,
    green: zones.filter((z) => z.status === "green").length,
    yellow: zones.filter((z) => z.status === "yellow").length,
    red: zones.filter((z) => z.status === "red").length,
    sensors: zones.reduce((a, z) => a + z.sensors, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Environmental Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time lab environment tracking per IEC 61215 / ISO 17025</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button variant="outline" size="sm"><Settings2 className="h-4 w-4 mr-1" /> Alerts</Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Zones", value: summary.total, icon: MapPin, color: "text-blue-400" },
          { label: "Normal", value: summary.green, icon: CheckCircle2, color: "text-emerald-400" },
          { label: "Attention", value: summary.yellow, icon: AlertTriangle, color: "text-amber-400" },
          { label: "Critical", value: summary.red, icon: AlertTriangle, color: "text-red-400" },
          { label: "Active Sensors", value: summary.sensors, icon: Activity, color: "text-cyan-400" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <k.icon className={`h-5 w-5 ${k.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-xl font-bold">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="zones"><MapPin className="h-4 w-4 mr-1 hidden sm:inline" /> Zones</TabsTrigger>
          <TabsTrigger value="power"><Zap className="h-4 w-4 mr-1 hidden sm:inline" /> Power</TabsTrigger>
          <TabsTrigger value="temperature"><Thermometer className="h-4 w-4 mr-1 hidden sm:inline" /> Temp</TabsTrigger>
          <TabsTrigger value="humidity"><Droplets className="h-4 w-4 mr-1 hidden sm:inline" /> Humidity</TabsTrigger>
          <TabsTrigger value="water"><GlassWater className="h-4 w-4 mr-1 hidden sm:inline" /> Water</TabsTrigger>
        </TabsList>

        {/* ── Zone Overview ── */}
        <TabsContent value="zones" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {zones.map((z) => (
              <Card key={z.id} className="hover:border-orange-500/40 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center"><StatusDot status={z.status} /><span className="font-semibold text-sm">{z.name}</span></div>
                    <Badge variant="outline" className="text-[10px]">{z.id}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Classification</span><span className="text-foreground">{z.classification}</span>
                    <span>Conditions</span><span className="text-foreground">{z.conditions}</span>
                    <span>Sensors</span><span className="text-foreground">{z.sensors}</span>
                    <span>Last Reading</span><span className="text-foreground">{z.lastReading.split(" ")[1]}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Power Quality ── */}
        <TabsContent value="power" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">IEC 61000-4-30 / IEEE 1159 compliance monitoring</p>
            <Button variant="outline" size="sm" onClick={() =>
              exportCSV(["Zone","Voltage","Freq","THD%","PF","Flicker","Unbalance","Class","Status"],
                powerData.map((r) => [r.zone,r.voltage,r.frequency,r.thd,r.pf,r.flicker,r.unbalance,r.classification,r.status].map(String)),
                "power_quality.csv")
            }><Download className="h-4 w-4 mr-1" /> CSV</Button>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Voltage Trend (24h)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={voltageTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#666" />
                  <YAxis domain={[225, 235]} tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }} />
                  <Legend />
                  <ReferenceLine y={230} stroke="#666" strokeDasharray="5 5" label={{ value: "Nominal", fill: "#888", fontSize: 10 }} />
                  <Line type="monotone" dataKey="FTZ" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="TCZ" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="CLZ" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead><TableHead>Voltage (V)</TableHead><TableHead>Freq (Hz)</TableHead>
                  <TableHead>THD %</TableHead><TableHead>PF</TableHead><TableHead>Flicker Pst</TableHead>
                  <TableHead>Unbalance %</TableHead><TableHead>Class</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powerData.map((r) => (
                  <TableRow key={r.zone}>
                    <TableCell className="font-medium">{zoneName(r.zone)}</TableCell>
                    <TableCell>{r.voltage.toFixed(1)}</TableCell>
                    <TableCell>{r.frequency.toFixed(2)}</TableCell>
                    <TableCell className={r.thd > 5 ? "text-amber-400" : ""}>{r.thd.toFixed(1)}</TableCell>
                    <TableCell>{r.pf.toFixed(2)}</TableCell>
                    <TableCell>{r.flicker.toFixed(2)}</TableCell>
                    <TableCell>{r.unbalance.toFixed(1)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.classification}</Badge></TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Temperature ── */}
        <TabsContent value="temperature" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">STC: 25±2°C | DH: 85±2°C | Calibration Lab: 23±1°C</p>
            <Button variant="outline" size="sm" onClick={() =>
              exportCSV(["Zone","Ambient","Equipment","DUT","Uniformity","Status"],
                tempData.map((r) => [r.zone,r.ambient,r.equipment,r.dut ?? "N/A",r.uniformity,r.status].map(String)),
                "temperature.csv")
            }><Download className="h-4 w-4 mr-1" /> CSV</Button>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Temperature Trend (24h)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }} />
                  <Legend />
                  <ReferenceLine y={25} stroke="#f97316" strokeDasharray="5 5" label={{ value: "STC", fill: "#f97316", fontSize: 10 }} />
                  <Line type="monotone" dataKey="FTZ" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="CLZ" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="OEZ" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead><TableHead>Ambient (°C)</TableHead><TableHead>Equipment (°C)</TableHead>
                  <TableHead>DUT (°C)</TableHead><TableHead>Uniformity</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tempData.map((r) => (
                  <TableRow key={r.zone}>
                    <TableCell className="font-medium">{zoneName(r.zone)}</TableCell>
                    <TableCell>{r.ambient.toFixed(1)}</TableCell>
                    <TableCell>{r.equipment.toFixed(1)}</TableCell>
                    <TableCell>{r.dut?.toFixed(1) ?? "—"}</TableCell>
                    <TableCell>{r.uniformity}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Humidity ── */}
        <TabsContent value="humidity" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">DH: 85±5% RH | Cal Lab: 45±5% RH | General: 30-70% RH</p>
            <Button variant="outline" size="sm" onClick={() =>
              exportCSV(["Zone","RH%","DewPoint","Uniformity","Target","Status"],
                humidityData.map((r) => [r.zone,r.rh,r.dewPoint,r.uniformity,r.target,r.status].map(String)),
                "humidity.csv")
            }><Download className="h-4 w-4 mr-1" /> CSV</Button>
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Humidity by Zone</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={humidityData.map((r) => ({ zone: r.zone, rh: r.rh, dewPoint: r.dewPoint }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="zone" tick={{ fontSize: 10 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333" }} />
                  <Legend />
                  <Bar dataKey="rh" name="RH %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="dewPoint" name="Dew Point °C" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead><TableHead>RH (%)</TableHead><TableHead>Dew Point (°C)</TableHead>
                  <TableHead>Uniformity</TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {humidityData.map((r) => (
                  <TableRow key={r.zone}>
                    <TableCell className="font-medium">{zoneName(r.zone)}</TableCell>
                    <TableCell>{r.rh.toFixed(1)}</TableCell>
                    <TableCell>{r.dewPoint.toFixed(1)}</TableCell>
                    <TableCell>{r.uniformity}</TableCell>
                    <TableCell>{r.target}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Water Quality ── */}
        <TabsContent value="water" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">IEC 61215 requirement: Resistivity ≥ 0.5 MΩ·cm for wet leakage</p>
            <Button variant="outline" size="sm" onClick={() =>
              exportCSV(["Source","Resistivity","pH","TDS","Conductivity","Temp","Use","Status"],
                waterData.map((r) => [r.source,r.resistivity,r.ph,r.tds,r.conductivity,r.temp,r.use,r.status].map(String)),
                "water_quality.csv")
            }><Download className="h-4 w-4 mr-1" /> CSV</Button>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead><TableHead>Resistivity (MΩ·cm)</TableHead><TableHead>pH</TableHead>
                  <TableHead>TDS (ppm)</TableHead><TableHead>Conductivity (μS/cm)</TableHead><TableHead>Temp (°C)</TableHead>
                  <TableHead>Application</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waterData.map((r) => (
                  <TableRow key={r.source}>
                    <TableCell className="font-medium">{r.source}</TableCell>
                    <TableCell className={r.resistivity < 0.5 ? "text-red-400 font-semibold" : ""}>{r.resistivity.toFixed(1)}</TableCell>
                    <TableCell>{r.ph.toFixed(1)}</TableCell>
                    <TableCell>{r.tds.toFixed(1)}</TableCell>
                    <TableCell>{r.conductivity.toFixed(2)}</TableCell>
                    <TableCell>{r.temp.toFixed(1)}</TableCell>
                    <TableCell>{r.use}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
