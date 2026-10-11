import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Type,
  Mic,
  QrCode,
  Plus,
  Sparkles,
  Utensils,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';

export const LogMeal = () => {
  const navigate = useNavigate();
  const { addMeal, showToast } = useHealth();

  // Active Method: 'text', 'photo', 'voice', 'barcode'
  const [activeMethod, setActiveMethod] = useState('text');
  const [selectedCategory, setSelectedCategory] = useState('Lunch');

  // Text Form fields
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('25');
  const [carbs, setCarbs] = useState('55');
  const [fat, setFat] = useState('14');
  const [fiber, setFiber] = useState('6');

  // Quick food database suggestions
  const presetMeals = [
    { name: 'Oats with Fruits and Nuts', type: 'Breakfast', cal: 320, pro: 14, carb: 52, fat: 8, fib: 6, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80' },
    { name: 'Dal, Rice, Salad', type: 'Lunch', cal: 560, pro: 20, carb: 88, fat: 12, fib: 8, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' },
    { name: 'Banana Shake', type: 'Snack', cal: 180, pro: 8, carb: 32, fat: 3, fib: 3, img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80' },
    { name: 'Grilled Paneer & Veggie Wrap', type: 'Dinner', cal: 420, pro: 22, carb: 45, fat: 16, fib: 5, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80' },
    { name: 'Grilled Chicken Bowl', type: 'Dinner', cal: 520, pro: 38, carb: 48, fat: 14, fib: 7, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80' },
    { name: 'Boiled Eggs & Toast', type: 'Breakfast', cal: 280, pro: 16, carb: 24, fat: 12, fib: 3, img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80' }
  ];

  const handleSelectPreset = (p) => {
    setMealName(p.name);
    setCalories(p.cal.toString());
    setProtein(p.pro.toString());
    setCarbs(p.carb.toString());
    setFat(p.fat.toString());
    setFiber(p.fib.toString());
    setSelectedCategory(p.type);
  };

  const handleSaveMeal = (e) => {
    e.preventDefault();
    if (!mealName.trim()) {
      showToast('Please enter a meal name', 'warning');
      return;
    }

    const newMeal = {
      name: mealName.trim(),
      type: selectedCategory,
      calories: parseInt(calories, 10) || 400,
      protein: parseInt(protein, 10) || 20,
      carbs: parseInt(carbs, 10) || 45,
      fat: parseInt(fat, 10) || 12,
      fiber: parseInt(fiber, 10) || 4,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      confidence: 96,
      method: activeMethod === 'text' ? 'Manual Entry' : activeMethod === 'photo' ? 'Photo Scan' : activeMethod === 'voice' ? 'Voice' : 'Barcode'
    };

    addMeal(newMeal);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EFFAF5] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-400 text-xs font-black">
          <Utensils className="w-4 h-4" />
          <span>Quick Log Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Log Your Meal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Choose your preferred method to quickly log food, track macronutrients, and update today's dashboard.
        </p>
      </div>

      {/* 4 Methods Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/snap-food')}
          className="p-4 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 hover:border-[#087F5B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#EFFAF5] dark:bg-slate-800 text-[#087F5B] dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">1. Photo</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Camera Scan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMethod('text')}
          className={`p-4 rounded-3xl border transition-all flex flex-col items-center text-center ${
            activeMethod === 'text'
              ? 'bg-[#EFFAF5] dark:bg-slate-800/90 border-[#087F5B] shadow-md'
              : 'bg-white dark:bg-[#14213D] border-slate-200/80 dark:border-slate-800 hover:border-[#087F5B]'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2 shadow-sm">
            <Type className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">2. Text</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Manual Details</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/voice-log')}
          className="p-4 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 hover:border-[#087F5B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
            <Mic className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">3. Voice</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Speak Meal</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/barcode')}
          className="p-4 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 hover:border-[#087F5B] shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white">4. Barcode</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Package Scan</span>
        </button>
      </div>

      {/* Main Logging Form Card */}
      <div className="bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Category Pill Selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
            Select Meal Category:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-2.5 px-4 rounded-2xl font-black text-xs transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#087F5B] text-white shadow-md shadow-[#087F5B]/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'Breakfast' ? '☀️ Breakfast' : cat === 'Lunch' ? '☀️ Lunch' : cat === 'Snack' ? '🌅 Snack' : '🌙 Dinner'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Suggestions from Database */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            ⚡ Quick Selection Preset Dishes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {presetMeals.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(item)}
                className="text-left p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-[#087F5B] hover:bg-[#EFFAF5] transition-all flex items-center space-x-3 group"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#087F5B]">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {item.cal} kcal • {item.pro}g Protein
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleSaveMeal} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dish Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Homemade Dal Tadka with Brown Rice"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
            />
          </div>

          {/* Macro Inputs 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-amber-500"
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-[#087F5B] dark:text-emerald-400"
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-sky-500"
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-black text-purple-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Log {selectedCategory} to Dashboard</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
