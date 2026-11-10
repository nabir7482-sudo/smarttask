import React from 'react';
import {
  Layers,
  ListTodo,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { DashboardSummary, Task, TaskStatus } from '../types/task';

interface OverviewViewProps {
  summary: DashboardSummary | null;
  tasks: Task[];
  loading: boolean;
  onNavigateToTasks: (statusFilter?: TaskStatus | 'ALL') => void;
  onNavigateToBoard: () => void;
  onOpenCreateModal: () => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  tasks,
  loading,
  onNavigateToTasks,
  onNavigateToBoard,
  onOpenCreateModal,
  onEditTask,
  onStatusChange,
}) => {
  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
              <div className="h-7 w-12 bg-slate-300 dark:bg-slate-700 rounded mb-2" />
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate real priority distribution from live tasks
  const highCount = tasks.filter((t) => t.priority === 'HIGH').length;
  const mediumCount = tasks.filter((t) => t.priority === 'MEDIUM').length;
  const lowCount = tasks.filter((t) => t.priority === 'LOW').length;
  const totalCalculated = tasks.length || 1;

  const highPct = Math.round((highCount / totalCalculated) * 100);
  const mediumPct = Math.round((mediumCount / totalCalculated) * 100);
  const lowPct = Math.round((lowCount / totalCalculated) * 100);

  // Recent 6 tasks
  const recentTasks = [...tasks].slice(0, 6);

  const metricCards = [
    {
      title: 'Total Tasks',
      value: summary?.totalTasks ?? tasks.length,
      subtitle: `${(summary?.todoTasks ?? 0) + (summary?.inProgressTasks ?? 0)} active in sprint`,
      icon: Layers,
      onClick: () => onNavigateToTasks('ALL'),
    },
    {
      title: 'To Do',
      value: summary?.todoTasks ?? tasks.filter((t) => t.status === 'TODO').length,
      subtitle: 'Backlog & awaiting start',
      icon: ListTodo,
      onClick: () => onNavigateToTasks('TODO'),
    },
    {
      title: 'In Progress',
      value: summary?.inProgressTasks ?? tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      subtitle: 'Currently in development',
      icon: Clock,
      onClick: () => onNavigateToTasks('IN_PROGRESS'),
    },
    {
      title: 'Completed',
      value: summary?.completedTasks ?? tasks.filter((t) => t.status === 'COMPLETED').length,
      subtitle: `${summary?.completionRate ?? 0}% sprint completion`,
      icon: CheckCircle2,
      progress: summary?.completionRate ?? 0,
      onClick: () => onNavigateToTasks('COMPLETED'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={card.onClick}
              className="text-left bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" />
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {card.value}
                </span>
                {card.progress !== undefined && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {card.progress}%
                  </span>
                )}
              </div>

              {card.progress !== undefined && (
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
              )}

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
                {card.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Middle Grid: Priority Distribution + Overdue Warning (if any) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Distribution Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Task Priority Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated directly from active workspace task records
              </p>
            </div>
            <button
              onClick={() => onNavigateToTasks('ALL')}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 cursor-pointer font-medium"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stacked bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex mb-4">
            <div style={{ width: `${highPct}%` }} className="bg-rose-500 transition-all duration-300" title={`High: ${highCount}`} />
            <div style={{ width: `${mediumPct}%` }} className="bg-amber-500 transition-all duration-300" title={`Medium: ${mediumCount}`} />
            <div style={{ width: `${lowPct}%` }} className="bg-slate-400 transition-all duration-300" title={`Low: ${lowCount}`} />
          </div>

          {/* Breakdown items */}
          <div className="grid grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span className="font-medium">High</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{highCount}</span>
                <span className="text-[11px] text-slate-400">({highPct}%)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span className="font-medium">Medium</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{mediumCount}</span>
                <span className="text-[11px] text-slate-400">({mediumPct}%)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                <span className="font-medium">Low</span>
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{lowCount}</span>
                <span className="text-[11px] text-slate-400">({lowPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action / Sprint Status Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
              Workflow Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Overview of deadlines and board progression
            </p>

            {(summary?.overdueTasks ?? 0) > 0 ? (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 mb-4">
                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{summary?.overdueTasks} Overdue Deliverable(s)</span>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400/80 mt-1">
                  Tasks with passed target due dates require immediate assignment review.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 mb-4">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All Tasks On Schedule</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">
                  No overdue tasks detected in current workspace records.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onNavigateToBoard}
              className="flex-1 py-2 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-center"
            >
              Open Kanban Board
            </button>
            <button
              onClick={onOpenCreateModal}
              className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer text-center"
            >
              + Create Task
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tasks List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Tasks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest items added or modified in the workspace
            </p>
          </div>
          <button
            onClick={() => onNavigateToTasks('ALL')}
            className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 cursor-pointer font-medium"
          >
            <span>View all ({tasks.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">No tasks found in workspace.</p>
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create first task</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="px-5 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1 flex items-center space-x-3">
                  {/* Status indicator / quick cycle */}
                  <button
                    onClick={() => {
                      const next = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'TODO';
                      onStatusChange(task.id, next);
                    }}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : task.status === 'IN_PROGRESS'
                        ? 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-slate-400'
                    }`}
                    title={`Click to mark ${task.status === 'TODO' ? 'In Progress' : task.status === 'IN_PROGRESS' ? 'Completed' : 'To Do'}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => onEditTask(task)}
                      className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block text-left cursor-pointer"
                    >
                      {task.title}
                    </button>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <span>#{task.id}</span>
                      <span>·</span>
                      <span className="truncate">{task.assigneeName}</span>
                      {task.dueDate && (
                        <>
                          <span>·</span>
                          <span className={task.isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                            Due {task.dueDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* Priority tag */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      task.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  {/* Status tag */}
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded hidden sm:inline-block ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
