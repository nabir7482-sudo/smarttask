import {
  AuthResponse,
  BackendHealth,
  CreateEmployeeData,
  DashboardSummary,
  LoginCredentials,
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
  User,
} from '../types/task';

const TOKEN_KEY = 'smarttask_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore storage errors
    }
  },
  clear: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  body?: any
): Promise<T> {
  const token = tokenStorage.get();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  let data: any = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    data = text ? { message: text } : null;
  }

  if (!res.ok) {
    const errorMessage =
      data?.message ||
      (data?.fieldErrors ? Object.values(data.fieldErrors).join(', ') : null) ||
      `Request failed with status ${res.status}`;
    const error: any = new Error(errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('POST', '/api/auth/login', credentials);
    if (res?.token) {
      tokenStorage.set(res.token);
    }
    return res;
  },

  async getCurrentUser(): Promise<User> {
    return apiRequest<User>('GET', '/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<void>('POST', '/api/auth/logout');
    } catch {
      // ignore logout network errors
    } finally {
      tokenStorage.clear();
    }
  },
};

export const userApi = {
  async getUsers(): Promise<User[]> {
    return apiRequest<User[]>('GET', '/api/users');
  },

  async createUser(userData: CreateEmployeeData): Promise<User> {
    return apiRequest<User>('POST', '/api/users', userData);
  },

  async deleteUser(id: number): Promise<void> {
    return apiRequest<void>('DELETE', `/api/users/${id}`);
  },
};

export const taskApi = {
  async getTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  }): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search && params.search.trim()) query.set('search', params.search.trim());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Task[]>('GET', `/api/tasks${qs}`);
  },

  async getTaskById(id: number): Promise<Task> {
    return apiRequest<Task>('GET', `/api/tasks/${id}`);
  },

  async createTask(taskData: TaskFormData): Promise<Task> {
    return apiRequest<Task>('POST', '/api/tasks', taskData);
  },

  async updateTask(id: number, taskData: TaskFormData): Promise<Task> {
    return apiRequest<Task>('PUT', `/api/tasks/${id}`, taskData);
  },

  async patchTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    return apiRequest<Task>('PATCH', `/api/tasks/${id}/status?status=${status}`);
  },

  async deleteTask(id: number): Promise<void> {
    return apiRequest<void>('DELETE', `/api/tasks/${id}`);
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>('GET', '/api/tasks/dashboard');
  },

  async seedTasks(): Promise<{ message: string; timestamp: string }> {
    return apiRequest<{ message: string; timestamp: string }>('POST', '/api/tasks/seed');
  },

  async checkHealth(): Promise<BackendHealth> {
    return apiRequest<BackendHealth>('GET', '/api/tasks/health');
  },
};
