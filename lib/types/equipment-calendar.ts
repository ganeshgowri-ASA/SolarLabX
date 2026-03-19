export type EquipmentCalendarStatus =
  | "running"
  | "booked"
  | "breakdown"
  | "maintenance"
  | "calibration"
  | "intermediate-check"
  | "upgradation";

export type CalendarViewMode = "month" | "week" | "day";

export interface EquipmentCalendarEvent {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentCategory: string;
  status: EquipmentCalendarStatus;
  title: string;
  startDate: string;
  endDate: string;
  testName: string | null;
  sampleId: string | null;
  projectId: string | null;
  projectName: string | null;
  operator: string;
  notes: string;
}
