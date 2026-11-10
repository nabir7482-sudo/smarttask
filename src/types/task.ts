export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdDate: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdDate: string;
  assigneeName: string;
  isOverdue: boolean;
  assigneeId?: number | null;
  assigneeEmail?: string | null;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assigneeName: string;
}

export interface DashboardSummary {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface BackendHealth {
  status: 'UP' | 'DOWN';
  service: string;
  framework: string;
  database: string;
  timestamp: string;
}

export type NavView = 'overview' | 'my-tasks' | 'all-tasks' | 'board' | 'calendar' | 'employees' | 'settings';

export type DensityMode = 'comfortable' | 'compact';

export interface WorkspaceSettings {
  density: DensityMode;
  defaultAssignee: string;
  defaultPriority: TaskPriority;
}
