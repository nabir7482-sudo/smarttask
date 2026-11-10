import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  Edit3,
  Trash2,
  Plus,
  AlertCircle,
  RefreshCw,
  FolderX,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  ListTodo
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, DensityMode } from '../types/task';

interface TasksViewProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onOpenCreateModal: () => void;
  density: DensityMode;
  onlyMyTasks?: boolean;
  currentUser?: string;
  defaultStatusFilter?: TaskStatus | 'ALL';
  isAdmin?: boolean;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  loading,
  error,
  onRetry,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onOpenCreateModal,
  density,
  onlyMyTasks = false,
  currentUser = '',
  defaultStatusFilter = 'ALL',
  isAdmin = true,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>(defaultStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdDate' | 'id'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // If My Tasks mode is active, filter by assignee
    if (onlyMyTasks && currentUser) {
      result = result.filter(
        (t) => t.assigneeName.toLowerCase().trim() === currentUser.toLowerCase().trim()
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'ALL') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.assigneeName.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sortBy === 'createdDate') {
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();
        comparison = dateB - dateA;
      } else if (sortBy === 'id') {
        comparison = b.id - a.id;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, onlyMyTasks, currentUser, statusFilter, priorityFilter, search, sortBy, sortOrder]);

  const toggleSort = (field: 'dueDate' | 'priority' | 'createdDate' | 'id') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const isFiltered = search.trim() !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  // Avatar initials helper
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

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 p-8 text-center max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Failed to load tasks</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry request</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <inpu
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or assignee..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-2">
            <selec
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
              className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Sort selector */}
            <selec
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdDate">Sort by Date Added</option>
              <option value="id">Sort by ID</option>
            </select>
          </div>
        </div>

        {/* Status segmented tabs + Results counter */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {[
              { id: 'ALL', label: 'All Tasks' },
              { id: 'TODO', label: 'To Do' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'COMPLETED', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-white tabular-nums">{filteredTasks.length}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white tabular-nums">{tasks.length}</strong>
            </span>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center max-w-md mx-auto shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FolderX className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {isFiltered ? 'No matching tasks' : onlyMyTasks ? 'No tasks assigned to you' : 'No tasks created yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {isFiltered
              ? 'Try modifying your search keywords or clearing active filters.'
              : 'Add a new task to organize your sprint work.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        /* Tasks Table (Desktop) & Cards (Mobile) */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-slate-400">#</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4 w-40">Assignee</th>
                  <th className="py-3 px-4 w-28">
                    <button
                      onClick={() => toggleSort('priority')}
                      className="flex items-center space-x-1 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 w-36">Status</th>
                  <th className="py-3 px-4 w-32">
                    <button
                      onClick={() => toggleSort('dueDate')}
                      className="flex items-center space-x-1 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      <span>Due Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.map((task) => {
                  const isCompact = density === 'compact';
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                        {task.id}
                      </td>

                      <td className={`py-2.5 px-4 ${isCompact ? 'py-1.5' : 'py-3'}`}>
                        <div className="min-w-0 max-w-md">
                          <button
                            onClick={() => onEditTask(task)}
                            className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left block truncate cursor-pointer text-xs"
                          >
                            {task.title}
                          </button>
                          {task.description && !isCompact && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[9px] shrink-0">
                            {getInitials(task.assigneeName)}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                            {task.assigneeName}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                            task.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <selec
                          value={task.status}
                          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-[11px] font-medium py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </td>

                      <td className="py-2.5 px-4">
                        {task.dueDate ? (
                          <div className="flex items-center space-x-1">
                            <span
                              className={`tabular-nums ${
                                task.isOverdue
                                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {task.dueDate}
                            </span>
                            {task.isOverdue && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-bold">
                                !
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Edit task"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-slate-400">#{task.id}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <selec
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-[11px] py-1 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <h4
                  onClick={() => onEditTask(task)}
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100"
                >
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 truncate max-w-[150px]">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{task.assigneeName}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {task.dueDate && (
                      <span className={task.isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                        {task.dueDate}
                      </span>
                    )}
                    {isAdmin && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
