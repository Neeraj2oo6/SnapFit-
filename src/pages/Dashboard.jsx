import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Droplets,
  Plus,
  ArrowRight,
  Sparkles,
  Moon,
  Clock,
  Eye,
  Utensils,
  ChevronRight,
  ChevronLeft,
  WifiOff,
  Trash2,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';
import { isFirebaseConfigured, getMissingFirebaseConfig, getFirebaseConnectionStatus } from '../firebase/firebase';
import { ProgressRing } from '../components/ui/ProgressRing';
import { AICoachWidget } from '../components/features/AICoachWidget';
import { MealDetailModal } from '../components/features/MealDetailModal';
import { AddMealModal } from '../components/features/AddMealModal';
import { SuggestionsModal } from '../components/features/SuggestionsModal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    meals,
    totals,
    targets,
    loadingMeals,
    waterMl,
    logWater,
    deleteMeal
  } = useHealth();

  // Selected meal for detail view modal
  const [selectedMealForView, setSelectedMealForView] = useState(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [addMealDefaultCategory, setAddMealDefaultCategory] = useState('Dinner');
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Collapsible AI Coach Right Panel State
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Next Best Move Carousel State
  const [activeSlide, setActiveSlide] = useState(0);

  // Derived progress calculations strictly from real Firestore data
  const calorieVal = Number(totals?.calories) || 0;
  const calorieMax = Number(targets?.dailyCalories) || 2200;
  const caloriePct = Math.min(100, Math.round((calorieVal / calorieMax) * 100));
  const calorieRemaining = Math.max(0, calorieMax - calorieVal);

  const proteinVal = Number(totals?.protein) || 0;
  const proteinMax = Number(targets?.proteinGrams) || 120;
  const proteinPct = Math.min(100, Math.round((proteinVal / proteinMax) * 100));

  const carbsVal = Number(totals?.carbs) || 0;
  const carbsMax = Number(targets?.carbsGrams) || 220;
  const carbsPct = Math.min(100, Math.round((carbsVal / carbsMax) * 100));

  const fatVal = Number(totals?.fat) || 0;
  const fatMax = Number(targets?.fatGrams) || 65;
  const fatPct = Math.min(100, Math.round((fatVal / fatMax) * 100));

  const waterTotalMl = Number(waterMl) || 0;
  const waterTargetMl = Number(targets?.waterMl) || 2500;
  const waterPct = Math.min(100, Math.round((waterTotalMl / waterTargetMl) * 100));

  // Dynamic recommendations generated from user's REAL intake
  const recommendations = [
    {
      id: 1,
      badge: "Your Next Best Move",
      message: proteinVal < proteinMax
        ? `Your protein is ${proteinVal}g / ${proteinMax}g.\nTry a protein-rich meal or shake to hit your target!`
        : `Great job! You've reached your protein target of ${proteinMax}g today!`,
      subtext: `${Math.max(0, proteinMax - proteinVal)}g remaining for peak recovery`,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
      actionText: "View Suggestions →"
    },
    {
      id: 2,
      badge: "Hydration Milestone",
      message: `You've logged ${waterTotalMl} of ${waterTargetMl} ml water.\nDrink another glass to keep hydrated!`,
      subtext: "Proper hydration improves cognitive performance and energy by 14%",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
      actionText: "Log Water (+250 ml) →"
    },
    {
      id: 3,
      badge: "AI Evening Nutrition Strategy",
      message: calorieRemaining > 400
        ? `You have ${calorieRemaining} kcal remaining today.\nA balanced dinner with lean protein and veggies will hit your goal.`
        : `You are within ${calorieRemaining} kcal of your daily goal.\nOpt for a light soup or salad for dinner.`,
      subtext: `${calorieVal} / ${calorieMax} kcal consumed today`,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
      actionText: "Log Dinner →"
    }
  ];

  // Auto cycle recommendation slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % recommendations.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [recommendations.length]);

  // Today's Meals items mapping from real Firestore meals
  const safeMeals = Array.isArray(meals) ? meals : [];
  const breakfastMeals = safeMeals.filter(m => (m?.mealType || m?.type || '').toLowerCase() === 'breakfast');
  const lunchMeals = safeMeals.filter(m => (m?.mealType || m?.type || '').toLowerCase() === 'lunch');
  const snackMeals = safeMeals.filter(m => (m?.mealType || m?.type || '').toLowerCase().includes('snack'));
  const dinnerMeals = safeMeals.filter(m => (m?.mealType || m?.type || '').toLowerCase() === 'dinner');

  const handleOpenAddMeal = (category) => {
    setAddMealDefaultCategory(category);
    setShowAddMealModal(true);
  };

  const handleHeroActionClick = () => {
    if (activeSlide === 0) {
      setShowSuggestionsModal(true);
    } else if (activeSlide === 1) {
      logWater(250, 'manual');
    } else {
      handleOpenAddMeal('Dinner');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Firebase Configuration Banner - Shown ONLY when configuration is missing or pending */}
      {!isFirebaseConfigured && (
        <div className="flex items-start justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-300 text-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Firebase configuration is pending</span>
              <span>
                Firebase environment variables are unconfigured ({getMissingFirebaseConfig().join(', ')}). Add your project credentials to <code className="bg-amber-200/50 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono font-bold">.env</code> and restart the development server to connect to Cloud Firestore and Firebase Auth.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="flex items-center space-x-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-600 dark:text-amber-400 text-xs font-bold">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Firestore offline persistence is enabled — your data will sync when reconnected.</span>
        </div>
      )}

      {/* Main Dashboard Content (occupies full available width) */}
      <div className="w-full space-y-6">

          {/* Top Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Hi, {user?.name || 'Athlete'} 👋
              </h2>
              <p className="text-sm font-semibold text-[#087F5B] dark:text-emerald-400 mt-0.5">
                Let's make today a healthy day!
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/snap-food')}
                className="px-3.5 py-2 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white text-xs font-bold shadow-md shadow-[#087F5B]/20 transition-all flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Camera</span>
              </button>
              <button
                onClick={() => navigate('/ai-coach')}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <span>Food Chat</span>
              </button>
              <button
                onClick={() => navigate('/barcode')}
                className="px-3.5 py-2 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <span>Barcode</span>
              </button>
            </div>
          </div>

          {/* LARGE GREEN RECOMMENDATION CARD: "Your Next Best Move" */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#087F5B] via-[#077252] to-[#056B4A] text-white p-6 sm:p-7 shadow-xl shadow-[#087F5B]/15 overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/3 top-0 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3.5 max-w-md text-left w-full">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>{recommendations[activeSlide].badge}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug whitespace-pre-line">
                  {recommendations[activeSlide].message}
                </h3>

                <p className="text-xs text-emerald-100/90 font-medium">
                  {recommendations[activeSlide].subtext}
                </p>

                <div className="pt-1 flex items-center space-x-3">
                  <button
                    onClick={handleHeroActionClick}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#087F5B] font-extrabold text-xs shadow-lg transition-all hover:scale-[1.02] flex items-center space-x-1.5"
                  >
                    <span>{recommendations[activeSlide].actionText}</span>
                  </button>
                </div>
              </div>

              <div className="relative shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <img
                  src={recommendations[activeSlide].image}
                  alt="Healthy Recommendation"
                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                  AI Picked
                </span>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="relative z-10 flex items-center justify-center space-x-2 pt-5">
              {recommendations.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlide === idx
                      ? 'w-6 bg-white shadow-sm'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* TODAY'S SUMMARY CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Today's Summary
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time Firestore macro balance & hydration tracking
                </p>
              </div>

              <button
                onClick={() => navigate('/meals')}
                className="text-xs font-bold text-[#087F5B] dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>See Meal History</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* 4 Circular Macro Progress Indicators strictly connected to Firestore */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              
              {/* 1. Calories Circle */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-amber-50/50 dark:bg-slate-800/40 border border-amber-500/15">
                <ProgressRing
                  progress={caloriePct}
                  size={100}
                  strokeWidth={9}
                  progressColor={calorieVal > calorieMax ? "stroke-rose-500" : "stroke-amber-500"}
                  circleColor="text-amber-100 dark:text-slate-700"
                >
                  <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                    {calorieVal}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                    / {calorieMax}
                  </span>
                </ProgressRing>
                <div className="mt-3">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">
                    Calories
                  </span>
                  <span className={`text-[11px] font-semibold ${calorieVal > calorieMax ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                    {calorieVal > calorieMax ? 'Daily calorie goal exceeded' : `${calorieRemaining} kcal left`}
                  </span>
                </div>
              </div>

              {/* 2. Protein Circle */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/40 border border-[#087F5B]/15">
                <ProgressRing
                  progress={proteinPct}
                  size={100}
                  strokeWidth={9}
                  progressColor="stroke-[#087F5B]"
                  circleColor="text-emerald-100 dark:text-slate-700"
                >
                  <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                    {proteinVal} g
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                    / {proteinMax} g
                  </span>
                </ProgressRing>
                <div className="mt-3">
                  <span className="text-xs font-black text-[#087F5B] dark:text-emerald-400 block">
                    Protein
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Target {proteinMax}g
                  </span>
                </div>
              </div>

              {/* 3. Carbs Circle */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-sky-50/50 dark:bg-slate-800/40 border border-sky-500/15">
                <ProgressRing
                  progress={carbsPct}
                  size={100}
                  strokeWidth={9}
                  progressColor="stroke-sky-500"
                  circleColor="text-sky-100 dark:text-slate-700"
                >
                  <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                    {carbsVal} g
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                    / {carbsMax} g
                  </span>
                </ProgressRing>
                <div className="mt-3 flex flex-col items-center">
                  <span className="text-xs font-black text-sky-600 dark:text-sky-400 block">
                    Carbs
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Target {carbsMax}g
                  </span>
                </div>
              </div>

              {/* 4. Fat Circle */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-purple-50/50 dark:bg-slate-800/40 border border-purple-500/15">
                <ProgressRing
                  progress={fatPct}
                  size={100}
                  strokeWidth={9}
                  progressColor="stroke-purple-500"
                  circleColor="text-purple-100 dark:text-slate-700"
                >
                  <span className="text-base font-black text-slate-900 dark:text-white leading-none">
                    {fatVal} g
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                    / {fatMax} g
                  </span>
                </ProgressRing>
                <div className="mt-3 flex flex-col items-center">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 block">
                    Fat
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Target {fatMax}g
                  </span>
                </div>
              </div>

            </div>

            {/* Real-time Water Tracking Card */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-slate-800/40 border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xl shrink-0">
                  💧
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Today's Water
                    </h4>
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {waterPct}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                    Water: <strong className="text-slate-900 dark:text-white">{waterTotalMl} / {waterTargetMl} ml</strong>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-64 space-y-1.5">
                <div className="w-full h-3 rounded-full bg-sky-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${waterPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>0 ml</span>
                  <span>{waterTargetMl} ml goal</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => logWater(250, 'manual')}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  +250 ml
                </button>
                <button
                  onClick={() => logWater(500, 'manual')}
                  className="px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-slate-700 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-slate-600 font-bold text-xs transition-all"
                >
                  +500 ml
                </button>
              </div>
            </div>

            {/* Daily Total Summary Strip */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Calories: <strong className="text-slate-900 dark:text-white">{calorieVal} / {calorieMax} kcal</strong></span>
                <span>•</span>
                <span>Protein: <strong className="text-slate-900 dark:text-white">{proteinVal} / {proteinMax}g</strong></span>
                <span>•</span>
                <span>Carbs: <strong className="text-slate-900 dark:text-white">{carbsVal} / {carbsMax}g</strong></span>
                <span>•</span>
                <span>Fat: <strong className="text-slate-900 dark:text-white">{fatVal} / {fatMax}g</strong></span>
                <span>•</span>
                <span>Water: <strong className="text-sky-600 dark:text-sky-400">{waterTotalMl} / {waterTargetMl} ml</strong></span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/snap-food')}
                  className="px-3 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-bold shadow hover:bg-[#056B4A] transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Camera</span>
                </button>
                <button
                  onClick={() => navigate('/ai-coach')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center space-x-1"
                >
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => navigate('/barcode')}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 dark:hover:bg-slate-700 transition-all flex items-center space-x-1"
                >
                  <span>Barcode</span>
                </button>
              </div>
            </div>
          </div>

          {/* TODAY'S MEALS SECTION */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Today's Meals
                </h3>
                <p className="text-xs text-slate-400">
                  {loadingMeals ? 'Loading your nutrition data...' : `${safeMeals.length} ${safeMeals.length === 1 ? 'meal' : 'meals'} logged in Firestore today (${calorieVal} kcal total)`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/snap-food')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#087F5B]" />
                  <span>Scan Food</span>
                </button>
                <button
                  onClick={() => handleOpenAddMeal('Lunch')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#087F5B] hover:bg-[#056B55] text-white text-xs font-extrabold shadow-md shadow-[#087F5B]/20 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Meal</span>
                </button>
              </div>
            </div>

            {loadingMeals ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#087F5B] animate-spin" />
                <span>Loading your nutrition data...</span>
              </div>
            ) : safeMeals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <Utensils className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No meals logged today.</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Use Food Camera or Food Chat to log your food in seconds.</p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-1">
                  <button
                    onClick={() => navigate('/snap-food')}
                    className="px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-bold hover:bg-[#056B4A] transition-all"
                  >
                    Take Food Photo
                  </button>
                  <button
                    onClick={() => navigate('/ai-coach')}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 transition-all"
                  >
                    Use Food Chat
                  </button>
                </div>
              </div>
            ) : null}

            {/* 4 MEAL CATEGORIES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. BREAKFAST */}
              {breakfastMeals.length > 0 ? (
                breakfastMeals.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-[#EFFAF5]/60 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between space-x-3 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={m.image || "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80"}
                        alt={m.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-500 uppercase">
                          <span>☀️</span>
                          <span>BREAKFAST • {m.time || 'Logged'}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                          {m.name}
                        </h4>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-300">
                          {m.calories} kcal • {m.protein}g P
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedMealForView(m)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-[#087F5B] hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-xs shadow-sm transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteMeal(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex flex-col items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
                      <span>☀️</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-500 uppercase">BREAKFAST</span>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        No breakfast logged yet
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddMeal('Breakfast')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow transition-all shrink-0 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>
              )}

              {/* 2. LUNCH */}
              {lunchMeals.length > 0 ? (
                lunchMeals.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-[#EFFAF5]/60 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between space-x-3 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={m.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"}
                        alt={m.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-500 uppercase">
                          <span>☀️</span>
                          <span>LUNCH • {m.time || 'Logged'}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                          {m.name}
                        </h4>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-300">
                          {m.calories} kcal • {m.protein}g P
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedMealForView(m)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-[#087F5B] hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-xs shadow-sm transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteMeal(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#087F5B] flex flex-col items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                      <span>🥗</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#087F5B] uppercase">LUNCH</span>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        No lunch logged yet
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddMeal('Lunch')}
                    className="px-3 py-1.5 rounded-xl bg-[#087F5B] hover:bg-[#056B55] text-white font-extrabold text-xs shadow transition-all shrink-0 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>
              )}

              {/* 3. EVENING SNACK */}
              {snackMeals.length > 0 ? (
                snackMeals.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-[#EFFAF5]/60 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between space-x-3 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={m.image || "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80"}
                        alt={m.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-orange-500 uppercase">
                          <span>🌅</span>
                          <span>SNACK • {m.time || 'Logged'}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                          {m.name}
                        </h4>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-300">
                          {m.calories} kcal • {m.protein}g P
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedMealForView(m)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-[#087F5B] hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-xs shadow-sm transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteMeal(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex flex-col items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
                      <span>🌅</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-500 uppercase">EVENING SNACK</span>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        No snack logged yet
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddMeal('Evening Snack')}
                    className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow transition-all shrink-0 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>
              )}

              {/* 4. DINNER */}
              {dinnerMeals.length > 0 ? (
                dinnerMeals.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-[#EFFAF5]/60 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between space-x-3 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={m.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"}
                        alt={m.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-indigo-500 uppercase">
                          <span>🌙</span>
                          <span>DINNER • {m.time || 'Logged'}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                          {m.name}
                        </h4>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-300">
                          {m.calories} kcal • {m.protein}g P
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedMealForView(m)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-[#087F5B] hover:text-white text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-xs shadow-sm transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteMeal(m.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex flex-col items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                      <Moon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">DINNER</span>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        No dinner logged yet
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAddMeal('Dinner')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition-all shrink-0 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                </div>
              )}

            </div>
          </div>

      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isAiCoachOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsAiCoachOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Collapsible AI Coach Right Side Panel */}
      <div
        className={`fixed top-0 sm:top-20 right-0 h-full sm:h-[calc(100vh-5rem)] z-40 w-full sm:w-[350px] lg:w-[400px] transition-transform duration-300 ease-in-out flex pointer-events-auto ${
          isAiCoachOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Attached Edge Trigger Button (moves together with the panel) */}
        <button
          onClick={() => setIsAiCoachOpen((prev) => !prev)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label={isAiCoachOpen ? "Close AI Coach" : "Open AI Coach"}
          className={`absolute top-24 sm:top-28 right-full z-50 flex items-center space-x-1.5 rounded-l-2xl bg-[#087F5B] hover:bg-[#066a4b] text-white shadow-[-6px_4px_20px_rgba(8,127,91,0.4)] transition-all cursor-pointer group border-y border-l border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-[#087F5B] ${
            isAiCoachOpen
              ? 'p-2.5 sm:p-3'
              : 'py-2.5 px-3 sm:px-3.5'
          }`}
          title={isAiCoachOpen ? "Close AI Coach (→)" : "Open AI Coach (←)"}
        >
          {isAiCoachOpen ? (
            <div className="flex items-center space-x-1">
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <Bot className="w-4 h-4 text-emerald-200" />
              <span className={`text-xs font-black tracking-wide pr-0.5 transition-all ${
                isButtonHovered ? 'inline' : 'hidden sm:inline'
              }`}>
                AI Coach
              </span>
            </div>
          )}
        </button>

        {/* Drawer Body containing AICoachWidget */}
        <div className="w-full h-full bg-white dark:bg-[#14213D] border-l border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <AICoachWidget onClose={() => setIsAiCoachOpen(false)} />
        </div>
      </div>

      {/* Modals */}
      <MealDetailModal
        isOpen={Boolean(selectedMealForView)}
        onClose={() => setSelectedMealForView(null)}
        meal={selectedMealForView}
      />

      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        defaultType={addMealDefaultCategory}
      />

      <SuggestionsModal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
      />
    </div>
  );
};
