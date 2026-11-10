import React from 'react';
import {
  Menu,
  Search,
  Plus,
  Sun,
  Moon,
  X,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { NavView, Role } from '../types/task';

interface HeaderProps {
  currentView: NavView;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleMobileSidebar: () => void;
  userRole?: Role;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileSidebar,
  userRole,
}) => {
  const isAdmin = userRole === 'ADMIN';

  const getHeaderMeta = (view: NavView) => {
    switch (view) {
      case 'overview':
        return {
          title: isAdmin ? 'Company Task Overview' : 'My Personal Overview',
          subtitle: isAdmin
            ? 'Executive summary and workload distribution across all employees'
            : 'Personal deliverables, active tasks, and completion progress',
        };
      case 'my-tasks':
        return {
          title: 'My Assigned Tasks',
          subtitle: 'Active priorities and deliverables assigned directly to you',
        };
      case 'all-tasks':
        return {
          title: 'All Employee Tasks',
          subtitle: 'Comprehensive task registry with custom filtering, sorting, and assignment',
        };
      case 'board':
        return {
          title: 'Board View',
          subtitle: 'Kanban workflow across To Do, In Progress, and Completed stages',
        };
      case 'calendar':
        return {
          title: 'Calendar Schedule',
          subtitle: 'Timeline and milestone schedule mapped by task due dates',
        };
      case 'employees':
        return {
          title: 'Team & Employee Directory',
          subtitle: 'Provision employee logins, manage roles, and review accounts',
        };
      case 'settings':
        return {
          title: 'Workspace Settings',
          subtitle: 'Configure view density, default task parameters, and workspace preferences',
        };
    }
  };

  const meta = getHeaderMeta(currentView);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + View Title + Role badge */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {meta.title}
              </h1>
              {userRole && (
                <span
                  className={`hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono tracking-wide ${
                    isAdmin
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                  <span>{userRole}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Search + Theme Toggle + New Task Button (Admin only) */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick Search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <inpu
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle color theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* New Task Button (Admin only) */}
          {isAdmin && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
