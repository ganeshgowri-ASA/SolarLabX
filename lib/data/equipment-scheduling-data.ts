// @ts-nocheck
export type BookingType = "test" | "maintenance" | "calibration" | "intermediate-check" | "reserved";
export type BookingStatus = "confirmed" | "tentative" | "in-progress" | "completed" | "cancelled";
export type ServiceRequestStatus = "pending" | "under-review" | "approved" | "scheduled" | "rejected";
export interface EquipmentBooking {
  id: string; equipmentId: string; equipmentName: string; type: BookingType; status: BookingStatus;
  startDate: string; endDate: string; projectId: string | null; sampleId: string | null;
  serviceRequestId: string | null; testType: string | null; assignedTo: string;
  priority: "critical" | "high" | "medium" | "low"; notes: string;
}
export interface ServiceRequest {
  id: string; requestNumber: string; clientName: string; clientCompany: string; submittedDate: string;
  requiredTests: { testName: string; standard: string; equipment: string[]; hours: number }[];
  sampleCount: number; moduleType: string; status: ServiceRequestStatus;
  priority: "critical" | "high" | "medium" | "low"; requestedStart: string; requestedEnd: string;
  reviewer: string | null; equipmentAllocations: { equipmentId: string; from: string; to: string; test: string; status: string }[];
}
export interface EquipmentSlot {
  equipmentId: string; date: string; hour: number;
  status: "available" | "booked" | "maintenance" | "calibration" | "check" | "blocked";
  bookingId: string | null; label: string;
}
export const equipmentBookings: EquipmentBooking[] = [
  { id: "BK-001", equipmentId: "EQ-TC-01", equipmentName: "Thermal Cycling Chamber TC-01", type: "test", status: "in-progress", startDate: "2026-03-10", endDate: "2026-04-15", projectId: "PRJ-2026-001", sampleId: "SM-500B #1-4", serviceRequestId: "SR-001", testType: "IEC 61215 MQT 11 - TC200", assignedTo: "Kumar", priority: "high", notes: "TC200 cycle 145/200" },
  { id: "BK-002", equipmentId: "EQ-TC-02", equipmentName: "Thermal Cycling Chamber TC-02", type: "test", status: "in-progress", startDate: "2026-03-12", endDate: "2026-04-20", projectId: "PRJ-2026-004", sampleId: "IS-600T #1-2", serviceRequestId: "SR-004", testType: "IEC 61215 MQT 11 - TC200", assignedTo: "Sharma", priority: "high", notes: "TC200 cycle 120/200" },
  { id: "BK-003", equipmentId: "EQ-TC-04", equipmentName: "Thermal Cycling Chamber TC-04", type: "maintenance", status: "in-progress", startDate: "2026-03-14", endDate: "2026-03-18", projectId: null, sampleId: null, serviceRequestId: null, testType: null, assignedTo: "Maintenance Team", priority: "medium", notes: "Compressor servicing" },
  { id: "BK-004", equipmentId: "EQ-DH-03", equipmentName: "Damp Heat Chamber DH-03", type: "calibration", status: "in-progress", startDate: "2026-03-15", endDate: "2026-03-17", projectId: null, sampleId: null, serviceRequestId: null, testType: null, assignedTo: "ExtCal Services", priority: "high", notes: "Annual calibration overdue" },
  { id: "BK-005", equipmentId: "EQ-SS-01", equipmentName: "Sun Simulator SS-01", type: "test", status: "in-progress", startDate: "2026-03-16", endDate: "2026-03-16", projectId: "PRJ-2026-002", sampleId: "GP-400M #1", serviceRequestId: "SR-002", testType: "IEC 60904-1 STC", assignedTo: "Kumar", priority: "critical", notes: "Initial STC measurement" },
  { id: "BK-006", equipmentId: "EQ-SS-01", equipmentName: "Sun Simulator SS-01", type: "intermediate-check", status: "confirmed", startDate: "2026-03-17", endDate: "2026-03-17", projectId: null, sampleId: null, serviceRequestId: null, testType: null, assignedTo: "Kumar", priority: "medium", notes: "Weekly ref cell check" },
  { id: "BK-007", equipmentId: "EQ-DH-01", equipmentName: "Damp Heat Chamber DH-01", type: "test", status: "in-progress", startDate: "2026-03-01", endDate: "2026-04-12", projectId: "PRJ-2026-001", sampleId: "SM-500B #5-8", serviceRequestId: "SR-001", testType: "IEC 61215 MQT 13 - DH1000", assignedTo: "Sharma", priority: "high", notes: "DH1000 720h/1000h done" },
  { id: "BK-008", equipmentId: "EQ-UV-01", equipmentName: "UV Chamber UV-01", type: "test", status: "in-progress", startDate: "2026-03-05", endDate: "2026-03-20", projectId: "PRJ-2026-001", sampleId: "SM-500B #9-12", serviceRequestId: "SR-001", testType: "IEC 61215 MQT 10 - UV", assignedTo: "Patel", priority: "high", notes: "UV 45/60 kWh/m2" },
  { id: "BK-009", equipmentId: "EQ-TC-05", equipmentName: "Thermal Cycling Chamber TC-05", type: "reserved", status: "confirmed", startDate: "2026-03-20", endDate: "2026-05-01", projectId: "PRJ-2026-005", sampleId: null, serviceRequestId: "SR-005", testType: "IEC 61215 MQT 11 - TC200", assignedTo: "TBD", priority: "medium", notes: "Reserved for Jinko project" },
  { id: "BK-010", equipmentId: "EQ-HP-02", equipmentName: "Hi-pot Tester HP-02", type: "calibration", status: "confirmed", startDate: "2026-03-18", endDate: "2026-03-19", projectId: null, sampleId: null, serviceRequestId: null, testType: null, assignedTo: "ExtCal Services", priority: "high", notes: "Calibration due" },
];
export const serviceRequests: ServiceRequest[] = [
  { id: "SR-001", requestNumber: "SR-2026-001", clientName: "Rajesh Mehta", clientCompany: "SunPower Corp", submittedDate: "2026-02-15", requiredTests: [{ testName: "TC200", standard: "IEC 61215", equipment: ["Climate Chamber"], hours: 840 }, { testName: "DH1000", standard: "IEC 61215", equipment: ["Climate Chamber"], hours: 1100 }, { testName: "UV Preconditioning", standard: "IEC 61215", equipment: ["UV Chamber"], hours: 360 }], sampleCount: 12, moduleType: "SPR-MAX6-450", status: "scheduled", priority: "high", requestedStart: "2026-03-01", requestedEnd: "2026-05-15", reviewer: "Dr. Sharma", equipmentAllocations: [{ equipmentId: "EQ-TC-01", from: "2026-03-10", to: "2026-04-15", test: "TC200", status: "in-use" }, { equipmentId: "EQ-DH-01", from: "2026-03-01", to: "2026-04-12", test: "DH1000", status: "in-use" }] },
  { id: "SR-005", requestNumber: "SR-2026-005", clientName: "Wei Zhang", clientCompany: "Jinko Solar", submittedDate: "2026-03-10", requiredTests: [{ testName: "TC200", standard: "IEC 61215", equipment: ["Climate Chamber"], hours: 840 }, { testName: "DH1000", standard: "IEC 61215", equipment: ["Climate Chamber"], hours: 1100 }], sampleCount: 8, moduleType: "Tiger Neo N-type", status: "approved", priority: "medium", requestedStart: "2026-03-20", requestedEnd: "2026-06-01", reviewer: "Dr. Sharma", equipmentAllocations: [{ equipmentId: "EQ-TC-05", from: "2026-03-20", to: "2026-05-01", test: "TC200", status: "confirmed" }] },
  { id: "SR-006", requestNumber: "SR-2026-006", clientName: "Amit Patel", clientCompany: "Adani Solar", submittedDate: "2026-03-14", requiredTests: [{ testName: "Full IEC 61215", standard: "IEC 61215", equipment: ["Climate Chamber", "Sun Simulator", "UV Chamber", "Hi-pot Tester"], hours: 2500 }], sampleCount: 16, moduleType: "Mono PERC 540W", status: "pending", priority: "high", requestedStart: "2026-04-01", requestedEnd: "2026-07-15", reviewer: null, equipmentAllocations: [] },
];
export function getEquipmentAvailability(equipmentId: string, startDate: string, endDate: string): { date: string; available: boolean; booking: EquipmentBooking | null }[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result: { date: string; available: boolean; booking: EquipmentBooking | null }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const booking = equipmentBookings.find(b => b.equipmentId === equipmentId && b.status !== "cancelled" && dateStr >= b.startDate && dateStr <= b.endDate);
    result.push({ date: dateStr, available: !booking, booking: booking || null });
  }
  return result;
}
export function getAvailableEquipmentForPeriod(category: string, startDate: string, endDate: string): { equipmentId: string; equipmentName: string; conflicts: EquipmentBooking[] }[] {
  const { equipment } = require("./equipment-data");
  return equipment.filter((e: any) => e.category === category).map((e: any) => {
    const conflicts = equipmentBookings.filter(b => b.equipmentId === e.id && b.status !== "cancelled" && b.startDate <= endDate && b.endDate >= startDate);
    return { equipmentId: e.id, equipmentName: e.name, conflicts };
  });
}
