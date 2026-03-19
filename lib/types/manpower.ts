export type TaskComplexity = "high" | "medium" | "low";
export type TaskStatus = "pending" | "in-progress" | "completed" | "on-hold";
export type LeaveType = "annual" | "sick" | "training" | "conference";

export interface ManpowerTask {
  id: string;
  title: string;
  description: string;
  complexity: TaskComplexity;
  status: TaskStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  equipmentId: string | null;
  projectId: string | null;
  projectName: string | null;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  requiredSkills: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  certifications: string[];
  availability: "available" | "busy" | "on-leave";
  maxHoursPerWeek: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  maxHoursPerMonth: number;
  currentTasks: string[];
  qualifiedTests: string[];
}

export interface LeaveRecord {
  id: string;
  memberId: string;
  memberName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  approved: boolean;
}

export interface SkillMatrixEntry {
  memberId: string;
  memberName: string;
  skills: Record<string, number>; // skill name -> proficiency 1-5
}
