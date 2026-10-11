import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  RotateCcw,
  Volume2
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import { foodService } from '../services/foodService';

export const VoiceLog = () => {
  const navigate = useNavigate();
  const { addMeal, showToast } = useHealth();

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState('I ate two eggs, one banana and a glass of milk.');
  const [detectedItems, setDetectedItems] = useState([
    { name: '2 Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 },
    { name: '1 Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: '1 Glass Milk', calories: 120, protein: 8, carbs: 12, fat: 5 }
  ]);
  const [progressData, setProgressData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealCategory, setMealCategory] = useState('Breakfast');

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
    // Fetch initial backend analysis and progress
    analyzeVoiceBackend('I ate two eggs, one banana and a glass of milk.');
  }, []);

  // Send voice transcript to AI voice parser
  const analyzeVoiceBackend = async (spokenText) => {
    if (!spokenText || !spokenText.trim()) return;
    setIsAnalyzing(true);

    try {
      // 1. Try backend endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/meals/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spokenText.trim(), type: mealCategory })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.meal?.items) {
          setDetectedItems(result.meal.items);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend voice analysis failed, using foodService parser:', err.message);
    }

    // 2. foodService AI speech parser
    try {
      const parsed = await foodService.parseVoiceMeal(spokenText);
      if (parsed.items && parsed.items.length > 0) {
        const parsedItems = parsed.items.map((itemName) => ({
          name: itemName,
          calories: Math.round(parsed.calories / parsed.items.length),
          protein: Math.round(parsed.protein / parsed.items.length),
          carbs: Math.round(parsed.carbs / parsed.items.length),
          fat: Math.round(parsed.fat / parsed.items.length)
        }));
        setDetectedItems(parsedItems);
        setMealCategory(parsed.mealType || mealCategory);
      } else {
        parseSpeechToFood(spokenText);
      }
    } catch (parseErr) {
      parseSpeechToFood(spokenText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fallback speech-to-food parser
  const parseSpeechToFood = (spokenText) => {
    const lower = spokenText.toLowerCase();
    const items = [];

    if (lower.includes('egg')) {
      items.push({ name: '2 Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 });
    }
    if (lower.includes('banana')) {
      items.push({ name: '1 Banana', calories: 105, protein: 1, carbs: 27, fat: 0 });
    }
    if (lower.includes('milk')) {
      items.push({ name: '1 Glass Milk', calories: 120, protein: 8, carbs: 12, fat: 5 });
    }
    if (lower.includes('oat') || lower.includes('oatmeal')) {
      items.push({ name: 'Bowl of Oatmeal with Berries', calories: 240, protein: 9, carbs: 42, fat: 4 });
    }
    if (lower.includes('chicken')) {
      items.push({ name: 'Grilled Chicken Breast', calories: 280, protein: 35, carbs: 0, fat: 6 });
    }
    if (lower.includes('rice') || lower.includes('dal')) {
      items.push({ name: 'Dal and Steamed Rice', calories: 380, protein: 14, carbs: 64, fat: 6 });
    }
    if (lower.includes('salad') || lower.includes('apple')) {
      items.push({ name: 'Fresh Green Salad / Fruit', calories: 95, protein: 2, carbs: 22, fat: 1 });
    }

    if (items.length === 0) {
      items.push({
        name: spokenText.trim().slice(0, 40) || 'Custom Voice Meal',
        calories: 360,
        protein: 18,
        carbs: 45,
        fat: 10
      });
    }

    setDetectedItems(items);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      showToast('Voice recognition is not supported in this browser.', 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Microphone active. Speak your meal now!', 'info');
      };

      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        analyzeVoiceBackend(spoken);
        showToast('Meal successfully recognized and analyzed!', 'success');
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        console.warn('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      showToast('Unable to start speech recognition', 'error');
    }
  };

  // Calculate combined totals from detected items
  const totalCalories = detectedItems.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = detectedItems.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbs = detectedItems.reduce((acc, item) => acc + item.carbs, 0);
  const totalFat = detectedItems.reduce((acc, item) => acc + item.fat, 0);

  const handleAddMeal = () => {
    const mealTitle = detectedItems.map(i => i.name).join(' + ');

    addMeal({
      name: mealTitle,
      type: mealCategory,
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80",
      confidence: 97,
      method: 'Voice Log'
    });

    navigate('/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-black">
          <Mic className="w-4 h-4" />
          <span>VOICE LOGGING</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Speak Your Meal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Tap the microphone and tell SnapFit what you ate. AI speech processing instantly extracts individual items and calculates nutrition.
        </p>
      </div>

      {/* Unsupported Browser Alert Fallback */}
      {!speechSupported && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-bold">Voice recognition is not supported in this browser.</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              You can type your meal transcript manually below to extract nutrition.
            </p>
          </div>
        </div>
      )}

      {/* Main Microphone Card */}
      <div className="bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        
        {/* Animated Radial Waves When Listening */}
        <div className="relative">
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-4 rounded-full bg-purple-500/20 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 2.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="absolute -inset-8 rounded-full bg-[#087F5B]/20 pointer-events-none"
              />
            </>
          )}

          {/* Large Microphone Button */}
          <button
            type="button"
            onClick={startSpeechRecognition}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative z-10 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 scale-105 shadow-rose-500/30'
                : 'bg-gradient-to-tr from-[#087F5B] to-emerald-400 hover:scale-105 shadow-[#087F5B]/30'
            }`}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 stroke-[2.2]" />
            ) : (
              <Mic className="w-12 h-12 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* State Label & Animated Waveform */}
        <div className="space-y-2">
          {isListening ? (
            <div className="space-y-3">
              <span className="text-base font-black text-rose-500 animate-pulse">
                Listening...
              </span>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center justify-center space-x-1.5 h-10">
                {[4, 8, 12, 16, 20, 16, 12, 8, 4, 10, 14, 8].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h}px`, `${h * 2.2}px`, `${h}px`] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.08 }}
                    className="w-1 bg-[#087F5B] rounded-full"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-base font-black text-slate-900 dark:text-white block">
                Speak your meal now
              </span>
              <p className="text-xs text-slate-400">
                Example: "I ate two eggs, one banana and a glass of milk."
              </p>
            </div>
          )}
        </div>

        {/* Try sample voice entries buttons */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <span className="text-xs font-bold text-slate-400 self-center">Try preset speech:</span>
          <button
            type="button"
            onClick={() => {
              const text = 'I ate two eggs, one banana and a glass of milk.';
              setTranscript(text);
              analyzeVoiceBackend(text);
            }}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#EFFAF5] hover:text-[#087F5B] transition-colors"
          >
            "Two eggs, one banana and milk"
          </button>
          <button
            type="button"
            onClick={() => {
              const text = 'I had grilled chicken breast with dal and rice for lunch.';
              setTranscript(text);
              analyzeVoiceBackend(text);
            }}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#EFFAF5] hover:text-[#087F5B] transition-colors"
          >
            "Chicken breast with dal and rice"
          </button>
        </div>
      </div>

      {/* Detected Meal & Nutritional Breakdown */}
      <div className="bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
        
        {/* Transcript Text Box (Editable Fallback) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Speech Transcript</span>
            <span className="text-[#087F5B] font-black">AI Speech-to-Text</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                analyzeVoiceBackend(e.target.value);
              }}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-[#087F5B]"
              placeholder="Speak or type your meal here..."
            />
          </div>
        </div>

        {/* Display: Detected Meal Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Detected Meal:
            </h4>
            {isAnalyzing && (
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold animate-pulse flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Backend Calculating Nutrition & Progress...</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {detectedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#EFFAF5] dark:bg-slate-800/60 border border-[#087F5B]/20 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white">
                      {item.name}
                    </h5>
                    <span className="text-[10px] text-slate-500">
                      {item.calories} kcal • {item.protein}g Pro
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Nutrition Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Calculated Nutrition</span>
            <span className="text-amber-500 font-black">{totalCalories} kcal Total</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Protein</span>
              <p className="text-base font-black text-[#087F5B] dark:text-emerald-400">{totalProtein}g</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Carbohydrates</span>
              <p className="text-base font-black text-sky-500">{totalCarbs}g</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Healthy Fats</span>
              <p className="text-base font-black text-purple-500">{totalFat}g</p>
            </div>
          </div>
        </div>

        {/* Backend Calculated Progress Card */}
        {progressData && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/70 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/70 dark:border-purple-800/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Backend Progress Calculation
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black">
                Health Score: {progressData.healthScore}/100
              </span>
            </div>

            {/* Metrics 4-Grid: Calories, Protein, Water, Activity */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm border border-purple-100 dark:border-purple-900/40">
                <span className="text-[9px] font-bold uppercase text-slate-400">Calories</span>
                <p className="text-sm font-black text-amber-500">
                  {progressData.calories.current} / {progressData.calories.target}
                </p>
                <span className="text-[9px] text-slate-500">{progressData.calories.percentage}% Target</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm border border-purple-100 dark:border-purple-900/40">
                <span className="text-[9px] font-bold uppercase text-slate-400">Protein</span>
                <p className="text-sm font-black text-[#087F5B] dark:text-emerald-400">
                  {progressData.protein.current}g / {progressData.protein.target}g
                </p>
                <span className="text-[9px] text-slate-500">{progressData.protein.percentage}% Target</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm border border-purple-100 dark:border-purple-900/40">
                <span className="text-[9px] font-bold uppercase text-slate-400">Water</span>
                <p className="text-sm font-black text-sky-500">
                  {progressData.water.current} / {progressData.water.target}
                </p>
                <span className="text-[9px] text-slate-500">Glasses</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 shadow-sm border border-purple-100 dark:border-purple-900/40">
                <span className="text-[9px] font-bold uppercase text-slate-400">Activity</span>
                <p className="text-sm font-black text-indigo-500">
                  {progressData.activity.current} / {progressData.activity.target}
                </p>
                <span className="text-[9px] text-slate-500">Mins Active</span>
              </div>
            </div>

            {/* Weekly Progress Bar Breakdown */}
            {Array.isArray(progressData.weeklyProgress) && progressData.weeklyProgress.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Weekly Progress (Mon - Sun):
                </span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {progressData.weeklyProgress.map((wp, idx) => (
                    <div key={idx} className="p-1 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/30">
                      <span className="text-[9px] font-bold text-slate-400 block">{wp.day}</span>
                      <span className="text-[10px] font-black text-slate-800 dark:text-white block">{wp.calories}</span>
                      <span className="text-[8px] font-semibold text-emerald-600 block">{wp.healthScore} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category selector & Add Meal Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <select
            value={mealCategory}
            onChange={(e) => setMealCategory(e.target.value)}
            className="w-full sm:w-44 px-4 py-3 text-xs font-black rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
          >
            <option value="Breakfast">☀️ Breakfast</option>
            <option value="Lunch">☀️ Lunch</option>
            <option value="Evening Snack">🌅 Snack</option>
            <option value="Dinner">🌙 Dinner</option>
          </select>

          <button
            type="button"
            onClick={handleAddMeal}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Meal to Today's Log</span>
          </button>
        </div>

      </div>
    </div>
  );
};
