import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
  Moon,
  Sparkles,
  Briefcase,
  GraduationCap,
  Activity,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { step } = useParams();
  const { user, completeOnboarding } = useAuth();

  // Determine current step from route parameter or fallback
  const getStepNumber = (s) => {
    if (s === 'step-1') return 1;
    if (s === 'step-2') return 2;
    if (s === 'step-3') return 3;
    if (s === 'step-4') return 4;
    return null;
  };

  const parsedStep = getStepNumber(step);

  const [currentStep, setCurrentStep] = useState(() => {
    if (parsedStep) return parsedStep;
    const saved = localStorage.getItem('snapfit_onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Keep route and state in sync
  useEffect(() => {
    if (parsedStep && parsedStep !== currentStep) {
      setCurrentStep(parsedStep);
    } else if (!parsedStep) {
      navigate(`/onboarding/step-${currentStep}`, { replace: true });
    }
  }, [step, parsedStep, currentStep, navigate]);

  useEffect(() => {
    localStorage.setItem('snapfit_onboarding_step', currentStep.toString());
  }, [currentStep]);

  // =========================================================================
  // STEP 1 STATE: PROFILE BASICS
  // =========================================================================
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_profile');
    if (saved) {
      try { return JSON.parse(saved).role || 'Student'; } catch (e) {}
    }
    return 'Student';
  });

  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_profile');
    if (saved) {
      try { return JSON.parse(saved).goal || 'Build Muscle'; } catch (e) {}
    }
    return 'Build Muscle';
  });

  const [gender, setGender] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_profile');
    if (saved) {
      try { return JSON.parse(saved).gender || 'Prefer not to say'; } catch (e) {}
    }
    return 'Prefer not to say';
  });

  // =========================================================================
  // STEP 2 STATE: DAILY ROUTINE
  // =========================================================================
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_routine');
    if (saved) {
      try { return JSON.parse(saved).startTime || '8:30 AM'; } catch (e) {}
    }
    return '8:30 AM';
  });

  const [endTime, setEndTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_routine');
    if (saved) {
      try { return JSON.parse(saved).endTime || '4:30 PM'; } catch (e) {}
    }
    return '4:30 PM';
  });

  const [studyWorkTime, setStudyWorkTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_routine');
    if (saved) {
      try { return JSON.parse(saved).studyWorkTime || '7:00 PM - 10:30 PM'; } catch (e) {}
    }
    return '7:00 PM - 10:30 PM';
  });

  const [sleepTime, setSleepTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_routine');
    if (saved) {
      try { return JSON.parse(saved).sleepTime || '11:30 PM'; } catch (e) {}
    }
    return '11:30 PM';
  });

  // =========================================================================
  // STEP 3 STATE: MEAL TIMES (defaults: Breakfast 8:00 AM, Lunch 1:30 PM, Evening Snack 5:30 PM, Dinner 8:30 PM)
  // =========================================================================
  const [breakfastTime, setBreakfastTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_mealTimes');
    if (saved) {
      try { return JSON.parse(saved).breakfast || '8:00 AM'; } catch (e) {}
    }
    return '8:00 AM';
  });

  const [lunchTime, setLunchTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_mealTimes');
    if (saved) {
      try { return JSON.parse(saved).lunch || '1:30 PM'; } catch (e) {}
    }
    return '1:30 PM';
  });

  const [eveningSnackTime, setEveningSnackTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_mealTimes');
    if (saved) {
      try { return JSON.parse(saved).eveningSnack || '5:30 PM'; } catch (e) {}
    }
    return '5:30 PM';
  });

  const [dinnerTime, setDinnerTime] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_mealTimes');
    if (saved) {
      try { return JSON.parse(saved).dinner || '8:30 PM'; } catch (e) {}
    }
    return '8:30 PM';
  });

  // =========================================================================
  // STEP 4 STATE: ACTIVITY LEVEL
  // =========================================================================
  const [activityLevel, setActivityLevel] = useState(() => {
    const saved = localStorage.getItem('snapfit_draft_activityLevel');
    if (saved) {
      try { return JSON.parse(saved).level || 'Moderate'; } catch (e) {}
    }
    return 'Moderate';
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Options Definitions
  const goalOptions = [
    'Build Muscle',
    'Lose Weight',
    'Maintain Weight',
    'Improve Fitness'
  ];

  const genderOptions = [
    'Male',
    'Female',
    'Other',
    'Prefer not to say'
  ];

  const activityOptions = [
    {
      id: 'Sedentary',
      title: 'Sedentary',
      subtitle: 'Little or no exercise',
      multiplier: '1.2x'
    },
    {
      id: 'Light',
      title: 'Light',
      subtitle: '1–3 days per week',
      multiplier: '1.375x'
    },
    {
      id: 'Moderate',
      title: 'Moderate',
      subtitle: '3–5 days per week',
      multiplier: '1.55x'
    },
    {
      id: 'Active',
      title: 'Active',
      subtitle: '6–7 days per week',
      multiplier: '1.725x'
    }
  ];

  // Step Progress %
  const progressPct =
    currentStep === 1 ? 25 :
    currentStep === 2 ? 50 :
    currentStep === 3 ? 75 : 100;

  // Navigation Handlers
  const handleNext = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      localStorage.setItem('snapfit_draft_profile', JSON.stringify({ role, goal, gender }));
      setCurrentStep(2);
      navigate('/onboarding/step-2');
    } else if (currentStep === 2) {
      localStorage.setItem('snapfit_draft_routine', JSON.stringify({
        startTime,
        endTime,
        studyWorkTime,
        sleepTime
      }));
      setCurrentStep(3);
      navigate('/onboarding/step-3');
    } else if (currentStep === 3) {
      localStorage.setItem('snapfit_draft_mealTimes', JSON.stringify({
        breakfast: breakfastTime,
        lunch: lunchTime,
        eveningSnack: eveningSnackTime,
        dinner: dinnerTime
      }));
      setCurrentStep(4);
      navigate('/onboarding/step-4');
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      navigate('/register');
    } else if (currentStep === 2) {
      setCurrentStep(1);
      navigate('/onboarding/step-1');
    } else if (currentStep === 3) {
      setCurrentStep(2);
      navigate('/onboarding/step-2');
    } else if (currentStep === 4) {
      setCurrentStep(3);
      navigate('/onboarding/step-3');
    }
  };

  const handleCompleteSetup = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const profileData = { role, goal, gender };
      const routineData = {
        startTime,
        endTime,
        studyWorkTime,
        sleepTime,
        // Also map to role specific keys for backward compatibility
        ...(role === 'Student'
          ? { collegeStartTime: startTime, collegeEndTime: endTime }
          : { workStartTime: startTime, workEndTime: endTime })
      };
      const mealTimesData = {
        breakfast: breakfastTime,
        lunch: lunchTime,
        eveningSnack: eveningSnackTime,
        dinner: dinnerTime
      };

      // Save onboarding data in Firestore users/{userId} and mark completed
      await completeOnboarding({
        profile: profileData,
        routine: routineData,
        mealTimes: mealTimesData,
        activityLevel
      });

      // Clear draft storage
      localStorage.removeItem('snapfit_onboarding_step');
      localStorage.removeItem('snapfit_draft_profile');
      localStorage.removeItem('snapfit_draft_routine');
      localStorage.removeItem('snapfit_draft_mealTimes');
      localStorage.removeItem('snapfit_draft_activityLevel');

      // Navigate to Dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] flex flex-col justify-between py-4 px-4 sm:py-8 sm:px-6 lg:px-8 relative overflow-y-auto transition-colors selection:bg-[#087F5B] selection:text-white safe-area-pt safe-area-pb">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#087F5B]/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full z-10 flex items-center justify-between shrink-0 mb-3 sm:mb-5">
        <div className="flex items-center space-x-2">
          <button
            id="onboarding-back-btn"
            type="button"
            onClick={handleBack}
            className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <Link to="/" className="inline-flex items-center space-x-2">
            <img
              src="/snapfit-logo.png"
              alt="SnapFit Logo"
              className="h-7 sm:h-9 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-[#087F5B] dark:text-emerald-400 leading-none">
                SnapFit
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Profile Setup
              </span>
            </div>
          </Link>
        </div>

        <span className="text-xs font-black text-[#087F5B] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-[#087F5B]/20">
          Step {currentStep} of 4
        </span>
      </div>

      {/* Main Form Content Container */}
      <div className="max-w-xl mx-auto w-full z-10 my-auto py-2 sm:py-4">
        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6 space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Setup Progress</span>
            <span className="text-[#087F5B] dark:text-emerald-400 font-black">{progressPct}%</span>
          </div>
          <div className="h-2 sm:h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#087F5B] rounded-full shadow-sm"
              initial={{ width: `${progressPct}%` }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400">
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ================================================================= */}
            {/* STEP 1 OF 4 — PROFILE BASICS                                      */}
            {/* ================================================================= */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Let's set up your profile
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Tell us about yourself to personalize your nutrition and routine.
                  </p>
                </div>

                {/* 1. I am: Student / Working Professional */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    I am
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('Student')}
                      className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${
                        role === 'Student'
                          ? 'border-[#087F5B] bg-[#EFFAF5] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">🎓</span>
                        <span className="text-sm font-bold">Student</span>
                      </div>
                      {role === 'Student' && (
                        <div className="w-4 h-4 rounded-full bg-[#087F5B] flex items-center justify-center text-white shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('Working Professional')}
                      className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${
                        role === 'Working Professional'
                          ? 'border-[#087F5B] bg-[#EFFAF5] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xl">💼</span>
                        <span className="text-sm font-bold leading-tight">Working Professional</span>
                      </div>
                      {role === 'Working Professional' && (
                        <div className="w-4 h-4 rounded-full bg-[#087F5B] flex items-center justify-center text-white shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Your Goal */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Your Goal
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {goalOptions.map((g) => {
                      const isSelected = goal === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGoal(g)}
                          className={`relative flex items-center justify-between p-3 rounded-xl sm:rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-[#087F5B] bg-[#EFFAF5] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-300 font-extrabold shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-bold'
                          }`}
                        >
                          <span className="text-xs sm:text-sm">{g}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#087F5B] flex items-center justify-center text-white shrink-0">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Gender */}
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {genderOptions.map((gen) => {
                      const isSelected = gender === gen;
                      return (
                        <button
                          key={gen}
                          type="button"
                          onClick={() => setGender(gen)}
                          className={`relative flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-[#087F5B] bg-[#EFFAF5] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-300 font-extrabold shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 font-medium'
                          }`}
                        >
                          <span className="text-xs">{gen}</span>
                          {isSelected && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#087F5B] flex items-center justify-center text-white shrink-0">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-3">
                  <button
                    id="step-1-next-btn"
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 2 OF 4 — DAILY ROUTINE                                       */}
            {/* ================================================================= */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Tell us about your routine
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Help us align nutrition timing with your daily schedule ({role}).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Dynamic Start Time */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>{role === 'Student' ? 'College Start Time' : 'Work Start Time'}</span>
                    </label>
                    <input
                      id="routine-start-time"
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="8:30 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#087F5B] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all"
                    />
                  </div>

                  {/* Dynamic End Time */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>{role === 'Student' ? 'College End Time' : 'Work End Time'}</span>
                    </label>
                    <input
                      id="routine-end-time"
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="4:30 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#087F5B] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all"
                    />
                  </div>

                  {/* Study / Work Time */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>Study / Work Time</span>
                    </label>
                    <input
                      id="routine-study-work-time"
                      type="text"
                      value={studyWorkTime}
                      onChange={(e) => setStudyWorkTime(e.target.value)}
                      placeholder="7:00 PM - 10:30 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#087F5B] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all"
                    />
                  </div>

                  {/* Sleep Time */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Sleep Time</span>
                    </label>
                    <input
                      id="routine-sleep-time"
                      type="text"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      placeholder="11:30 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#087F5B] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Back / Next Buttons */}
                <div className="pt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    id="step-2-next-btn"
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 hover:shadow-xl transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 3 OF 4 — MEAL TIMES                                          */}
            {/* ================================================================= */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Your typical meal times
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Editable defaults provided. Feel free to customize to your schedule.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Breakfast */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-200/80 dark:border-amber-800/40 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">☀️</span>
                      <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
                        Breakfast
                      </span>
                    </div>
                    <input
                      id="meal-breakfast-time"
                      type="text"
                      value={breakfastTime}
                      onChange={(e) => setBreakfastTime(e.target.value)}
                      placeholder="8:00 AM"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/60 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Lunch */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-800/40 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🍱</span>
                      <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300">
                        Lunch
                      </span>
                    </div>
                    <input
                      id="meal-lunch-time"
                      type="text"
                      value={lunchTime}
                      onChange={(e) => setLunchTime(e.target.value)}
                      placeholder="1:30 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/60 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
                    />
                  </div>

                  {/* Evening Snack */}
                  <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border-2 border-orange-200/80 dark:border-orange-800/40 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">☕</span>
                      <span className="text-xs font-black uppercase text-orange-900 dark:text-orange-300">
                        Evening Snack
                      </span>
                    </div>
                    <input
                      id="meal-evening-snack-time"
                      type="text"
                      value={eveningSnackTime}
                      onChange={(e) => setEveningSnackTime(e.target.value)}
                      placeholder="5:30 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700/60 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Dinner */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-200/80 dark:border-indigo-800/40 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🌙</span>
                      <span className="text-xs font-black uppercase text-indigo-900 dark:text-indigo-300">
                        Dinner
                      </span>
                    </div>
                    <input
                      id="meal-dinner-time"
                      type="text"
                      value={dinnerTime}
                      onChange={(e) => setDinnerTime(e.target.value)}
                      placeholder="8:30 PM"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700/60 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Back / Next Buttons */}
                <div className="pt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    id="step-3-next-btn"
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 hover:shadow-xl transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* STEP 4 OF 4 — ACTIVITY LEVEL                                      */}
            {/* ================================================================= */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Your Activity Level
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select how active you are to calculate your daily calorie & macro goals.
                  </p>
                </div>

                {/* Activity Level Cards */}
                <div className="space-y-2.5">
                  {activityOptions.map((opt) => {
                    const isSelected = activityLevel === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setActivityLevel(opt.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#087F5B] bg-[#EFFAF5] dark:bg-emerald-950/40 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                        }`}
                      >
                        <div>
                          <p
                            className={`text-sm font-black ${
                              isSelected
                                ? 'text-[#087F5B] dark:text-emerald-300'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {opt.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {opt.subtitle}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#087F5B] flex items-center justify-center text-white shrink-0">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Back / Complete Setup Buttons */}
                <div className="pt-3 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    id="complete-onboarding-btn"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleCompleteSetup}
                    className="flex-1 py-3.5 px-4 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-xl shadow-[#087F5B]/30 hover:scale-[1.01] transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>{isSubmitting ? 'Saving Profile...' : 'Complete Setup'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer hint */}
      <div className="max-w-xl mx-auto w-full z-10 text-center shrink-0">
        <p className="text-[11px] text-slate-400">
          SnapFit AI • You can update routine and meal times anytime from your Profile settings.
        </p>
      </div>
    </div>
  );
};
