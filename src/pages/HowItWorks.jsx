import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  Brain,
  BarChart2,
  Heart,
  ArrowRight,
  Sparkles,
  Play,
  Mic,
  QrCode,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    {children}
  </motion.div>
);

const STEPS = [
  {
    step: '01',
    emoji: '📸',
    title: 'Capture',
    subtitle: 'Your Meal',
    desc: 'Snap a photo, send a chat message, record your voice, or scan a barcode. 4 ways to log, zero friction.',
    methods: ['📷 Photo Upload', '💬 Chat Log', '🎙️ Voice Note', '🔍 Barcode Scan'],
    color: 'bg-[#E9F8F3] text-[#078B68]',
    border: 'border-[#078B68]/20',
  },
  {
    step: '02',
    emoji: '🧠',
    title: 'Analyze',
    subtitle: 'With AI',
    desc: 'Our advanced AI models understand your food context — identifying ingredients, estimating portions, and processing everything in under 3 seconds.',
    methods: ['Vision AI model', 'NLP understanding', 'Portion estimation', 'Database matching'],
    color: 'bg-[#EAF3FF] text-sky-600',
    border: 'border-sky-200/40',
  },
  {
    step: '03',
    emoji: '📊',
    title: 'Understand',
    subtitle: 'Your Nutrition',
    desc: 'See a full nutritional breakdown — calories, macros (protein, carbs, fat), fiber, water, and your daily health score.',
    methods: ['Calorie tracking', 'Macro breakdown', 'Micro nutrients', 'Daily health score'],
    color: 'bg-[#F2ECFF] text-purple-600',
    border: 'border-purple-200/40',
  },
  {
    step: '04',
    emoji: '❤️',
    title: 'Improve',
    subtitle: 'Your Health',
    desc: 'Your AI Health Coach identifies gaps, suggests meals, and gives personalized guidance to help you build consistent, healthy habits.',
    methods: ['AI coach advice', 'Meal suggestions', 'Habit tracking', 'Progress insights'],
    color: 'bg-[#FFECEF] text-rose-500',
    border: 'border-rose-200/40',
  },
];

const DETAILS = [
  {
    phase: 'Step 1',
    icon: Camera,
    title: 'Choose How to Log',
    desc: 'SnapFit gives you 4 different ways to log a meal so tracking never feels like a chore.',
    items: [
      { icon: Camera, label: 'Snap a photo', sub: 'AI identifies your food instantly' },
      { icon: MessageSquare, label: 'Chat it in', sub: 'Type naturally like texting a friend' },
      { icon: Mic, label: 'Speak it out', sub: 'Voice-first, hands-free logging' },
      { icon: QrCode, label: 'Scan the barcode', sub: 'Instant packaged food details' },
    ],
    bg: 'bg-[#F3FCF9]',
    border: 'border-[#078B68]/20',
  },
  {
    phase: 'Step 2',
    icon: Brain,
    title: 'AI Does the Heavy Lifting',
    desc: 'After you input your meal, SnapFit\'s AI parses the food, matches ingredients, and computes full nutritional data automatically.',
    items: [
      { icon: Brain, label: 'Multi-model AI', sub: 'Vision + NLP models working together' },
      { icon: CheckCircle2, label: 'High accuracy', sub: '95%+ food identification rate' },
      { icon: BarChart2, label: 'Full nutrition facts', sub: 'Calories, protein, carbs, fats, fiber' },
      { icon: Sparkles, label: 'Smart suggestions', sub: 'Immediate healthier alternatives' },
    ],
    bg: 'bg-[#F0F7FF]',
    border: 'border-sky-200/40',
  },
  {
    phase: 'Step 3',
    icon: BarChart2,
    title: 'See Your Progress Clearly',
    desc: 'SnapFit displays your nutrition in a clean, easy-to-understand dashboard. Track trends, spot gaps, and celebrate wins.',
    items: [
      { icon: BarChart2, label: 'Daily dashboard', sub: 'Clear macro progress rings' },
      { icon: Heart, label: 'Health Score', sub: 'Your daily 0–100 health rating' },
      { icon: ArrowRight, label: 'Weekly trends', sub: 'Spot patterns over 7 and 30 days' },
      { icon: CheckCircle2, label: 'Streak tracking', sub: 'Build consistent healthy habits' },
    ],
    bg: 'bg-[#F7F3FF]',
    border: 'border-purple-200/40',
  },
  {
    phase: 'Step 4',
    icon: Heart,
    title: 'Get Guidance, Build Habits',
    desc: 'Your AI Health Coach reads your data and delivers personalized daily actions to help you continuously improve.',
    items: [
      { icon: Sparkles, label: 'AI Health Coach', sub: 'Personalized daily nudges' },
      { icon: Brain, label: 'Pattern analysis', sub: 'Learns your habits over time' },
      { icon: CheckCircle2, label: 'Meal recommendations', sub: 'AI-curated recipes and meals' },
      { icon: Heart, label: 'Long-term goals', sub: 'Weight, protein, energy and more' },
    ],
    bg: 'bg-[#FFF5F5]',
    border: 'border-rose-200/40',
  },
];

export const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#102033] text-[#102033] dark:text-slate-100 font-sans selection:bg-[#078B68] selection:text-white flex flex-col">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative bg-[#F3FCF9] dark:bg-[#102033]/60 pt-14 pb-20 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#C2EFE1]/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#E9F8F3]/60 dark:bg-[#078B68]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-[#078B68]/20 shadow-sm text-[#078B68] text-xs font-bold"
          >
            <Play className="w-4 h-4" />
            <span>How SnapFit Works</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102033] dark:text-white tracking-tight leading-[1.1]"
          >
            From Your Plate to
            <br />
            <span className="text-[#078B68]">Better Health</span> in 4 Steps
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#102033]/70 dark:text-slate-300 max-w-xl mx-auto leading-relaxed"
          >
            SnapFit's AI workflow is simple, fast, and incredibly powerful. Here's exactly how it transforms your meal into health insights.
          </motion.p>
        </div>
      </section>

      {/* VISUAL 4-STEP SUMMARY */}
      <section className="py-20 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              The SnapFit <span className="text-[#078B68]">Workflow</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Simple, fast, powerful — every single time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-16 left-[calc(12.5%)] w-[75%] h-0.5 bg-gradient-to-r from-[#078B68] via-sky-400 via-purple-400 to-rose-400 z-0 opacity-30" />
            
            {STEPS.map((s, idx) => (
              <FadeIn key={s.title} delay={idx * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className={`relative z-10 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all text-center space-y-4`}
                >
                  {/* Step Number */}
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center mx-auto text-2xl shadow-md`}>
                      {s.emoji}
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#078B68] text-white text-[9px] font-black flex items-center justify-center shadow">
                      {idx + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#102033] dark:text-white">{s.title}</h3>
                    <p className="text-xs font-bold text-slate-400">{s.subtitle}</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{s.desc}</p>
                  <div className="space-y-1">
                    {s.methods.map((m) => (
                      <p key={m} className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">• {m}</p>
                    ))}
                  </div>

                  {/* Arrow to next */}
                  {idx < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow">
                        <ChevronRight className="w-3.5 h-3.5 text-[#078B68]" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED STEP-BY-STEP */}
      <section className="py-20 bg-[#F3FCF9] dark:bg-[#102033]/40 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 mb-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              In <span className="text-[#078B68]">Detail</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">A closer look at each step of the SnapFit AI process.</p>
          </div>

          {DETAILS.map((detail, idx) => (
            <FadeIn key={detail.title} delay={0.05}>
              <div className={`rounded-[32px] ${detail.bg} dark:bg-slate-900 border ${detail.border} dark:border-slate-800 p-8 sm:p-10 shadow-soft`}>
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center`}>
                  <div className={`space-y-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-[#078B68] inline-block">
                      {detail.phase}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#078B68] text-white flex items-center justify-center">
                        <detail.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#102033] dark:text-white">{detail.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{detail.desc}</p>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                    {detail.items.map((item) => (
                      <div
                        key={item.label}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm space-y-2"
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#E9F8F3] flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-[#078B68]" />
                        </div>
                        <p className="text-xs font-extrabold text-[#102033] dark:text-white">{item.label}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#078B68] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#056B55] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2 text-center md:text-left flex-1 max-w-xl relative z-10">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Try It Yourself?
              </h3>
              <p className="text-emerald-100 text-sm font-medium">See how simple healthy eating can be. Start free today.</p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#078B68] font-black text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2 shrink-0 relative z-10"
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
