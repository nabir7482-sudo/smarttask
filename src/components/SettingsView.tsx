import React, { useState } from 'react';
import {
  Sliders,
  User,
  RotateCcw,
  Check,
  Layers,
  Database,
  ShieldCheck,
  Building
} from 'lucide-react';
import { DensityMode, TaskPriority, WorkspaceSettings } from '../types/task';

interface SettingsViewProps {
  settings: WorkspaceSettings;
  onUpdateSettings: (newSettings: Partial<WorkspaceSettings>) => void;
  onResetWorkspaceData: () => Promise<void>;
  isResetting: boolean;
  assignees: string[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetWorkspaceData,
  isResetting,
  assignees,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDensityChange = (density: DensityMode) => {
    onUpdateSettings({ density });
    triggerSaveFeedback();
  };

  const handleAssigneeChange = (defaultAssignee: string) => {
    onUpdateSettings({ defaultAssignee });
    triggerSaveFeedback();
  };

  const handlePriorityChange = (defaultPriority: TaskPriority) => {
    onUpdateSettings({ defaultPriority });
    triggerSaveFeedback();
  };

  const triggerSaveFeedback = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Display & Interaction Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize table row density and default creation presets
            </p>
          </div>
          {savedSuccess && (
            <span className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Preferences saved</span>
            </span>
          )}
        </div>

        {/* Setting: Density Mode */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Table Row Density
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust spacing and padding across task list tables
            </p>
          </div>

          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              onClick={() => handleDensityChange('comfortable')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                settings.density === 'comfortable'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() => handleDensityChange('compact')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                settings.density === 'compact'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Compac
            </button>
          </div>
        </div>

        {/* Setting: Active Member / Default Assignee */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Active Member Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Determines which tasks filter into "My Tasks" view
            </p>
          </div>

          <selec
            value={settings.defaultAssignee}
            onChange={(e) => handleAssigneeChange(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            {assignees.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        {/* Setting: Default Task Priority */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Default Task Priority
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Default priority applied when creating a new deliverable
            </p>
          </div>

          <selec
            value={settings.defaultPriority}
            onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
            className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Workspace Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Workspace Sample Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Repopulate the database with the standard set of 8 realistic software team deliverables.
              Useful for refreshing sprint scenarios or testing status workflows.
            </p>
          </div>

          <button
            onClick={onResetWorkspaceData}
            disabled={isResetting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Sample Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
