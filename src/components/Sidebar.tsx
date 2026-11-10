import React, { useState } from 'react';
import {
  CheckSquare,
  LayoutDashboard,
  UserCheck,
  Layers,
  Columns3,
  CalendarDays,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Check,
  Users,
  LogOut,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { NavView, User } from '../types/task';

interface SidebarProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  taskCounts: {
    total: number;
    myTasks: number;
  };
  currentUser: User | null;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  taskCounts,
  currentUser,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState('Engineering Team');

  const workspaces = ['Engineering Team', 'Product & Design', 'Operations'];
  const isAdmin = currentUser?.role === 'ADMIN';

  const navItems = [
    { id: 'overview' as NavView, label: 'Overview', icon: LayoutDashboard },
    ...(isAdmin
      ? [{ id: 'all-tasks' as NavView, label: 'All Tasks', icon: Layers, count: taskCounts.total }]
      : [{ id: 'my-tasks' as NavView, label: 'My Tasks', icon: UserCheck, count: taskCounts.myTasks }]),
    { id: 'board' as NavView, label: 'Board View', icon: Columns3 },
    { id: 'calendar' as NavView, label: 'Calendar', icon: CalendarDays },
    ...(isAdmin ? [{ id: 'employees' as NavView, label: 'Employees', icon: Users }] : []),
    { id: 'settings' as NavView, label: 'Settings', icon: Settings2 },
  ];

  const handleNavClick = (view: NavView) => {
    onViewChange(view);
    onCloseMobile();
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand & Workspace Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                <CheckSquare className="w-4 h-4" />
              </div>
              {!collapsed && (
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate">
                  SmartTask
                </span>
              )}
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Workspace Switcher */}
          {!collapsed && (
            <div className="relative">
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{selectedWorkspace}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
              </button>

              {workspaceMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 animate-in fade-in duration-100">
                  <div className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                    Switch Workspace
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws}
                      onClick={() => {
                        setSelectedWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
                    >
                      <span>{ws}</span>
                      {selectedWorkspace === ws && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!collapsed && (
            <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Navigation
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-inherit' : 'text-slate-400 dark:text-slate-500'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.count !== undefined && (
                  <span
                    className={`ml-2 text-[11px] px-1.5 py-0.2 rounded font-mono tabular-nums ${
                      isActive
                        ? 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Authenticated User & Logout Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                {userInitials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser?.name || 'User'}
                  </p>
                  <div className="flex items-center space-x-1">
                    {isAdmin ? (
                      <span className="inline-flex items-center space-x-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>ADMIN</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                        <UserIcon className="w-2.5 h-2.5" />
                        <span>EMPLOYEE</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
