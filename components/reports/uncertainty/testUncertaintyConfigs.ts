/**
 * Test-Specific Uncertainty Budget Configurations
 * Covers all major PV testing standards with manufacturer/lab-specific data
 */

import type { UncertaintyRow } from "./ReportUncertaintyBudgetTable"

// ─── Sun Simulator Manufacturers ─────────────────────────────────────────────

export interface SimulatorInfo {
  manufacturer: string
  models: string[]
  classification: string
  spatialNonUniformity: number
  temporalInstability: number
  spectralMismatch: number
}

export const SUN_SIMULATOR_MANUFACTURERS: SimulatorInfo[] = [
  { manufacturer: "PASAN", models: ["HighLIGHT 3b", "SunSim 3c", "SpotLIGHT", "GridSim"], classification: "AAA+", spatialNonUniformity: 0.5, temporalInstability: 0.5, spectralMismatch: 1.0 },
  { manufacturer: "h.a.l.m.", models: ["cetisPV-CTL4", "cetisPV-CTL3", "cetisPV-IUCT"], classification: "AAA+", spatialNonUniformity: 0.5, temporalInstability: 0.3, spectralMismatch: 1.5 },
  { manufacturer: "Spire", models: ["4600SLP", "5600SLP", "6600SLP", "460RPC"], classification: "AAA+", spatialNonUniformity: 1.0, temporalInstability: 0.5, spectralMismatch: 2.0 },
  { manufacturer: "Eternal Sun", models: ["A+A+A+", "AAA", "Model S"], classification: "A+A+A+", spatialNonUniformity: 0.25, temporalInstability: 0.25, spectralMismatch: 0.50 },
  { manufacturer: "Avalon", models: ["RS-1200", "RS-2400", "RS-4800"], classification: "AAA", spatialNonUniformity: 1.0, temporalInstability: 0.5, spectralMismatch: 2.0 },
  { manufacturer: "Berger", models: ["PSS 10", "PSS 8", "PSS 20"], classification: "AAA", spatialNonUniformity: 1.0, temporalInstability: 0.5, spectralMismatch: 2.0 },
  { manufacturer: "Endeas", models: ["QuickSun 600DL", "QuickSun 700A", "QuickSun 800A"], classification: "AAA+", spatialNonUniformity: 0.5, temporalInstability: 0.3, spectralMismatch: 1.5 },
  { manufacturer: "Wavelabs", models: ["SINUS-2100-AAAA", "SINUS-1100", "SINUS-4100"], classification: "AAAA", spatialNonUniformity: 0.25, temporalInstability: 0.1, spectralMismatch: 0.50 },
  { manufacturer: "G-Solar", models: ["GSS-200A", "GSS-300A", "GSS-150A"], classification: "AAA", spatialNonUniformity: 1.0, temporalInstability: 0.5, spectralMismatch: 2.0 },
  { manufacturer: "All Real", models: ["AR-S3600", "AR-S2400", "AR-S6000"], classification: "AAA", spatialNonUniformity: 1.0, temporalInstability: 0.5, spectralMismatch: 2.5 },
  { manufacturer: "Lumartix", models: ["SuSi-300", "SuSi-600", "SuSi-1200"], classification: "AAAA", spatialNonUniformity: 0.25, temporalInstability: 0.1, spectralMismatch: 0.50 },
  { manufacturer: "Atlas", models: ["SC340A", "SC540A", "SC740A"], classification: "AAA+", spatialNonUniformity: 0.5, temporalInstability: 0.3, spectralMismatch: 1.0 },
  { manufacturer: "NPC", models: ["YSS-200A", "YSS-400B", "YSS-150M"], classification: "AAA", spatialNonUniformity: 1.0, temporalInstability: 0.5, spectralMismatch: 2.0 },
  { manufacturer: "Abet Technologies", models: ["Sun 3000", "Sun 2000", "Sun 3000 Bifacial"], classification: "AAA+", spatialNonUniformity: 0.5, temporalInstability: 0.5, spectralMismatch: 1.5 },
]

// ─── Calibration Laboratories ────────────────────────────────────────────────

export interface CalibrationLab {
  name: string
  abbreviation: string
  country: string
  accreditation: string
  pmaxUncertainty: number
  iscUncertainty: number
  vocUncertainty: number
}

export const CALIBRATION_LABORATORIES: CalibrationLab[] = [
  { name: "Physikalisch-Technische Bundesanstalt", abbreviation: "PTB", country: "Germany", accreditation: "DAkkS", pmaxUncertainty: 0.55, iscUncertainty: 0.35, vocUncertainty: 0.15 },
  { name: "National Renewable Energy Laboratory", abbreviation: "NREL", country: "USA", accreditation: "NVLAP", pmaxUncertainty: 0.62, iscUncertainty: 0.40, vocUncertainty: 0.18 },
  { name: "National Institute of Advanced Industrial Science and Technology", abbreviation: "AIST", country: "Japan", accreditation: "JCSS", pmaxUncertainty: 0.60, iscUncertainty: 0.38, vocUncertainty: 0.16 },
  { name: "Institut für Solarenergieforschung Hameln", abbreviation: "ISFH", country: "Germany", accreditation: "DAkkS", pmaxUncertainty: 0.65, iscUncertainty: 0.42, vocUncertainty: 0.18 },
  { name: "Fraunhofer Institute for Solar Energy Systems", abbreviation: "ISE", country: "Germany", accreditation: "DAkkS", pmaxUncertainty: 0.58, iscUncertainty: 0.37, vocUncertainty: 0.16 },
  { name: "National Institute of Metrology", abbreviation: "NIM", country: "China", accreditation: "CNAS", pmaxUncertainty: 0.70, iscUncertainty: 0.45, vocUncertainty: 0.20 },
  { name: "European Solar Test Installation", abbreviation: "ESTI", country: "Italy (EU JRC)", accreditation: "ACCREDIA", pmaxUncertainty: 0.60, iscUncertainty: 0.38, vocUncertainty: 0.17 },
  { name: "TÜV Rheinland", abbreviation: "TÜV", country: "Germany", accreditation: "DAkkS", pmaxUncertainty: 0.75, iscUncertainty: 0.48, vocUncertainty: 0.22 },
]

// ─── Test-Specific Uncertainty Configs ───────────────────────────────────────

export type TestUncertaintyType =
  | "flasher_stc"
  | "insulation_test"
  | "ground_continuity"
  | "noct_nmot"
  | "temperature_coefficient"
  | "energy_rating"
  | "spectral_response"
  | "iam"
  | "wet_leakage"
  | "peel_test"
  | "pid"
  | "tc_dh_hf"

export interface TestUncertaintyConfig {
  type: TestUncertaintyType
  label: string
  standard: string
  measurand: string
  unit: string
  rows: UncertaintyRow[]
  combinedUncertainty: number
  coverageFactor: number
  expandedUncertainty: number
}

export const TEST_UNCERTAINTY_CONFIGS: Record<TestUncertaintyType, TestUncertaintyConfig> = {
  flasher_stc: {
    type: "flasher_stc",
    label: "Flasher / STC Measurement",
    standard: "IEC 60904-1, IEC 60891",
    measurand: "Pmax",
    unit: "W",
    rows: [
      { id: "f1", component: "Irradiance", category: "Equipment", source: "Spatial non-uniformity", value: 0.50, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.002887, sensitivityCoefficient: 1.0, contribution: 8.33e-6, percentContribution: 26.8 },
      { id: "f2", component: "Irradiance", category: "Equipment", source: "Temporal instability (STI/LTI)", value: 0.20, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.001155, sensitivityCoefficient: 1.0, contribution: 1.33e-6, percentContribution: 4.3 },
      { id: "f3", component: "Spectral", category: "Method", source: "Spectral mismatch factor", value: 0.30, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.001732, sensitivityCoefficient: 1.0, contribution: 3.0e-6, percentContribution: 9.7 },
      { id: "f4", component: "Temperature", category: "Environment", source: "Module temperature", value: 0.50, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.002500, sensitivityCoefficient: 0.45, contribution: 1.27e-6, percentContribution: 4.1 },
      { id: "f5", component: "Reference", category: "Reference Standard", source: "Cal cert uncertainty (k=2)", value: 0.80, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.004000, sensitivityCoefficient: 1.0, contribution: 1.6e-5, percentContribution: 51.5 },
      { id: "f6", component: "Electrical", category: "Equipment", source: "DAQ resolution + contact R", value: 0.05, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.000289, sensitivityCoefficient: 1.0, contribution: 8.33e-8, percentContribution: 0.3 },
      { id: "f7", component: "Repeatability", category: "Method", source: "10 repeat measurements", value: 0.15, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.000474, sensitivityCoefficient: 1.0, contribution: 2.25e-7, percentContribution: 0.7 },
      { id: "f8", component: "Curve Fit", category: "Method", source: "IV curve fitting/correction", value: 0.10, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.000577, sensitivityCoefficient: 1.0, contribution: 3.33e-7, percentContribution: 1.1 },
      { id: "f9", component: "Hysteresis", category: "Method", source: "Forward/reverse scan diff", value: 0.05, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.000289, sensitivityCoefficient: 1.0, contribution: 8.33e-8, percentContribution: 0.3 },
    ],
    combinedUncertainty: 0.00557,
    coverageFactor: 2.0,
    expandedUncertainty: 0.01114,
  },
  insulation_test: {
    type: "insulation_test",
    label: "Insulation Resistance Test",
    standard: "IEC 61215-2 MQT 03",
    measurand: "RISO × A",
    unit: "MΩ·m²",
    rows: [
      { id: "i1", component: "Voltage Source", category: "Equipment", source: "Applied voltage accuracy (±1%)", value: 10.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 5.774, sensitivityCoefficient: 0.10, contribution: 0.333, percentContribution: 12.0 },
      { id: "i2", component: "Current Meter", category: "Equipment", source: "Leakage current measurement", value: 0.50, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.250, sensitivityCoefficient: 1.0, contribution: 0.0625, percentContribution: 2.3 },
      { id: "i3", component: "Temperature", category: "Environment", source: "Ambient temp variation", value: 2.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 1.155, sensitivityCoefficient: 0.80, contribution: 0.854, percentContribution: 30.7 },
      { id: "i4", component: "Humidity", category: "Environment", source: "Ambient humidity effect", value: 5.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 2.887, sensitivityCoefficient: 0.50, contribution: 2.082, percentContribution: 74.9 },
      { id: "i5", component: "Module Area", category: "Sample", source: "Area measurement", value: 0.01, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.00577, sensitivityCoefficient: 1.0, contribution: 3.33e-5, percentContribution: 0.001 },
    ],
    combinedUncertainty: 1.826,
    coverageFactor: 2.0,
    expandedUncertainty: 3.652,
  },
  ground_continuity: {
    type: "ground_continuity",
    label: "Ground Continuity Test",
    standard: "IEC 61730-2 MST 13",
    measurand: "R_ground",
    unit: "Ω",
    rows: [
      { id: "g1", component: "Resistance Meter", category: "Equipment", source: "Meter accuracy (±0.5%)", value: 0.005, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.0025, sensitivityCoefficient: 1.0, contribution: 6.25e-6, percentContribution: 45.0 },
      { id: "g2", component: "Contact Resistance", category: "Method", source: "Probe contact quality", value: 0.003, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.00173, sensitivityCoefficient: 1.0, contribution: 3.0e-6, percentContribution: 21.6 },
      { id: "g3", component: "Cable Compensation", category: "Equipment", source: "Lead resistance zeroing", value: 0.002, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.00115, sensitivityCoefficient: 1.0, contribution: 1.33e-6, percentContribution: 9.6 },
      { id: "g4", component: "Temperature", category: "Environment", source: "Temp effect on conductor R", value: 0.003, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.00173, sensitivityCoefficient: 1.0, contribution: 3.0e-6, percentContribution: 21.6 },
      { id: "g5", component: "Repeatability", category: "Method", source: "Repeat measurements", value: 0.001, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.000316, sensitivityCoefficient: 1.0, contribution: 1.0e-7, percentContribution: 0.7 },
    ],
    combinedUncertainty: 0.00372,
    coverageFactor: 2.0,
    expandedUncertainty: 0.00744,
  },
  noct_nmot: {
    type: "noct_nmot",
    label: "NOCT / NMOT Determination",
    standard: "IEC 61215-2 MQT 05, IEC 61853-2",
    measurand: "NOCT/NMOT",
    unit: "°C",
    rows: [
      { id: "n1", component: "Irradiance Sensor", category: "Equipment", source: "Pyranometer accuracy", value: 2.0, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 1.0, sensitivityCoefficient: 0.03, contribution: 9.0e-4, percentContribution: 8.5 },
      { id: "n2", component: "Wind Speed", category: "Environment", source: "Anemometer accuracy", value: 0.5, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.289, sensitivityCoefficient: 2.0, contribution: 0.333, percentContribution: 31.4 },
      { id: "n3", component: "Ambient Temp", category: "Environment", source: "Temperature sensor", value: 0.3, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.15, sensitivityCoefficient: 1.0, contribution: 0.0225, percentContribution: 2.1 },
      { id: "n4", component: "Module Temp", category: "Equipment", source: "Thermocouple accuracy", value: 0.5, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.25, sensitivityCoefficient: 1.0, contribution: 0.0625, percentContribution: 5.9 },
      { id: "n5", component: "Equilibrium", category: "Method", source: "Thermal equilibrium criterion", value: 2.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 1.155, sensitivityCoefficient: 0.50, contribution: 0.333, percentContribution: 31.4 },
      { id: "n6", component: "Repeatability", category: "Method", source: "Day-to-day variation", value: 1.0, type: "A", distribution: "normal", divisor: 2.236, standardUncertainty: 0.447, sensitivityCoefficient: 1.0, contribution: 0.200, percentContribution: 18.9 },
    ],
    combinedUncertainty: 1.030,
    coverageFactor: 2.0,
    expandedUncertainty: 2.060,
  },
  temperature_coefficient: {
    type: "temperature_coefficient",
    label: "Temperature Coefficient",
    standard: "IEC 61215-2 MQT 06, IEC 60891",
    measurand: "α, β, γ",
    unit: "%/°C",
    rows: [
      { id: "tc1", component: "Regression", category: "Method", source: "Linear regression fitting", value: 0.002, type: "A", distribution: "normal", divisor: 2.0, standardUncertainty: 0.001, sensitivityCoefficient: 1.0, contribution: 1.0e-6, percentContribution: 35.7 },
      { id: "tc2", component: "Temp Sensor", category: "Equipment", source: "Thermocouple cal. uncertainty", value: 0.3, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.15, sensitivityCoefficient: 0.005, contribution: 5.63e-7, percentContribution: 20.1 },
      { id: "tc3", component: "Irradiance", category: "Equipment", source: "Irradiance stability during test", value: 0.5, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.289, sensitivityCoefficient: 0.003, contribution: 7.5e-7, percentContribution: 26.8 },
      { id: "tc4", component: "Data Points", category: "Method", source: "Number of temp steps (5 pts)", value: 0.001, type: "A", distribution: "normal", divisor: 2.236, standardUncertainty: 0.000447, sensitivityCoefficient: 1.0, contribution: 2.0e-7, percentContribution: 7.1 },
      { id: "tc5", component: "Repeatability", category: "Method", source: "Day-to-day repeat", value: 0.001, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.000316, sensitivityCoefficient: 1.0, contribution: 1.0e-7, percentContribution: 3.6 },
    ],
    combinedUncertainty: 0.00168,
    coverageFactor: 2.0,
    expandedUncertainty: 0.00336,
  },
  energy_rating: {
    type: "energy_rating",
    label: "Energy Rating (IEC 61853)",
    standard: "IEC 61853-1/2/3/4",
    measurand: "Energy Yield",
    unit: "kWh/kWp",
    rows: [
      { id: "er1", component: "Power Matrix", category: "Method", source: "22-point power measurements", value: 1.5, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.75, sensitivityCoefficient: 1.0, contribution: 0.5625, percentContribution: 42.3 },
      { id: "er2", component: "Spectral", category: "Method", source: "Spectral correction factor", value: 0.5, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.289, sensitivityCoefficient: 1.0, contribution: 0.0833, percentContribution: 6.3 },
      { id: "er3", component: "AOI", category: "Method", source: "Angle of incidence correction", value: 0.3, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.173, sensitivityCoefficient: 1.0, contribution: 0.030, percentContribution: 2.3 },
      { id: "er4", component: "Temp Model", category: "Method", source: "NOCT/NMOT model accuracy", value: 2.0, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 1.0, sensitivityCoefficient: 0.45, contribution: 0.2025, percentContribution: 15.2 },
      { id: "er5", component: "Climate Data", category: "Environment", source: "TMY irradiance data accuracy", value: 3.0, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 1.5, sensitivityCoefficient: 0.50, contribution: 0.5625, percentContribution: 42.3 },
    ],
    combinedUncertainty: 1.154,
    coverageFactor: 2.0,
    expandedUncertainty: 2.308,
  },
  spectral_response: {
    type: "spectral_response",
    label: "Spectral Response",
    standard: "IEC 60904-8",
    measurand: "SR(λ)",
    unit: "A/W",
    rows: [
      { id: "sr1", component: "Monochromator", category: "Equipment", source: "Wavelength accuracy (±1nm)", value: 1.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.577, sensitivityCoefficient: 0.002, contribution: 1.33e-6, percentContribution: 15.8 },
      { id: "sr2", component: "Reference Detector", category: "Reference Standard", source: "Calibrated detector uncertainty", value: 0.5, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.25, sensitivityCoefficient: 1.0, contribution: 0.0625, percentContribution: 51.2 },
      { id: "sr3", component: "Stray Light", category: "Equipment", source: "Stray/scattered light", value: 0.2, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.1155, sensitivityCoefficient: 1.0, contribution: 0.01334, percentContribution: 10.9 },
      { id: "sr4", component: "Bias Light", category: "Method", source: "Bias irradiance stability", value: 0.3, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.1732, sensitivityCoefficient: 0.5, contribution: 0.0075, percentContribution: 6.1 },
      { id: "sr5", component: "Repeatability", category: "Method", source: "Measurement repeatability", value: 0.15, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.0474, sensitivityCoefficient: 1.0, contribution: 0.00225, percentContribution: 1.8 },
    ],
    combinedUncertainty: 0.293,
    coverageFactor: 2.0,
    expandedUncertainty: 0.586,
  },
  iam: {
    type: "iam",
    label: "Incidence Angle Modifier (IAM)",
    standard: "IEC 61853-2",
    measurand: "IAM(θ)",
    unit: "dimensionless",
    rows: [
      { id: "a1", component: "Goniometer", category: "Equipment", source: "Angular positioning accuracy", value: 0.5, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.289, sensitivityCoefficient: 0.01, contribution: 8.33e-6, percentContribution: 18.5 },
      { id: "a2", component: "Irradiance", category: "Equipment", source: "Sensor cosine correction", value: 0.3, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.15, sensitivityCoefficient: 0.02, contribution: 9.0e-6, percentContribution: 20.0 },
      { id: "a3", component: "Cosine Corr.", category: "Method", source: "Cosine correction model", value: 0.5, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.289, sensitivityCoefficient: 0.015, contribution: 1.88e-5, percentContribution: 41.7 },
      { id: "a4", component: "Alignment", category: "Method", source: "Module alignment to beam", value: 0.2, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.1155, sensitivityCoefficient: 0.01, contribution: 1.33e-6, percentContribution: 3.0 },
      { id: "a5", component: "Repeatability", category: "Method", source: "Measurement repeatability", value: 0.1, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.0316, sensitivityCoefficient: 0.05, contribution: 2.5e-6, percentContribution: 5.6 },
    ],
    combinedUncertainty: 0.00671,
    coverageFactor: 2.0,
    expandedUncertainty: 0.01342,
  },
  wet_leakage: {
    type: "wet_leakage",
    label: "Wet Leakage Current Test",
    standard: "IEC 61215-2 MQT 15",
    measurand: "I_leakage",
    unit: "µA",
    rows: [
      { id: "w1", component: "Current Meter", category: "Equipment", source: "µA measurement accuracy", value: 0.5, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.25, sensitivityCoefficient: 1.0, contribution: 0.0625, percentContribution: 38.5 },
      { id: "w2", component: "Water Resistivity", category: "Environment", source: "Water conductivity variation", value: 100, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 57.74, sensitivityCoefficient: 0.001, contribution: 0.00333, percentContribution: 2.1 },
      { id: "w3", component: "Temperature", category: "Environment", source: "Water/ambient temp effect", value: 2.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 1.155, sensitivityCoefficient: 0.08, contribution: 0.00854, percentContribution: 5.3 },
      { id: "w4", component: "Voltage Source", category: "Equipment", source: "Applied 500V accuracy", value: 5.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 2.887, sensitivityCoefficient: 0.10, contribution: 0.0833, percentContribution: 51.3 },
      { id: "w5", component: "Repeatability", category: "Method", source: "Repeat measurements", value: 0.3, type: "A", distribution: "normal", divisor: 3.162, standardUncertainty: 0.0949, sensitivityCoefficient: 1.0, contribution: 0.009, percentContribution: 5.5 },
    ],
    combinedUncertainty: 0.403,
    coverageFactor: 2.0,
    expandedUncertainty: 0.806,
  },
  peel_test: {
    type: "peel_test",
    label: "Peel / Lap Shear Test",
    standard: "IEC 62788-1-2",
    measurand: "Peel Force",
    unit: "N/mm",
    rows: [
      { id: "p1", component: "Force Sensor", category: "Equipment", source: "Load cell accuracy (±0.5%)", value: 0.05, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.025, sensitivityCoefficient: 1.0, contribution: 6.25e-4, percentContribution: 45.5 },
      { id: "p2", component: "Displacement", category: "Equipment", source: "Crosshead displacement", value: 0.01, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.00577, sensitivityCoefficient: 0.5, contribution: 8.33e-6, percentContribution: 0.6 },
      { id: "p3", component: "Speed Control", category: "Equipment", source: "Peel speed variation", value: 0.5, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.289, sensitivityCoefficient: 0.05, contribution: 2.08e-4, percentContribution: 15.2 },
      { id: "p4", component: "Sample Prep", category: "Sample", source: "Cut width accuracy", value: 0.1, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.0577, sensitivityCoefficient: 0.3, contribution: 3.0e-4, percentContribution: 21.8 },
      { id: "p5", component: "Repeatability", category: "Method", source: "5 peel tests", value: 0.5, type: "A", distribution: "normal", divisor: 2.236, standardUncertainty: 0.224, sensitivityCoefficient: 0.10, contribution: 5.0e-4, percentContribution: 36.4 },
    ],
    combinedUncertainty: 0.0370,
    coverageFactor: 2.0,
    expandedUncertainty: 0.0740,
  },
  pid: {
    type: "pid",
    label: "Potential Induced Degradation",
    standard: "IEC TS 62804-1:2015",
    measurand: "ΔPmax",
    unit: "%",
    rows: [
      { id: "pid1", component: "Voltage Source", category: "Equipment", source: "±1500V DC accuracy", value: 15.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 8.66, sensitivityCoefficient: 0.001, contribution: 7.5e-5, percentContribution: 8.5 },
      { id: "pid2", component: "Chamber", category: "Equipment", source: "Temp/humidity uniformity", value: 2.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 1.155, sensitivityCoefficient: 0.05, contribution: 0.00333, percentContribution: 37.8 },
      { id: "pid3", component: "Leakage Current", category: "Equipment", source: "Leakage current measurement", value: 0.1, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.05, sensitivityCoefficient: 0.10, contribution: 2.5e-5, percentContribution: 2.8 },
      { id: "pid4", component: "Pmax Pre/Post", category: "Method", source: "Flash test uncertainty (×2)", value: 1.0, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.50, sensitivityCoefficient: 0.10, contribution: 0.0025, percentContribution: 28.4 },
      { id: "pid5", component: "Repeatability", category: "Method", source: "Module-to-module variation", value: 0.5, type: "A", distribution: "normal", divisor: 2.0, standardUncertainty: 0.25, sensitivityCoefficient: 0.20, contribution: 0.0025, percentContribution: 28.4 },
    ],
    combinedUncertainty: 0.0938,
    coverageFactor: 2.0,
    expandedUncertainty: 0.1876,
  },
  tc_dh_hf: {
    type: "tc_dh_hf",
    label: "TC / DH / HF Chamber Tests",
    standard: "IEC 61215-2 MQT 11/12/13",
    measurand: "ΔPmax",
    unit: "%",
    rows: [
      { id: "ch1", component: "Chamber Uniformity", category: "Equipment", source: "Spatial temp uniformity (±2°C)", value: 2.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 1.155, sensitivityCoefficient: 0.02, contribution: 5.33e-4, percentContribution: 12.2 },
      { id: "ch2", component: "Temp Sensor", category: "Equipment", source: "Thermocouple accuracy", value: 0.5, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.25, sensitivityCoefficient: 0.02, contribution: 2.5e-5, percentContribution: 0.6 },
      { id: "ch3", component: "Humidity Sensor", category: "Equipment", source: "RH sensor accuracy (±3%RH)", value: 3.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 1.732, sensitivityCoefficient: 0.01, contribution: 3.0e-4, percentContribution: 6.9 },
      { id: "ch4", component: "Cycle Count", category: "Method", source: "Cycle counter accuracy", value: 1.0, type: "B", distribution: "uniform", divisor: 1.732, standardUncertainty: 0.577, sensitivityCoefficient: 0.005, contribution: 8.33e-6, percentContribution: 0.2 },
      { id: "ch5", component: "Pmax Pre/Post", category: "Method", source: "Flash test uncertainty (×2)", value: 1.0, type: "B", distribution: "normal", divisor: 2.0, standardUncertainty: 0.50, sensitivityCoefficient: 0.20, contribution: 0.01, percentContribution: 229.0 },
      { id: "ch6", component: "Repeatability", category: "Method", source: "Module variation in batch", value: 0.3, type: "A", distribution: "normal", divisor: 1.732, standardUncertainty: 0.173, sensitivityCoefficient: 1.0, contribution: 0.030, percentContribution: 688.0 },
    ],
    combinedUncertainty: 0.202,
    coverageFactor: 2.0,
    expandedUncertainty: 0.404,
  },
}

export function getUncertaintyConfigForTest(testType: TestUncertaintyType): TestUncertaintyConfig {
  return TEST_UNCERTAINTY_CONFIGS[testType]
}
