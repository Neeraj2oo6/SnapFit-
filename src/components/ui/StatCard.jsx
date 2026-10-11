import React from 'react';

export const StatCard = ({
  title,
  value,
  target,
  unit = 'g',
  icon: Icon,
  color = 'emerald',
  progress = 0
}) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-500', bar: 'bg-emerald-500' },
    sky: { bg: 'bg-sky-500/10 dark:bg-sky-500/20', text: 'text-sky-500', bar: 'bg-sky-500' },
    violet: { bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-500', bar: 'bg-violet-500' },
    amber: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-500', bar: 'bg-amber-500' },
    rose: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-500', bar: 'bg-rose-500' },
  };

  const selectedColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${selectedColor.bg} ${selectedColor.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
          {target && (
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
              / {target}{unit}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full ${selectedColor.bar} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};
