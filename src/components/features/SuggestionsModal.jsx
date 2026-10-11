import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, ArrowRight, Zap } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';

export const SuggestionsModal = ({ isOpen, onClose }) => {
  const { addMeal, showToast } = useHealth();
  if (!isOpen) return null;

  const proteinSuggestions = [
    {
      title: 'Greek Yogurt with Mixed Berries & Almonds',
      calories: 210,
      protein: 18,
      carbs: 16,
      fat: 6,
      time: '10 min prep',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80'
    },
    {
      title: 'Roasted Spiced Chickpeas (Chana)',
      calories: 180,
      protein: 12,
      carbs: 26,
      fat: 4,
      time: 'Ready to eat',
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=80'
    },
    {
      title: 'Hard-Boiled Eggs with Black Pepper',
      calories: 140,
      protein: 13,
      carbs: 1,
      fat: 9,
      time: '8 min boil',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80'
    },
    {
      title: 'Whey Protein Shake with Almond Milk',
      calories: 160,
      protein: 26,
      carbs: 4,
      fat: 3,
      time: '2 min shake',
      image: 'https://images.unsplash.com/photo-1593095940087-05ccb2be667f?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const handleQuickAdd = (snack) => {
    addMeal({
      name: snack.title,
      type: 'Snack',
      calories: snack.calories,
      protein: snack.protein,
      carbs: snack.carbs,
      fat: snack.fat,
      image: snack.image,
      confidence: 99,
      method: 'AI Recommendation'
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Smart Protein Snack Suggestions
                </h3>
                <p className="text-xs text-slate-400">Recommended for your 38g protein gap before dinner</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {proteinSuggestions.map((snack, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2 hover:border-[#087F5B] transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={snack.image}
                    alt={snack.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {snack.title}
                    </h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-0.5">
                      +{snack.protein}g Protein • {snack.calories} kcal
                    </p>
                    <span className="text-[10px] text-slate-400">{snack.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAdd(snack)}
                  className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-700 hover:bg-[#087F5B] hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-bold transition-all flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log This Snack</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
