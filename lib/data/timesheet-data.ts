import type { StaffMember, TimesheetEntry, ShiftDefinition, ShiftAssignment, ShiftSwapRequest, TaskReassignment } from "@/lib/types/timesheet";

export const shiftDefinitions: ShiftDefinition[] = [
  { code: "A", name: "Morning Shift", startTime: "06:00", endTime: "14:00", hours: 8, color: "text-blue-700", bgColor: "bg-blue-100" },
  { code: "B", name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", hours: 8, color: "text-amber-700", bgColor: "bg-amber-100" },
  { code: "C", name: "Night Shift", startTime: "22:00", endTime: "06:00", hours: 8, color: "text-purple-700", bgColor: "bg-purple-100" },
  { code: "OFF", name: "Day Off", startTime: "-", endTime: "-", hours: 0, color: "text-gray-500", bgColor: "bg-gray-100" },
  { code: "LEAVE", name: "Leave", startTime: "-", endTime: "-", hours: 0, color: "text-gray-600", bgColor: "bg-gray-200" },
  { code: "HOLIDAY", name: "Holiday", startTime: "-", endTime: "-", hours: 0, color: "text-indigo-700", bgColor: "bg-indigo-100" },
];

export const staffMembers: StaffMember[] = [
  // 12 Permanent Staff (P1-P12)
  { id: "P01", name: "Vikram Singh", code: "P1", type: "permanent", role: "Lab Director", skillGroup: "Management", contactNumber: "+91-9876543210" },
  { id: "P02", name: "Priya Sharma", code: "P2", type: "permanent", role: "Sr. Test Engineer", skillGroup: "Testing", contactNumber: "+91-9876543211" },
  { id: "P03", name: "Anil Mehta", code: "P3", type: "permanent", role: "Test Engineer", skillGroup: "STC/IV", contactNumber: "+91-9876543212" },
  { id: "P04", name: "Kavitha Nair", code: "P4", type: "permanent", role: "Test Engineer", skillGroup: "Mechanical", contactNumber: "+91-9876543213" },
  { id: "P05", name: "Raj Krishnan", code: "P5", type: "permanent", role: "Sr. Test Engineer", skillGroup: "UV/Outdoor", contactNumber: "+91-9876543214" },
  { id: "P06", name: "Dr. Meera Patel", code: "P6", type: "permanent", role: "Quality Manager", skillGroup: "Quality", contactNumber: "+91-9876543215" },
  { id: "P07", name: "Suresh Kumar", code: "P7", type: "permanent", role: "Lab Technician", skillGroup: "Chamber", contactNumber: "+91-9876543216" },
  { id: "P08", name: "Deepa Iyer", code: "P8", type: "permanent", role: "Test Engineer", skillGroup: "Safety", contactNumber: "+91-9876543217" },
  { id: "P09", name: "Arjun Reddy", code: "P9", type: "permanent", role: "Test Engineer", skillGroup: "Testing", contactNumber: "+91-9876543218" },
  { id: "P10", name: "Lakshmi Venkat", code: "P10", type: "permanent", role: "Lab Technician", skillGroup: "Chamber", contactNumber: "+91-9876543219" },
  { id: "P11", name: "Rahul Deshmukh", code: "P11", type: "permanent", role: "Test Engineer", skillGroup: "EL/IR", contactNumber: "+91-9876543220" },
  { id: "P12", name: "Sunita Patil", code: "P12", type: "permanent", role: "Data Analyst", skillGroup: "Data", contactNumber: "+91-9876543221" },
  // 12 Off-role/Contract Staff (O1-O12)
  { id: "O01", name: "Ramesh Gupta", code: "O1", type: "off-role", role: "Chamber Operator", skillGroup: "Chamber", contactNumber: "+91-9876543230" },
  { id: "O02", name: "Sanjay Tiwari", code: "O2", type: "off-role", role: "Chamber Operator", skillGroup: "Chamber", contactNumber: "+91-9876543231" },
  { id: "O03", name: "Pooja Mishra", code: "O3", type: "off-role", role: "Lab Assistant", skillGroup: "Testing", contactNumber: "+91-9876543232" },
  { id: "O04", name: "Dinesh Yadav", code: "O4", type: "off-role", role: "Sample Handler", skillGroup: "Logistics", contactNumber: "+91-9876543233" },
  { id: "O05", name: "Anita Joshi", code: "O5", type: "off-role", role: "Lab Assistant", skillGroup: "Testing", contactNumber: "+91-9876543234" },
  { id: "O06", name: "Manoj Pandey", code: "O6", type: "off-role", role: "Chamber Operator", skillGroup: "Chamber", contactNumber: "+91-9876543235" },
  { id: "O07", name: "Neha Saxena", code: "O7", type: "off-role", role: "Data Entry Operator", skillGroup: "Data", contactNumber: "+91-9876543236" },
  { id: "O08", name: "Vijay Chauhan", code: "O8", type: "off-role", role: "Maintenance Tech", skillGroup: "Maintenance", contactNumber: "+91-9876543237" },
  { id: "O09", name: "Rekha Verma", code: "O9", type: "off-role", role: "Lab Assistant", skillGroup: "Testing", contactNumber: "+91-9876543238" },
  { id: "O10", name: "Amit Sharma", code: "O10", type: "off-role", role: "Chamber Operator", skillGroup: "Chamber", contactNumber: "+91-9876543239" },
  { id: "O11", name: "Divya Nair", code: "O11", type: "off-role", role: "Lab Assistant", skillGroup: "Testing", contactNumber: "+91-9876543240" },
  { id: "O12", name: "Karthik Rajan", code: "O12", type: "off-role", role: "Maintenance Tech", skillGroup: "Maintenance", contactNumber: "+91-9876543241" },
];

// Generate timesheet entries for March 2026
function generateTimesheetEntries(): TimesheetEntry[] {
  const entries: TimesheetEntry[] = [];
  const tasks = [
    "TC200 Monitoring", "DH1000 Check", "UV Chamber Op", "STC Measurement", "EL Imaging",
    "Sample Handling", "Chamber PM", "Report Writing", "Data Entry", "Calibration Check",
    "Visual Inspection", "Hi-Pot Testing", "Safety Check", "Mech Load Test", "IR Imaging",
  ];
  const holidays = ["2026-03-11", "2026-03-26"]; // Maha Shivaratri, Holi (example)

  for (const staff of staffMembers) {
    for (let day = 1; day <= 20; day++) {
      const date = `2026-03-${String(day).padStart(2, "0")}`;
      const dow = new Date(date).getDay(); // 0=Sun

      if (holidays.includes(date)) {
        entries.push({ staffId: staff.id, date, hoursWorked: 0, shift: "HOLIDAY", taskAssigned: "Public Holiday", status: "holiday", overtimeHours: 0 });
        continue;
      }
      if (dow === 0) {
        entries.push({ staffId: staff.id, date, hoursWorked: 0, shift: "OFF", taskAssigned: "-", status: "off", overtimeHours: 0 });
        continue;
      }

      // Some leave days
      if (staff.id === "P04" && (day === 16 || day === 17)) {
        entries.push({ staffId: staff.id, date, hoursWorked: 0, shift: "LEAVE", taskAssigned: "Annual Leave", status: "leave", overtimeHours: 0 });
        continue;
      }
      if (staff.id === "O03" && day === 19) {
        entries.push({ staffId: staff.id, date, hoursWorked: 0, shift: "LEAVE", taskAssigned: "Sick Leave", status: "absent", overtimeHours: 0 });
        continue;
      }
      if (staff.id === "P07" && day === 13) {
        entries.push({ staffId: staff.id, date, hoursWorked: 0, shift: "LEAVE", taskAssigned: "Medical", status: "absent", overtimeHours: 0 });
        continue;
      }

      // Night shift for chamber operators
      const isNightShift = (staff.skillGroup === "Chamber" && dow >= 1 && dow <= 5 && day % 7 < 2);
      const shift: "A" | "B" | "C" = isNightShift ? "C" : (day % 3 === 0 ? "B" : "A");
      const baseHours = 8;
      const overtime = (day % 5 === 0 && staff.type === "permanent") ? 2 : 0;
      const task = tasks[(day + staffMembers.indexOf(staff)) % tasks.length];

      entries.push({
        staffId: staff.id,
        date,
        hoursWorked: baseHours + overtime,
        shift,
        taskAssigned: task,
        status: overtime > 0 ? "overtime" : "regular",
        overtimeHours: overtime,
      });
    }
  }
  return entries;
}

export const timesheetEntries = generateTimesheetEntries();

// Generate shift assignments for March 2026
function generateShiftAssignments(): ShiftAssignment[] {
  const assignments: ShiftAssignment[] = [];
  const nightTasks = ["Chamber Monitoring", "Temperature Logging", "Humidity Check", "Alarm Response", "Data Recording"];
  const dayTasks = [
    "TC200 Test Execution", "DH1000 Monitoring", "UV Exposure Check", "STC Measurement", "EL Imaging",
    "Visual Inspection", "Sample Handling", "Report Compilation", "Equipment PM", "Calibration Verification",
  ];

  for (let day = 1; day <= 31; day++) {
    const date = `2026-03-${String(day).padStart(2, "0")}`;
    const dow = new Date(date).getDay();
    if (dow === 0) continue; // Skip Sundays

    staffMembers.forEach((staff, idx) => {
      // Rotating shift pattern
      const shiftIdx = (day + idx) % 3;
      const shift: "A" | "B" | "C" = (["A", "B", "C"] as const)[shiftIdx];
      const tasks = shift === "C"
        ? [nightTasks[idx % nightTasks.length]]
        : [dayTasks[idx % dayTasks.length]];

      assignments.push({
        staffId: staff.id,
        date,
        shift,
        isReliever: false,
        relievingFor: null,
        tasks,
      });
    });
  }
  return assignments;
}

export const shiftAssignments = generateShiftAssignments();

export const shiftSwapRequests: ShiftSwapRequest[] = [
  { id: "SSR-001", requesterId: "P03", requesterName: "Anil Mehta", targetId: "P09", targetName: "Arjun Reddy", date: "2026-03-22", fromShift: "A", toShift: "B", reason: "Personal commitment in morning", status: "pending", createdAt: "2026-03-19" },
  { id: "SSR-002", requesterId: "O01", requesterName: "Ramesh Gupta", targetId: "O02", targetName: "Sanjay Tiwari", date: "2026-03-23", fromShift: "C", toShift: "A", reason: "Medical appointment next morning", status: "approved", createdAt: "2026-03-18" },
  { id: "SSR-003", requesterId: "P11", requesterName: "Rahul Deshmukh", targetId: "P02", targetName: "Priya Sharma", date: "2026-03-25", fromShift: "B", toShift: "A", reason: "Training session scheduled in morning", status: "pending", createdAt: "2026-03-19" },
];

export const taskReassignments: TaskReassignment[] = [
  { id: "TR-001", originalAssigneeId: "P04", originalAssigneeName: "Kavitha Nair", relieverId: "P11", relieverName: "Rahul Deshmukh", taskDescription: "EL Imaging - Pre-test Baseline for SunPower modules", date: "2026-03-16", handoverNotes: "Use EL-01 camera, settings saved in preset #3. Focus on busbars.", status: "completed", notificationSent: true },
  { id: "TR-002", originalAssigneeId: "P04", originalAssigneeName: "Kavitha Nair", relieverId: "P09", relieverName: "Arjun Reddy", taskDescription: "Mechanical Load Test Setup for IndiSolar batch", date: "2026-03-17", handoverNotes: "ML-01 pre-configured for 5400Pa. Check mounting clamps.", status: "completed", notificationSent: true },
  { id: "TR-003", originalAssigneeId: "P07", originalAssigneeName: "Suresh Kumar", relieverId: "O01", relieverName: "Ramesh Gupta", taskDescription: "Chamber PM - TC-03 Quarterly maintenance", date: "2026-03-13", handoverNotes: "Follow PM checklist v3.2. Compressor oil change due.", status: "completed", notificationSent: true },
  { id: "TR-004", originalAssigneeId: "O03", originalAssigneeName: "Pooja Mishra", relieverId: "O05", relieverName: "Anita Joshi", taskDescription: "Sample labeling and storage for GreenPower batch", date: "2026-03-19", handoverNotes: "Labels printed, stored in Bay C rack 2.", status: "accepted", notificationSent: true },
];
