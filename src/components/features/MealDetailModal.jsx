import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Zap, TrendingUp, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

export const MealDetailModal = ({ isOpen, onClose, meal }) => {
  if (!isOpen || !meal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header image with gradient overlay */}
          <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={meal.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"}
              alt={meal.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#087F5B] text-[10px] font-black uppercase tracking-wider">
                  {meal.icon || '☀️'} {meal.type}
                </span>
                <span className="text-xs text-slate-300 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {meal.time || 'Logged Today'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {meal.name}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Calories Callout */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#EFFAF5] dark:bg-slate-800/80 border border-[#087F5B]/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-amber-500" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Energy</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                    {meal.calories} <span className="text-xs font-bold text-slate-400">kcal</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#087F5B] dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm">
                {Math.round((meal.calories / 2000) * 100)}% of daily goal
              </span>
            </div>

            {/* Macros 3-Grid */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5">
                Macronutrient Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                    Protein
                  </span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {meal.protein || 0}g
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-500/20">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 block">
                    Carbs
                  </span>
                  <p className="text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5">
                    {meal.carbs || 0}g
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-500/20">
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 block">
                    Healthy Fats
                  </span>
                  <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    {meal.fat || 0}g
                  </p>
                </div>
              </div>
            </div>

            {/* AI Confidence & Method */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center space-x-1 text-[#087F5B] dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>AI Confidence: {meal.confidence || 95}%</span>
              </span>
              <span className="font-semibold text-slate-400">
                Method: {meal.method || 'Food Scan'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
