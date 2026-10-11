import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Camera,
  MessageSquare,
  Mic,
  QrCode,
  Sparkles,
  ArrowRight,
  Flame,
  Droplets,
  Activity,
  CheckCircle2,
  Brain,
  BarChart2,
  Bell,
  Play,
  Zap,
  Footprints,
  Dumbbell
} from 'lucide-react';

import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#102033] text-[#102033] dark:text-slate-100 font-sans selection:bg-[#078B68] selection:text-white flex flex-col">
      <PublicNavbar />

      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="relative bg-[#F3FCF9] dark:bg-[#102033]/60 pt-10 pb-20 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        
        {/* Abstract Soft Organic Background Blobs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#C2EFE1]/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#E9F8F3]/60 dark:bg-[#078B68]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT HERO CONTENT (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Pill Badge with SnapFit branding */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-[#078B68]/20 shadow-sm text-[#078B68] text-xs font-bold"
              >
                <img
                  src="/snapfit-logo.png"
                  alt="SnapFit Logo"
                  className="h-4 w-auto object-contain"
                />
                <span className="font-extrabold text-[#078B68]">SnapFit</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>Your Personal Health Companion</span>
              </motion.div>

              {/* Large Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-6xl font-black text-[#102033] dark:text-white tracking-tight leading-[1.1]"
              >
                Making{' '}
                <span className="text-[#078B68]">Healthy</span>{' '}
                <span className="text-[#078B68]">Living</span> <br />
                as Easy as Social Media
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-[#102033]/75 dark:text-slate-300 max-w-xl leading-relaxed font-normal"
              >
                Track your meals through photo, chat, voice or barcode and get personalized nutrition insights with AI. Build healthier habits, one meal at a time.
              </motion.p>

              {/* CTA Buttons & Account Prompt */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 pt-2"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    id="welcome-get-started-btn"
                    onClick={() => navigate('/register')}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#078B68] hover:bg-[#056B55] text-white font-bold text-base shadow-lg shadow-[#078B68]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto px-7 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#102033] dark:text-white font-bold text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
                  >
                    <span className="text-[#078B68]">◉</span>
                    <span>See How It Works</span>
                  </a>
                </div>

                {/* Existing account prompt */}
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Already have an account?{' '}
                  <button
                    id="welcome-login-link-btn"
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[#078B68] dark:text-emerald-400 font-bold hover:underline ml-1"
                  >
                    Login
                  </button>
                </p>
              </motion.div>

              {/* HERO STATISTICS GRID */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-8 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-4 gap-2 text-left"
              >
                <div className="pr-4 border-r border-slate-200 dark:border-slate-800">
                  <p className="text-2xl sm:text-3xl font-black text-[#102033] dark:text-white">4+</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Input Modes</p>
                </div>
                <div className="px-4 border-r border-slate-200 dark:border-slate-800">
                  <p className="text-2xl sm:text-3xl font-black text-[#078B68]">AI</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Powered Insights</p>
                </div>
                <div className="px-4 border-r border-slate-200 dark:border-slate-800">
                  <p className="text-2xl sm:text-3xl font-black text-[#102033] dark:text-white">100%</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Personalized</p>
                </div>
                <div className="pl-4">
                  <p className="text-2xl sm:text-3xl font-black text-[#078B68]">Healthier</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">You</p>
                </div>
              </motion.div>

            </div>

            {/* HERO RIGHT VISUAL: MOBILE DASHBOARD MOCKUP & FLOATING CARDS (5 cols) */}
            <div className="lg:col-span-5 relative flex justify-center py-6">

              {/* FLOATING CARD 1: AI HEALTH COACH (TOP LEFT) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 sm:-left-8 z-30 w-64 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-float backdrop-blur-md -rotate-3"
              >
                <div className="flex items-center space-x-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-[#078B68]" />
                  <span className="text-xs font-extrabold text-[#102033] dark:text-white">AI Health Coach</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  "Your protein intake is slightly low today. Try adding eggs, curd or dal in your next meal."
                </p>
                <div className="mt-2 flex justify-end">
                  <span className="w-6 h-6 rounded-full bg-[#E9F8F3] text-[#078B68] flex items-center justify-center text-xs">
                    →
                  </span>
                </div>
              </motion.div>

              {/* FLOATING CARD 2: FOOD ANALYSIS CARD (BOTTOM RIGHT) */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-6 -right-4 sm:-right-8 z-30 w-64 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-float backdrop-blur-md rotate-2"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80"
                    alt="Grilled Chicken Bowl"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-[#E9F8F3] text-[#078B68] text-[9px] font-extrabold block w-max mb-0.5">
                      ✨ AI Analyzing...
                    </span>
                    <h5 className="text-xs font-bold text-[#102033] dark:text-white">Grilled Chicken Bowl</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">~520 kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl text-[10px] font-bold">
                  <div>
                    <span className="text-slate-400 block text-[8px]">PROTEIN</span>
                    <span className="text-[#078B68]">32g</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px]">CARBS</span>
                    <span className="text-sky-500">48g</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[8px]">FATS</span>
                    <span className="text-purple-500">16g</span>
                  </div>
                </div>
              </motion.div>

              {/* SMARTPHONE FRAME MOCKUP */}
              <div className="w-[300px] sm:w-[330px] rounded-[44px] bg-[#102033] p-3 shadow-phone border-4 border-slate-800 relative z-20">
                {/* Phone Inner Screen */}
                <div className="w-full rounded-[36px] bg-white dark:bg-slate-900 p-5 space-y-4 text-left overflow-hidden border border-slate-200/40 dark:border-slate-800">
                  
                  {/* Phone Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/snapfit-logo.png"
                        alt="SnapFit Logo"
                        className="h-7 w-auto object-contain"
                      />
                      <span className="text-sm font-black text-[#102033] dark:text-white">SnapFit</span>
                    </div>
                    <Bell className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Greeting */}
                  <div>
                    <h4 className="text-base font-extrabold text-[#102033] dark:text-white">
                      Hi Everyone 👋
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Let's take care of your health today!
                    </p>
                  </div>

                  {/* Health Score Card */}
                  <div className="p-3.5 rounded-2xl bg-[#E9F8F3] dark:bg-[#078B68]/20 border border-[#078B68]/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#102033] dark:text-white">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>Today's Health Score</span>
                      </span>
                      <span className="text-[#078B68] text-sm font-black">82 / 100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-[#078B68] rounded-full w-[82%]" />
                    </div>
                  </div>

                  {/* 4 Metric Cards Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[9px] text-slate-400 font-bold block">🔥 Calories</span>
                      <span className="text-xs font-extrabold text-[#102033] dark:text-white">1,240 / 2,000</span>
                      <span className="text-[9px] text-slate-400 block">kcal</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[9px] text-slate-400 font-bold block">💪 Protein</span>
                      <span className="text-xs font-extrabold text-[#078B68]">52 / 80 g</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[9px] text-slate-400 font-bold block">💧 Water</span>
                      <span className="text-xs font-extrabold text-sky-500">5 / 8 glasses</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[9px] text-slate-400 font-bold block">👟 Steps</span>
                      <span className="text-xs font-extrabold text-purple-500">4,820</span>
                    </div>
                  </div>

                  {/* Today's Meals */}
                  <div>
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                      Today's Meals
                    </h5>
                    <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <img
                        src="https://images.unsplash.com/photo-1525351484163-7529414344d8?w=100&auto=format&fit=crop&q=80"
                        alt="Oats"
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <h6 className="text-xs font-bold text-[#102033] dark:text-white">Oats with fruits</h6>
                        <span className="text-[10px] text-amber-500 font-bold">Breakfast • 320 kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Bottom Nav Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-[9px] font-bold text-slate-400">
                    <span className="text-[#078B68]">Home</span>
                    <span>Snap</span>
                    <span>Chat</span>
                    <span>Progress</span>
                    <span>Profile</span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURE INTRODUCTION: WHY CHOOSE SNAPFIT (WHITE BACKGROUND)               */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              Why Choose <span className="text-[#078B68]">SnapFit</span>
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
              A smarter, simpler and more engaging way to stay healthy.
            </p>
          </div>

          {/* 5 Horizontally Arranged Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all text-center flex flex-col items-center justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#E9F8F3] text-[#078B68] flex items-center justify-center mb-5 mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white mb-2">
                  Snap Your Food
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload a photo and let AI analyze your meal.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all text-center flex flex-col items-center justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#EAF3FF] text-sky-600 flex items-center justify-center mb-5 mx-auto">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white mb-2">
                  Chat With AI
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Log meals or ask health questions naturally.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all text-center flex flex-col items-center justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#F2ECFF] text-purple-600 flex items-center justify-center mb-5 mx-auto">
                  <Mic className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white mb-2">
                  Log With Voice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Speak your meals, we'll take care of the rest.
                </p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all text-center flex flex-col items-center justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FFF3E5] text-amber-600 flex items-center justify-center mb-5 mx-auto">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white mb-2">
                  Scan Your Food
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get instant info from QR / Barcode.
                </p>
              </div>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              whileHover={{ y: -6 }}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all text-center flex flex-col items-center justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FFECEF] text-rose-500 flex items-center justify-center mb-5 mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white mb-2">
                  Get Guidance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Build healthier habits with AI recommendations.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* HOW SNAPFIT WORKS (VERY LIGHT MINT BACKGROUND)                            */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 bg-[#F3FCF9] dark:bg-[#102033]/40 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              How <span className="text-[#078B68]">SnapFit</span> Works
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">
              From your plate to better health — in 4 simple steps.
            </p>
          </div>

          {/* Horizontal 4-Step Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">

            {/* STEP 1 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#078B68] text-white flex items-center justify-center mx-auto shadow-md">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#102033] dark:text-white">
                  1. Capture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Photo / Chat / Voice / QR
                </p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#078B68] text-white flex items-center justify-center mx-auto shadow-md">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#102033] dark:text-white">
                  2. Analyze
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  AI understands your meal
                </p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-md">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#102033] dark:text-white">
                  3. Understand
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Get calories & nutrition insights
                </p>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Heart className="w-6 h-6 fill-white stroke-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#102033] dark:text-white">
                  4. Improve
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Build healthier daily habits
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CTA BANNER SECTION                                                        */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-[36px] bg-[#078B68] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Background Blob Pattern */}
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#056B55] rounded-full blur-3xl pointer-events-none" />

            {/* LEFT: Logo */}
            <div className="flex items-center space-x-4 shrink-0">
              <div className="w-18 h-18 p-2 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <img
                  src="/snapfit-logo.png"
                  alt="SnapFit Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* CENTER: Text */}
            <div className="space-y-2 text-center md:text-left flex-1 max-w-xl">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Ready to make healthy living easier?
              </h3>
              <p className="text-emerald-100 text-sm sm:text-base font-medium">
                Start your health journey with SnapFit today.
              </p>
            </div>

            {/* RIGHT: Button */}
            <div className="shrink-0">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#078B68] font-black text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 text-[#078B68]" />
              </button>
            </div>

          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
