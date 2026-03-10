import {
  ChamberTest,
  ChamberScheduleEvent,
  ChamberUtilization,
} from "@/lib/types/chamber-tests";

export const chamberTests: ChamberTest[] = [
  {
    id: "CT-001",
    chamberId: "EQ-TC-01",
    chamberName: "TC-01",
    testType: "TC",
    testName: "TC200 Thermal Cycling",
    standard: "IEC 61215 MQT 11",
    projectId: "PRJ-2026-001",
    projectName: "SolarMax 500W IEC Qualification",
    sampleIds: ["SM-500B-1", "SM-500B-2", "SM-500B-3", "SM-500B-4"],
    status: "Running",
    parameters: {
      tempMin: -40,
      tempMax: 85,
      humidityMin: null,
      humidityMax: null,
      rampRate: 100,
      dwellTime: 10,
      totalCycles: 200,
      totalDuration: 1200,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-02-05",
      endDate: "2026-04-10",
      startedAt: "2026-02-05T08:00:00",
      completedAt: null,
      estimatedCompletion: "2026-04-08",
    },
    loadingPlan: [
      { position: 1, moduleId: "SM-500B-1", sampleId: "S-001-1", orientation: "Portrait" },
      { position: 2, moduleId: "SM-500B-2", sampleId: "S-001-2", orientation: "Portrait" },
      { position: 3, moduleId: "SM-500B-3", sampleId: "S-001-3", orientation: "Portrait" },
      { position: 4, moduleId: "SM-500B-4", sampleId: "S-001-4", orientation: "Portrait" },
    ],
    cycleData: {
      totalCycles: 200,
      completedCycles: 70,
      currentCycleNumber: 71,
      cycleGroups: [
        { id: "CG-001-1", name: "TC50", mqtRef: "MQT 11.1", requiredCycles: 50, completedCycles: 50, status: "Pass", startCycle: 1, endCycle: 50 },
        { id: "CG-001-2", name: "TC100", mqtRef: "MQT 11.2", requiredCycles: 100, completedCycles: 70, status: "In Progress", startCycle: 1, endCycle: 100 },
        { id: "CG-001-3", name: "TC200", mqtRef: "MQT 11.3", requiredCycles: 200, completedCycles: 70, status: "In Progress", startCycle: 1, endCycle: 200 },
      ],
      anomalies: [
        { id: "AN-001", cycleNumber: 23, timestamp: "2026-02-18T14:30:00", type: "Temperature Excursion", severity: "Minor", description: "Max temp reached 86.2°C (limit 85±2°C)", value: 86.2, limit: 87, resolved: true },
        { id: "AN-002", cycleNumber: 45, timestamp: "2026-02-28T02:15:00", type: "Power Failure", severity: "Major", description: "UPS switchover, 3 min interruption", value: 3, limit: 5, resolved: true },
        { id: "AN-003", cycleNumber: 67, timestamp: "2026-03-08T09:45:00", type: "Ramp Rate Violation", severity: "Minor", description: "Ramp rate 115°C/h exceeds 100°C/h max", value: 115, limit: 100, resolved: false },
      ],
      temperatureLog: generateTemperatureLog(70, -40, 85),
    },
  },
  {
    id: "CT-002",
    chamberId: "EQ-TC-02",
    chamberName: "TC-02",
    testType: "TC",
    testName: "TC50 Supplementary",
    standard: "IEC 61215 MQT 11",
    projectId: "PRJ-2026-004",
    projectName: "IndiaSolar 600W Qualification",
    sampleIds: ["IS-600T-1", "IS-600T-2"],
    status: "Running",
    parameters: {
      tempMin: -40,
      tempMax: 85,
      humidityMin: null,
      humidityMax: null,
      rampRate: 100,
      dwellTime: 10,
      totalCycles: 50,
      totalDuration: 300,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-02-20",
      endDate: "2026-03-25",
      startedAt: "2026-02-20T06:00:00",
      completedAt: null,
      estimatedCompletion: "2026-03-22",
    },
    loadingPlan: [
      { position: 1, moduleId: "IS-600T-1", sampleId: "S-004-1", orientation: "Landscape" },
      { position: 2, moduleId: "IS-600T-2", sampleId: "S-004-2", orientation: "Landscape" },
    ],
    cycleData: {
      totalCycles: 50,
      completedCycles: 34,
      currentCycleNumber: 35,
      cycleGroups: [
        { id: "CG-002-1", name: "TC50", mqtRef: "MQT 11.1", requiredCycles: 50, completedCycles: 34, status: "In Progress", startCycle: 1, endCycle: 50 },
      ],
      anomalies: [],
      temperatureLog: generateTemperatureLog(34, -40, 85),
    },
  },
  {
    id: "CT-003",
    chamberId: "EQ-TC-03",
    chamberName: "TC-03",
    testType: "TC",
    testName: "TC200 Extended",
    standard: "IEC 61215 MQT 11",
    projectId: "PRJ-2026-002",
    projectName: "GreenPower 400W Qualification",
    sampleIds: ["GP-400M-1"],
    status: "Running",
    parameters: {
      tempMin: -40,
      tempMax: 85,
      humidityMin: null,
      humidityMax: null,
      rampRate: 100,
      dwellTime: 10,
      totalCycles: 200,
      totalDuration: 1200,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-02-25",
      endDate: "2026-04-28",
      startedAt: "2026-02-25T08:00:00",
      completedAt: null,
      estimatedCompletion: "2026-04-25",
    },
    loadingPlan: [
      { position: 1, moduleId: "GP-400M-1", sampleId: "S-003-1", orientation: "Portrait" },
    ],
    cycleData: {
      totalCycles: 200,
      completedCycles: 30,
      currentCycleNumber: 31,
      cycleGroups: [
        { id: "CG-003-1", name: "TC50", mqtRef: "MQT 11.1", requiredCycles: 50, completedCycles: 30, status: "In Progress", startCycle: 1, endCycle: 50 },
        { id: "CG-003-2", name: "TC200", mqtRef: "MQT 11.3", requiredCycles: 200, completedCycles: 30, status: "In Progress", startCycle: 1, endCycle: 200 },
      ],
      anomalies: [
        { id: "AN-004", cycleNumber: 12, timestamp: "2026-03-03T11:20:00", type: "Door Open", severity: "Minor", description: "Chamber door opened during ramp phase for 45 seconds", value: 45, limit: 60, resolved: true },
      ],
      temperatureLog: generateTemperatureLog(30, -40, 85),
    },
  },
  {
    id: "CT-004",
    chamberId: "EQ-DH-01",
    chamberName: "DH-01",
    testType: "DH",
    testName: "DH1000 Damp Heat",
    standard: "IEC 61215 MQT 13",
    projectId: "PRJ-2026-001",
    projectName: "SolarMax 500W IEC Qualification",
    sampleIds: ["SM-500B-5", "SM-500B-6", "SM-500B-7", "SM-500B-8"],
    status: "Running",
    parameters: {
      tempMin: 85,
      tempMax: 85,
      humidityMin: 85,
      humidityMax: 85,
      rampRate: 60,
      dwellTime: 1000,
      totalCycles: 1,
      totalDuration: 1000,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-02-05",
      endDate: "2026-03-30",
      startedAt: "2026-02-05T10:00:00",
      completedAt: null,
      estimatedCompletion: "2026-03-28",
    },
    loadingPlan: [
      { position: 1, moduleId: "SM-500B-5", sampleId: "S-001-5", orientation: "Portrait" },
      { position: 2, moduleId: "SM-500B-6", sampleId: "S-001-6", orientation: "Portrait" },
      { position: 3, moduleId: "SM-500B-7", sampleId: "S-001-7", orientation: "Portrait" },
      { position: 4, moduleId: "SM-500B-8", sampleId: "S-001-8", orientation: "Portrait" },
    ],
    cycleData: {
      totalCycles: 1,
      completedCycles: 0,
      currentCycleNumber: 1,
      cycleGroups: [
        { id: "CG-004-1", name: "DH1000", mqtRef: "MQT 13.1", requiredCycles: 1, completedCycles: 0, status: "In Progress", startCycle: 1, endCycle: 1 },
      ],
      anomalies: [
        { id: "AN-005", cycleNumber: 1, timestamp: "2026-02-20T03:10:00", type: "Humidity Deviation", severity: "Minor", description: "Humidity dropped to 82.5%RH for 15 min", value: 82.5, limit: 83, resolved: true },
      ],
      temperatureLog: generateDHTemperatureLog(500),
    },
  },
  {
    id: "CT-005",
    chamberId: "EQ-DH-02",
    chamberName: "DH-02",
    testType: "DH",
    testName: "DH500 Pre-qualification",
    standard: "Internal Protocol",
    projectId: "PRJ-2026-004",
    projectName: "IndiaSolar 600W Qualification",
    sampleIds: ["IS-600T-3", "IS-600T-4"],
    status: "Running",
    parameters: {
      tempMin: 85,
      tempMax: 85,
      humidityMin: 85,
      humidityMax: 85,
      rampRate: 60,
      dwellTime: 500,
      totalCycles: 1,
      totalDuration: 500,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-02-15",
      endDate: "2026-03-15",
      startedAt: "2026-02-15T08:00:00",
      completedAt: null,
      estimatedCompletion: "2026-03-12",
    },
    loadingPlan: [
      { position: 1, moduleId: "IS-600T-3", sampleId: "S-004-3", orientation: "Landscape" },
      { position: 2, moduleId: "IS-600T-4", sampleId: "S-004-4", orientation: "Landscape" },
    ],
    cycleData: {
      totalCycles: 1,
      completedCycles: 0,
      currentCycleNumber: 1,
      cycleGroups: [
        { id: "CG-005-1", name: "DH500", mqtRef: "Internal", requiredCycles: 1, completedCycles: 0, status: "In Progress", startCycle: 1, endCycle: 1 },
      ],
      anomalies: [],
      temperatureLog: generateDHTemperatureLog(375),
    },
  },
  {
    id: "CT-006",
    chamberId: "EQ-UV-01",
    chamberName: "UV-01",
    testType: "UV",
    testName: "UV Preconditioning 15kWh/m²",
    standard: "IEC 61215 MQT 10",
    projectId: "PRJ-2026-001",
    projectName: "SolarMax 500W IEC Qualification",
    sampleIds: ["SM-500B-9", "SM-500B-10", "SM-500B-11", "SM-500B-12"],
    status: "Running",
    parameters: {
      tempMin: 60,
      tempMax: 60,
      humidityMin: null,
      humidityMax: null,
      rampRate: 30,
      dwellTime: 0,
      totalCycles: 1,
      totalDuration: 480,
      uvIntensity: 250,
    },
    schedule: {
      startDate: "2026-02-15",
      endDate: "2026-03-18",
      startedAt: "2026-02-15T06:00:00",
      completedAt: null,
      estimatedCompletion: "2026-03-16",
    },
    loadingPlan: [
      { position: 1, moduleId: "SM-500B-9", sampleId: "S-001-9", orientation: "Portrait" },
      { position: 2, moduleId: "SM-500B-10", sampleId: "S-001-10", orientation: "Portrait" },
      { position: 3, moduleId: "SM-500B-11", sampleId: "S-001-11", orientation: "Portrait" },
      { position: 4, moduleId: "SM-500B-12", sampleId: "S-001-12", orientation: "Portrait" },
    ],
    cycleData: {
      totalCycles: 1,
      completedCycles: 0,
      currentCycleNumber: 1,
      cycleGroups: [
        { id: "CG-006-1", name: "UV 15kWh/m²", mqtRef: "MQT 10", requiredCycles: 1, completedCycles: 0, status: "In Progress", startCycle: 1, endCycle: 1 },
      ],
      anomalies: [],
      temperatureLog: [],
    },
  },
  {
    id: "CT-007",
    chamberId: "EQ-HF-01",
    chamberName: "HF-01",
    testType: "HF",
    testName: "HF10 Humidity Freeze",
    standard: "IEC 61215 MQT 12",
    projectId: "PRJ-2026-001",
    projectName: "SolarMax 500W IEC Qualification",
    sampleIds: ["SM-500B-1", "SM-500B-2"],
    status: "Scheduled",
    parameters: {
      tempMin: -40,
      tempMax: 85,
      humidityMin: 85,
      humidityMax: 85,
      rampRate: 100,
      dwellTime: 20,
      totalCycles: 10,
      totalDuration: 150,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-04-12",
      endDate: "2026-04-25",
      startedAt: null,
      completedAt: null,
      estimatedCompletion: null,
    },
    loadingPlan: [
      { position: 1, moduleId: "SM-500B-1", sampleId: "S-001-1", orientation: "Portrait" },
      { position: 2, moduleId: "SM-500B-2", sampleId: "S-001-2", orientation: "Portrait" },
    ],
  },
  {
    id: "CT-008",
    chamberId: "EQ-TC-05",
    chamberName: "TC-05",
    testType: "TC",
    testName: "TC200 for TechSolar",
    standard: "IEC 61215 MQT 11",
    projectId: "PRJ-2026-003",
    projectName: "TechSolar 550W Qualification",
    sampleIds: ["TS-550-1", "TS-550-2", "TS-550-3"],
    status: "Scheduled",
    parameters: {
      tempMin: -40,
      tempMax: 85,
      humidityMin: null,
      humidityMax: null,
      rampRate: 100,
      dwellTime: 10,
      totalCycles: 200,
      totalDuration: 1200,
      uvIntensity: null,
    },
    schedule: {
      startDate: "2026-04-01",
      endDate: "2026-06-05",
      startedAt: null,
      completedAt: null,
      estimatedCompletion: null,
    },
    loadingPlan: [
      { position: 1, moduleId: "TS-550-1", sampleId: "S-005-1", orientation: "Portrait" },
      { position: 2, moduleId: "TS-550-2", sampleId: "S-005-2", orientation: "Portrait" },
      { position: 3, moduleId: "TS-550-3", sampleId: "S-005-3", orientation: "Portrait" },
    ],
  },
];

export const chamberScheduleEvents: ChamberScheduleEvent[] = [
  { id: "SE-001", chamberId: "EQ-TC-01", chamberName: "TC-01", testId: "CT-001", testName: "TC200 SolarMax", testType: "TC", projectId: "PRJ-2026-001", startDate: "2026-02-05", endDate: "2026-04-10", status: "Running", color: "bg-blue-500" },
  { id: "SE-002", chamberId: "EQ-TC-02", chamberName: "TC-02", testId: "CT-002", testName: "TC50 IndiaSolar", testType: "TC", projectId: "PRJ-2026-004", startDate: "2026-02-20", endDate: "2026-03-25", status: "Running", color: "bg-green-500" },
  { id: "SE-003", chamberId: "EQ-TC-03", chamberName: "TC-03", testId: "CT-003", testName: "TC200 GreenPower", testType: "TC", projectId: "PRJ-2026-002", startDate: "2026-02-25", endDate: "2026-04-28", status: "Running", color: "bg-purple-500" },
  { id: "SE-004", chamberId: "EQ-DH-01", chamberName: "DH-01", testId: "CT-004", testName: "DH1000 SolarMax", testType: "DH", projectId: "PRJ-2026-001", startDate: "2026-02-05", endDate: "2026-03-30", status: "Running", color: "bg-orange-500" },
  { id: "SE-005", chamberId: "EQ-DH-02", chamberName: "DH-02", testId: "CT-005", testName: "DH500 IndiaSolar", testType: "DH", projectId: "PRJ-2026-004", startDate: "2026-02-15", endDate: "2026-03-15", status: "Running", color: "bg-cyan-500" },
  { id: "SE-006", chamberId: "EQ-UV-01", chamberName: "UV-01", testId: "CT-006", testName: "UV 15kWh SolarMax", testType: "UV", projectId: "PRJ-2026-001", startDate: "2026-02-15", endDate: "2026-03-18", status: "Running", color: "bg-amber-500" },
  { id: "SE-007", chamberId: "EQ-HF-01", chamberName: "HF-01", testId: "CT-007", testName: "HF10 SolarMax", testType: "HF", projectId: "PRJ-2026-001", startDate: "2026-04-12", endDate: "2026-04-25", status: "Scheduled", color: "bg-indigo-500" },
  { id: "SE-008", chamberId: "EQ-TC-05", chamberName: "TC-05", testId: "CT-008", testName: "TC200 TechSolar", testType: "TC", projectId: "PRJ-2026-003", startDate: "2026-04-01", endDate: "2026-06-05", status: "Scheduled", color: "bg-rose-500" },
];

export const chamberUtilization: ChamberUtilization[] = [
  { chamberId: "EQ-TC-01", chamberName: "TC-01", totalHours: 720, runningHours: 684, idleHours: 18, maintenanceHours: 18, utilizationPercent: 95, testsCompleted: 2, testsInProgress: 1 },
  { chamberId: "EQ-TC-02", chamberName: "TC-02", totalHours: 720, runningHours: 634, idleHours: 50, maintenanceHours: 36, utilizationPercent: 88, testsCompleted: 1, testsInProgress: 1 },
  { chamberId: "EQ-TC-03", chamberName: "TC-03", totalHours: 720, runningHours: 518, idleHours: 166, maintenanceHours: 36, utilizationPercent: 72, testsCompleted: 0, testsInProgress: 1 },
  { chamberId: "EQ-TC-04", chamberName: "TC-04", totalHours: 720, runningHours: 0, idleHours: 576, maintenanceHours: 144, utilizationPercent: 0, testsCompleted: 0, testsInProgress: 0 },
  { chamberId: "EQ-TC-05", chamberName: "TC-05", totalHours: 720, runningHours: 324, idleHours: 360, maintenanceHours: 36, utilizationPercent: 45, testsCompleted: 1, testsInProgress: 0 },
  { chamberId: "EQ-DH-01", chamberName: "DH-01", totalHours: 720, runningHours: 720, idleHours: 0, maintenanceHours: 0, utilizationPercent: 100, testsCompleted: 0, testsInProgress: 1 },
  { chamberId: "EQ-DH-02", chamberName: "DH-02", totalHours: 720, runningHours: 612, idleHours: 72, maintenanceHours: 36, utilizationPercent: 85, testsCompleted: 0, testsInProgress: 1 },
  { chamberId: "EQ-DH-03", chamberName: "DH-03", totalHours: 720, runningHours: 0, idleHours: 648, maintenanceHours: 72, utilizationPercent: 0, testsCompleted: 0, testsInProgress: 0 },
  { chamberId: "EQ-DH-04", chamberName: "DH-04", totalHours: 720, runningHours: 432, idleHours: 252, maintenanceHours: 36, utilizationPercent: 60, testsCompleted: 1, testsInProgress: 0 },
  { chamberId: "EQ-DH-05", chamberName: "DH-05", totalHours: 720, runningHours: 396, idleHours: 288, maintenanceHours: 36, utilizationPercent: 55, testsCompleted: 1, testsInProgress: 0 },
  { chamberId: "EQ-DH-06", chamberName: "DH-06", totalHours: 720, runningHours: 288, idleHours: 396, maintenanceHours: 36, utilizationPercent: 40, testsCompleted: 0, testsInProgress: 0 },
  { chamberId: "EQ-HF-01", chamberName: "HF-01", totalHours: 720, runningHours: 216, idleHours: 468, maintenanceHours: 36, utilizationPercent: 30, testsCompleted: 1, testsInProgress: 0 },
  { chamberId: "EQ-HF-02", chamberName: "HF-02", totalHours: 720, runningHours: 180, idleHours: 504, maintenanceHours: 36, utilizationPercent: 25, testsCompleted: 0, testsInProgress: 0 },
  { chamberId: "EQ-HF-03", chamberName: "HF-03", totalHours: 720, runningHours: 144, idleHours: 540, maintenanceHours: 36, utilizationPercent: 20, testsCompleted: 0, testsInProgress: 0 },
  { chamberId: "EQ-UV-01", chamberName: "UV-01", totalHours: 720, runningHours: 720, idleHours: 0, maintenanceHours: 0, utilizationPercent: 100, testsCompleted: 0, testsInProgress: 1 },
  { chamberId: "EQ-UV-02", chamberName: "UV-02", totalHours: 720, runningHours: 144, idleHours: 540, maintenanceHours: 36, utilizationPercent: 20, testsCompleted: 0, testsInProgress: 0 },
  { chamberId: "EQ-UV-03", chamberName: "UV-03", totalHours: 720, runningHours: 108, idleHours: 576, maintenanceHours: 36, utilizationPercent: 15, testsCompleted: 0, testsInProgress: 0 },
];

function generateTemperatureLog(cycles: number, tempMin: number, tempMax: number) {
  const log = [];
  const pointsPerCycle = 8;
  for (let c = 1; c <= Math.min(cycles, 30); c++) {
    const phases = [
      { phase: "Ramp Up" as const, temp: tempMin + (tempMax - tempMin) * 0.25 },
      { phase: "Ramp Up" as const, temp: tempMin + (tempMax - tempMin) * 0.75 },
      { phase: "Dwell Hot" as const, temp: tempMax + (Math.random() - 0.5) * 1.5 },
      { phase: "Dwell Hot" as const, temp: tempMax + (Math.random() - 0.5) * 1.0 },
      { phase: "Ramp Down" as const, temp: tempMax - (tempMax - tempMin) * 0.25 },
      { phase: "Ramp Down" as const, temp: tempMax - (tempMax - tempMin) * 0.75 },
      { phase: "Dwell Cold" as const, temp: tempMin + (Math.random() - 0.5) * 1.5 },
      { phase: "Dwell Cold" as const, temp: tempMin + (Math.random() - 0.5) * 1.0 },
    ];
    for (let p = 0; p < pointsPerCycle; p++) {
      const hourOffset = (c - 1) * 6 + p * 0.75;
      const date = new Date("2026-02-05T08:00:00");
      date.setHours(date.getHours() + hourOffset);
      log.push({
        timestamp: date.toISOString(),
        cycle: c,
        temperature: Math.round(phases[p].temp * 10) / 10,
        humidity: null,
        setpointTemp: phases[p].phase.includes("Hot") || phases[p].phase === "Ramp Up" ? tempMax : tempMin,
        setpointHumidity: null,
        phase: phases[p].phase,
      });
    }
  }
  return log;
}

function generateDHTemperatureLog(hours: number) {
  const log = [];
  const points = Math.min(hours, 200);
  for (let h = 0; h < points; h += 5) {
    const date = new Date("2026-02-05T10:00:00");
    date.setHours(date.getHours() + h);
    log.push({
      timestamp: date.toISOString(),
      cycle: 1,
      temperature: 85 + (Math.random() - 0.5) * 0.8,
      humidity: 85 + (Math.random() - 0.5) * 1.2,
      setpointTemp: 85,
      setpointHumidity: 85,
      phase: "Stable" as const,
    });
  }
  return log;
}
