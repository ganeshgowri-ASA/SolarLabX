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
    projectType?: ProjectType;
  teamMembers?: TeamMember[];
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
  column?: KanbanColumn;
  subtasks?: { id: string; name: string; done: boolean }[];
  tags?: string[];
  labels?: string[];
  estimatedHours?: number;
  loggedHours?: number;
  attachments?: number;
  comments?: number;
}

export interface ResourceAllocation {
  id: string;
  type: ResourceType;
  name: string;
  allocatedFrom: string;
  allocatedTo: string;
  utilizationPercent: number;
}
export type KanbanColumn = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";

// ── Enhanced Project Management Types (Phase 2) ──────────────────────────

export type ProjectType = "Testing" | "Quality" | "Audit" | "Maintenance" | "Calibration" | "Research";

export type UserRole = "Engineer" | "Operator" | "Reviewer" | "Approver" | "Manager" | "Admin";

export type NotificationType = "task_assigned" | "task_due" | "review_requested" | "approval_needed" | "task_completed" | "task_overdue" | "comment_added" | "file_uploaded";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  activeTasks: number;
  completedTasks: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
  linkedUrl?: string;
  fromUser: string;
  toUser: string;
  read: boolean;
  createdAt: string;
}

export interface EnhancedTask extends Task {
  projectType: ProjectType;
  assignedBy: string;
  reviewer?: string;
  approver?: string;
  linkedModuleUrl?: string;
  linkedModuleName?: string;
  workflowStage: "assigned" | "in_progress" | "submitted" | "in_review" | "approved" | "rejected";
  dueTime?: string;
  notifications: string[];
  reviewComments?: string;
  approvalDate?: string;
  category: string;
}

export interface FolderNode {
  id: string;
  name: string;
  path: string;
  type: "folder" | "file";
  children?: FolderNode[];
  size?: number;
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
}

export interface ProjectDashboardFilter {
  role?: UserRole;
  projectType?: ProjectType;
  status?: TaskStatus;
  assignee?: string;
  dateRange?: { start: string; end: string };
}

export interface DayTaskSummary {
  date: string;
  tasks: EnhancedTask[];
  totalTasks: number;
  completed: number;
  pending: number;
  overdue: number;
}
