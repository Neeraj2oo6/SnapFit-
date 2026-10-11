import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Utensils, Sparkles, CheckCircle2 } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';

export const AddMealModal = ({ isOpen, onClose, defaultType = 'Dinner' }) => {
  const { addMeal } = useHealth();
  const [mealType, setMealType] = useState(defaultType);
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('420');
  const [protein, setProtein] = useState('28');
  const [carbs, setCarbs] = useState('45');
  const [fat, setFat] = useState('14');

  useEffect(() => {
    if (defaultType) {
      setMealType(defaultType);
    }
  }, [defaultType]);

  if (!isOpen) return null;

  const quickPresets = [
    { name: 'Paneer + Roti + Salad', cal: 420, pro: 24, carb: 48, fat: 16, type: 'Dinner' },
    { name: 'Grilled Chicken + Veggies', cal: 460, pro: 38, carb: 22, fat: 12, type: 'Dinner' },
    { name: 'Dal + Brown Rice + Curd', cal: 490, pro: 22, carb: 68, fat: 10, type: 'Dinner' },
    { name: 'Greek Yogurt & Almond Bowl', cal: 220, pro: 18, carb: 14, fat: 8, type: 'Snack' }
  ];

  const handleSelectPreset = (preset) => {
    setMealName(preset.name);
    setCalories(preset.cal.toString());
    setProtein(preset.pro.toString());
    setCarbs(preset.carb.toString());
    setFat(preset.fat.toString());
    setMealType(preset.type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    addMeal({
      name: mealName.trim(),
      type: mealType,
      calories: parseInt(calories, 10) || 350,
      protein: parseInt(protein, 10) || 20,
      carbs: parseInt(carbs, 10) || 40,
      fat: parseInt(fat, 10) || 10,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
      confidence: 97,
      method: 'Manual Entry'
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
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#087F5B] text-white flex items-center justify-center shadow-md">
                <Utensils className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Log {mealType}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick AI Presets */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              ⚡ Recommended High-Protein Options:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#087F5B] bg-slate-50 dark:bg-slate-800/40 transition-colors text-xs flex flex-col justify-between"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {p.name}
                  </span>
                  <span className="text-[11px] text-[#087F5B] font-semibold mt-0.5">
                    {p.cal} kcal • {p.pro}g Protein
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Meal Category & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Evening Snack">Evening Snack</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Dish / Meal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Paneer Bowl"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#087F5B]"
                />
              </div>
            </div>

            {/* Macros Input Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs text-center rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs text-center rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs text-center rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-sky-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs text-center rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-black text-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!mealName.trim()}
              className="w-full py-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Save {mealType} to Logs</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
