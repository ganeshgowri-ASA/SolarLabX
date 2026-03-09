export type EquipmentCategory =
  | "Climate Chamber"
  | "Sun Simulator"
  | "Outdoor Test Bed"
  | "EL Camera"
  | "IR Camera"
  | "IV Tracer"
  | "Hi-pot Tester"
  | "Mechanical Load"
  | "UV Chamber"
  | "Insulation Tester";

export type EquipmentStatus = "Available" | "In-Use" | "Maintenance" | "Calibration";

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  serialNumber: string;
  manufacturer: string;
  model: string;
  location: string;
  status: EquipmentStatus;
  currentProject: string | null;
  currentSample: string | null;
  calibration: CalibrationInfo;
  kpis: EquipmentKPIs;
  maintenanceHistory: MaintenanceRecord[];
  pmChecklist: PMChecklistItem[];
}

export interface CalibrationInfo {
  lastCalibrated: string;
  nextDue: string;
  certificateNumber: string;
  calibratedBy: string;
  status: "Valid" | "Due Soon" | "Overdue";
  history: CalibrationRecord[];
}

export interface CalibrationRecord {
  id: string;
  date: string;
  certificateNumber: string;
  calibratedBy: string;
  result: "Pass" | "Conditional" | "Fail";
  notes: string;
}

export interface EquipmentKPIs {
  utilizationRate: number;
  mtbf: number; // Mean Time Between Failures (hours)
  mttr: number; // Mean Time To Repair (hours)
  availability: number; // percentage
  totalRunHours: number;
  breakdownCount: number;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: "Preventive" | "Breakdown" | "Corrective";
  description: string;
  technician: string;
  downtime: number; // hours
  cost: number;
  status: "Completed" | "Pending" | "In Progress";
}

export interface PMChecklistItem {
  id: string;
  task: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual";
  lastCompleted: string;
  nextDue: string;
  assignee: string;
  status: "Done" | "Due" | "Overdue";
}

export interface OutdoorTestPosition {
  position: number;
  moduleId: string | null;
  sampleId: string | null;
  projectId: string | null;
  projectName: string | null;
  status: "Occupied" | "Available" | "Reserved";
  installDate: string | null;
}

export interface ChamberStatus {
  id: string;
  name: string;
  status: EquipmentStatus;
  currentTest: string | null;
  testType: string | null;
  projectId: string | null;
  progress: number;
  timeRemaining: string | null;
  temperature: number | null;
  humidity: number | null;
  setpointTemp: number | null;
  setpointHumidity: number | null;
}

export interface TestFlowStep {
  id: string;
  station: string;
  equipment: string;
  status: "Completed" | "Active" | "Pending";
  duration: string;
  order: number;
}

export interface Technician {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  certifications: string[];
  availability: "Available" | "Busy" | "On Leave";
  currentTask: string | null;
  hoursThisWeek: number;
  maxHoursPerWeek: number;
}
