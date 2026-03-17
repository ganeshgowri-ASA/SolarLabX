"use client";
import { useState } from "react";
import { equipmentBookings, serviceRequests } from "@/lib/data/equipment-scheduling-data";
import type { EquipmentBooking, ServiceRequest } from "@/lib/data/equipment-scheduling-data";

const TYPE_COLORS: Record<string, string> = { test: "bg-blue-500", maintenance: "bg-yellow-500", calibration: "bg-purple-500", "intermediate-check": "bg-cyan-500", reserved: "bg-orange-400" };
const STATUS_COLORS: Record<string, string> = { pending: "bg-gray-100 text-gray-800", "under-review": "bg-blue-100 text-blue-800", approved: "bg-green-100 text-green-800", scheduled: "bg-indigo-100 text-indigo-800", rejected: "bg-red-100 text-red-800" };

export default function EquipmentSchedulingDashboard() {
  const [activeTab, setActiveTab] = useState<"calendar" | "requests" | "allocations">("calendar");
  const [selectedBooking, setSelectedBooking] = useState<EquipmentBooking | null>(null);
  const activeBookings = equipmentBookings.filter(b => b.status !== "cancelled" && b.status !== "completed");
  const today = new Date().toISOString().split("T")[0];
  const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i - 7); return d.toISOString().split("T")[0]; });
  const equipmentIds = Array.from(new Set(equipmentBookings.map(b => b.equipmentId)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Scheduling</h2>
          <p className="text-muted-foreground">Manage bookings, calibration & maintenance</p>
        </div>
        <div className="flex gap-2">
          {(["calendar", "requests", "allocations"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "calendar" && (
        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium w-32">Equipment</th>
                {days.map(d => <th key={d} className={`p-1 text-center min-w-[40px] ${d === today ? "bg-primary/10 font-bold" : ""}`}>{new Date(d).getDate()}</th>)}
              </tr>
            </thead>
            <tbody>
              {equipmentIds.map(eqId => (
                <tr key={eqId} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-medium truncate max-w-[120px]">{eqId}</td>
                  {days.map(d => {
                    const booking = activeBookings.find(b => b.equipmentId === eqId && b.startDate <= d && b.endDate >= d);
                    return <td key={d} className="p-0.5"><div className={`h-6 rounded ${booking ? TYPE_COLORS[booking.type] || "bg-gray-400" : ""} ${booking ? "cursor-pointer opacity-80 hover:opacity-100" : ""}`} onClick={() => booking && setSelectedBooking(booking)} title={booking ? `${booking.type}: ${booking.assignedTo}` : ""} /></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "requests" && (
        <div className="space-y-3">
          {serviceRequests.map((req: ServiceRequest) => (
            <div key={req.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{req.requestNumber} - {req.clientCompany}</h3>
                  <p className="text-sm text-muted-foreground">{req.clientName} | {req.moduleType} | {req.sampleCount} samples | Priority: {req.priority}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || ""}`}>{req.status}</span>
              </div>
              <div className="mt-2 text-sm">
                <p className="text-muted-foreground">Tests: {req.requiredTests.map(t => t.testName).join(", ")}</p>
                <p className="text-muted-foreground">Period: {req.requestedStart} to {req.requestedEnd}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "allocations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipmentIds.map(eqId => {
            const eqBookings = equipmentBookings.filter(b => b.equipmentId === eqId);
            const active = eqBookings.filter(b => b.status !== "cancelled" && b.status !== "completed");
            const eqName = eqBookings[0]?.equipmentName || eqId;
            return (
              <div key={eqId} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-1">{eqName}</h3>
                <p className="text-xs text-muted-foreground mb-2">{eqId}</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Active Bookings</span><span className="font-medium">{active.length}</span></div>
                  <div className="flex justify-between"><span>Total Bookings</span><span>{eqBookings.length}</span></div>
                  {active.map(b => (
                    <div key={b.id} className="mt-1 p-2 bg-muted/50 rounded text-xs">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${TYPE_COLORS[b.type] || "bg-gray-400"}`} />
                      {b.type} | {b.assignedTo} | {b.startDate} to {b.endDate}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedBooking(null)}>
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Equipment:</strong> {selectedBooking.equipmentName}</p>
              <p><strong>Type:</strong> {selectedBooking.type}</p>
              <p><strong>Assigned To:</strong> {selectedBooking.assignedTo}</p>
              <p><strong>Date:</strong> {selectedBooking.startDate} to {selectedBooking.endDate}</p>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>Priority:</strong> {selectedBooking.priority}</p>
              {selectedBooking.testType && <p><strong>Test:</strong> {selectedBooking.testType}</p>}
              {selectedBooking.notes && <p><strong>Notes:</strong> {selectedBooking.notes}</p>}
            </div>
            <button className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-lg" onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
