export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked" | "Overdue";
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type ResourceType = "Chamber" | "Simulator" | "Staff" | "Equipment";

export interface Project {
  id: string;
  name: string;
  client: string;
  clientContact: string;
  testStandards: string[];
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  completionPercent: number;
  projectManager: string;
  description: string;
  samples: SampleInfo[];
  milestones: Milestone[];
  tasks: Task[];
  resources: ResourceAllocation[];
  createdAt: string;
}

export interface SampleInfo {
  id: string;
  name: string;
  type: string;
  quantity: number;
  receivedDate: string;
}

export interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: "Pending" | "Completed" | "Overdue";
  description: string;
}

export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  startDate: string;
  endDate: string;
  duration: number;
  dependencies: string[];
  completionPercent: number;
  description: string;
}

export interface ResourceAllocation {
  id: string;
  type: ResourceType;
  name: string;
  allocatedFrom: string;
  allocatedTo: string;
  utilizationPercent: number;
}
