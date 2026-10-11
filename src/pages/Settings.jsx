import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Globe,
  Ruler,
  User,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';

export const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showToast } = useHealth();

  // Notification toggles
  const [proteinAlerts, setProteinAlerts] = useState(true);
  const [waterAlerts, setWaterAlerts] = useState(true);
  const [streakWarnings, setStreakWarnings] = useState(true);

  // Units, Language, Privacy
  const [units, setUnits] = useState('Metric (kg, cm, ml)');
  const [language, setLanguage] = useState('English (US)');
  const [aiDataConsent, setAiDataConsent] = useState(true);

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveSettings = () => {
    showToast('Preferences and settings saved successfully!', 'success');
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-[#EFFAF5] dark:bg-slate-800 text-[#087F5B] flex items-center justify-center shadow-sm">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Settings & Preferences
          </h2>
          <p className="text-xs text-slate-400">
            Manage your account security, notification alerts, appearance theme, measurement units, and language.
          </p>
        </div>
      </div>

      {/* 1. Account Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Account Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-bold uppercase mb-1">Account Holder</span>
            <p className="font-black text-sm text-slate-900 dark:text-white">{user?.name || 'Rahul Sharma'}</p>
          </div>
          <div>
            <span className="text-slate-400 block font-bold uppercase mb-1">Primary Email</span>
            <p className="font-black text-sm text-slate-900 dark:text-white">{user?.email || 'rahul.sharma@snapfit.ai'}</p>
          </div>
        </div>
      </div>

      {/* 2. Appearance Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sun className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Appearance
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Interface Theme</h4>
            <p className="text-xs text-slate-400 mt-0.5">Toggle between crisp Light Mode and sleek Dark Navy Mode</p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-black text-slate-900 dark:text-white flex items-center space-x-2 transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Dark Mode (Active)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span>Light Mode (Active)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Notifications Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Bell className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Notifications
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Protein Goal Alerts</h4>
              <p className="text-[11px] text-slate-400">Receive smart nudges when your evening protein is deficient</p>
            </div>
            <input
              type="checkbox"
              checked={proteinAlerts}
              onChange={(e) => setProteinAlerts(e.target.checked)}
              className="w-5 h-5 accent-[#087F5B] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hydration Reminders</h4>
              <p className="text-[11px] text-slate-400">Periodic glass reminders during the afternoon</p>
            </div>
            <input
              type="checkbox"
              checked={waterAlerts}
              onChange={(e) => setWaterAlerts(e.target.checked)}
              className="w-5 h-5 accent-[#087F5B] rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Healthy Streak Warnings</h4>
              <p className="text-[11px] text-slate-400">Alerts if you haven't logged dinner before 10:00 PM</p>
            </div>
            <input
              type="checkbox"
              checked={streakWarnings}
              onChange={(e) => setStreakWarnings(e.target.checked)}
              className="w-5 h-5 accent-[#087F5B] rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Units & Language Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Ruler className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Units & Language
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Measurement Units
            </label>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="Metric (kg, cm, ml)">Metric (kg, cm, ml)</option>
              <option value="Imperial (lbs, in, fl oz)">Imperial (lbs, in, fl oz)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Display Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="English (US)">English (US)</option>
              <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
              <option value="Spanish (Español)">Spanish (Español)</option>
              <option value="French (Français)">French (Français)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Privacy Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Shield className="w-5 h-5 text-[#087F5B]" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Privacy & AI Security
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Anonymized Food Image Training
            </h4>
            <p className="text-[11px] text-slate-400">Help improve meal recognition model accuracy</p>
          </div>
          <input
            type="checkbox"
            checked={aiDataConsent}
            onChange={(e) => setAiDataConsent(e.target.checked)}
            className="w-5 h-5 accent-[#087F5B] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons: Save Preferences & Logout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-xs shadow-md transition-all"
        >
          Save Preferences
        </button>

        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 font-bold text-xs transition-colors flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Are you sure you want to sign out?
            </h4>
            <p className="text-xs text-slate-400">
              Your logged meals and Fit Points will remain safely saved in your browser storage.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
