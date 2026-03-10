export type ChamberTestType = "TC" | "HF" | "DH" | "UV" | "Hot Spot";

export type ChamberTestStatus = "Scheduled" | "Running" | "Completed" | "Paused" | "Failed";

export interface ChamberTest {
  id: string;
  chamberId: string;
  chamberName: string;
  testType: ChamberTestType;
  testName: string;
  standard: string;
  projectId: string;
  projectName: string;
  sampleIds: string[];
  status: ChamberTestStatus;
  parameters: ChamberTestParameters;
  schedule: ChamberTestSchedule;
  loadingPlan: ChamberLoadingSlot[];
  cycleData?: CycleData;
}

export interface ChamberTestParameters {
  tempMin: number;
  tempMax: number;
  humidityMin: number | null;
  humidityMax: number | null;
  rampRate: number;
  dwellTime: number;
  totalCycles: number;
  totalDuration: number; // hours
  uvIntensity: number | null;
}

export interface ChamberTestSchedule {
  startDate: string;
  endDate: string;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletion: string | null;
}

export interface ChamberLoadingSlot {
  position: number;
  moduleId: string;
  sampleId: string;
  orientation: "Portrait" | "Landscape";
}

export interface CycleData {
  totalCycles: number;
  completedCycles: number;
  currentCycleNumber: number;
  cycleGroups: CycleGroup[];
  anomalies: CycleAnomaly[];
  temperatureLog: TemperatureLogEntry[];
}

export interface CycleGroup {
  id: string;
  name: string;
  mqtRef: string;
  requiredCycles: number;
  completedCycles: number;
  status: "Pass" | "Fail" | "In Progress" | "Pending";
  startCycle: number;
  endCycle: number;
}

export interface CycleAnomaly {
  id: string;
  cycleNumber: number;
  timestamp: string;
  type: "Temperature Excursion" | "Humidity Deviation" | "Power Failure" | "Ramp Rate Violation" | "Door Open";
  severity: "Critical" | "Major" | "Minor";
  description: string;
  value: number;
  limit: number;
  resolved: boolean;
}

export interface TemperatureLogEntry {
  timestamp: string;
  cycle: number;
  temperature: number;
  humidity: number | null;
  setpointTemp: number;
  setpointHumidity: number | null;
  phase: "Ramp Up" | "Dwell Hot" | "Ramp Down" | "Dwell Cold" | "Stable";
}

export interface ChamberScheduleEvent {
  id: string;
  chamberId: string;
  chamberName: string;
  testId: string;
  testName: string;
  testType: ChamberTestType;
  projectId: string;
  startDate: string;
  endDate: string;
  status: ChamberTestStatus;
  color: string;
}

export interface ChamberUtilization {
  chamberId: string;
  chamberName: string;
  totalHours: number;
  runningHours: number;
  idleHours: number;
  maintenanceHours: number;
  utilizationPercent: number;
  testsCompleted: number;
  testsInProgress: number;
}
