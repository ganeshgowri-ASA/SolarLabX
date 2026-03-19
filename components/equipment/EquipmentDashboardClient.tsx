// @ts-nocheck
"use client";

import { useState, useMemo, useRef } from "react";
import { equipment as initialEquipment, chamberStatuses, outdoorTestPositions, testFlowSteps, technicians } from "@/lib/data/equipment-data";
import { Equipment, EquipmentStatus, EquipmentCategory } from "@/lib/types/equipment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import EquipmentRegistry from "@/components/equipment/EquipmentRegistry";
import ChamberDashboard from "@/components/equipment/ChamberDashboard";
import OutdoorTestbedMap from "@/components/equipment/OutdoorTestbedMap";
import TestFlowRoute from "@/components/equipment/TestFlowRoute";
import TechnicianView from "@/components/equipment/TechnicianView";
import EquipmentFormDialog from "@/components/equipment/EquipmentFormDialog";
import EquipmentCalendarView from "@/components/equipment/EquipmentCalendarView";
import ChamberTestsManager from "@/components/chamber-tests/ChamberTestsManager";
import { chamberTests } from "@/lib/data/chamber-tests-data";

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

const statusColors: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  "In-Use": "bg-blue-100 text-blue-700",
  Maintenance: "bg-amber-100 text-amber-700",
  Calibration: "bg-purple-100 text-purple-700",
};

const calibrationStatusColors: Record<string, string> = {
  Valid: "text-green-600",
  "Due Soon": "text-amber-600",
  Overdue: "text-red-600",
};

export default function EquipmentDashboardClient() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([...initialEquipment]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // KPI computations
  const stats = useMemo(() => {
    const total = equipmentList.length;
    const inUse = equipmentList.filter((e) => e.status === "In-Use").length;
    const available = equipmentList.filter((e) => e.status === "Available").length;
    const maintenance = equipmentList.filter((e) => e.status === "Maintenance").length;
    const calibration = equipmentList.filter((e) => e.status === "Calibration").length;
    const calDueSoon = equipmentList.filter((e) => e.calibration.status === "Due Soon").length;
    const calOverdue = equipmentList.filter((e) => e.calibration.status === "Overdue").length;
    const calValid = equipmentList.filter((e) => e.calibration.status === "Valid").length;
    const avgUtil = total > 0 ? Math.round(equipmentList.reduce((s, e) => s + e.kpis.utilizationRate, 0) / total) : 0;
    const avgAvail = total > 0 ? Math.round(equipmentList.reduce((s, e) => s + e.kpis.availability, 0) / total) : 0;

    // Per-category availability rates
    const categoryStats = categories.slice(1).map((cat) => {
      const catEq = equipmentList.filter((e) => e.category === cat);
      const count = catEq.length;
      const availRate = count > 0 ? Math.round(catEq.reduce((s, e) => s + e.kpis.availability, 0) / count) : 0;
      const utilRate = count > 0 ? Math.round(catEq.reduce((s, e) => s + e.kpis.utilizationRate, 0) / count) : 0;
      return { category: cat, count, availRate, utilRate };
    }).filter((c) => c.count > 0);

    return { total, inUse, available, maintenance, calibration, calDueSoon, calOverdue, calValid, avgUtil, avgAvail, categoryStats };
  }, [equipmentList]);

  const occupiedPositions = outdoorTestPositions.filter((p) => p.status === "Occupied").length;

  // Equipment CRUD handlers
  function handleAddOrEditEquipment(eq: Equipment) {
    setEquipmentList((prev) => {
      const existing = prev.findIndex((e) => e.id === eq.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = eq;
        return updated;
      }
      return [...prev, eq];
    });
    setEditingEquipment(null);
  }

  function handleEditClick(eq: Equipment) {
    setEditingEquipment(eq);
    setFormOpen(true);
  }

  function handleStatusChange(eqId: string, newStatus: EquipmentStatus) {
    setEquipmentList((prev) =>
      prev.map((e) =>
        e.id === eqId
          ? {
              ...e,
              status: newStatus,
              currentProject: newStatus === "Available" ? null : e.currentProject,
              currentSample: newStatus === "Available" ? null : e.currentSample,
            }
          : e
      )
    );
    setStatusChangeId(null);
  }

  function handleDownloadReport() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* Print-only report header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold">SolarLabX - Equipment Availability Report</h1>
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipment & Resources</h1>
          <p className="text-sm text-muted-foreground">Equipment registry, calibration, TPM, and resource management</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadReport}>
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Equipment Report
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingEquipment(null);
              setFormOpen(true);
            }}
          >
            + Add Equipment
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div ref={reportRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 print:grid-cols-7">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Equipment</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">In Use</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{stats.inUse}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Available</p>
            <p className="text-xl font-bold text-green-600 mt-0.5">{stats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Maintenance</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{stats.maintenance}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Calibration</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{stats.calibration}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Util.</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{stats.avgUtil}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Avail.</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{stats.avgAvail}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Availability Rate KPIs per Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Equipment Utilization by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.categoryStats.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{cat.category}</span>
                  <span className="text-muted-foreground">{cat.utilRate}% ({cat.count} units)</span>
                </div>
                <div className="h-5 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      cat.utilRate >= 80 ? "bg-red-500" : cat.utilRate >= 50 ? "bg-amber-500" : "bg-green-500"
                    )}
                    style={{ width: `${cat.utilRate}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground">
                    {cat.utilRate}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Calibration Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-green-50">
                <p className="text-2xl font-bold text-green-600">{stats.calValid}</p>
                <p className="text-xs text-green-700 mt-1">Up to Date</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50">
                <p className="text-2xl font-bold text-amber-600">{stats.calDueSoon}</p>
                <p className="text-xs text-amber-700 mt-1">Due Soon</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50">
                <p className="text-2xl font-bold text-red-600">{stats.calOverdue}</p>
                <p className="text-xs text-red-700 mt-1">Overdue</p>
              </div>
            </div>

            {/* List equipment with upcoming calibration */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Calibration Attention Required</p>
              {equipmentList
                .filter((e) => e.calibration.status === "Due Soon" || e.calibration.status === "Overdue")
                .map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded border text-xs">
                    <div>
                      <span className="font-medium text-foreground">{e.name}</span>
                      <span className="text-muted-foreground ml-2">({e.id})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Due: {new Date(e.calibration.nextDue).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                      <Badge className={cn("text-[10px]", e.calibration.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                        {e.calibration.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              {equipmentList.filter((e) => e.calibration.status === "Due Soon" || e.calibration.status === "Overdue").length === 0 && (
                <p className="text-xs text-muted-foreground py-2">All calibrations are up to date.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Rate per Category */}
      <Card className="print:break-before-page">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Availability Rate by Equipment Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.categoryStats.map((cat) => (
              <div key={cat.category} className="text-center p-3 rounded-lg border">
                <p className="text-xs font-medium text-muted-foreground mb-1 truncate">{cat.category}</p>
                <p className={cn(
                  "text-2xl font-bold",
                  cat.availRate >= 95 ? "text-green-600" : cat.availRate >= 85 ? "text-amber-600" : "text-red-600"
                )}>
                  {cat.availRate}%
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cat.count} units</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="registry" className="space-y-4 print:hidden">
        <TabsList>
          <TabsTrigger value="registry">Equipment Registry</TabsTrigger>
          <TabsTrigger value="calendar">Equipment Calendar</TabsTrigger>
          <TabsTrigger value="chamber-tests">Chamber Tests</TabsTrigger>
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
          <EquipmentRegistryWithActions
            equipment={equipmentList}
            selectedCategory={selectedCategory}
            onEdit={handleEditClick}
            onStatusChange={handleStatusChange}
            statusChangeId={statusChangeId}
            onToggleStatusChange={setStatusChangeId}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <EquipmentCalendarView />
        </TabsContent>

        <TabsContent value="chamber-tests">
          <ChamberTestsManager tests={chamberTests} />
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

      {/* Print-only: full equipment list table */}
      <div className="hidden print:block">
        <h2 className="text-base font-bold mb-3 mt-6">Equipment List with Status</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-1 font-semibold">ID</th>
              <th className="text-left p-1 font-semibold">Name</th>
              <th className="text-left p-1 font-semibold">Category</th>
              <th className="text-left p-1 font-semibold">Status</th>
              <th className="text-left p-1 font-semibold">Location</th>
              <th className="text-right p-1 font-semibold">Util %</th>
              <th className="text-right p-1 font-semibold">Avail %</th>
              <th className="text-left p-1 font-semibold">Cal Due</th>
              <th className="text-left p-1 font-semibold">Cal Status</th>
            </tr>
          </thead>
          <tbody>
            {equipmentList.map((eq) => (
              <tr key={eq.id} className="border-b">
                <td className="p-1">{eq.id}</td>
                <td className="p-1">{eq.name}</td>
                <td className="p-1">{eq.category}</td>
                <td className="p-1">{eq.status}</td>
                <td className="p-1">{eq.location}</td>
                <td className="p-1 text-right">{eq.kpis.utilizationRate}%</td>
                <td className="p-1 text-right">{eq.kpis.availability}%</td>
                <td className="p-1">{new Date(eq.calibration.nextDue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className={cn("p-1", calibrationStatusColors[eq.calibration.status])}>{eq.calibration.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipment Add/Edit Dialog */}
      <EquipmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleAddOrEditEquipment}
        editingEquipment={editingEquipment}
      />

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)) !important; }
          .print\\:break-before-page { break-before: page; }
          nav, header, aside, footer { display: none !important; }
          @page { margin: 1cm; size: A4 landscape; }
        }
      `}</style>
    </div>
  );
}

/* Extended equipment registry with edit/status-change actions */
interface EquipmentRegistryWithActionsProps {
  equipment: Equipment[];
  selectedCategory: string;
  onEdit: (eq: Equipment) => void;
  onStatusChange: (id: string, status: EquipmentStatus) => void;
  statusChangeId: string | null;
  onToggleStatusChange: (id: string | null) => void;
}

const statusColorMap: Record<string, string> = {
  Available: "bg-green-100 text-green-700",
  "In-Use": "bg-blue-100 text-blue-700",
  Maintenance: "bg-amber-100 text-amber-700",
  Calibration: "bg-purple-100 text-purple-700",
};

const calStatusColorMap: Record<string, string> = {
  Valid: "bg-green-100 text-green-700",
  "Due Soon": "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-700",
};

const ALL_STATUSES: EquipmentStatus[] = ["Available", "In-Use", "Maintenance", "Calibration"];

function EquipmentRegistryWithActions({
  equipment,
  selectedCategory,
  onEdit,
  onStatusChange,
  statusChangeId,
  onToggleStatusChange,
}: EquipmentRegistryWithActionsProps) {
  const filtered = selectedCategory === "All"
    ? equipment
    : equipment.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground mb-2">{filtered.length} equipment items</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((eq) => (
          <Card key={eq.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{eq.name}</h3>
                  <p className="text-xs text-muted-foreground">{eq.manufacturer} {eq.model}</p>
                </div>
                <Badge className={cn("text-[10px] shrink-0 ml-2", statusColorMap[eq.status])}>
                  {eq.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <div><span className="font-medium text-foreground">S/N:</span> {eq.serialNumber}</div>
                <div><span className="font-medium text-foreground">Location:</span> {eq.location}</div>
              </div>

              {eq.currentProject && (
                <div className="text-xs bg-muted/50 rounded p-2 mb-3">
                  <span className="font-medium text-foreground">Project:</span> {eq.currentProject}
                  {eq.currentSample && <span className="ml-2 text-muted-foreground">| {eq.currentSample}</span>}
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Calibration</span>
                <Badge className={cn("text-[10px]", calStatusColorMap[eq.calibration.status])}>
                  {eq.calibration.status}
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mb-3">
                Next due: {new Date(eq.calibration.nextDue).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{eq.kpis.utilizationRate}%</p>
                  <p className="text-[9px] text-muted-foreground">Utilization</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{eq.kpis.availability}%</p>
                  <p className="text-[9px] text-muted-foreground">Availability</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{eq.kpis.mtbf}h</p>
                  <p className="text-[9px] text-muted-foreground">MTBF</p>
                </div>
              </div>

              <div className="mt-2">
                <Progress
                  value={eq.kpis.utilizationRate}
                  className={cn(
                    "h-1.5",
                    eq.kpis.utilizationRate >= 90 && "[&>div]:bg-red-500",
                    eq.kpis.utilizationRate >= 70 && eq.kpis.utilizationRate < 90 && "[&>div]:bg-amber-500"
                  )}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                <Button variant="outline" size="sm" className="text-xs h-7 flex-1" onClick={() => onEdit(eq)}>
                  Edit
                </Button>
                <div className="relative flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 w-full"
                    onClick={() => onToggleStatusChange(statusChangeId === eq.id ? null : eq.id)}
                  >
                    Change Status
                  </Button>
                  {statusChangeId === eq.id && (
                    <div className="absolute top-8 right-0 z-10 bg-background border rounded-md shadow-lg p-1 min-w-[140px]">
                      {ALL_STATUSES.filter((s) => s !== eq.status).map((s) => (
                        <button
                          key={s}
                          className="w-full text-left text-xs px-3 py-1.5 hover:bg-muted rounded-sm"
                          onClick={() => onStatusChange(eq.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
