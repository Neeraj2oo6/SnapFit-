import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Clock,
  Edit3,
  UserCheck,
  TrendingDown,
  Camera,
  Brain,
  BarChart2,
  Sliders,
  CheckCircle2,
  Zap,
  Target,
  Smile,
  ShieldCheck,
  ChevronRight,
  Bell
} from 'lucide-react';

import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

export const About = () => {
  const navigate = useNavigate();

  const problemCards = [
    {
      icon: Clock,
      title: 'Busy Lifestyle',
      desc: 'Students and professionals often skip meals or choose unhealthy food because of busy schedules.',
      bg: 'bg-[#FFF3E5]',
      color: 'text-amber-600'
    },
    {
      icon: Edit3,
      title: 'Manual Tracking',
      desc: 'Traditional apps require users to manually enter every meal and calorie line by line.',
      bg: 'bg-[#FFECEF]',
      color: 'text-rose-500'
    },
    {
      icon: UserCheck,
      title: 'Lack of Personalization',
      desc: 'Generic nutrition advice does not always match individual body goals and habits.',
      bg: 'bg-[#EAF3FF]',
      color: 'text-sky-600'
    },
    {
      icon: TrendingDown,
      title: 'Losing Motivation',
      desc: 'Repetitive, boring tracking makes users quit using health applications within weeks.',
      bg: 'bg-[#F2ECFF]',
      color: 'text-purple-600'
    }
  ];

  const differenceCards = [
    {
      icon: Camera,
      title: '4-in-1 Input',
      desc: 'Photo + Chat + Voice + QR/Barcode logging options.',
      color: 'bg-[#E9F8F3] text-[#078B68]'
    },
    {
      icon: Brain,
      title: 'AI Health Coach',
      desc: 'Contextual, personalized nutrition guidance 24/7.',
      color: 'bg-[#EAF3FF] text-sky-600'
    },
    {
      icon: Heart,
      title: 'Daily Health Score',
      desc: 'Understand your overall health progress instantly.',
      color: 'bg-[#FFECEF] text-rose-500'
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      desc: 'AI-powered meal and nutrition recipe suggestions.',
      color: 'bg-[#FFF3E5] text-amber-600'
    },
    {
      icon: Smile,
      title: 'Social-Media-Like Experience',
      desc: 'Make healthy tracking simple, fast, and engaging.',
      color: 'bg-[#F2ECFF] text-purple-600'
    }
  ];

  const roadmapSteps = [
    {
      phase: 'Today',
      title: 'Core AI Food Tracking',
      desc: 'Photo scan, voice logs, barcode scanner, and health dashboard.',
      status: 'Active'
    },
    {
      phase: 'Next',
      title: 'AI Health Coach 2.0',
      desc: 'Deep conversational advice and meal recipe generation.',
      status: 'In Progress'
    },
    {
      phase: 'Future',
      title: 'AR Food Scanner',
      desc: 'Augmented reality instant dish detection and macro overlays.',
      status: 'Upcoming'
    },
    {
      phase: 'Ecosystem',
      title: 'Integrated Health Suite',
      desc: 'Wearables sync + meal planning + social fitness challenges.',
      status: 'Planned'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#102033] text-[#102033] dark:text-slate-100 font-sans selection:bg-[#078B68] selection:text-white flex flex-col">
      <PublicNavbar />

      {/* 1. ABOUT HERO SECTION */}
      <section className="relative bg-[#F3FCF9] dark:bg-[#102033]/60 pt-12 pb-20 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#C2EFE1]/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-[#078B68]/20 shadow-sm text-[#078B68] text-xs font-bold"
              >
                <Sparkles className="w-4 h-4 text-[#078B68]" />
                <span>✨ About SnapFit</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black text-[#102033] dark:text-white tracking-tight leading-none"
              >
                Making <span className="text-[#078B68]">Healthy Living</span> <br />
                Simple, <span className="text-[#078B68]">Smart</span> & Social
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-[#102033]/75 dark:text-slate-300 max-w-xl leading-relaxed"
              >
                SnapFit is an AI-powered health companion designed to make nutrition tracking simple, engaging and effortless.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-2"
              >
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#078B68] hover:bg-[#056B55] text-white font-bold text-base shadow-lg shadow-[#078B68]/20 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-7 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#102033] dark:text-white font-bold text-base shadow-sm hover:bg-slate-50 transition-all text-center"
                >
                  Explore Features
                </a>
              </motion.div>
            </div>

            {/* Right Visual: Mockup + Floating Cards */}
            <div className="lg:col-span-5 relative flex justify-center py-6">
              
              {/* Floating AI Coach Card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 z-30 w-60 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-float -rotate-3"
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#078B68]" />
                  <span className="text-xs font-bold text-[#102033] dark:text-white">AI Health Coach</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  "Great breakfast choices! You've logged 32g protein towards your daily 80g target."
                </p>
              </motion.div>

              {/* Floating Food Card */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-4 z-30 w-56 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-float rotate-2"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-[#E9F8F3] text-[#078B68] flex items-center justify-center font-bold text-sm">
                    🥗
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#102033] dark:text-white">Quinoa Protein Bowl</h5>
                    <span className="text-[10px] text-[#078B68] font-extrabold">~440 kcal logged</span>
                  </div>
                </div>
              </motion.div>

              {/* Smartphone Frame Mockup */}
              <div className="w-[280px] sm:w-[310px] rounded-[40px] bg-[#102033] p-3 shadow-phone border-4 border-slate-800 relative z-20">
                <div className="w-full rounded-[32px] bg-white dark:bg-slate-900 p-4 space-y-3.5 text-left overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Heart className="w-4 h-4 text-[#078B68] fill-[#078B68]" />
                      <span className="text-xs font-black text-[#102033] dark:text-white">SnapFit</span>
                    </div>
                    <Bell className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  {/* Health Score Card */}
                  <div className="p-3 rounded-2xl bg-[#E9F8F3] border border-[#078B68]/20 text-center space-y-1">
                    <span className="text-[10px] font-bold text-[#102033] block">❤️ Today's Health Score</span>
                    <span className="text-2xl font-black text-[#078B68]">88 / 100</span>
                    <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
                      <div className="h-full bg-[#078B68] rounded-full w-[88%]" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-bold space-y-1">
                    <span className="text-slate-400 block">DAILY PROGRESS</span>
                    <div className="flex justify-between text-[#102033] dark:text-white">
                      <span>Calories: 1,420 kcal</span>
                      <span className="text-[#078B68]">Protein: 68g</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. OUR MISSION */}
      <section className="py-20 bg-white dark:bg-[#102033]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              Our <span className="text-[#078B68]">Mission</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
              Our mission is to make healthy living as easy as using social media. SnapFit removes the boring and repetitive process of manual food tracking and uses AI to make nutrition awareness simple.
            </p>
          </div>

          {/* Large Mission Quote Card */}
          <div className="p-8 sm:p-12 rounded-[32px] bg-[#F3FCF9] dark:bg-[#102033]/80 border border-[#078B68]/20 shadow-soft text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#078B68] text-white flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-7 h-7 fill-white stroke-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#102033] dark:text-white">
              Health should be simple.
            </h3>
            <p className="text-base sm:text-lg text-[#078B68] font-bold max-w-xl mx-auto">
              “Technology should help people build better habits, not make them harder.”
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM WE SOLVE ("WHY SNAPFIT?") */}
      <section className="py-20 bg-[#F3FCF9] dark:bg-[#102033]/40 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              Why <span className="text-[#078B68]">SnapFit?</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Traditional nutrition tracking can be time-consuming and difficult to maintain.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all space-y-4 text-left"
              >
                <div className={`w-12 h-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#102033] dark:text-white">{card.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OUR SOLUTION */}
      <section className="py-24 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              One Snap. <span className="text-[#078B68]">Smarter Health.</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A 4-step effortless workflow from plate to peak wellness.
            </p>
          </div>

          {/* 4-Step Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/20 shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#078B68] text-white flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#102033] dark:text-white">📸 Capture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload a photo, speak, chat or scan a barcode.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/20 shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#078B68] text-white flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#102033] dark:text-white">🧠 AI Analyze</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI identifies your food and nutrition instantly.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/20 shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#102033] dark:text-white">📊 Understand</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">See calories, protein, carbs and fats clearly.</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/20 shadow-soft text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 fill-white stroke-white" />
              </div>
              <h3 className="text-base font-extrabold text-[#102033] dark:text-white">❤️ Improve</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Get personalized daily habit recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT MAKES SNAPFIT DIFFERENT */}
      <section id="features" className="py-20 bg-[#F3FCF9] dark:bg-[#102033]/40 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              What Makes <span className="text-[#078B68]">SnapFit Different</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Designed from scratch for speed, engagement, and deep health insight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {differenceCards.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -5 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft text-center space-y-3"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mx-auto`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OUR VISION (LARGE EMERALD GREEN SECTION) */}
      <section className="py-20 bg-[#078B68] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8 relative z-10">
          <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            The Future of Health AI
          </span>

          <h2 className="text-3xl sm:text-5xl font-black">Our Vision</h2>

          <p className="text-base sm:text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed font-medium">
            “We envision a future where AI becomes an everyday health companion that helps people understand their food, build healthier habits and make better decisions effortlessly.”
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <span className="px-4 py-2 rounded-full bg-white/15 text-xs font-extrabold backdrop-blur-md border border-white/20">
              ✨ AI Powered
            </span>
            <span className="px-4 py-2 rounded-full bg-white/15 text-xs font-extrabold backdrop-blur-md border border-white/20">
              🎯 Personalized
            </span>
            <span className="px-4 py-2 rounded-full bg-white/15 text-xs font-extrabold backdrop-blur-md border border-white/20">
              🌱 Healthy Habits
            </span>
          </div>
        </div>
      </section>

      {/* 7. FUTURE VISION ROADMAP */}
      <section className="py-24 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              Product <span className="text-[#078B68]">Roadmap</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Our journey towards building the ultimate AI health ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {roadmapSteps.map((step, index) => (
              <div key={step.phase} className="p-6 rounded-3xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/20 shadow-soft text-left space-y-3 relative">
                <span className="px-3 py-1 rounded-full bg-[#078B68] text-white text-[10px] font-black uppercase">
                  {step.phase}
                </span>
                <h3 className="text-base font-extrabold text-[#102033] dark:text-white pt-1">{step.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                <span className="text-[10px] font-bold text-[#078B68] block">Status: {step.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. ABOUT CTA */}
      <section className="py-16 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#078B68] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left flex-1 max-w-xl">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Ready to Build Healthier Habits?
              </h3>
              <p className="text-emerald-100 text-sm sm:text-base font-medium">
                Start your journey with SnapFit today.
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#078B68] font-black text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 text-[#078B68]" />
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
