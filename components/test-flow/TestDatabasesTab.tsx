// @ts-nocheck
'use client'

import { useState } from 'react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DBColumn {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  render?: (val: any, row: any) => React.ReactNode
}

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────

// 1. Insulation Resistance
const mockInsulationResistance = [
  { id: 'ir-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Initial', date: '2026-01-10', equipment: 'IR-TESTER-01', operator: 'Rajesh K', voltage: 1000, resistance: 2800, leakageCurrent: 0.36, humidity: 45, temp: 25, result: 'Pass' },
  { id: 'ir-002', moduleId: 'MOD-2026-001-A', stage: 'Post', testType: 'DH1000', date: '2026-02-15', equipment: 'IR-TESTER-01', operator: 'Priya M', voltage: 1000, resistance: 2450, leakageCurrent: 0.41, humidity: 85, temp: 25, result: 'Pass' },
  { id: 'ir-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Initial', date: '2026-01-10', equipment: 'IR-TESTER-02', operator: 'Suresh P', voltage: 1000, resistance: 3100, leakageCurrent: 0.32, humidity: 45, temp: 25, result: 'Pass' },
  { id: 'ir-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'DH1000', date: '2026-02-15', equipment: 'IR-TESTER-01', operator: 'Rajesh K', voltage: 1000, resistance: 1850, leakageCurrent: 0.54, humidity: 85, temp: 25, result: 'Fail' },
  { id: 'ir-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Initial', date: '2026-01-12', equipment: 'IR-TESTER-02', operator: 'Anitha R', voltage: 500, resistance: 4200, leakageCurrent: 0.12, humidity: 50, temp: 23, result: 'Pass' },
  { id: 'ir-006', moduleId: 'MOD-2026-002-A', stage: 'Post', testType: 'TC200', date: '2026-03-01', equipment: 'IR-TESTER-02', operator: 'Anitha R', voltage: 500, resistance: 3750, leakageCurrent: 0.13, humidity: 55, temp: 25, result: 'Pass' },
]

// 2. Wet Leakage Current
const mockWetLeakage = [
  { id: 'wl-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Initial', date: '2026-01-11', equipment: 'WLC-TESTER-01', operator: 'Rajesh K', voltage: 500, leakageCurrent: 3.2, waterTemp: 23, conductivity: 2.5, result: 'Pass' },
  { id: 'wl-002', moduleId: 'MOD-2026-001-A', stage: 'Post', testType: 'HF10', date: '2026-02-20', equipment: 'WLC-TESTER-01', operator: 'Priya M', voltage: 500, leakageCurrent: 4.8, waterTemp: 23, conductivity: 2.8, result: 'Pass' },
  { id: 'wl-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Initial', date: '2026-01-11', equipment: 'WLC-TESTER-02', operator: 'Suresh P', voltage: 500, leakageCurrent: 2.9, waterTemp: 24, conductivity: 2.4, result: 'Pass' },
  { id: 'wl-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'HF10', date: '2026-02-20', equipment: 'WLC-TESTER-01', operator: 'Rajesh K', voltage: 500, leakageCurrent: 12.4, waterTemp: 24, conductivity: 2.6, result: 'Fail' },
  { id: 'wl-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Initial', date: '2026-01-13', equipment: 'WLC-TESTER-02', operator: 'Anitha R', voltage: 500, leakageCurrent: 2.1, waterTemp: 22, conductivity: 2.3, result: 'Pass' },
  { id: 'wl-006', moduleId: 'MOD-2026-002-B', stage: 'Pre', testType: 'Initial', date: '2026-01-13', equipment: 'WLC-TESTER-02', operator: 'Priya M', voltage: 500, leakageCurrent: 3.5, waterTemp: 23, conductivity: 2.7, result: 'Pass' },
]

// 3. Ground Continuity
const mockGroundContinuity = [
  { id: 'gc-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', date: '2026-01-12', equipment: 'GC-TESTER-01', operator: 'Rajesh K', resistance: 45, current: 25, duration: 60, result: 'Pass' },
  { id: 'gc-002', moduleId: 'MOD-2026-001-A', stage: 'Post', date: '2026-02-16', equipment: 'GC-TESTER-01', operator: 'Priya M', resistance: 52, current: 25, duration: 60, result: 'Pass' },
  { id: 'gc-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', date: '2026-01-12', equipment: 'GC-TESTER-02', operator: 'Suresh P', resistance: 38, current: 25, duration: 60, result: 'Pass' },
  { id: 'gc-004', moduleId: 'MOD-2026-001-B', stage: 'Post', date: '2026-02-16', equipment: 'GC-TESTER-01', operator: 'Rajesh K', resistance: 210, current: 25, duration: 60, result: 'Fail' },
  { id: 'gc-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', date: '2026-01-14', equipment: 'GC-TESTER-02', operator: 'Anitha R', resistance: 41, current: 25, duration: 60, result: 'Pass' },
  { id: 'gc-006', moduleId: 'MOD-2026-002-B', stage: 'Pre', date: '2026-01-14', equipment: 'GC-TESTER-02', operator: 'Anitha R', resistance: 44, current: 25, duration: 60, result: 'Pass' },
]

// 4. EL Imaging
const mockELImaging = [
  { id: 'el-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Initial EL', date: '2026-01-13', equipment: 'EL-CAM-01', operator: 'Priya M', forwardCurrent: 9.8, exposureTime: 5000, cracksCount: 0, severity: 'None', imageRef: 'EL-MOD001A-PRE-001.tif' },
  { id: 'el-002', moduleId: 'MOD-2026-001-A', stage: 'Post', testType: 'Post-TC200', date: '2026-02-18', equipment: 'EL-CAM-01', operator: 'Priya M', forwardCurrent: 9.8, exposureTime: 5000, cracksCount: 3, severity: 'Minor', imageRef: 'EL-MOD001A-POST-TC-001.tif' },
  { id: 'el-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Initial EL', date: '2026-01-13', equipment: 'EL-CAM-02', operator: 'Rajesh K', forwardCurrent: 9.8, exposureTime: 5000, cracksCount: 1, severity: 'Minor', imageRef: 'EL-MOD001B-PRE-001.tif' },
  { id: 'el-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'Post-TC200', date: '2026-02-18', equipment: 'EL-CAM-01', operator: 'Priya M', forwardCurrent: 9.8, exposureTime: 5000, cracksCount: 8, severity: 'Severe', imageRef: 'EL-MOD001B-POST-TC-001.tif' },
  { id: 'el-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Initial EL', date: '2026-01-15', equipment: 'EL-CAM-02', operator: 'Suresh P', forwardCurrent: 10.2, exposureTime: 5000, cracksCount: 0, severity: 'None', imageRef: 'EL-MOD002A-PRE-001.tif' },
  { id: 'el-006', moduleId: 'MOD-2026-002-A', stage: 'Post', testType: 'Post-DH1000', date: '2026-03-02', equipment: 'EL-CAM-02', operator: 'Suresh P', forwardCurrent: 10.2, exposureTime: 5000, cracksCount: 2, severity: 'Minor', imageRef: 'EL-MOD002A-POST-DH-001.tif' },
]

// 5. IR Thermal Imaging
const mockIRImaging = [
  { id: 'ir-t-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Initial IR', date: '2026-01-13', equipment: 'IR-CAM-FLIR-01', operator: 'Priya M', hotSpotTemp: 28.4, deltaT: 3.2, ambientTemp: 25.2, irradiance: 980, imageRef: 'IR-MOD001A-PRE-001.jpg' },
  { id: 'ir-t-002', moduleId: 'MOD-2026-001-A', stage: 'Post', testType: 'Post-DH1000', date: '2026-02-18', equipment: 'IR-CAM-FLIR-01', operator: 'Priya M', hotSpotTemp: 38.6, deltaT: 13.4, ambientTemp: 25.2, irradiance: 985, imageRef: 'IR-MOD001A-POST-DH-001.jpg' },
  { id: 'ir-t-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Initial IR', date: '2026-01-13', equipment: 'IR-CAM-FLIR-02', operator: 'Rajesh K', hotSpotTemp: 27.8, deltaT: 2.6, ambientTemp: 25.2, irradiance: 980, imageRef: 'IR-MOD001B-PRE-001.jpg' },
  { id: 'ir-t-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'Post-DH1000', date: '2026-02-18', equipment: 'IR-CAM-FLIR-01', operator: 'Priya M', hotSpotTemp: 52.1, deltaT: 26.9, ambientTemp: 25.2, irradiance: 985, imageRef: 'IR-MOD001B-POST-DH-001.jpg' },
  { id: 'ir-t-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Initial IR', date: '2026-01-15', equipment: 'IR-CAM-FLIR-02', operator: 'Suresh P', hotSpotTemp: 26.9, deltaT: 1.7, ambientTemp: 25.2, irradiance: 975, imageRef: 'IR-MOD002A-PRE-001.jpg' },
]

// 6. Mechanical Load
const mockMechanicalLoad = [
  { id: 'ml-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Static Load', date: '2026-01-16', equipment: 'MECH-RIG-01', operator: 'Suresh P', load: 2400, cycles: 3, side: 'Front', deflection: 12.4, result: 'Pass' },
  { id: 'ml-002', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Static Load', date: '2026-01-16', equipment: 'MECH-RIG-01', operator: 'Suresh P', load: 2400, cycles: 3, side: 'Rear', deflection: 11.8, result: 'Pass' },
  { id: 'ml-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Dynamic Load', date: '2026-01-17', equipment: 'MECH-RIG-02', operator: 'Anitha R', load: 2400, cycles: 1000, side: 'Front', deflection: 14.2, result: 'Pass' },
  { id: 'ml-004', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Dynamic Load', date: '2026-01-17', equipment: 'MECH-RIG-02', operator: 'Anitha R', load: 2400, cycles: 1000, side: 'Rear', deflection: 13.7, result: 'Pass' },
  { id: 'ml-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Static Load', date: '2026-01-18', equipment: 'MECH-RIG-01', operator: 'Rajesh K', load: 5400, cycles: 3, side: 'Front', deflection: 18.9, result: 'Pass' },
  { id: 'ml-006', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Static Load', date: '2026-01-18', equipment: 'MECH-RIG-01', operator: 'Rajesh K', load: 5400, cycles: 3, side: 'Rear', deflection: 17.3, result: 'Pass' },
]

// 7. Hail Impact
const mockHailImpact = [
  { id: 'hi-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', date: '2026-01-20', equipment: 'HAIL-GUN-01', operator: 'Suresh P', ballDia: 25, velocity: 23, impactPoints: 11, damageFound: 'No', result: 'Pass' },
  { id: 'hi-002', moduleId: 'MOD-2026-001-B', stage: 'Pre', date: '2026-01-20', equipment: 'HAIL-GUN-01', operator: 'Suresh P', ballDia: 25, velocity: 23, impactPoints: 11, damageFound: 'No', result: 'Pass' },
  { id: 'hi-003', moduleId: 'MOD-2026-002-A', stage: 'Pre', date: '2026-01-21', equipment: 'HAIL-GUN-02', operator: 'Rajesh K', ballDia: 35, velocity: 23, impactPoints: 11, damageFound: 'Micro-crack cell 23', result: 'Fail' },
  { id: 'hi-004', moduleId: 'MOD-2026-002-B', stage: 'Pre', date: '2026-01-21', equipment: 'HAIL-GUN-02', operator: 'Rajesh K', ballDia: 35, velocity: 23, impactPoints: 11, damageFound: 'No', result: 'Pass' },
  { id: 'hi-005', moduleId: 'MOD-2026-003-A', stage: 'Pre', date: '2026-01-22', equipment: 'HAIL-GUN-01', operator: 'Priya M', ballDia: 25, velocity: 23, impactPoints: 11, damageFound: 'No', result: 'Pass' },
]

// 8. Bypass Diode
const mockBypassDiode = [
  { id: 'bd-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Electrical', date: '2026-01-14', equipment: 'BD-TESTER-01', operator: 'Rajesh K', diodePos: 'D1', forwardVoltage: 0.61, reverseCurrent: 2.1, thermalTemp: 75, result: 'Pass' },
  { id: 'bd-002', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Electrical', date: '2026-01-14', equipment: 'BD-TESTER-01', operator: 'Rajesh K', diodePos: 'D2', forwardVoltage: 0.62, reverseCurrent: 1.9, thermalTemp: 74, result: 'Pass' },
  { id: 'bd-003', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Electrical', date: '2026-01-14', equipment: 'BD-TESTER-01', operator: 'Rajesh K', diodePos: 'D3', forwardVoltage: 0.60, reverseCurrent: 2.3, thermalTemp: 76, result: 'Pass' },
  { id: 'bd-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'Post-TC200', date: '2026-02-19', equipment: 'BD-TESTER-02', operator: 'Priya M', diodePos: 'D1', forwardVoltage: 0.59, reverseCurrent: 2.5, thermalTemp: 78, result: 'Pass' },
  { id: 'bd-005', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'Post-TC200', date: '2026-02-19', equipment: 'BD-TESTER-02', operator: 'Priya M', diodePos: 'D2', forwardVoltage: 1.85, reverseCurrent: 145, thermalTemp: 122, result: 'Fail' },
  { id: 'bd-006', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Electrical', date: '2026-01-15', equipment: 'BD-TESTER-01', operator: 'Suresh P', diodePos: 'D1', forwardVoltage: 0.63, reverseCurrent: 1.8, thermalTemp: 73, result: 'Pass' },
]

// 9. Peel Test / Lap Shear
const mockPeelTest = [
  { id: 'pt-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Peel Test', date: '2026-01-22', equipment: 'UTM-INSTRON-01', operator: 'Anitha R', force: 82.4, width: 25, adhesionStrength: 3.30, failureMode: 'Adhesive', result: 'Pass' },
  { id: 'pt-002', moduleId: 'MOD-2026-001-A', stage: 'Post', testType: 'Post-DH1000', date: '2026-02-25', equipment: 'UTM-INSTRON-01', operator: 'Anitha R', force: 68.2, width: 25, adhesionStrength: 2.73, failureMode: 'Adhesive', result: 'Pass' },
  { id: 'pt-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Lap Shear', date: '2026-01-22', equipment: 'UTM-INSTRON-02', operator: 'Suresh P', force: 195.6, width: 25, adhesionStrength: 7.82, failureMode: 'Cohesive', result: 'Pass' },
  { id: 'pt-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'Post-DH1000', date: '2026-02-25', equipment: 'UTM-INSTRON-01', operator: 'Anitha R', force: 41.8, width: 25, adhesionStrength: 1.67, failureMode: 'Mixed', result: 'Fail' },
  { id: 'pt-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Peel Test', date: '2026-01-23', equipment: 'UTM-INSTRON-02', operator: 'Priya M', force: 88.3, width: 25, adhesionStrength: 3.53, failureMode: 'Adhesive', result: 'Pass' },
  { id: 'pt-006', moduleId: 'MOD-2026-002-A', stage: 'Post', testType: 'Post-TC200', date: '2026-03-05', equipment: 'UTM-INSTRON-02', operator: 'Priya M', force: 79.1, width: 25, adhesionStrength: 3.16, failureMode: 'Adhesive', result: 'Pass' },
]

// 10. Visual Inspection
const mockVisualInspection = [
  { id: 'vi-001', moduleId: 'MOD-2026-001-A', stage: 'Pre', testType: 'Initial VI', date: '2026-01-08', inspector: 'Rajesh K', defectType: 'None', location: 'N/A', severity: 'None', imageRef: 'VI-MOD001A-PRE-001.jpg', comments: 'Clean, no visible defects' },
  { id: 'vi-002', moduleId: 'MOD-2026-001-A', stage: 'Post', testType: 'Post-DH1000', date: '2026-02-16', inspector: 'Priya M', defectType: 'Discolouration', location: 'Cell row 3-4', severity: 'Minor', imageRef: 'VI-MOD001A-POST-001.jpg', comments: 'Slight yellowing on encapsulant' },
  { id: 'vi-003', moduleId: 'MOD-2026-001-B', stage: 'Pre', testType: 'Initial VI', date: '2026-01-08', inspector: 'Suresh P', defectType: 'Micro-crack', location: 'Cell C12', severity: 'Minor', imageRef: 'VI-MOD001B-PRE-001.jpg', comments: 'Pre-existing micro crack, documented' },
  { id: 'vi-004', moduleId: 'MOD-2026-001-B', stage: 'Post', testType: 'Post-DH1000', date: '2026-02-16', inspector: 'Suresh P', defectType: 'Delamination', location: 'Edge bottom-left', severity: 'Major', imageRef: 'VI-MOD001B-POST-001.jpg', comments: 'Delamination propagated from edge' },
  { id: 'vi-005', moduleId: 'MOD-2026-002-A', stage: 'Pre', testType: 'Initial VI', date: '2026-01-09', inspector: 'Anitha R', defectType: 'None', location: 'N/A', severity: 'None', imageRef: 'VI-MOD002A-PRE-001.jpg', comments: 'No defects found' },
  { id: 'vi-006', moduleId: 'MOD-2026-002-A', stage: 'Post', testType: 'Post-TC200', date: '2026-03-03', inspector: 'Anitha R', defectType: 'Snail Trail', location: 'Cell B7, B8', severity: 'Minor', imageRef: 'VI-MOD002A-POST-001.jpg', comments: 'Snail trails visible after TC' },
]

// 11. NMOT/NOCT
const mockNMOT = [
  { id: 'nmot-001', moduleId: 'MOD-2026-001-A', date: '2026-01-25', equipment: 'OUTDOOR-RACK-01', operator: 'Rajesh K', irradiance: 800, windSpeed: 1.0, ambientTemp: 20.0, moduleTemp: 43.2, nmotValue: 43.2 },
  { id: 'nmot-002', moduleId: 'MOD-2026-001-A', date: '2026-01-26', equipment: 'OUTDOOR-RACK-01', operator: 'Rajesh K', irradiance: 800, windSpeed: 1.2, ambientTemp: 20.3, moduleTemp: 42.9, nmotValue: 42.9 },
  { id: 'nmot-003', moduleId: 'MOD-2026-001-B', date: '2026-01-25', equipment: 'OUTDOOR-RACK-02', operator: 'Priya M', irradiance: 800, windSpeed: 0.9, ambientTemp: 20.0, moduleTemp: 44.1, nmotValue: 44.1 },
  { id: 'nmot-004', moduleId: 'MOD-2026-001-B', date: '2026-01-26', equipment: 'OUTDOOR-RACK-02', operator: 'Priya M', irradiance: 800, windSpeed: 1.1, ambientTemp: 20.2, moduleTemp: 43.8, nmotValue: 43.8 },
  { id: 'nmot-005', moduleId: 'MOD-2026-002-A', date: '2026-01-28', equipment: 'OUTDOOR-RACK-01', operator: 'Suresh P', irradiance: 800, windSpeed: 1.0, ambientTemp: 20.5, moduleTemp: 44.6, nmotValue: 44.6 },
  { id: 'nmot-006', moduleId: 'MOD-2026-002-B', date: '2026-01-28', equipment: 'OUTDOOR-RACK-02', operator: 'Suresh P', irradiance: 800, windSpeed: 1.0, ambientTemp: 20.1, moduleTemp: 43.5, nmotValue: 43.5 },
]

// 12. Stabilization
const mockStabilization = [
  { id: 'stab-001', moduleId: 'MOD-2026-001-A', date: '2026-01-30', equipment: 'SUN-SIM-PASAN-01', operator: 'Rajesh K', exposureHours: 5, pmaxReading: 420.8, deltaFromInitial: -0.17, stabilized: 'N' },
  { id: 'stab-002', moduleId: 'MOD-2026-001-A', date: '2026-01-31', equipment: 'SUN-SIM-PASAN-01', operator: 'Rajesh K', exposureHours: 10, pmaxReading: 421.2, deltaFromInitial: -0.07, stabilized: 'N' },
  { id: 'stab-003', moduleId: 'MOD-2026-001-A', date: '2026-02-01', equipment: 'SUN-SIM-PASAN-01', operator: 'Rajesh K', exposureHours: 15, pmaxReading: 421.5, deltaFromInitial: 0.00, stabilized: 'Y' },
  { id: 'stab-004', moduleId: 'MOD-2026-001-B', date: '2026-01-30', equipment: 'SUN-SIM-PASAN-02', operator: 'Priya M', exposureHours: 5, pmaxReading: 419.1, deltaFromInitial: -0.33, stabilized: 'N' },
  { id: 'stab-005', moduleId: 'MOD-2026-001-B', date: '2026-01-31', equipment: 'SUN-SIM-PASAN-02', operator: 'Priya M', exposureHours: 10, pmaxReading: 419.6, deltaFromInitial: -0.21, stabilized: 'N' },
  { id: 'stab-006', moduleId: 'MOD-2026-001-B', date: '2026-02-01', equipment: 'SUN-SIM-PASAN-02', operator: 'Priya M', exposureHours: 15, pmaxReading: 420.1, deltaFromInitial: -0.09, stabilized: 'Y' },
]

// 13. Damp Heat / TC / HF Environmental
const mockEnvironmental = [
  { id: 'env-001', moduleId: 'MOD-2026-001-A', stage: 'In-progress', testType: 'DH', date: '2026-02-01', equipment: 'CHAMBER-WEISS-01', operator: 'Anitha R', hoursCycles: 500, temp: 85, humidity: 85, status: 'In Progress' },
  { id: 'env-002', moduleId: 'MOD-2026-001-A', stage: 'Complete', testType: 'DH', date: '2026-02-15', equipment: 'CHAMBER-WEISS-01', operator: 'Anitha R', hoursCycles: 1000, temp: 85, humidity: 85, status: 'Complete' },
  { id: 'env-003', moduleId: 'MOD-2026-001-B', stage: 'Complete', testType: 'TC', date: '2026-02-12', equipment: 'CHAMBER-ESPEC-01', operator: 'Suresh P', hoursCycles: 200, temp: -40, humidity: 0, status: 'Complete' },
  { id: 'env-004', moduleId: 'MOD-2026-001-B', stage: 'Complete', testType: 'HF', date: '2026-02-10', equipment: 'CHAMBER-ESPEC-02', operator: 'Suresh P', hoursCycles: 10, temp: 85, humidity: 85, status: 'Complete' },
  { id: 'env-005', moduleId: 'MOD-2026-002-A', stage: 'In-progress', testType: 'TC', date: '2026-03-01', equipment: 'CHAMBER-ESPEC-01', operator: 'Priya M', hoursCycles: 100, temp: -40, humidity: 0, status: 'In Progress' },
  { id: 'env-006', moduleId: 'MOD-2026-002-A', stage: 'Complete', testType: 'UV', date: '2026-03-05', equipment: 'CHAMBER-UV-01', operator: 'Rajesh K', hoursCycles: 15, temp: 60, humidity: 50, status: 'Complete' },
]

// ─────────────────────────────────────────────
// Generic Database Table Component
// ─────────────────────────────────────────────
function resultBadge(result: string) {
  const base = 'text-xs px-2 py-0.5 rounded-full font-semibold'
  if (result === 'Pass' || result === 'Y' || result === 'Complete') return <span className={`${base} bg-green-100 text-green-700`}>{result}</span>
  if (result === 'Fail' || result === 'N') return <span className={`${base} bg-red-100 text-red-700`}>{result}</span>
  if (result === 'In Progress') return <span className={`${base} bg-blue-100 text-blue-700`}>{result}</span>
  return <span className={`${base} bg-gray-100 text-gray-600`}>{result}</span>
}

function stageBadge(stage: string) {
  const base = 'text-xs px-2 py-0.5 rounded-full font-medium'
  if (stage === 'Pre') return <span className={`${base} bg-blue-100 text-blue-700`}>Pre</span>
  if (stage === 'Post') return <span className={`${base} bg-green-100 text-green-700`}>Post</span>
  return <span className={`${base} bg-gray-100 text-gray-600`}>{stage}</span>
}

interface GenericDBConfig {
  title: string
  csvColumns: string
  columns: DBColumn[]
  mockData: any[]
  stageField?: string
  testTypeField?: string
  moduleField?: string
}

function GenericTestDBTab({ config }: { config: GenericDBConfig }) {
  const [data] = useState(config.mockData)
  const [filterModule, setFilterModule] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [uploadMsg, setUploadMsg] = useState('')

  const moduleField = config.moduleField ?? 'moduleId'
  const stageField = config.stageField ?? 'stage'
  const testTypeField = config.testTypeField ?? 'testType'

  const modules = [...new Set(data.map((r: any) => r[moduleField]))]
  const stages = config.stageField !== null ? [...new Set(data.map((r: any) => r[stageField]))] : []
  const testTypes = config.testTypeField !== null ? [...new Set(data.map((r: any) => r[testTypeField]))] : []

  const filtered = data.filter((r: any) => {
    const modOk = filterModule === 'all' || r[moduleField] === filterModule
    const stageOk = filterStage === 'all' || !config.stageField || r[stageField] === filterStage
    const typeOk = filterType === 'all' || !config.testTypeField || r[testTypeField] === filterType
    return modOk && stageOk && typeOk
  })

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadMsg(`Parsing ${file.name}...`)
    setTimeout(() => {
      setUploadMsg(`Columns validated. ${Math.floor(Math.random() * 8) + 3} records ready to import into Master DB.`)
    }, 900)
  }

  return (
    <div className="space-y-4">
      {/* CSV Upload */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="cursor-pointer flex items-center gap-2 text-sm border-2 border-dashed border-amber-300 rounded-lg px-4 py-2 hover:border-amber-400 hover:bg-amber-50">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span className="text-amber-600 font-medium">Upload CSV</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
          </label>
          {uploadMsg
            ? <span className="text-xs text-green-600 font-medium">{uploadMsg}</span>
            : <span className="text-xs text-gray-400">No file selected</span>
          }
          <div className="ml-auto text-xs text-gray-400 bg-gray-50 border rounded px-3 py-1.5 font-mono">
            Expected: {config.csvColumns}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-sm text-gray-800">{config.title} <span className="text-gray-400 font-normal">({filtered.length} records)</span></h3>
          <div className="flex gap-2 flex-wrap">
            <select className="text-xs border rounded px-2 py-1 bg-white" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
              <option value="all">All Modules</option>
              {modules.map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>
            {config.stageField && (
              <select className="text-xs border rounded px-2 py-1 bg-white" value={filterStage} onChange={e => setFilterStage(e.target.value)}>
                <option value="all">Pre + Post</option>
                {stages.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {config.testTypeField && testTypes.length > 0 && (
              <select className="text-xs border rounded px-2 py-1 bg-white" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="all">All Test Types</option>
                {testTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                {config.columns.map(col => (
                  <th key={col.key} className={`px-2 py-2 font-medium whitespace-nowrap text-${col.align ?? 'left'}`}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={config.columns.length} className="px-2 py-8 text-center text-gray-400">No records match the current filters</td></tr>
              ) : filtered.map((row: any) => (
                <tr key={row.id} className="hover:bg-amber-50 transition-colors">
                  {config.columns.map(col => (
                    <td key={col.key} className={`px-2 py-1.5 text-${col.align ?? 'left'}`}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
          <span>Showing {filtered.length} of {data.length} total records</span>
          <button className="text-xs text-amber-600 hover:underline">Export CSV</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Database Configurations
// ─────────────────────────────────────────────

const IR_CONFIG: GenericDBConfig = {
  title: 'Insulation Resistance Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Applied Voltage(V), Resistance(MOhm), Leakage Current(uA), Humidity(%), Temp(C), Pass/Fail',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockInsulationResistance,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'voltage', label: 'Voltage (V)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'resistance', label: 'Resistance (MOhm)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'leakageCurrent', label: 'Leakage (uA)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'humidity', label: 'RH (%)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'temp', label: 'Temp (C)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const WL_CONFIG: GenericDBConfig = {
  title: 'Wet Leakage Current Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Applied Voltage(V), Leakage Current(uA), Water Temp(C), Conductivity(uS/cm), Pass/Fail',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockWetLeakage,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'voltage', label: 'Voltage (V)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'leakageCurrent', label: 'Leakage (uA)', align: 'right', render: (v) => <span className="font-mono">{v.toFixed(1)}</span> },
    { key: 'waterTemp', label: 'Water Temp (C)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'conductivity', label: 'Conductivity (uS/cm)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const GC_CONFIG: GenericDBConfig = {
  title: 'Ground Continuity Database',
  csvColumns: 'Module ID, Stage, Date, Equipment, Operator, Resistance(mOhm), Current(A), Duration(s), Pass/Fail',
  stageField: 'stage',
  testTypeField: null,
  mockData: mockGroundContinuity,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'resistance', label: 'Resistance (mOhm)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'current', label: 'Current (A)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'duration', label: 'Duration (s)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const EL_CONFIG: GenericDBConfig = {
  title: 'EL Imaging Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Forward Current(A), Exposure Time(ms), Cell Cracks Count, Severity, Image Reference',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockELImaging,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'forwardCurrent', label: 'Fwd I (A)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'exposureTime', label: 'Exp. (ms)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'cracksCount', label: 'Cracks', align: 'right', render: (v) => <span className={`font-mono font-semibold ${v > 0 ? 'text-red-600' : 'text-green-600'}`}>{v}</span> },
    { key: 'severity', label: 'Severity', render: (v) => {
      const cls = v === 'None' ? 'bg-green-50 text-green-700' : v === 'Minor' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
      return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{v}</span>
    }},
    { key: 'imageRef', label: 'Image Ref', render: (v) => <span className="text-blue-600 hover:underline cursor-pointer">{v}</span> },
  ],
}

const IR_THERMAL_CONFIG: GenericDBConfig = {
  title: 'IR Thermal Imaging Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Hot Spot Temp(C), Delta T(C), Ambient Temp(C), Irradiance(W/m2), Image Reference',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockIRImaging,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'hotSpotTemp', label: 'Hot Spot (C)', align: 'right', render: (v) => <span className={`font-mono font-semibold ${v > 45 ? 'text-red-600' : 'text-gray-700'}`}>{v}</span> },
    { key: 'deltaT', label: 'Delta T (C)', align: 'right', render: (v) => <span className={`font-mono font-semibold ${v > 10 ? 'text-red-600' : v > 5 ? 'text-yellow-600' : 'text-green-600'}`}>{v}</span> },
    { key: 'ambientTemp', label: 'Ambient (C)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'irradiance', label: 'G (W/m2)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'imageRef', label: 'Image Ref', render: (v) => <span className="text-blue-600 hover:underline cursor-pointer">{v}</span> },
  ],
}

const ML_CONFIG: GenericDBConfig = {
  title: 'Mechanical Load Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Load(Pa), Cycles, Front/Rear, Deflection(mm), Pass/Fail',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockMechanicalLoad,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'load', label: 'Load (Pa)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'cycles', label: 'Cycles', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'side', label: 'Side' },
    { key: 'deflection', label: 'Deflection (mm)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const HI_CONFIG: GenericDBConfig = {
  title: 'Hail Impact Database',
  csvColumns: 'Module ID, Stage, Date, Equipment, Operator, Ice Ball Dia(mm), Velocity(m/s), Impact Points, Damage Found, Pass/Fail',
  stageField: 'stage',
  testTypeField: null,
  mockData: mockHailImpact,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'ballDia', label: 'Ball Dia (mm)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'velocity', label: 'Velocity (m/s)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'impactPoints', label: 'Impact Pts', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'damageFound', label: 'Damage Found', render: (v) => <span className={v === 'No' ? 'text-green-600' : 'text-red-600 font-medium'}>{v}</span> },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const BD_CONFIG: GenericDBConfig = {
  title: 'Bypass Diode Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Diode Position, Forward Voltage(V), Reverse Current(uA), Thermal Test Temp(C), Pass/Fail',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockBypassDiode,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'diodePos', label: 'Diode Pos.' },
    { key: 'forwardVoltage', label: 'Vf (V)', align: 'right', render: (v) => <span className="font-mono">{v.toFixed(2)}</span> },
    { key: 'reverseCurrent', label: 'Ir (uA)', align: 'right', render: (v) => <span className={`font-mono ${v > 100 ? 'text-red-600 font-semibold' : ''}`}>{v}</span> },
    { key: 'thermalTemp', label: 'Thermal (C)', align: 'right', render: (v) => <span className={`font-mono ${v > 100 ? 'text-red-600 font-semibold' : ''}`}>{v}</span> },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const PT_CONFIG: GenericDBConfig = {
  title: 'Peel Test / Lap Shear Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Equipment, Operator, Force(N), Width(mm), Adhesion Strength(N/mm), Failure Mode, Pass/Fail',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockPeelTest,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'force', label: 'Force (N)', align: 'right', render: (v) => <span className="font-mono">{v.toFixed(1)}</span> },
    { key: 'width', label: 'Width (mm)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'adhesionStrength', label: 'Adhesion (N/mm)', align: 'right', render: (v) => <span className="font-mono">{v.toFixed(2)}</span> },
    { key: 'failureMode', label: 'Failure Mode' },
    { key: 'result', label: 'Pass/Fail', render: (v) => resultBadge(v) },
  ],
}

const VI_CONFIG: GenericDBConfig = {
  title: 'Visual Inspection Database',
  csvColumns: 'Module ID, Stage, Test Type, Date, Inspector, Defect Type, Location, Severity, Image Reference, Comments',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockVisualInspection,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type' },
    { key: 'date', label: 'Date' },
    { key: 'inspector', label: 'Inspector' },
    { key: 'defectType', label: 'Defect Type', render: (v) => <span className={v === 'None' ? 'text-green-600' : 'text-red-600 font-medium'}>{v}</span> },
    { key: 'location', label: 'Location' },
    { key: 'severity', label: 'Severity', render: (v) => {
      const cls = v === 'None' ? 'bg-green-50 text-green-700' : v === 'Minor' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
      return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{v}</span>
    }},
    { key: 'imageRef', label: 'Image Ref', render: (v) => <span className="text-blue-600 hover:underline cursor-pointer">{v}</span> },
    { key: 'comments', label: 'Comments', render: (v) => <span className="text-gray-500 max-w-xs truncate block" title={v}>{v}</span> },
  ],
}

const NMOT_CONFIG: GenericDBConfig = {
  title: 'NMOT / NOCT Database',
  csvColumns: 'Module ID, Date, Equipment, Operator, Irradiance(W/m2), Wind Speed(m/s), Ambient Temp(C), Module Temp(C), NMOT/NOCT Value(C)',
  stageField: null,
  testTypeField: null,
  mockData: mockNMOT,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'irradiance', label: 'G (W/m2)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'windSpeed', label: 'Wind (m/s)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'ambientTemp', label: 'Ambient (C)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'moduleTemp', label: 'Module Temp (C)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'nmotValue', label: 'NMOT/NOCT (C)', align: 'right', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
  ],
}

const STAB_CONFIG: GenericDBConfig = {
  title: 'Stabilization Database',
  csvColumns: 'Module ID, Date, Equipment, Operator, Exposure Hours(kWh/m2), Pmax Reading(W), Delta from Initial(%), Stabilized(Y/N)',
  stageField: null,
  testTypeField: null,
  mockData: mockStabilization,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Equipment' },
    { key: 'operator', label: 'Operator' },
    { key: 'exposureHours', label: 'Exposure (kWh/m2)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'pmaxReading', label: 'Pmax (W)', align: 'right', render: (v) => <span className="font-mono font-semibold">{v.toFixed(1)}</span> },
    { key: 'deltaFromInitial', label: 'Delta (%)', align: 'right', render: (v) => <span className={`font-mono ${Math.abs(v) > 0.1 ? 'text-yellow-600' : 'text-green-600'}`}>{v > 0 ? '+' : ''}{v.toFixed(2)}</span> },
    { key: 'stabilized', label: 'Stabilized', render: (v) => resultBadge(v) },
  ],
}

const ENV_CONFIG: GenericDBConfig = {
  title: 'Damp Heat / TC / HF Environmental Database',
  csvColumns: 'Module ID, Stage, Test Type(DH/TC/HF/UV), Date, Equipment(Chamber ID), Operator, Hours/Cycles Completed, Temp(C), Humidity(%), Status',
  stageField: 'stage',
  testTypeField: 'testType',
  mockData: mockEnvironmental,
  columns: [
    { key: 'moduleId', label: 'Module ID', render: (v) => <span className="font-mono font-semibold text-amber-700">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v) => stageBadge(v) },
    { key: 'testType', label: 'Test Type', render: (v) => {
      const colors: Record<string, string> = { DH: 'bg-blue-100 text-blue-700', TC: 'bg-purple-100 text-purple-700', HF: 'bg-orange-100 text-orange-700', UV: 'bg-yellow-100 text-yellow-700' }
      return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors[v] ?? 'bg-gray-100 text-gray-600'}`}>{v}</span>
    }},
    { key: 'date', label: 'Date' },
    { key: 'equipment', label: 'Chamber ID' },
    { key: 'operator', label: 'Operator' },
    { key: 'hoursCycles', label: 'Hrs / Cycles', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'temp', label: 'Temp (C)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'humidity', label: 'RH (%)', align: 'right', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => resultBadge(v) },
  ],
}

// ─────────────────────────────────────────────
// Sub-tab definitions
// ─────────────────────────────────────────────
const DB_TABS = [
  { id: 'ir-db', label: 'Insulation Resistance' },
  { id: 'wl-db', label: 'Wet Leakage' },
  { id: 'gc-db', label: 'Ground Continuity' },
  { id: 'el-db', label: 'EL Imaging' },
  { id: 'ir-therm-db', label: 'IR Thermal' },
  { id: 'ml-db', label: 'Mech. Load' },
  { id: 'hi-db', label: 'Hail Impact' },
  { id: 'bd-db', label: 'Bypass Diode' },
  { id: 'pt-db', label: 'Peel / Lap Shear' },
  { id: 'vi-db', label: 'Visual Inspection' },
  { id: 'nmot-db', label: 'NMOT/NOCT' },
  { id: 'stab-db', label: 'Stabilization' },
  { id: 'env-db', label: 'Env. (DH/TC/HF/UV)' },
]

// ─────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────
export function TestDatabasesTab() {
  const [activeDB, setActiveDB] = useState('ir-db')

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <nav className="flex min-w-max px-2 pt-2">
          {DB_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDB(tab.id)}
              className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap mr-1 rounded-t transition-colors ${
                activeDB === tab.id
                  ? 'border-amber-500 text-amber-700 bg-amber-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab content */}
      {activeDB === 'ir-db' && <GenericTestDBTab config={IR_CONFIG} />}
      {activeDB === 'wl-db' && <GenericTestDBTab config={WL_CONFIG} />}
      {activeDB === 'gc-db' && <GenericTestDBTab config={GC_CONFIG} />}
      {activeDB === 'el-db' && <GenericTestDBTab config={EL_CONFIG} />}
      {activeDB === 'ir-therm-db' && <GenericTestDBTab config={IR_THERMAL_CONFIG} />}
      {activeDB === 'ml-db' && <GenericTestDBTab config={ML_CONFIG} />}
      {activeDB === 'hi-db' && <GenericTestDBTab config={HI_CONFIG} />}
      {activeDB === 'bd-db' && <GenericTestDBTab config={BD_CONFIG} />}
      {activeDB === 'pt-db' && <GenericTestDBTab config={PT_CONFIG} />}
      {activeDB === 'vi-db' && <GenericTestDBTab config={VI_CONFIG} />}
      {activeDB === 'nmot-db' && <GenericTestDBTab config={NMOT_CONFIG} />}
      {activeDB === 'stab-db' && <GenericTestDBTab config={STAB_CONFIG} />}
      {activeDB === 'env-db' && <GenericTestDBTab config={ENV_CONFIG} />}
    </div>
  )
}
