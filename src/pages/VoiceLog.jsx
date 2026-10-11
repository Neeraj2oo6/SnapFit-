import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  RotateCcw,
  Volume2,
  Edit2,
  Trash2,
  Check,
  X,
  Droplets,
  Languages,
  Loader2,
  Calendar,
  Utensils
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import { useAuth } from '../hooks/useAuth';
import { nutritionService } from '../services/nutritionService';

export const VoiceLog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMeal, logWater, showToast } = useHealth();

  // Speech Recognition States
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN'); // en-IN or hi-IN

  // Input & Transcript States
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  // Analysis Result States
  const [analyzedResult, setAnalyzedResult] = useState(null);
  const [isWaterResult, setIsWaterResult] = useState(false);
  const [waterAmountMl, setWaterAmountMl] = useState(250);
  const [mealCategory, setMealCategory] = useState('Lunch');

  // Editable Items Mode
  const [isEditingItems, setIsEditingItems] = useState(false);
  const [editableItems, setEditableItems] = useState([]);

  // Ref to hold current speech recognition instance
  const recognitionRef = useRef(null);

  // Check speech recognition support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  // Set default meal category based on current time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setMealCategory('Breakfast');
    else if (hour < 16) setMealCategory('Lunch');
    else if (hour < 19) setMealCategory('Snack');
    else setMealCategory('Dinner');
  }, []);

  // Start or Stop Speech Recognition Lifecycle
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      showToast('Voice recognition is not supported in this browser. Please type your meal.', 'warning');
      return;
    }

    setRecognitionError(null);
    setPermissionDenied(false);

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionDenied(true);
          setRecognitionError('Microphone permission was denied. Please allow microphone access or type your meal manually.');
          showToast('Microphone access denied. Please type your meal.', 'error');
        } else if (event.error === 'no-speech') {
          setRecognitionError('No speech detected. Please speak closer to your microphone and try again.');
        } else if (event.error === 'network') {
          setRecognitionError('Network error occurred during speech recognition. Please check your connection or type manually.');
        } else {
          setRecognitionError(`Speech recognition issue (${event.error}). You can type your meal description directly.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setRecognitionError('Could not start microphone. Please check browser permissions or type manually.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  };

  // Submit transcript for food and nutrition analysis
  const handleAnalyzeTranscript = async (customText = null) => {
    const textToAnalyze = (customText !== null ? customText : transcript).trim();
    if (!textToAnalyze) {
      showToast('Please speak or type a food description first.', 'warning');
      return;
    }

    stopListening();
    setIsAnalyzing(true);
    setRecognitionError(null);
    setSaveSuccess(null);

    try {
      // 1. First, check if backend API endpoint is reachable
      let analyzedData = null;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/meals/voice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: textToAnalyze,
            text: textToAnalyze,
            type: mealCategory,
            language: selectedLanguage
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            analyzedData = json;
          }
        }
      } catch (backendErr) {
        console.warn('Backend API call bypassed/failed, seamlessly using central client nutritionService:', backendErr.message);
      }

      // 2. Check for Water intake (either from backend response or local parser)
      const classification = nutritionService.classifyMessage(textToAnalyze);
      if ((analyzedData && analyzedData.isWater) || classification === 'water') {
        const ml = analyzedData?.amountMl || nutritionService.parseWaterIntake(textToAnalyze);
        setIsWaterResult(true);
        setWaterAmountMl(ml);
        setAnalyzedResult({
          type: 'water',
          amountMl: ml,
          transcript: textToAnalyze
        });
        setIsAnalyzing(false);
        return;
      }

      // 3. Process Food intake
      setIsWaterResult(false);

      if (analyzedData && analyzedData.items && analyzedData.items.length > 0) {
        // Use verified structured data returned by backend
        const items = analyzedData.items.map((it, idx) => ({
          id: `item-${idx}-${Date.now()}`,
          foodName: it.foodName || it.name,
          quantity: Number(it.quantity) || 1,
          portionUnit: it.portionUnit || 'serving',
          portion: it.portion || `${it.quantity || 1} ${it.portionUnit || 'serving'}`,
          calories: Math.round(Number(it.calories) || 0),
          protein: Math.round(Number(it.protein) || 0),
          carbs: Math.round(Number(it.carbs) || 0),
          fat: Math.round(Number(it.fat) || 0),
          fiber: it.fiber != null ? Math.round(Number(it.fiber) * 10) / 10 : 0,
          source: it.source || 'ai',
          isEstimated: it.source === 'ai' || it.isEstimated || false
        }));

        setEditableItems(items);
        setAnalyzedResult({
          type: 'food',
          mealType: analyzedData.meal?.type || mealCategory,
          transcript: textToAnalyze,
          source: analyzedData.meal?.source || 'backend_ai'
        });
        if (analyzedData.meal?.type) {
          setMealCategory(analyzedData.meal.type);
        }
      } else {
        // Use Central Client Nutrition Service (Verified Indian Food Database + NLP)
        const parsed = await nutritionService.parseNaturalLanguageFood(textToAnalyze);
        if (parsed && parsed.items && parsed.items.length > 0) {
          const items = parsed.items.map((it, idx) => ({
            id: `item-${idx}-${Date.now()}`,
            foodName: it.foodName,
            quantity: Number(it.quantity) || 1,
            portionUnit: it.portionUnit || it.portion?.replace(/^[\d.]+\s*/, '') || 'serving',
            portion: it.portion || '1 serving',
            calories: Math.round(it.calories || 0),
            protein: Math.round(it.protein || 0),
            carbs: Math.round(it.carbs || 0),
            fat: Math.round(it.fat || 0),
            fiber: it.fiber != null ? Math.round(it.fiber * 10) / 10 : 0,
            source: it.source || 'verified_database',
            isEstimated: it.isEstimated || false
          }));

          setEditableItems(items);
          setAnalyzedResult({
            type: 'food',
            mealType: parsed.mealType || mealCategory,
            transcript: textToAnalyze,
            source: 'verified_database'
          });
          if (parsed.mealType) {
            setMealCategory(parsed.mealType);
          }
        } else {
          // Unknown food item fallback with editable fields
          const fallbackName = textToAnalyze.slice(0, 35) || 'Custom Food';
          const fallbackItem = {
            id: `item-0-${Date.now()}`,
            foodName: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
            quantity: 1,
            portionUnit: 'serving',
            portion: '1 serving',
            calories: 280,
            protein: 8,
            carbs: 38,
            fat: 8,
            fiber: 2,
            source: 'ai_estimate',
            isEstimated: true
          };
          setEditableItems([fallbackItem]);
          setAnalyzedResult({
            type: 'food',
            mealType: mealCategory,
            transcript: textToAnalyze,
            source: 'ai_estimate'
          });
        }
      }
    } catch (err) {
      console.error('Food analysis error:', err);
      setRecognitionError('Could not analyze the food description. Please check your text and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Recalculate nutrient totals from editable items
  const totalCalories = editableItems.reduce((acc, it) => acc + (Number(it.calories) || 0), 0);
  const totalProtein = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.fat) || 0), 0) * 10) / 10;
  const totalFiber = Math.round(editableItems.reduce((acc, it) => acc + (Number(it.fiber) || 0), 0) * 10) / 10;

  // Handle item property changes in the Confirmation Screen
  const handleItemChange = async (itemId, field, value) => {
    setEditableItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        const updated = { ...item, [field]: value };

        // If quantity changed, scale calories and macros proportionally
        if (field === 'quantity') {
          const oldQty = Number(item.quantity) || 1;
          const newQty = Math.max(0.25, Number(value) || 1);
          const ratio = newQty / oldQty;

          updated.calories = Math.round(item.calories * ratio);
          updated.protein = Math.round(item.protein * ratio * 10) / 10;
          updated.carbs = Math.round(item.carbs * ratio * 10) / 10;
          updated.fat = Math.round(item.fat * ratio * 10) / 10;
          updated.portion = `${newQty} ${updated.portionUnit || 'serving'}`;
        }

        if (field === 'portionUnit') {
          updated.portion = `${updated.quantity || 1} ${value}`;
        }

        return updated;
      })
    );
  };

  // Delete an item from the meal
  const handleRemoveItem = (itemId) => {
    setEditableItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Add a new food item manually to the confirmation screen
  const handleAddManualItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      foodName: 'New Item',
      quantity: 1,
      portionUnit: 'serving',
      portion: '1 serving',
      calories: 120,
      protein: 4,
      carbs: 18,
      fat: 3,
      fiber: 1,
      source: 'user_confirmed',
      isEstimated: true
    };
    setEditableItems((prev) => [...prev, newItem]);
    setIsEditingItems(true);
  };

  // Reset / Cancel analysis
  const handleCancelAnalysis = () => {
    setAnalyzedResult(null);
    setIsWaterResult(false);
    setEditableItems([]);
    setIsEditingItems(false);
    setSaveSuccess(null);
  };

  // CONFIRM & ADD TO DASHBOARD (FOOD FLOW)
  const handleConfirmAddMeal = async () => {
    if (!user) {
      showToast('Please sign in to save meals to your Dashboard.', 'error');
      navigate('/login');
      return;
    }

    if (editableItems.length === 0) {
      showToast('No food items to log. Please add at least one item.', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      const aggregateName = editableItems.map((i) => i.foodName).join(' + ');
      const isAnyEstimated = editableItems.some((i) => i.isEstimated);

      const mealPayload = {
        foodName: aggregateName,
        name: aggregateName,
        quantity: editableItems.reduce((s, i) => s + (Number(i.quantity) || 1), 0),
        portionUnit: editableItems[0]?.portionUnit || 'serving',
        portion: editableItems.map((i) => i.portion || `${i.quantity} ${i.portionUnit}`).join(', '),
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        fiber: totalFiber,
        mealType: mealCategory,
        type: mealCategory,
        source: isAnyEstimated ? 'ai_estimate' : 'user_confirmed',
        estimated: isAnyEstimated,
        inputMethod: 'voice',
        originalTranscript: transcript,
        items: editableItems.map((i) => ({
          foodName: i.foodName,
          quantity: i.quantity,
          portionUnit: i.portionUnit,
          portion: i.portion,
          calories: i.calories,
          protein: i.protein,
          carbs: i.carbs,
          fat: i.fat
        }))
      };

      // Save to Firebase Firestore via centralized HealthContext / mealService
      const saved = await addMeal(mealPayload);

      setSaveSuccess({
        type: 'food',
        message: 'Meal added to your Dashboard successfully!',
        data: saved
      });
      showToast('Meal added to your Dashboard successfully.', 'success');
    } catch (err) {
      console.error('Failed to confirm and save meal to Firestore:', err);
      showToast(err.message || 'Failed to save meal. Please retry.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // CONFIRM & ADD TO DASHBOARD (WATER FLOW)
  const handleConfirmAddWater = async () => {
    if (!user) {
      showToast('Please sign in to log water.', 'error');
      navigate('/login');
      return;
    }

    if (!waterAmountMl || Number(waterAmountMl) <= 0) {
      showToast('Please specify a valid water quantity in ml.', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      // Save water to Firebase Firestore via HealthContext / waterService
      await logWater(Number(waterAmountMl), 'voice', transcript);

      setSaveSuccess({
        type: 'water',
        message: `${waterAmountMl} ml of water added to your Dashboard!`,
        amountMl: waterAmountMl
      });
      showToast('Water intake added to your Dashboard successfully.', 'success');
    } catch (err) {
      console.error('Failed to save water intake:', err);
      showToast(err.message || 'Failed to save water. Please retry.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-400 text-xs font-black">
          <Mic className="w-4 h-4" />
          <span>VOICE MEAL LOGGING</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Speak Your Meal Naturally
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Speak in English, Hindi, or Hinglish. SnapFit parses your foods, calculates verified nutrition, asks for your confirmation, and updates your Dashboard automatically.
        </p>
      </div>

      {/* Language Selector Bar */}
      <div className="flex items-center justify-center space-x-2 text-xs font-bold">
        <span className="text-slate-400 flex items-center space-x-1">
          <Languages className="w-3.5 h-3.5" />
          <span>Recognition Language:</span>
        </span>
        <button
          type="button"
          onClick={() => setSelectedLanguage('en-IN')}
          className={`px-3 py-1 rounded-full transition-all ${
            selectedLanguage === 'en-IN'
              ? 'bg-[#087F5B] text-white shadow-sm font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          English (India)
        </button>
        <button
          type="button"
          onClick={() => setSelectedLanguage('hi-IN')}
          className={`px-3 py-1 rounded-full transition-all ${
            selectedLanguage === 'hi-IN'
              ? 'bg-[#087F5B] text-white shadow-sm font-extrabold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          हिंदी (Hindi / Hinglish)
        </button>
      </div>

      {/* Browser Support Alert */}
      {!speechSupported && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-bold">Speech recognition is not supported in this browser.</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              You can type your food description below and submit it for AI nutrition analysis.
            </p>
          </div>
        </div>
      )}

      {/* Permission Denied Alert */}
      {permissionDenied && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <div>
            <p className="font-bold">Microphone Permission Denied</p>
            <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
              Please click the lock icon in your browser address bar to allow microphone access, or type your meal description manually in the box below.
            </p>
          </div>
        </div>
      )}

      {/* Recognition Error Alert */}
      {recognitionError && !permissionDenied && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{recognitionError}</span>
        </div>
      )}

      {/* Main Microphone Card (Always Visible for Recording or Retrying) */}
      <div className="bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Animated Radial Ripple Waves */}
        <div className="relative">
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-4 rounded-full bg-rose-500/20 pointer-events-none"
              />
              <motion.div
                animate={{ scale: [1, 2.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                className="absolute -inset-8 rounded-full bg-[#087F5B]/20 pointer-events-none"
              />
            </>
          )}

          {/* Large Interactive Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 relative z-10 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 scale-105 shadow-rose-500/30 animate-pulse'
                : 'bg-gradient-to-tr from-[#087F5B] to-emerald-400 hover:scale-105 shadow-[#087F5B]/30'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to start voice recognition'}
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
              <span className="text-base font-black text-rose-500">
                Listening... (Click button to stop)
              </span>

              {/* Animated Waveform Visualizer */}
              <div className="flex items-center justify-center space-x-1.5 h-10">
                {[6, 12, 18, 24, 30, 24, 18, 12, 6, 14, 20, 10].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h}px`, `${h * 1.8}px`, `${h}px`] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.06 }}
                    className="w-1 bg-[#087F5B] rounded-full"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-base font-black text-slate-900 dark:text-white block">
                {transcript ? 'Review or edit your spoken meal' : 'Click the microphone to speak'}
              </span>
              <p className="text-xs text-slate-400">
                Try: "I ate two rotis and one bowl of dal" or "Maine do glass pani piya"
              </p>
            </div>
          )}
        </div>

        {/* Preset Speech Suggestions */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Or try these test phrases:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                const text = 'I ate two rotis and one bowl of dal.';
                setTranscript(text);
                handleAnalyzeTranscript(text);
              }}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#EFFAF5] hover:text-[#087F5B] transition-colors"
            >
              "Two rotis and one bowl of dal"
            </button>
            <button
              type="button"
              onClick={() => {
                const text = 'Maine do roti aur ek bowl dal khayi.';
                setTranscript(text);
                handleAnalyzeTranscript(text);
              }}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#EFFAF5] hover:text-[#087F5B] transition-colors"
            >
              "Maine do roti aur dal khayi"
            </button>
            <button
              type="button"
              onClick={() => {
                const text = 'Aaj lunch mein rajma chawal khaya.';
                setTranscript(text);
                handleAnalyzeTranscript(text);
              }}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#EFFAF5] hover:text-[#087F5B] transition-colors"
            >
              "Aaj lunch mein rajma chawal"
            </button>
            <button
              type="button"
              onClick={() => {
                const text = 'I ate one banana and one apple.';
                setTranscript(text);
                handleAnalyzeTranscript(text);
              }}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#EFFAF5] hover:text-[#087F5B] transition-colors"
            >
              "One banana and one apple"
            </button>
            <button
              type="button"
              onClick={() => {
                const text = 'I drank 500 ml water.';
                setTranscript(text);
                handleAnalyzeTranscript(text);
              }}
              className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
            >
              "I drank 500 ml water"
            </button>
          </div>
        </div>

        {/* Editable Transcript Input Area */}
        <div className="w-full space-y-2 pt-2 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>RECOGNIZED SPEECH / EDITABLE TRANSCRIPT</span>
            <span className="text-[#087F5B] font-black">Step 1: Review Transcript</span>
          </div>
          <div className="relative">
            <textarea
              rows={2}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words appear here. You can also edit or type manually..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#087F5B] focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setTranscript('')}
              disabled={!transcript}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 disabled:opacity-40 transition-colors"
            >
              Clear Text
            </button>

            <button
              type="button"
              onClick={() => handleAnalyzeTranscript()}
              disabled={!transcript.trim() || isAnalyzing}
              className="py-2.5 px-5 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-[#087F5B]/20 flex items-center space-x-2 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Food & Nutrition...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Spoken Meal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION SCREEN: FOOD ENTRY */}
      {analyzedResult && !isWaterResult && (
        <div className="bg-white dark:bg-[#14213D] rounded-3xl border-2 border-[#087F5B]/40 dark:border-[#087F5B]/50 p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#087F5B] dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>VOICE MEAL ANALYSIS CONFIRMATION</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Please Review & Confirm Your Meal
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400">Meal Type:</span>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-black rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Breakfast">☀️ Breakfast</option>
                <option value="Lunch">☀️ Lunch</option>
                <option value="Snack">🌅 Snack</option>
                <option value="Dinner">🌙 Dinner</option>
              </select>
            </div>
          </div>

          {/* Recognized Speech Quote */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
              Recognized Speech:
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
              "{analyzedResult.transcript}"
            </p>
          </div>

          {/* Food Items List (Editable) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Detected Food Items ({editableItems.length})
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditingItems(!isEditingItems)}
                  className="text-xs font-bold text-[#087F5B] hover:underline flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingItems ? 'Done Editing' : 'Edit Items'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {editableItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-2xl bg-[#EFFAF5]/60 dark:bg-slate-800/80 border border-[#087F5B]/20 space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-[#087F5B] text-white text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {isEditingItems ? (
                        <input
                          type="text"
                          value={item.foodName}
                          onChange={(e) => handleItemChange(item.id, 'foodName', e.target.value)}
                          className="px-2 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      ) : (
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {item.foodName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          item.isEstimated
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                        }`}
                      >
                        {item.isEstimated ? 'Estimated Nutrition' : 'Verified Database'}
                      </span>
                      {editableItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Portion & Quantity Controls */}
                  <div className="flex flex-wrap items-center gap-3 text-xs bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-semibold">Quantity:</span>
                      <input
                        type="number"
                        min="0.25"
                        step="0.5"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1 text-xs font-bold text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-semibold">Unit:</span>
                      <select
                        value={item.portionUnit || 'serving'}
                        onChange={(e) => handleItemChange(item.id, 'portionUnit', e.target.value)}
                        className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="piece">piece / pcs</option>
                        <option value="bowl">bowl / katori</option>
                        <option value="plate">plate</option>
                        <option value="cup">cup</option>
                        <option value="glass">glass</option>
                        <option value="slice">slice</option>
                        <option value="serving">serving</option>
                        <option value="grams">grams</option>
                      </select>
                    </div>

                    {/* Macros breakdown for item */}
                    <div className="ml-auto flex items-center space-x-2 text-[11px] font-bold">
                      <span className="text-amber-600 dark:text-amber-400">{item.calories} kcal</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{item.protein}g P</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sky-600 dark:text-sky-400">{item.carbs}g C</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-purple-600 dark:text-purple-400">{item.fat}g F</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL NUTRITION SUMMARY CARD */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400">
              <span>TOTAL COMBINED NUTRITION</span>
              <span className="text-base font-black text-amber-500">{totalCalories} kcal Total</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-amber-500 block">Calories</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{totalCalories}</span>
                <span className="text-[9px] text-slate-400 block">kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-[#087F5B] block">Protein</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{totalProtein}</span>
                <span className="text-[9px] text-slate-400 block">g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-sky-500 block">Carbs</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{totalCarbs}</span>
                <span className="text-[9px] text-slate-400 block">g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] uppercase font-bold text-purple-500 block">Fat</span>
                <span className="text-base font-black text-slate-900 dark:text-white">{totalFat}</span>
                <span className="text-[9px] text-slate-400 block">g</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: [Edit] [Cancel] [Confirm & Add to Dashboard] */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingItems(!isEditingItems)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#087F5B] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>{isEditingItems ? 'Done Editing' : 'Edit Items'}</span>
            </button>

            <button
              type="button"
              onClick={handleCancelAnalysis}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-rose-500 hover:text-rose-600 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAddMeal}
              disabled={isSaving || editableItems.length === 0}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-[#087F5B]/25 flex items-center justify-center space-x-2 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Firebase Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Add to Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* CONFIRMATION SCREEN: WATER ENTRY */}
      {analyzedResult && isWaterResult && (
        <div className="bg-white dark:bg-[#14213D] rounded-3xl border-2 border-sky-500/40 p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-[10px] font-black uppercase tracking-wider">
                <Droplets className="w-3.5 h-3.5" />
                <span>WATER INTAKE CONFIRMATION</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                Confirm Water Intake
              </h3>
            </div>
            <span className="text-2xl">💧</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
              Recognized Speech:
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
              "{analyzedResult.transcript}"
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-800 border border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xl">
                💧
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Water Quantity (Milliliters)</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {waterAmountMl} ml
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">Edit amount:</span>
              <input
                type="number"
                min="50"
                step="50"
                value={waterAmountMl}
                onChange={(e) => setWaterAmountMl(Math.max(1, Number(e.target.value) || 250))}
                className="w-24 px-3 py-1.5 text-xs font-black text-center rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700"
              />
              <span className="text-xs font-bold text-slate-500">ml</span>
            </div>
          </div>

          {/* Quick volume buttons */}
          <div className="flex items-center space-x-2 justify-center text-xs">
            <span className="text-slate-400 font-semibold">Quick select:</span>
            {[250, 500, 750, 1000].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => setWaterAmountMl(ml)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  waterAmountMl === ml
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50'
                }`}
              >
                {ml} ml
              </button>
            ))}
          </div>

          {/* Water Confirmation Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelAnalysis}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-rose-500 hover:text-rose-600 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAddWater}
              disabled={isSaving}
              className="flex-1 py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center space-x-2 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Water to Firestore...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Add Water to Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL / CARD */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-[#087F5B] text-white shadow-xl space-y-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-black">Saved to Today's Dashboard!</h4>
              <p className="text-xs text-white/80">{saveSuccess.message}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-2.5 px-5 rounded-xl bg-white text-[#087F5B] hover:bg-slate-100 text-xs font-extrabold shadow-md flex items-center space-x-1.5 transition-all"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setSaveSuccess(null);
                setAnalyzedResult(null);
                setTranscript('');
                setEditableItems([]);
              }}
              className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all"
            >
              Log Another Entry
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceLog;
