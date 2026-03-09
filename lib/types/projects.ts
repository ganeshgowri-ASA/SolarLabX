export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
export type KanbanColumn = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
export type TaskPriority = "P0" | "P1" | "P2" | "P3" | "P4";
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
  template: string;
  samples: SampleInfo[];
  milestones: Milestone[];
  tasks: Task[];
  sprints: Sprint[];
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
  column: KanbanColumn;
  priority: TaskPriority;
  assignee: string;
  assigneeAvatar: string;
  startDate: string;
  endDate: string;
  duration: number;
  dependencies: string[];
  completionPercent: number;
  description: string;
  labels: string[];
  subtasks: Subtask[];
  comments: TaskComment[];
  timeSpent: number;
  timeEstimate: number;
  sprintId: string | null;
}

export interface Subtask {
  id: string;
  name: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goals: string[];
  status: "Planning" | "Active" | "Completed";
}

export interface ResourceAllocation {
  id: string;
  type: ResourceType;
  name: string;
  allocatedFrom: string;
  allocatedTo: string;
  utilizationPercent: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  tasksAssigned: number;
  hoursLogged: number;
  hoursCapacity: number;
}
