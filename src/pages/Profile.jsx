import React, { useState } from 'react';
import { User, Target, Scale, Ruler, Activity, Save, CheckCircle2, Droplets, Flame, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { targets, setTargets, showToast } = useHealth();

  // Biometrics & Personal Info
  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(user?.email || 'rahul.sharma@snapfit.ai');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [age, setAge] = useState(user?.age || targets?.age || 24);
  const [height, setHeight] = useState(user?.height || targets?.heightCm || 175);
  const [weight, setWeight] = useState(user?.weight || targets?.weightKg || 70);
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || targets?.activityLevel || 'Moderate');
  const [healthGoal, setHealthGoal] = useState(user?.goal || targets?.goal || 'Build Muscle');

  // Daily Targets
  const [calories, setCalories] = useState(user?.dailyCalorieGoal || targets?.dailyCalories || 2200);
  const [protein, setProtein] = useState(user?.proteinTargetGrams || targets?.proteinGrams || 120);
  const [carbs, setCarbs] = useState(user?.carbsTargetGrams || targets?.carbsGrams || 220);
  const [fat, setFat] = useState(user?.fatTargetGrams || targets?.fatGrams || 65);
  const [waterGlasses, setWaterGlasses] = useState(8);

  const [saving, setSaving] = useState(false);

  const healthGoals = [
    'Lose Weight',
    'Gain Muscle',
    'Maintain Weight',
    'Eat Healthier',
    'Improve Fitness'
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedProfileData = {
        name,
        age: parseInt(age, 10) || 24,
        height: parseInt(height, 10) || 175,
        weight: parseInt(weight, 10) || 70,
        goal: healthGoal,
        activityLevel,
        dailyCalorieGoal: parseInt(calories, 10) || 2200,
        proteinTargetGrams: parseInt(protein, 10) || 120,
        carbsTargetGrams: parseInt(carbs, 10) || 220,
        fatTargetGrams: parseInt(fat, 10) || 65,
        waterTargetMl: (parseInt(waterGlasses, 10) || 8) * 250
      };

      await updateUserProfile(updatedProfileData);
      showToast('Profile & Daily Targets updated successfully in Firestore!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative group">
          <img
            src={avatar}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-3xl object-cover border-4 border-[#087F5B] shadow-md"
          />
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {name}
          </h2>
          <p className="text-xs text-slate-400">{email}</p>
          <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1.5">
            <span className="px-3 py-0.5 rounded-full bg-[#EFFAF5] dark:bg-emerald-950/50 text-[#087F5B] dark:text-emerald-400 text-xs font-bold border border-[#087F5B]/20">
              Goal: {healthGoal}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              Level 3 Healthy Living
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Biometrics & Personal Info Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-[#087F5B]" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Personal Information & Biometrics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-[#087F5B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-[#087F5B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold"
              >
                <option value="Sedentary (Little or no exercise)">Sedentary (Little or no exercise)</option>
                <option value="Moderate (3-4 workouts/wk)">Moderate (3-4 workouts/wk)</option>
                <option value="Very Active (6-7 workouts/wk)">Very Active (6-7 workouts/wk)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Health Goal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {healthGoals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setHealthGoal(g)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      healthGoal === g
                        ? 'bg-[#087F5B] text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Targets Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Target className="w-5 h-5 text-[#087F5B]" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Daily Nutritional Targets
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/50 border border-amber-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-amber-600 block">Calories</span>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full text-center text-lg font-black bg-transparent border-none text-slate-900 dark:text-white p-0 mt-1"
              />
              <span className="text-[10px] text-slate-400">kcal/day</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/50 border border-emerald-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-[#087F5B] dark:text-emerald-400 block">Protein</span>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full text-center text-lg font-black bg-transparent border-none text-slate-900 dark:text-white p-0 mt-1"
              />
              <span className="text-[10px] text-slate-400">grams/day</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-slate-800/50 border border-sky-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-sky-600 block">Carbs</span>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full text-center text-lg font-black bg-transparent border-none text-slate-900 dark:text-white p-0 mt-1"
              />
              <span className="text-[10px] text-slate-400">grams/day</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-slate-800/50 border border-purple-500/20 text-center">
              <span className="text-[10px] font-black uppercase text-purple-600 block">Fat</span>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full text-center text-lg font-black bg-transparent border-none text-slate-900 dark:text-white p-0 mt-1"
              />
              <span className="text-[10px] text-slate-400">grams/day</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-slate-800/50 border border-cyan-500/20 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase text-cyan-600 block">Water</span>
              <input
                type="number"
                value={waterGlasses}
                onChange={(e) => setWaterGlasses(e.target.value)}
                className="w-full text-center text-lg font-black bg-transparent border-none text-slate-900 dark:text-white p-0 mt-1"
              />
              <span className="text-[10px] text-slate-400">glasses/day</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 transition-all flex items-center justify-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving Changes...' : 'Save Profile & Update Targets'}</span>
        </button>
      </form>
    </div>
  );
};
