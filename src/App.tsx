import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { TasksView } from './components/TasksView';
import { BoardView } from './components/BoardView';
import { CalendarView } from './components/CalendarView';
import { EmployeesView } from './components/EmployeesView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { TaskModal } from './components/TaskModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { authApi, taskApi, tokenStorage } from './services/api';
import {
  DashboardSummary,
  DensityMode,
  LoginCredentials,
  NavView,
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
  User,
  WorkspaceSettings
} from './types/task';
import { CheckCircle2, AlertCircle, CheckSquare } from 'lucide-react';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Navigation & View state
  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('smarttask_theme') === 'dark';
  });

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Workspace Settings
  const [settings, setSettings] = useState<WorkspaceSettings>(() => {
    const saved = localStorage.getItem('smarttask_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      density: 'comfortable',
      defaultAssignee: 'Aarav Sharma',
      defaultPriority: 'MEDIUM',
    };
  });

  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isResettingWorkspace, setIsResettingWorkspace] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Sync dark mode class on documen
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('smarttask_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('smarttask_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist settings
  const handleUpdateSettings = (newSettings: Partial<WorkspaceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('smarttask_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Load all tasks (respects role isolation on backend)
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err: any) {
      if (err.status === 401) {
        tokenStorage.clear();
        setCurrentUser(null);
        setLoginError('Your session has expired. Please sign in again.');
      } else {
        setError(err.message || 'Unable to connect to task service.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dashboard summary
  const loadSummary = useCallback(async () => {
    try {
      const data = await taskApi.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    }
  }, []);

  // Check existing session on moun
  useEffect(() => {
    const verifySession = async () => {
      const token = tokenStorage.get();
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        tokenStorage.clear();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, []);

  // Load tasks & summary when user becomes authenticated
  useEffect(() => {
    if (currentUser) {
      loadTasks();
      loadSummary();
    }
  }, [currentUser, loadTasks, loadSummary]);

  // Login handler
  const handleLogin = async (credentials: LoginCredentials) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const authRes = await authApi.login(credentials);
      setCurrentUser(authRes.user);
      setCurrentView('overview');
      showToast(`Welcome back, ${authRes.user.name}`);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setTasks([]);
    setSummary(null);
    setCurrentView('overview');
    showToast('Signed out successfully.');
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  // Distinct assignees list from live tasks + defaults
  const assigneesList = useMemo(() => {
    const defaultList = ['Aarav Sharma', 'Priya Patel', 'Rohan Verma', 'Neha Gupta', 'Vikram Singh', 'Ananya Iyer'];
    const fromTasks = tasks.map((t) => t.assigneeName).filter(Boolean);
    return Array.from(new Set([...defaultList, ...fromTasks]));
  }, [tasks]);

  // Task counts for sidebar
  const myTasksCount = useMemo(() => {
    if (!currentUser) return 0;
    return tasks.filter(
      (t) => t.assigneeName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
    ).length;
  }, [tasks, currentUser]);

  // Global search filtering
  const visibleTasks = useMemo(() => {
    if (!globalSearch.trim()) return tasks;
    const q = globalSearch.toLowerCase().trim();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.assigneeName.toLowerCase().includes(q)
    );
  }, [tasks, globalSearch]);

  // CRUD Handlers
  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      showToast('Only Admins can create and assign tasks.', 'error');
      return;
    }
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    if (!isAdmin) {
      showToast('Only Admins can modify task details.', 'error');
      return;
    }
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (formData: TaskFormData) => {
    setIsSubmittingTask(true);
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, formData);
        showToast('Task updated successfully.');
      } else {
        await taskApi.createTask(formData);
        showToast('Task created and assigned successfully.');
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await Promise.all([loadTasks(), loadSummary()]);
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Inline status patch (Available to both Admin and Employee on assigned tasks)
  const handlePatchStatus = async (id: number, status: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );

    try {
      await taskApi.patchTaskStatus(id, status);
      await loadSummary();
      showToast(`Status updated to ${status.replace('_', ' ')}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status.', 'error');
      await loadTasks();
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    if (!isAdmin) {
      showToast('Employees cannot delete tasks.', 'error');
      return;
    }
    setIsDeletingTask(true);
    try {
      await taskApi.deleteTask(deleteTaskTarget.id);
      showToast(`Task #${deleteTaskTarget.id} deleted.`);
      setDeleteTaskTarget(null);
      await Promise.all([loadTasks(), loadSummary()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task.', 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleResetWorkspaceData = async () => {
    if (!isAdmin) {
      showToast('Only Admins can reset workspace sample data.', 'error');
      return;
    }
    setIsResettingWorkspace(true);
    try {
      await taskApi.seedTasks();
      showToast('Workspace reset to baseline sample data.');
      await Promise.all([loadTasks(), loadSummary()]);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset workspace.', 'error');
    } finally {
      setIsResettingWorkspace(false);
    }
  };

  // Initial loading splash
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center mb-3">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!currentUser) {
    return (
      <LoginView
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
        onClearError={() => setLoginError(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-slate-900 selection:text-white dark:selection:bg-slate-100 dark:selection:text-slate-900 transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-800 dark:border-slate-200'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 dark:text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        taskCounts={{
          total: tasks.length,
          myTasks: myTasksCount,
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentView={currentView}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenCreateModal={handleOpenCreateModal}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          userRole={currentUser.role}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'overview' && (
            <OverviewView
              summary={summary}
              tasks={visibleTasks}
              loading={loading}
              onNavigateToTasks={(statusFilter) => {
                setCurrentView(isAdmin ? 'all-tasks' : 'my-tasks');
              }}
              onNavigateToBoard={() => setCurrentView('board')}
              onOpenCreateModal={handleOpenCreateModal}
              onEditTask={handleOpenEditModal}
              onStatusChange={handlePatchStatus}
            />
          )}

          {currentView === 'my-tasks' && (
            <TasksView
              tasks={visibleTasks}
              loading={loading}
              error={error}
              onRetry={loadTasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={(task) => setDeleteTaskTarget(task)}
              onStatusChange={handlePatchStatus}
              onOpenCreateModal={handleOpenCreateModal}
              density={settings.density}
              onlyMyTasks={!isAdmin}
              currentUser={currentUser.name}
              isAdmin={isAdmin}
            />
          )}

          {currentView === 'all-tasks' && (
            <TasksView
              tasks={visibleTasks}
              loading={loading}
              error={error}
              onRetry={loadTasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={(task) => setDeleteTaskTarget(task)}
              onStatusChange={handlePatchStatus}
              onOpenCreateModal={handleOpenCreateModal}
              density={settings.density}
              onlyMyTasks={false}
              isAdmin={isAdmin}
            />
          )}

          {currentView === 'board' && (
            <BoardView
              tasks={visibleTasks}
              onStatusChange={handlePatchStatus}
              onEditTask={handleOpenEditModal}
              onDeleteTask={(task) => setDeleteTaskTarget(task)}
              onOpenCreateModal={handleOpenCreateModal}
              isAdmin={isAdmin}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              tasks={visibleTasks}
              onEditTask={handleOpenEditModal}
              onOpenCreateModal={handleOpenCreateModal}
              onStatusChange={handlePatchStatus}
            />
          )}

          {currentView === 'employees' && isAdmin && (
            <EmployeesView
              currentUser={currentUser}
              onShowToast={showToast}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetWorkspaceData={handleResetWorkspaceData}
              isResetting={isResettingWorkspace}
              assignees={assigneesList}
            />
          )}
        </main>
      </div>

      {/* Task Creation & Edit Modal (Admin only) */}
      {isAdmin && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleSaveTask}
          initialTask={editingTask}
          isSubmitting={isSubmittingTask}
          defaultAssignee={settings.defaultAssignee}
          defaultPriority={settings.defaultPriority}
        />
      )}

      {/* Task Deletion Modal (Admin only) */}
      {isAdmin && (
        <DeleteConfirmModal
          isOpen={!!deleteTaskTarget}
          task={deleteTaskTarget}
          onClose={() => setDeleteTaskTarget(null)}
          onConfirm={handleDeleteTask}
          isDeleting={isDeletingTask}
        />
      )}
    </div>
  );
}
