"use client";
import { useState, useMemo } from "react";
import { equipmentBookings, serviceRequests, getEquipmentAvailability } from "@/lib/data/equipment-scheduling-data";
import type { EquipmentBooking, ServiceRequest } from "@/lib/data/equipment-scheduling-data";

const COLORS: Record<string, string> = { test: "bg-blue-500", maintenance: "bg-yellow-500", calibration: "bg-purple-500", "intermediate-check": "bg-cyan-500", reserved: "bg-orange-400", blocked: "bg-red-500" };
const STATUS_COLORS: Record<string, string> = { pending: "bg-gray-100 text-gray-800", "under-review": "bg-blue-100 text-blue-800", approved: "bg-green-100 text-green-800", scheduled: "bg-purple-100 text-purple-800", rejected: "bg-red-100 text-red-800" };

export default function EquipmentSchedulingDashboard() {
  const [activeTab, setActiveTab] = useState<"calendar" | "requests" | "allocations">("calendar");
  const [selectedBooking, setSelectedBooking] = useState<EquipmentBooking | null>(null);
  const activeBookings = equipmentBookings.filter(b => b.status !== "cancelled" && b.status !== "completed");
  const today = new Date().toISOString().split("T")[0];
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i - 7); return d.toISOString().split("T")[0]; });
  const equipmentIds = [...new Set(equipmentBookings.map(b => b.equipmentId))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Scheduling & Availability</h2>
          <p className="text-muted-foreground">View equipment bookings, service requests, and block slots for projects</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("calendar")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "calendar" ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>Availability Calendar</button>
          <button onClick={() => setActiveTab("requests")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "requests" ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>Service Requests ({serviceRequests.length})</button>
          <button onClick={() => setActiveTab("allocations")} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === "allocations" ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>Slot Allocations</button>
        </div>
      </div>
            {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><div className="text-2xl font-bold text-blue-600">{activeBookings.filter(b=>b.type==="test").length}</div><div className="text-xs text-muted-foreground">Active Tests</div></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><div className="text-2xl font-bold text-yellow-600">{activeBookings.filter(b=>b.type==="maintenance").length}</div><div className="text-xs text-muted-foreground">Maintenance</div></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><div className="text-2xl font-bold text-purple-600">{activeBookings.filter(b=>b.type==="calibration").length}</div><div className="text-xs text-muted-foreground">Calibration</div></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><div className="text-2xl font-bold text-cyan-600">{activeBookings.filter(b=>b.type==="intermediate-check").length}</div><div className="text-xs text-muted-foreground">Int. Checks</div></div>
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4"><div className="text-2xl font-bold text-orange-600">{activeBookings.filter(b=>b.type==="reserved").length}</div><div className="text-xs text-muted-foreground">Reserved</div></div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(COLORS).map(([k,v]) => <span key={k} className="flex items-center gap-1"><span className={`w-3 h-3 rounded ${v}`}/>{k}</span>)}
      </div>
            {activeTab === "calendar" && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl overflow-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b"><th className="p-2 text-left min-w-[180px] sticky left-0 bg-white dark:bg-gray-900">Equipment</th>
              {days.map(d => <th key={d} className={`p-1 min-w-[32px] text-center ${d===today?"bg-orange-100 dark:bg-orange-900/30":""}`}>{new Date(d).getDate()}</th>)}
            </tr></thead>
            <tbody>{equipmentIds.map(eqId => {
              const eqBookings = activeBookings.filter(b => b.equipmentId === eqId);
              const name = eqBookings[0]?.equipmentName || eqId;
              return (<tr key={eqId} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-2 font-medium sticky left-0 bg-white dark:bg-gray-900 text-xs">{name}</td>
                {days.map(d => {
                  const bk = eqBookings.find(b => d >= b.startDate && d <= b.endDate);
                  return <td key={d} className={`p-0 text-center ${d===today?"border-l-2 border-orange-400":""}`}>
                    {bk ? <div className={`w-full h-6 ${COLORS[bk.type]} opacity-80 cursor-pointer`} title={`${bk.type}: ${bk.notes}`} onClick={() => setSelectedBooking(bk)}/> : <div className="w-full h-6 bg-green-100 dark:bg-green-900/20"/>}
                  </td>;
                })}
              </tr>);
            })}</tbody>
          </table>
        </div>
      )}
            {activeTab === "requests" && (
        <div className="space-y-4">{serviceRequests.map(sr => (
          <div key={sr.id} className="bg-white dark:bg-gray-900 border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div><span className="font-bold">{sr.requestNumber}</span> - <span>{sr.clientCompany}</span></div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[sr.status]}`}>{sr.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
              <div><span className="text-muted-foreground">Client:</span> {sr.clientName}</div>
              <div><span className="text-muted-foreground">Modules:</span> {sr.sampleCount}x {sr.moduleType}</div>
              <div><span className="text-muted-foreground">Period:</span> {sr.requestedStart} to {sr.requestedEnd}</div>
              <div><span className="text-muted-foreground">Priority:</span> <span className={sr.priority==="high"?"text-red-500 font-bold":""}>{ sr.priority}</span></div>
            </div>
            <div className="text-xs"><span className="font-medium">Tests:</span> {sr.requiredTests.map(t=>t.testName).join(", ")}</div>
            {sr.equipmentAllocations.length > 0 && <div className="mt-2 text-xs"><span className="font-medium">Equipment Allocated:</span> {sr.equipmentAllocations.map(a=>`${a.equipmentId} (${a.test}: ${a.from} to ${a.to})`).join("; ")}</div>}
            {sr.status === "pending" && <div className="mt-3 flex gap-2"><button className="px-3 py-1 bg-green-500 text-white rounded text-xs">Review & Allocate Equipment</button><button className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs">Reject</button></div>}
          </div>
        ))}</div>
      )}
            {activeTab === "allocations" && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
          <h3 className="font-bold mb-3">Current Equipment Allocations</h3>
          <table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Equipment</th><th className="p-2">Type</th><th className="p-2">Project</th><th className="p-2">Period</th><th className="p-2">Assigned</th><th className="p-2">Status</th></tr></thead>
            <tbody>{activeBookings.map(b => <tr key={b.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={()=>setSelectedBooking(b)}>
              <td className="p-2 font-medium">{b.equipmentName}</td>
              <td className="p-2"><span className={`px-2 py-0.5 rounded text-white text-xs ${COLORS[b.type]}`}>{b.type}</span></td>
              <td className="p-2">{b.projectId || "-"}</td>
              <td className="p-2 text-xs">{b.startDate} to {b.endDate}</td>
              <td className="p-2">{b.assignedTo}</td>
              <td className="p-2"><span className="text-xs font-medium">{b.status}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
      {/* Booking Detail Modal */}
      {selectedBooking && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={()=>setSelectedBooking(null)}>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4" onClick={e=>e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-2">{selectedBooking.equipmentName}</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Type:</span> <span className={`px-2 py-0.5 rounded text-white text-xs ${COLORS[selectedBooking.type]}`}>{selectedBooking.type}</span></div>
            <div><span className="text-muted-foreground">Status:</span> {selectedBooking.status}</div>
            <div><span className="text-muted-foreground">Period:</span> {selectedBooking.startDate} to {selectedBooking.endDate}</div>
            {selectedBooking.projectId && <div><span className="text-muted-foreground">Project:</span> {selectedBooking.projectId}</div>}
            {selectedBooking.testType && <div><span className="text-muted-foreground">Test:</span> {selectedBooking.testType}</div>}
            <div><span className="text-muted-foreground">Assigned:</span> {selectedBooking.assignedTo}</div>
            <div><span className="text-muted-foreground">Notes:</span> {selectedBooking.notes}</div>
          </div>
          <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm w-full" onClick={()=>setSelectedBooking(null)}>Close</button>
        </div>
      </div>}
    </div>
  );
}
