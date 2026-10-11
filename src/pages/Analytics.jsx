import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Award, Flame, Droplets, Calendar, Sparkles } from 'lucide-react';
import { WEEKLY_ANALYTICS } from '../data/mockNutrition';
import { StatCard } from '../components/ui/StatCard';

export const Analytics = () => {
  const [rangeToggle, setRangeToggle] = useState('Weekly');

  const macroPieData = [
    { name: 'Protein', value: 160, color: '#10b981' },
    { name: 'Carbs', value: 220, color: '#0ea5e9' },
    { name: 'Fat', value: 70, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Nutrition Analytics & Trends
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deep dive into weekly macronutrient intake, hydration levels, and health score progression.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {['Weekly', 'Monthly', 'Yearly'].map((mode) => (
            <button
              key={mode}
              onClick={() => setRangeToggle(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                rangeToggle === mode
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Week Over Week Insights Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/30 flex items-center space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            This week your protein intake improved by 18%! 🚀
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            You've consistently hit over 140g of protein 5 days out of 7. Hydration goal completed 86% on average.
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Calorie Intake Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Weekly Calorie Intake vs Target
            </h3>
            <span className="text-xs text-amber-500 font-bold">Target: 2200 kcal</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="calories" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Score Progression Line Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daily Health Score Trend
            </h3>
            <span className="text-xs text-emerald-500 font-bold">Avg: 87 / 100</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macro Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Ideal Macronutrient Split
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs font-bold pt-2">
            <span className="text-emerald-500">Protein (30%)</span>
            <span className="text-sky-500">Carbs (45%)</span>
            <span className="text-violet-500">Fat (25%)</span>
          </div>
        </div>

        {/* Water Intake Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Water Hydration (Liters)
            </h3>
            <span className="text-xs text-cyan-500 font-bold">Goal: 3.0L</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="water" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
