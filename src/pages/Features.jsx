import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  MessageSquare,
  Mic,
  QrCode,
  Heart,
  Brain,
  BarChart2,
  Sparkles,
  Smile,
  Zap,
  ArrowRight,
  CheckCircle2,
  Shield,
  Activity,
  TrendingUp,
} from 'lucide-react';

import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

const MAIN_FEATURES = [
  {
    icon: Camera,
    title: 'Snap Your Food',
    tagline: 'AI Photo Recognition',
    desc: 'Upload a photo of your meal and our AI instantly identifies ingredients, estimates portions, and calculates full nutritional breakdown — calories, protein, carbs, fats, and fiber.',
    badge: '📸 Snap',
    color: 'bg-[#E9F8F3] text-[#078B68]',
    borderColor: 'border-[#078B68]/20',
    bgCard: 'bg-[#F3FCF9]',
    perks: ['Instant meal recognition', 'Multi-ingredient detection', 'Portion size estimation', 'Auto nutrition log']
  },
  {
    icon: MessageSquare,
    title: 'Chat With AI',
    tagline: 'Natural Language Logging',
    desc: 'Type naturally to log meals or ask health questions. Say "I had two rotis with dal and sabzi for lunch" and SnapFit logs it all accurately. Ask anything about your nutrition.',
    badge: '💬 Chat',
    color: 'bg-[#EAF3FF] text-sky-600',
    borderColor: 'border-sky-200/40',
    bgCard: 'bg-[#F0F7FF]',
    perks: ['Conversational logging', 'Health Q&A', 'Meal suggestions', 'Smart understanding']
  },
  {
    icon: Mic,
    title: 'Log With Voice',
    tagline: 'Speak Your Meals',
    desc: 'Hands-free meal tracking at its best. Speak your meals naturally and SnapFit\'s voice AI parses ingredients, portions, and nutritional data automatically.',
    badge: '🎙️ Voice',
    color: 'bg-[#F2ECFF] text-purple-600',
    borderColor: 'border-purple-200/40',
    bgCard: 'bg-[#F7F3FF]',
    perks: ['Hands-free logging', 'Real-time transcription', 'Natural speech support', 'Instant nutrition parse']
  },
  {
    icon: QrCode,
    title: 'Scan Your Food',
    tagline: 'Barcode & QR Scanner',
    desc: 'Instantly scan any packaged food\'s barcode or QR code to pull complete nutrition facts from our global food database. No manual entry needed.',
    badge: '📦 Scan',
    color: 'bg-[#FFF3E5] text-amber-600',
    borderColor: 'border-amber-200/40',
    bgCard: 'bg-[#FFFBF0]',
    perks: ['Barcode scanning', 'QR code support', 'Global food database', 'Instant results']
  },
  {
    icon: Brain,
    title: 'AI Health Coach',
    tagline: 'Personalized Guidance',
    desc: 'Get daily personalized nutrition advice from your AI Health Coach. It analyzes your eating patterns, goals, and health data to deliver contextual recommendations.',
    badge: '🧠 Coach',
    color: 'bg-[#FFECEF] text-rose-500',
    borderColor: 'border-rose-200/40',
    bgCard: 'bg-[#FFF5F5]',
    perks: ['Daily personalized tips', '24/7 AI coach', 'Goal-based guidance', 'Pattern analysis']
  },
];

const ADDITIONAL_FEATURES = [
  { icon: Heart, title: 'Daily Health Score', desc: 'Get a comprehensive score out of 100 each day based on calories, protein, water, and activity.', bg: 'bg-[#FFECEF] text-rose-500' },
  { icon: BarChart2, title: 'Health Analytics', desc: 'Deep weekly and monthly nutrition trends with beautiful, interactive charts.', bg: 'bg-[#EAF3FF] text-sky-600' },
  { icon: Sparkles, title: 'Smart Recommendations', desc: 'AI-powered meal suggestions tailored to your goals and preferences.', bg: 'bg-[#E9F8F3] text-[#078B68]' },
  { icon: Smile, title: 'Gamification', desc: 'Earn badges and streaks for consistent healthy habits. Make health fun.', bg: 'bg-[#F2ECFF] text-purple-600' },
  { icon: Shield, title: 'Privacy First', desc: 'Your health data is encrypted and never shared without your consent.', bg: 'bg-[#FFF3E5] text-amber-600' },
  { icon: Activity, title: 'Water Tracker', desc: 'Track your daily water intake and stay hydrated with gentle reminders.', bg: 'bg-[#EAF3FF] text-cyan-600' },
  { icon: TrendingUp, title: 'Macro Insights', desc: 'Understand your protein, carbs, and fat balance with real-time breakdowns.', bg: 'bg-[#E9F8F3] text-emerald-600' },
  { icon: Zap, title: 'Instant Results', desc: 'Every scan, snap, or voice note gives you nutrition facts in under 3 seconds.', bg: 'bg-[#FFF3E5] text-orange-500' },
];

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

export const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#102033] text-[#102033] dark:text-slate-100 font-sans selection:bg-[#078B68] selection:text-white flex flex-col">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative bg-[#F3FCF9] dark:bg-[#102033]/60 pt-14 pb-20 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#C2EFE1]/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E9F8F3]/60 dark:bg-[#078B68]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-[#078B68]/20 shadow-sm text-[#078B68] text-xs font-bold"
          >
            <Sparkles className="w-4 h-4" />
            <span>SnapFit Features</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102033] dark:text-white tracking-tight leading-[1.1]"
          >
            Everything You Need for a
            <br />
            <span className="text-[#078B68]">Healthier Life</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#102033]/70 dark:text-slate-300 max-w-xl mx-auto leading-relaxed"
          >
            4 unique ways to track meals + AI coaching + analytics. SnapFit puts your entire health journey in one place.
          </motion.p>
        </div>
      </section>

      {/* MAIN FEATURES */}
      <section className="py-20 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              4-in-1 <span className="text-[#078B68]">Input Modes</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Track your meals your way — snap, chat, speak, or scan.
            </p>
          </div>

          <div className="space-y-8">
            {MAIN_FEATURES.map((feature, idx) => (
              <FadeIn key={feature.title} delay={idx * 0.05}>
                <div className={`rounded-[32px] ${feature.bgCard} dark:bg-slate-900 border ${feature.borderColor} dark:border-slate-800 p-8 sm:p-10 shadow-soft hover:shadow-soft-hover transition-shadow`}>
                  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    <div className={`space-y-5 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-extrabold border border-slate-200 dark:border-slate-700 inline-block">
                        {feature.badge}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center`}>
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-extrabold text-[#102033] dark:text-white">{feature.title}</h3>
                          <p className="text-xs font-bold text-slate-400">{feature.tagline}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{feature.desc}</p>
                      <ul className="space-y-2">
                        {feature.perks.map((perk) => (
                          <li key={perk} className="flex items-center space-x-2 text-sm font-medium text-[#102033] dark:text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#078B68] shrink-0" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`flex justify-center ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <div className="w-48 h-48 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-md flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-2xl ${feature.color} flex items-center justify-center`}>
                          <feature.icon className="w-12 h-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ADDITIONAL FEATURES */}
      <section className="py-20 bg-[#F3FCF9] dark:bg-[#102033]/40 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              And So Much <span className="text-[#078B68]">More</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">A complete health ecosystem, not just a tracker.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADDITIONAL_FEATURES.map((f, idx) => (
              <FadeIn key={f.title} delay={idx * 0.04}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover transition-all space-y-4"
                >
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#102033] dark:text-white">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#078B68] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#056B55] rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2 text-center md:text-left flex-1 max-w-xl relative z-10">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Experience All Features?
              </h3>
              <p className="text-emerald-100 text-sm font-medium">Start your personalized health journey today.</p>
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
