import React from 'react';
import { Flame, Trophy, Award, Zap, Star, ShieldCheck } from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import { AchievementBadge } from '../components/features/AchievementBadge';

export const Achievements = () => {
  const { streakDays, xpPoints, level } = useHealth();

  const badges = [
    {
      id: 'b1',
      title: '5-Day Streak Hero',
      description: 'Logged all 3 main meals for 5 consecutive days without skipping.',
      xp: 200,
      unlocked: true,
      category: 'Consistency'
    },
    {
      id: 'b2',
      title: 'Protein Pro',
      description: 'Hit 100% of your daily protein target (160g) 3 times this week.',
      xp: 350,
      unlocked: true,
      category: 'Nutrition'
    },
    {
      id: 'b3',
      title: 'Hydration Hero',
      description: 'Logged 3.0 Liters of water 4 days in a row.',
      xp: 150,
      unlocked: true,
      category: 'Hydration'
    },
    {
      id: 'b4',
      title: 'AI Scanner Pioneer',
      description: 'Scanned 10 food photos using the Vision AI engine.',
      xp: 250,
      unlocked: true,
      category: 'AI Features'
    },
    {
      id: 'b5',
      title: '7-Day Champion Streak',
      description: 'Reach a full 7-day healthy streak.',
      xp: 500,
      unlocked: false,
      category: 'Streak'
    },
    {
      id: 'b6',
      title: 'Macro Perfectionist',
      description: 'Achieve a 95+ Health Score in a single day.',
      xp: 400,
      unlocked: false,
      category: 'Mastery'
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Gamification Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <Trophy className="w-4 h-4" />
              <span>Level {level} Healthy Lifestyle Master</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black">
              {streakDays} Day Healthy Streak 🔥
            </h2>
            <p className="text-slate-300 text-sm max-w-md">
              Keep logging meals and completing hydration goals to earn XP and level up your status.
            </p>

            {/* Level XP Progress Bar */}
            <div className="w-full max-w-md space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400">{xpPoints} XP Total</span>
                <span className="text-slate-400">Next Level: 2000 XP</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full w-3/4 transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* Level Trophy Icon */}
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-emerald-500 to-green-400 p-1 shadow-2xl shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-slate-900 flex flex-col items-center justify-center">
              <Trophy className="w-12 h-12 text-emerald-400 mb-1" />
              <span className="text-xs font-black text-white">LVL {level}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
          Achievement Badges ({badges.filter(b => b.unlocked).length} / {badges.length} Unlocked)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <AchievementBadge key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
};
