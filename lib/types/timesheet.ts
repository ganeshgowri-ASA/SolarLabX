export type StaffType = "permanent" | "off-role";
export type ShiftType = "A" | "B" | "C" | "OFF" | "LEAVE" | "HOLIDAY";
export type CellStatus = "regular" | "overtime" | "absent" | "leave" | "holiday" | "off";

export interface StaffMember {
  id: string;
  name: string;
  code: string; // P1-P12 or O1-O12
  type: StaffType;
  role: string;
  skillGroup: string;
  contactNumber: string;
}

export interface TimesheetEntry {
  staffId: string;
  date: string; // YYYY-MM-DD
  hoursWorked: number;
  shift: ShiftType;
  taskAssigned: string;
  status: CellStatus;
  overtimeHours: number;
}

export interface ShiftDefinition {
  code: ShiftType;
  name: string;
  startTime: string;
  endTime: string;
  hours: number;
  color: string;
  bgColor: string;
}

export interface ShiftAssignment {
  staffId: string;
  date: string;
  shift: ShiftType;
  isReliever: boolean;
  relievingFor: string | null;
  tasks: string[];
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  date: string;
  fromShift: ShiftType;
  toShift: ShiftType;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface TaskReassignment {
  id: string;
  originalAssigneeId: string;
  originalAssigneeName: string;
  relieverId: string;
  relieverName: string;
  taskDescription: string;
  date: string;
  handoverNotes: string;
  status: "pending" | "accepted" | "completed";
  notificationSent: boolean;
}
