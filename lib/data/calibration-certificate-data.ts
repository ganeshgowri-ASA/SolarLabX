import type { CalibrationCertificate, CalibrationAlert } from "@/lib/types/calibration-certificate";

export const calibrationCertificates: CalibrationCertificate[] = [
  {
    id: "CC-001", equipmentId: "EQ-TC-01", equipmentName: "Thermal Cycling Chamber TC-01",
    certificateNumber: "CAL-TC1-2025-4400", calibrationDate: "2025-11-15", nextDueDate: "2026-05-15",
    calibrationAgency: "National Calibration Lab (NABL Accredited)",
    parametersCalibrated: [
      { name: "Temperature", range: "-40°C to +85°C", uncertainty: "±0.3°C", unit: "°C", result: "pass" },
      { name: "Temperature Uniformity", range: "Full chamber volume", uncertainty: "±0.5°C", unit: "°C", result: "pass" },
      { name: "Temperature Rate of Change", range: "≥1°C/min", uncertainty: "±0.1°C/min", unit: "°C/min", result: "pass" },
      { name: "Humidity", range: "40% to 95% RH", uncertainty: "±2% RH", unit: "% RH", result: "pass" },
    ],
    fileName: "CAL-TC1-2025-4400.pdf", fileType: "pdf", fileSize: "2.4 MB",
    uploadedBy: "Suresh Kumar", uploadedAt: "2025-11-20", status: "valid", notes: "All parameters within spec. Next cal due May 2026."
  },
  {
    id: "CC-002", equipmentId: "EQ-TC-02", equipmentName: "Thermal Cycling Chamber TC-02",
    certificateNumber: "CAL-TC2-2025-4401", calibrationDate: "2025-11-15", nextDueDate: "2026-05-15",
    calibrationAgency: "National Calibration Lab (NABL Accredited)",
    parametersCalibrated: [
      { name: "Temperature", range: "-40°C to +85°C", uncertainty: "±0.3°C", unit: "°C", result: "pass" },
      { name: "Temperature Uniformity", range: "Full chamber volume", uncertainty: "±0.6°C", unit: "°C", result: "pass" },
      { name: "Humidity", range: "40% to 95% RH", uncertainty: "±2.5% RH", unit: "% RH", result: "pass" },
    ],
    fileName: "CAL-TC2-2025-4401.pdf", fileType: "pdf", fileSize: "2.1 MB",
    uploadedBy: "Suresh Kumar", uploadedAt: "2025-11-20", status: "valid", notes: "Parameters within spec."
  },
  {
    id: "CC-003", equipmentId: "EQ-SS-01", equipmentName: "Sun Simulator SS-01 (Pasan 3c)",
    certificateNumber: "CAL-SS1-2025-4410", calibrationDate: "2025-09-10", nextDueDate: "2026-03-10",
    calibrationAgency: "Pasan SA (OEM Calibration)",
    parametersCalibrated: [
      { name: "Irradiance Level", range: "800-1200 W/m²", uncertainty: "±1.0%", unit: "W/m²", result: "pass" },
      { name: "Spectral Match (A+)", range: "300-1100 nm", uncertainty: "±2%", unit: "ratio", result: "pass" },
      { name: "Spatial Uniformity (A+)", range: "2m x 2m area", uncertainty: "±1.0%", unit: "%", result: "pass" },
      { name: "Temporal Stability (A+)", range: "During flash", uncertainty: "±0.5%", unit: "%", result: "pass" },
    ],
    fileName: "CAL-SS1-2025-4410.pdf", fileType: "pdf", fileSize: "3.8 MB",
    uploadedBy: "Anil Mehta", uploadedAt: "2025-09-15", status: "expired", notes: "OVERDUE - Calibration expired March 10, 2026. OEM calibration scheduled."
  },
  {
    id: "CC-004", equipmentId: "EQ-SS-02", equipmentName: "Sun Simulator SS-02 (Eternal Sun)",
    certificateNumber: "CAL-SS2-2026-4500", calibrationDate: "2026-01-20", nextDueDate: "2026-07-20",
    calibrationAgency: "Eternal Sun B.V. (OEM)",
    parametersCalibrated: [
      { name: "Irradiance Level", range: "800-1200 W/m²", uncertainty: "±0.8%", unit: "W/m²", result: "pass" },
      { name: "Spectral Match (A+)", range: "300-1100 nm", uncertainty: "±1.5%", unit: "ratio", result: "pass" },
      { name: "Spatial Uniformity (A)", range: "1.6m x 1.6m area", uncertainty: "±1.5%", unit: "%", result: "pass" },
    ],
    fileName: "CAL-SS2-2026-4500.pdf", fileType: "pdf", fileSize: "2.9 MB",
    uploadedBy: "Anil Mehta", uploadedAt: "2026-01-25", status: "valid", notes: "All parameters meet A+ classification."
  },
  {
    id: "CC-005", equipmentId: "EQ-DH-01", equipmentName: "Damp Heat Chamber DH-01",
    certificateNumber: "CAL-DH1-2025-4420", calibrationDate: "2025-12-01", nextDueDate: "2026-06-01",
    calibrationAgency: "National Calibration Lab (NABL Accredited)",
    parametersCalibrated: [
      { name: "Temperature", range: "85°C ±2°C", uncertainty: "±0.3°C", unit: "°C", result: "pass" },
      { name: "Humidity", range: "85% ±5% RH", uncertainty: "±1.5% RH", unit: "% RH", result: "pass" },
      { name: "Temperature Uniformity", range: "Full chamber", uncertainty: "±0.5°C", unit: "°C", result: "pass" },
    ],
    fileName: "CAL-DH1-2025-4420.pdf", fileType: "pdf", fileSize: "1.8 MB",
    uploadedBy: "Suresh Kumar", uploadedAt: "2025-12-05", status: "valid", notes: "Stable at 85/85 setpoint."
  },
  {
    id: "CC-006", equipmentId: "EQ-UV-01", equipmentName: "UV Chamber UV-01 (Atlas)",
    certificateNumber: "CAL-UV1-2025-4430", calibrationDate: "2025-10-20", nextDueDate: "2026-04-20",
    calibrationAgency: "Atlas Material Testing (OEM)",
    parametersCalibrated: [
      { name: "UV Irradiance", range: "60 W/m² (280-400nm)", uncertainty: "±5%", unit: "W/m²", result: "pass" },
      { name: "Chamber Temperature", range: "60°C ±2°C", uncertainty: "±0.5°C", unit: "°C", result: "pass" },
      { name: "UV Sensor Calibration", range: "Broadband", uncertainty: "±3%", unit: "W/m²", result: "pass" },
    ],
    fileName: "CAL-UV1-2025-4430.pdf", fileType: "pdf", fileSize: "2.0 MB",
    uploadedBy: "Raj Krishnan", uploadedAt: "2025-10-25", status: "expiring-soon", notes: "Due in 30 days. Schedule OEM calibration."
  },
  {
    id: "CC-007", equipmentId: "EQ-EL-01", equipmentName: "EL Camera EL-01 (Greateyes)",
    certificateNumber: "CAL-EL1-2026-4510", calibrationDate: "2026-02-10", nextDueDate: "2026-08-10",
    calibrationAgency: "Greateyes GmbH (OEM)",
    parametersCalibrated: [
      { name: "Sensor Linearity", range: "0-65535 counts", uncertainty: "±0.1%", unit: "counts", result: "pass" },
      { name: "Dark Current", range: "<0.5 e/pixel/s @ -30°C", uncertainty: "±10%", unit: "e/pixel/s", result: "pass" },
      { name: "Spatial Resolution", range: "Full module FOV", uncertainty: "±1 pixel", unit: "pixel", result: "pass" },
    ],
    fileName: "CAL-EL1-2026-4510.pdf", fileType: "pdf", fileSize: "1.5 MB",
    uploadedBy: "Kavitha Nair", uploadedAt: "2026-02-15", status: "valid", notes: "CCD sensor performing within spec."
  },
  {
    id: "CC-008", equipmentId: "EQ-HP-01", equipmentName: "Hi-Pot Tester HP-01 (Hipotronics)",
    certificateNumber: "CAL-HP1-2025-4440", calibrationDate: "2025-08-15", nextDueDate: "2026-02-15",
    calibrationAgency: "BIS Certified Lab",
    parametersCalibrated: [
      { name: "AC Voltage", range: "0-5000 V AC", uncertainty: "±1.5%", unit: "V", result: "pass" },
      { name: "DC Voltage", range: "0-6000 V DC", uncertainty: "±1.0%", unit: "V", result: "pass" },
      { name: "Leakage Current", range: "0-20 mA", uncertainty: "±2%", unit: "mA", result: "pass" },
    ],
    fileName: "CAL-HP1-2025-4440.pdf", fileType: "pdf", fileSize: "1.2 MB",
    uploadedBy: "Deepa Iyer", uploadedAt: "2025-08-20", status: "expired", notes: "OVERDUE since Feb 15, 2026. Recalibration in progress."
  },
  {
    id: "CC-009", equipmentId: "EQ-IV-01", equipmentName: "IV Tracer IV-01",
    certificateNumber: "CAL-IV1-2026-4520", calibrationDate: "2026-03-01", nextDueDate: "2026-09-01",
    calibrationAgency: "National Calibration Lab (NABL Accredited)",
    parametersCalibrated: [
      { name: "Voltage Measurement", range: "0-100 V DC", uncertainty: "±0.05%", unit: "V", result: "pass" },
      { name: "Current Measurement", range: "0-15 A DC", uncertainty: "±0.1%", unit: "A", result: "pass" },
      { name: "Resistance (4-wire)", range: "0-100 Ω", uncertainty: "±0.05%", unit: "Ω", result: "pass" },
    ],
    fileName: "CAL-IV1-2026-4520.pdf", fileType: "pdf", fileSize: "1.6 MB",
    uploadedBy: "Anil Mehta", uploadedAt: "2026-03-05", status: "valid", notes: "Recently calibrated. All parameters within tolerance."
  },
  {
    id: "CC-010", equipmentId: "EQ-ML-01", equipmentName: "Mechanical Load Tester ML-01",
    certificateNumber: "CAL-ML1-2025-4450", calibrationDate: "2025-11-01", nextDueDate: "2026-05-01",
    calibrationAgency: "Force Calibration Services India",
    parametersCalibrated: [
      { name: "Force Application", range: "0-5400 Pa (uniform)", uncertainty: "±2%", unit: "Pa", result: "pass" },
      { name: "Pressure Distribution", range: "Full module area", uncertainty: "±3%", unit: "Pa", result: "pass" },
      { name: "Cycle Counter", range: "0-10000 cycles", uncertainty: "±1 cycle", unit: "cycles", result: "pass" },
    ],
    fileName: "CAL-ML1-2025-4450.pdf", fileType: "pdf", fileSize: "1.9 MB",
    uploadedBy: "Kavitha Nair", uploadedAt: "2025-11-05", status: "expiring-soon", notes: "Due in ~42 days. Schedule calibration."
  },
];

function computeAlerts(certs: CalibrationCertificate[]): CalibrationAlert[] {
  const today = new Date("2026-03-20");
  const alerts: CalibrationAlert[] = [];
  certs.forEach((cert) => {
    const due = new Date(cert.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let alertLevel: CalibrationAlert["alertLevel"] | null = null;
    if (diffDays < 0) alertLevel = "overdue";
    else if (diffDays <= 30) alertLevel = "30-day";
    else if (diffDays <= 60) alertLevel = "60-day";
    else if (diffDays <= 90) alertLevel = "90-day";
    if (alertLevel) {
      alerts.push({
        id: `ALR-${cert.id}`,
        equipmentId: cert.equipmentId,
        equipmentName: cert.equipmentName,
        certificateNumber: cert.certificateNumber,
        nextDueDate: cert.nextDueDate,
        daysUntilDue: diffDays,
        alertLevel,
        acknowledged: false,
      });
    }
  });
  return alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

export const calibrationAlerts = computeAlerts(calibrationCertificates);
