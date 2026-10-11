import React from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';

export const AchievementBadge = ({ badge }) => {
  const { title, description, xp, unlocked, icon: IconColor, category } = badge;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
        unlocked
          ? 'bg-gradient-to-b from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20 border-emerald-500/30 shadow-sm hover:shadow-md'
          : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              unlocked
                ? 'bg-gradient-to-tr from-emerald-500 to-green-400 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <Award className="w-6 h-6" />
          </div>
          {unlocked ? (
            <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-xs font-medium text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5" />
              <span>Locked</span>
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-400 uppercase text-[10px] tracking-wider">{category}</span>
        <span className="text-emerald-500 font-bold">+{xp} XP</span>
      </div>
    </div>
  );
};
