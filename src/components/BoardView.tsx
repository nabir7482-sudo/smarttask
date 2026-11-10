import React from 'react';
import {
  Plus,
  Clock,
  Calendar,
  User,
  Edit3,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CircleDot,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types/task';

interface BoardViewProps {
  tasks: Task[];
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onOpenCreateModal: () => void;
  isAdmin?: boolean;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  isAdmin = true,
}) => {
  const columns: { id: TaskStatus; title: string; icon: React.FC<any>; color: string }[] = [
    { id: 'TODO', title: 'To Do', icon: ListTodo, color: 'text-amber-600 dark:text-amber-400' },
    { id: 'IN_PROGRESS', title: 'In Progress', icon: Clock, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'COMPLETED', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'U';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100vh-12rem)]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${col.color}`} />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {col.title}
                </h3>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold tabular-nums">
                  {colTasks.length}
                </span>
              </div>

              {isAdmin && (
                <button
                  onClick={onOpenCreateModal}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Add task to column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Cards Container */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {colTasks.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No tasks in this stage</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-slate-800/90 rounded-lg p-3.5 border border-slate-200 dark:border-slate-700/70 shadow-2xs hover:shadow-xs transition group"
                  >
                    {/* Priority & Actions */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono text-slate-400">#{task.id}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            task.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => onEditTask(task)}
                      className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer mb-1.5 leading-snug"
                    >
                      {task.title}
                    </h4>

                    {/* Description preview */}
                    {task.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Footer: Assignee & Due Date */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5 truncate max-w-[120px]">
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[8px] shrink-0">
                          {getInitials(task.assigneeName)}
                        </div>
                        <span className="truncate">{task.assigneeName}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center space-x-1">
                          <span className={task.isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                            {task.dueDate}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick Move Row */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      {col.id !== 'TODO' ? (
                        <button
                          onClick={() => {
                            const prevStatus = col.id === 'COMPLETED' ? 'IN_PROGRESS' : 'TODO';
                            onStatusChange(task.id, prevStatus);
                          }}
                          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Move Left</span>
                        </button>
                      ) : <span />}

                      {col.id !== 'COMPLETED' ? (
                        <button
                          onClick={() => {
                            const nextStatus = col.id === 'TODO' ? 'IN_PROGRESS' : 'COMPLETED';
                            onStatusChange(task.id, nextStatus);
                          }}
                          className="flex items-center space-x-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                        >
                          <span>Move to {col.id === 'TODO' ? 'In Progress' : 'Completed'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onStatusChange(task.id, 'TODO')}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Add Task Button */}
            <button
              onClick={onOpenCreateModal}
              className="mt-3 py-1.5 px-2 text-xs font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add task</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
