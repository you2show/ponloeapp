import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, CircleIcon, Delete02Icon } from '@hugeicons/core-free-icons';
import React from 'react';
import { Task, Priority } from '@/types';


interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete }) => {
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'text-red-600 bg-red-50 border-red-200';
      case Priority.MEDIUM: return 'text-amber-600 bg-amber-50 border-amber-200';
      case Priority.LOW: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`group relative p-4 bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${task.completed ? 'opacity-60 bg-gray-50 dark:bg-slate-800/50' : 'border-gray-100 dark:border-slate-800'}`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task.id)}
          className="mt-1 text-gray-400 hover:text-emerald-500 transition-colors dark:text-slate-500 dark:hover:text-emerald-400"
        >
          {task.completed ? (
            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <HugeiconsIcon icon={CircleIcon} strokeWidth={1.5} className="w-6 h-6" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate dark:text-white ${task.completed ? 'line-through text-gray-500 dark:text-slate-500' : ''}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 dark:text-slate-400">
            {task.description}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getPriorityColor(task.priority)} dark:bg-opacity-10`}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {task.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>

        <button 
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors dark:text-slate-600 dark:hover:text-red-400 dark:hover:bg-red-900/20"
          aria-label="Delete task"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};