import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  Gift,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  ShoppingBag,
  Clock,
  Copy,
  Check,
  X
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';

export const Rewards = () => {
  const { fitPoints, streakDays, redeemReward, redeemedRewards, showToast } = useHealth();
  const [activeVoucherModal, setActiveVoucherModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Achievements as specified in prompt
  const achievements = [
    {
      id: 'a1',
      title: '7 Day Streak',
      desc: 'Maintain healthy eating and logging for 7 days in a row.',
      progress: '5 / 7 Days',
      pct: 71,
      completed: false,
      pts: 200,
      icon: '🔥'
    },
    {
      id: 'a2',
      title: 'Protein Pro',
      desc: 'Hit your daily protein target 5 times in a single week.',
      progress: 'Completed',
      pct: 100,
      completed: true,
      pts: 150,
      icon: '💪'
    },
    {
      id: 'a3',
      title: 'Hydration Hero',
      desc: 'Drink 8+ glasses of water 4 days in a row.',
      progress: 'Completed',
      pct: 100,
      completed: true,
      pts: 120,
      icon: '💧'
    },
    {
      id: 'a4',
      title: 'Healthy Breakfast',
      desc: 'Log a nutritious breakfast before 9:00 AM for 5 days.',
      progress: 'Completed',
      pct: 100,
      completed: true,
      pts: 100,
      icon: '☀️'
    },
    {
      id: 'a5',
      title: 'Consistency Champion',
      desc: 'Log all main meals for 14 consecutive days.',
      progress: '8 / 14 Days',
      pct: 57,
      completed: false,
      pts: 300,
      icon: '🏆'
    }
  ];

  // Rewards Store as specified in prompt
  const storeItems = [
    {
      id: 'snack-voucher',
      title: 'Healthy Snack Voucher',
      points: 500,
      desc: 'Get $10 OFF organic snack bowls, nuts & superfood bars at WholeFoods/Instacart.',
      image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500&auto=format&fit=crop&q=80',
      badge: 'Bestseller'
    },
    {
      id: 'protein-bottle',
      title: 'Protein Shake Bottle',
      points: 800,
      desc: 'Premium stainless steel SnapFit thermal shaker with mixing whisk ball.',
      image: 'https://images.unsplash.com/photo-1593095940087-05ccb2be667f?w=500&auto=format&fit=crop&q=80',
      badge: 'Merchandise'
    },
    {
      id: 'fitness-band',
      title: 'Fitness Band Discount',
      points: 1200,
      desc: 'Exclusive 25% discount voucher on Fitbit, Apple Watch & Whoop bands.',
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80',
      badge: 'Special Offer'
    },
    {
      id: 'wellness-voucher',
      title: 'Wellness Voucher',
      points: 1500,
      desc: '$50 spa, yoga studio, or sports massage pass valid at certified centers.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80',
      badge: 'Premium VIP'
    }
  ];

  const handleRedeem = async (item) => {
    try {
      const token = localStorage.getItem('snapfit_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post('http://localhost:5000/api/rewards/redeem', { rewardId: 1 }, { headers });
    } catch (e) {
      console.warn('Backend reward redeem notice:', e.message);
    }
    const code = redeemReward(item);
    if (code) {
      setActiveVoucherModal({ ...item, voucherCode: code });
    }
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Voucher code copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner: Fit Points & 5 Day Streak */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#087F5B] via-[#056B4A] to-[#14213D] text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-emerald-100">
              <Trophy className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Gamification & Store</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              SnapFit Rewards Store
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg">
              Earn Fit Points with every meal logged, water glass tracked, and daily streak maintained. Redeem real rewards anytime!
            </p>
          </div>

          {/* Fit Points & Streak Showcase Card */}
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shrink-0">
            <div className="text-center px-3 border-r border-white/20">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200 block">
                FIT POINTS
              </span>
              <p className="text-3xl font-black text-white mt-0.5">
                {fitPoints}
              </p>
            </div>

            <div className="text-center px-3">
              <div className="flex items-center justify-center space-x-1 text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400 animate-bounce" />
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-300">
                  STREAK
                </span>
              </div>
              <p className="text-xl font-black text-white mt-0.5">
                🔥 {streakDays} Day Streak
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Store Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <Gift className="w-5 h-5 text-[#087F5B]" />
              <span>Rewards Store</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Redeem your accumulated Fit Points for discounts, gear, and wellness vouchers
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Available Points: <strong className="text-[#087F5B]">{fitPoints} pts</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {storeItems.map((item) => {
            const canAfford = fitPoints >= item.points;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Item Image */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">Cost</span>
                    <span className="text-base font-black text-[#087F5B] dark:text-emerald-400">
                      {item.points} pts
                    </span>
                  </div>

                  {/* Redeem Button */}
                  <button
                    type="button"
                    onClick={() => handleRedeem(item)}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 ${
                      canAfford
                        ? 'bg-[#087F5B] hover:bg-[#056B4A] text-white shadow-md shadow-[#087F5B]/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{canAfford ? 'Redeem Voucher' : `Need ${item.points - fitPoints} more pts`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Section as specified in prompt */}
      <div className="space-y-4 pt-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Achievements</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete healthy lifestyle streaks to unlock badges and bonus points
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all space-y-3 ${
                ach.completed
                  ? 'bg-white dark:bg-[#14213D] border-[#087F5B]/30 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFFAF5] dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {ach.title}
                    </h4>
                    <span className="text-[10px] font-bold text-[#087F5B] dark:text-emerald-400">
                      +{ach.pts} Fit Points
                    </span>
                  </div>
                </div>

                {ach.completed ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#087F5B] dark:text-emerald-400 text-[10px] font-black flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>In Progress</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {ach.desc}
              </p>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Progress</span>
                  <span>{ach.progress}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-[#087F5B] rounded-full transition-all duration-500"
                    style={{ width: `${ach.pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeemed Rewards History List */}
      {Array.isArray(redeemedRewards) && redeemedRewards.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="text-base font-black text-slate-900 dark:text-white">
            Your Active Redeemed Vouchers ({redeemedRewards.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {redeemedRewards.map((v, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#EFFAF5] dark:bg-slate-800/80 border border-[#087F5B]/20 flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-black text-slate-900 dark:text-white">{v.title}</h5>
                  <p className="text-[11px] font-mono font-bold text-[#087F5B] mt-0.5">{v.voucherCode}</p>
                  <span className="text-[9px] text-slate-400">Redeemed on {v.redeemedAt}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyVoucherCode(v.voucherCode)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#087F5B] text-xs font-bold shadow-sm"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voucher Code Celebration Modal */}
      {activeVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-[#EFFAF5] dark:bg-emerald-950/60 text-[#087F5B] flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Reward Redeemed Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You redeemed <strong>{activeVoucherModal.title}</strong> for {activeVoucherModal.points} points.
              </p>
            </div>

            {/* Voucher Code Card */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-[#087F5B]/50 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Your Voucher Coupon Code
              </span>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg font-black font-mono text-[#087F5B] tracking-wider">
                  {activeVoucherModal.voucherCode}
                </span>
                <button
                  onClick={() => copyVoucherCode(activeVoucherModal.voucherCode)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#087F5B]"
                  title="Copy"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveVoucherModal(null)}
              className="w-full py-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-extrabold text-xs shadow-md transition-all"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
