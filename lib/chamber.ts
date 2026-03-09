/**
 * Chamber Configurator - TypeScript port
 * Environmental test chamber configuration for PV module testing
 */

export type TestType = "TC" | "HF" | "DH" | "UV" | "TC+HF" | "TC+HF+DH" | "UV+TC+HF+DH";

export interface ChamberDimensions {
  length: number; // mm
  width: number;  // mm
  height: number; // mm
}

export interface EnvironmentalParams {
  tempMin: number;       // °C
  tempMax: number;       // °C
  humidityMin: number;   // %RH
  humidityMax: number;   // %RH
  uvIntensity: number;   // W/m²
  rampRate: number;      // °C/min
}

export interface TestProfile {
  testType: TestType;
  standard: string;
  description: string;
  cycles: number;
  params: EnvironmentalParams;
  duration: string;
}

export interface ChamberSpec {
  id: string;
  name: string;
  dimensions: ChamberDimensions;
  testProfiles: TestProfile[];
  volume: number;          // m³
  coolingCapacity: number; // kW
  heatingCapacity: number; // kW
  uvLedCount: number;
  uvPower: number;         // kW
  estimatedCost: CostBreakdown;
  features: string[];
}

export interface CostItem {
  item: string;
  cost: number;  // INR Lakhs
  description: string;
}

export interface CostBreakdown {
  items: CostItem[];
  totalLakhs: number;
  totalINR: number;
}

/** Standard test profiles per IEC standards */
export const STANDARD_TEST_PROFILES: TestProfile[] = [
  {
    testType: "TC",
    standard: "IEC 61215 MQT 11",
    description: "Thermal Cycling - 200 cycles between -40°C and 85°C",
    cycles: 200,
    params: { tempMin: -40, tempMax: 85, humidityMin: 0, humidityMax: 0, uvIntensity: 0, rampRate: 1.67 },
    duration: "~25 days",
  },
  {
    testType: "HF",
    standard: "IEC 61215 MQT 12",
    description: "Humidity Freeze - 10 cycles between -40°C and 85°C/85%RH",
    cycles: 10,
    params: { tempMin: -40, tempMax: 85, humidityMin: 0, humidityMax: 85, uvIntensity: 0, rampRate: 1.67 },
    duration: "~10 days",
  },
  {
    testType: "DH",
    standard: "IEC 61215 MQT 13",
    description: "Damp Heat - 1000h at 85°C/85%RH",
    cycles: 1,
    params: { tempMin: 85, tempMax: 85, humidityMin: 85, humidityMax: 85, uvIntensity: 0, rampRate: 0 },
    duration: "~42 days",
  },
  {
    testType: "UV",
    standard: "IEC 61215 MQT 10",
    description: "UV Preconditioning - 15 kWh/m² UVA + 5 kWh/m² UVB",
    cycles: 1,
    params: { tempMin: 60, tempMax: 60, humidityMin: 0, humidityMax: 0, uvIntensity: 250, rampRate: 0 },
    duration: "~5 days",
  },
  {
    testType: "TC+HF",
    standard: "IEC 61215 Sequence C",
    description: "Combined TC200 + HF10 sequence",
    cycles: 210,
    params: { tempMin: -40, tempMax: 85, humidityMin: 0, humidityMax: 85, uvIntensity: 0, rampRate: 1.67 },
    duration: "~35 days",
  },
  {
    testType: "UV+TC+HF+DH",
    standard: "IEC 61215 Full Sequence",
    description: "UV preconditioning + TC + HF + DH combined chamber",
    cycles: 211,
    params: { tempMin: -40, tempMax: 85, humidityMin: 0, humidityMax: 85, uvIntensity: 250, rampRate: 1.67 },
    duration: "~82 days",
  },
];

/** Calculate chamber volume in m³ */
export function calculateVolume(dims: ChamberDimensions): number {
  return (dims.length * dims.width * dims.height) / 1e9;
}

/** Calculate required cooling capacity (simplified) */
export function calculateCoolingCapacity(volume: number, tempMin: number, rampRate: number): number {
  const airDensity = 1.2; // kg/m³
  const specificHeat = 1.005; // kJ/(kg·°C)
  const mass = volume * airDensity;
  const tempDelta = 25 - tempMin; // from ambient to min
  const baseCapacity = mass * specificHeat * tempDelta / 60; // kW base
  const rampCapacity = mass * specificHeat * rampRate / 60;
  // Add 40% safety factor and wall losses
  return Math.ceil((baseCapacity + rampCapacity) * 1.4 * 10) / 10;
}

/** Calculate required heating capacity */
export function calculateHeatingCapacity(volume: number, tempMax: number, rampRate: number): number {
  const airDensity = 1.2;
  const specificHeat = 1.005;
  const mass = volume * airDensity;
  const tempDelta = tempMax - 25;
  const baseCapacity = mass * specificHeat * tempDelta / 60;
  const rampCapacity = mass * specificHeat * rampRate / 60;
  return Math.ceil((baseCapacity + rampCapacity) * 1.3 * 10) / 10;
}

/** Calculate UV system specs */
export function calculateUVSystem(areaM2: number, targetIntensity: number): {
  ledCount: number;
  totalPower: number;
  uniformity: number;
} {
  const ledCoverage = 0.05; // m² per LED
  const ledPower = 0.085; // kW per LED
  const ledCount = Math.ceil(areaM2 / ledCoverage);
  const totalPower = Math.round(ledCount * ledPower * 100) / 100;
  const uniformity = 8.5; // ±%
  return { ledCount, totalPower, uniformity };
}

/** Generate chamber specification from configuration */
export function generateChamberSpec(
  name: string,
  dimensions: ChamberDimensions,
  testProfiles: TestProfile[]
): ChamberSpec {
  const volume = calculateVolume(dimensions);
  const allParams = testProfiles.map((p) => p.params);
  const minTemp = Math.min(...allParams.map((p) => p.tempMin));
  const maxTemp = Math.max(...allParams.map((p) => p.tempMax));
  const maxRamp = Math.max(...allParams.map((p) => p.rampRate));
  const maxHumidity = Math.max(...allParams.map((p) => p.humidityMax));
  const maxUV = Math.max(...allParams.map((p) => p.uvIntensity));

  const coolingCapacity = calculateCoolingCapacity(volume, minTemp, maxRamp);
  const heatingCapacity = calculateHeatingCapacity(volume, maxTemp, maxRamp);

  const areaM2 = (dimensions.length * dimensions.width) / 1e6;
  const uvSystem = maxUV > 0 ? calculateUVSystem(areaM2, maxUV) : { ledCount: 0, totalPower: 0, uniformity: 0 };

  const features: string[] = [];
  if (minTemp <= -40) features.push("Cascade refrigeration system");
  if (maxTemp >= 85) features.push("High-power heating elements");
  if (maxHumidity >= 85) features.push("Precision humidity control (steam + dehumidification)");
  if (maxUV > 0) features.push(`UV LED array (${uvSystem.ledCount} LEDs, ${uvSystem.totalPower} kW)`);
  features.push("PLC-based control system with HMI");
  features.push("Data logging with RS485/Ethernet");
  features.push("Safety interlocks and over-temperature protection");

  const costItems = generateCostBreakdown(volume, coolingCapacity, heatingCapacity, maxHumidity > 0, maxUV > 0, uvSystem);

  return {
    id: Date.now().toString(),
    name,
    dimensions,
    testProfiles,
    volume: Math.round(volume * 1000) / 1000,
    coolingCapacity,
    heatingCapacity,
    uvLedCount: uvSystem.ledCount,
    uvPower: uvSystem.totalPower,
    estimatedCost: costItems,
    features,
  };
}

/** Generate cost breakdown */
function generateCostBreakdown(
  volume: number,
  coolingCapacity: number,
  heatingCapacity: number,
  hasHumidity: boolean,
  hasUV: boolean,
  uvSystem: { ledCount: number; totalPower: number; uniformity: number }
): CostBreakdown {
  const items: CostItem[] = [
    { item: "Chamber Body & Insulation", cost: 25 + volume * 5, description: "SS304 inner, MS outer, PUF insulation (100mm)" },
    { item: "Refrigeration System", cost: 8 + coolingCapacity * 0.5, description: `Cascade system, ${coolingCapacity} kW capacity` },
    { item: "Heating System", cost: 3 + heatingCapacity * 0.2, description: `Nichrome heaters, ${heatingCapacity} kW capacity` },
    { item: "Air Circulation", cost: 4, description: "Centrifugal blower with variable speed drive" },
    { item: "Control System", cost: 12, description: "PLC + 10\" HMI + data logger + Ethernet" },
    { item: "Safety Systems", cost: 3, description: "Over-temp protection, door interlocks, pressure relief" },
    { item: "Sensors & Instrumentation", cost: 5, description: "PT100 sensors, humidity probes, pressure transducers" },
  ];

  if (hasHumidity) {
    items.push({ item: "Humidity System", cost: 8, description: "Steam generator + dehumidification unit" });
  }

  if (hasUV) {
    items.push({ item: "UV LED Array", cost: 10 + uvSystem.ledCount * 0.2, description: `${uvSystem.ledCount} UV LEDs, ${uvSystem.totalPower} kW` });
  }

  items.push({ item: "Installation & Commissioning", cost: 5, description: "Site installation, IQ/OQ/PQ qualification" });

  const totalLakhs = Math.round(items.reduce((sum, item) => sum + item.cost, 0) * 10) / 10;

  return {
    items: items.map((i) => ({ ...i, cost: Math.round(i.cost * 10) / 10 })),
    totalLakhs,
    totalINR: totalLakhs * 100000,
  };
}

/** Compare two chamber configurations */
export function compareChambers(a: ChamberSpec, b: ChamberSpec): {
  parameter: string;
  specA: string;
  specB: string;
  advantage: "A" | "B" | "equal";
}[] {
  return [
    {
      parameter: "Volume",
      specA: `${a.volume} m³`,
      specB: `${b.volume} m³`,
      advantage: a.volume > b.volume ? "A" : a.volume < b.volume ? "B" : "equal",
    },
    {
      parameter: "Cooling Capacity",
      specA: `${a.coolingCapacity} kW`,
      specB: `${b.coolingCapacity} kW`,
      advantage: a.coolingCapacity > b.coolingCapacity ? "A" : a.coolingCapacity < b.coolingCapacity ? "B" : "equal",
    },
    {
      parameter: "Heating Capacity",
      specA: `${a.heatingCapacity} kW`,
      specB: `${b.heatingCapacity} kW`,
      advantage: a.heatingCapacity > b.heatingCapacity ? "A" : a.heatingCapacity < b.heatingCapacity ? "B" : "equal",
    },
    {
      parameter: "UV LEDs",
      specA: `${a.uvLedCount}`,
      specB: `${b.uvLedCount}`,
      advantage: a.uvLedCount > b.uvLedCount ? "A" : a.uvLedCount < b.uvLedCount ? "B" : "equal",
    },
    {
      parameter: "Estimated Cost",
      specA: `₹${a.estimatedCost.totalLakhs}L`,
      specB: `₹${b.estimatedCost.totalLakhs}L`,
      advantage: a.estimatedCost.totalLakhs < b.estimatedCost.totalLakhs ? "A" : a.estimatedCost.totalLakhs > b.estimatedCost.totalLakhs ? "B" : "equal",
    },
    {
      parameter: "Test Types",
      specA: a.testProfiles.map((p) => p.testType).join(", "),
      specB: b.testProfiles.map((p) => p.testType).join(", "),
      advantage: a.testProfiles.length > b.testProfiles.length ? "A" : a.testProfiles.length < b.testProfiles.length ? "B" : "equal",
    },
  ];
}
