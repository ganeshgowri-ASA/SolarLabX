export interface CalibrationCertificate {
  id: string;
  equipmentId: string;
  equipmentName: string;
  certificateNumber: string;
  calibrationDate: string;
  nextDueDate: string;
  calibrationAgency: string;
  parametersCalibrated: CalibratedParameter[];
  fileName: string;
  fileType: "pdf" | "image";
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "valid" | "expiring-soon" | "expired";
  notes: string;
}

export interface CalibratedParameter {
  name: string;
  range: string;
  uncertainty: string;
  unit: string;
  result: "pass" | "conditional" | "fail";
}

export interface CalibrationAlert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  certificateNumber: string;
  nextDueDate: string;
  daysUntilDue: number;
  alertLevel: "30-day" | "60-day" | "90-day" | "overdue";
  acknowledged: boolean;
}
