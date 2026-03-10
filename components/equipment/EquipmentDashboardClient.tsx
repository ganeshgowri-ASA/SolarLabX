"use client";

import { useState } from "react";
import { equipment, chamberStatuses, outdoorTestPositions, testFlowSteps, technicians } from "@/lib/data/equipment-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EquipmentRegistry from "@/components/equipment/EquipmentRegistry";
import ChamberDashboard from "@/components/equipment/ChamberDashboard";
import OutdoorTestbedMap from "@/components/equipment/OutdoorTestbedMap";
import TestFlowRoute from "@/components/equipment/TestFlowRoute";
import TechnicianView from "@/components/equipment/TechnicianView";

const categories = [
  "All",
  "Climate Chamber",
  "Sun Simulator",
  "UV Chamber",
  "EL Camera",
  "IR Camera",
  "IV Tracer",
  "Hi-pot Tester",
  "Mechanical Load",
  "Insulation Tester",
];

export default function EquipmentDashboardClient() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const totalEquipment = equipment.length;
  const inUse = equipment.filter((e) => e.status === "In-Use").length;
  const available = equipment.filter((e) => e.status === "Available").length;
  const maintenance = equipment.filter((e) => e.status === "Maintenance" || e.status === "Calibration").length;
  const calibrationDue = equipment.filter((e) => e.calibration.status === "Due Soon" || e.calibration.status === "Overdue").length;
  const avgUtilization = Math.round(equipment.reduce((sum, e) => sum + e.kpis.utilizationRate, 0) / totalEquipment);
  const avgAvailability = Math.round(equipment.reduce((sum, e) => sum + e.kpis.availability, 0) / totalEquipment);

  const occupiedPositions = outdoorTestPositions.filter((p) => p.status === "Occupied").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipment & Resources</h1>
          <p className="text-sm text-muted-foreground">Equipment registry, calibration, TPM, and resource management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Equipment data exported successfully")}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </Button>
          <Button size="sm" onClick={() => toast.info("Add equipment form coming soon")}>+ Add Equipment</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Equipment</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{totalEquipment}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">In Use</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{inUse}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Available</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Maintenance</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{maintenance}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cal. Due</p>
            <p className="text-xl font-bold text-red-600 mt-0.5">{calibrationDue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Util.</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{avgUtilization}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Avail.</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{avgAvailability}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="registry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registry">Equipment Registry</TabsTrigger>
          <TabsTrigger value="chambers">Chambers ({chamberStatuses.length})</TabsTrigger>
          <TabsTrigger value="outdoor">Outdoor Testbed ({occupiedPositions}/72)</TabsTrigger>
          <TabsTrigger value="flow">Test Flow</TabsTrigger>
          <TabsTrigger value="manpower">Manpower</TabsTrigger>
        </TabsList>

        <TabsContent value="registry">
          <div className="flex items-center gap-3 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <EquipmentRegistry equipment={equipment} selectedCategory={selectedCategory} />
        </TabsContent>

        <TabsContent value="chambers">
          <ChamberDashboard chambers={chamberStatuses} />
        </TabsContent>

        <TabsContent value="outdoor">
          <OutdoorTestbedMap positions={outdoorTestPositions} />
        </TabsContent>

        <TabsContent value="flow">
          <TestFlowRoute steps={testFlowSteps} />
        </TabsContent>

        <TabsContent value="manpower">
          <TechnicianView technicians={technicians} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
