import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Bot,
  QrCode,
  UtensilsCrossed,
  User,
  LogOut,
  Sparkles,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useHealth } from '../../hooks/useHealth';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { totals, targets } = useHealth();
  const navigate = useNavigate();

  // ONLY the Core Features as instructed:
  // 1. Dashboard
  // 2. Food Camera
  // 3. Food Chat
  // 4. Barcode Scanner
  // 5. Meal History
  // 6. Basic Profile
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Food Camera', icon: Camera, path: '/snap-food' },
    { label: 'Food Chat', icon: Bot, path: '/ai-coach' },
    { label: 'Barcode Scanner', icon: QrCode, path: '/barcode' },
    { label: 'Meal History', icon: UtensilsCrossed, path: '/meals' },
    { label: 'Profile', icon: User, path: '/profile' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const calConsumed = Number(totals?.calories) || 0;
  const calGoal = Number(targets?.dailyCalories) || 2200;
  const calRemaining = Math.max(0, calGoal - calConsumed);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#14213D] border-r border-slate-200/80 dark:border-slate-800 shrink-0 z-30 select-none">
      {/* Brand Logo */}
      <div className="flex items-center px-6 h-20 border-b border-slate-100 dark:border-slate-800/80">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <img
            src="/snapfit-logo.png"
            alt="SnapFit Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#087F5B] dark:text-emerald-400 tracking-tight leading-none">
              SnapFit
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
              Nutrition Tracker
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#087F5B] text-white shadow-md shadow-[#087F5B]/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-[#EFFAF5] dark:hover:bg-slate-800/60 hover:text-[#087F5B] dark:hover:text-emerald-400'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Live Nutrition Summary Card */}
        <div className="pt-6 space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#EFFAF5] to-emerald-50/50 dark:from-slate-800/80 dark:to-slate-900 border border-[#087F5B]/20 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#087F5B] dark:text-emerald-400">
                Today's Calories
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {calRemaining} left
              </span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {calConsumed}
              </span>
              <span className="text-xs font-bold text-slate-400">/ {calGoal} kcal</span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#087F5B] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((calConsumed / calGoal) * 100))}%` }}
              />
            </div>

            <button
              onClick={() => navigate('/snap-food')}
              className="text-xs font-bold text-[#087F5B] dark:text-emerald-400 hover:underline flex items-center pt-1"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              <span>Scan Food Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 truncate cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-[#087F5B] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#087F5B] transition-colors">
                {user?.name || "SnapFit User"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || "user@snapfit.ai"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
