import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Sparkles, Crown, Shield } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';

export const UpgradeModal = ({ isOpen, onClose }) => {
  const { upgradeToPro, isPro } = useHealth();
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [subscribing, setSubscribing] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setSubscribing(true);
    setTimeout(() => {
      upgradeToPro();
      setSubscribing(false);
      onClose();
    }, 1000);
  };

  const benefits = [
    'Advanced AI Computer Vision with 99.4% accuracy',
    'Personalized meal recommendations & calorie planning',
    'Unlimited AI Health Coach chat and voice queries',
    'Ad-free premium experience with priority sync',
    'Exclusive fitness band discounts & bonus Fit Points',
    'Export nutritional analytics in PDF & CSV format'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
              <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>SnapFit Pro Membership</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Unlock Your Full Health Potential
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Join thousands of health enthusiasts achieving their macro goals with SnapFit Pro.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Plan switcher */}
            <div className="flex items-center justify-center space-x-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-xs mx-auto">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly ($9.99/mo)
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Yearly ($79.99/yr)
                <span className="absolute -top-2 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  SAVE 33%
                </span>
              </button>
            </div>

            {/* Benefits list */}
            <div className="space-y-2.5">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start space-x-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                    {b}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA action */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
              >
                {subscribing ? (
                  <span>Activating Pro Membership...</span>
                ) : isPro ? (
                  <span>You Are Already a Pro Member! ✨</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start 7-Day Free Trial</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Cancel anytime. 7-day trial followed by auto-renewal. 100% money back guarantee.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
