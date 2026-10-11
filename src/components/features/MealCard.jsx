import React from 'react';
import { Trash2, Sparkles, Clock, Flame } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';

export const MealCard = ({ meal }) => {
  const { deleteMeal } = useHealth();

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Breakfast': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Lunch': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Dinner': return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      default: return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    }
  };

  return (
    <div className="group relative flex flex-col sm:flex-row items-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      {/* Image */}
      <img
        src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80"}
        alt={meal.name}
        className="w-full sm:w-24 h-32 sm:h-24 rounded-xl object-cover shrink-0 mb-3 sm:mb-0"
      />

      {/* Main Info */}
      <div className="sm:ml-4 flex-1 w-full">
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeColor(meal.type)}`}>
            {meal.type}
          </span>
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{meal.timestamp}</span>
          </div>
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 line-clamp-1">
          {meal.name}
        </h4>

        {/* Macros Pills */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
          <span className="flex items-center text-slate-700 dark:text-slate-300 font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-500 mr-1" />
            {meal.calories} kcal
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            P: <strong className="text-emerald-500">{meal.protein}g</strong>
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            C: <strong className="text-sky-500">{meal.carbs}g</strong>
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            F: <strong className="text-violet-500">{meal.fat}g</strong>
          </span>
        </div>
      </div>

      {/* Action / Delete */}
      <button
        onClick={() => deleteMeal(meal.id)}
        className="sm:opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all sm:ml-4 self-end sm:self-center"
        title="Delete meal"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
