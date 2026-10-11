import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Camera,
  Bot,
  QrCode,
  UtensilsCrossed,
  User,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const MobileNav = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ONLY the Core Features as instructed:
  // 1. Dashboard
  // 2. Food Camera
  // 3. Food Chat
  // 4. Barcode Scanner
  // 5. Meal History
  // 6. Basic Profile
  const coreNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Camera', icon: Camera, path: '/snap-food' },
    { label: 'Chat', icon: Bot, path: '/ai-coach' },
    { label: 'Barcode', icon: QrCode, path: '/barcode' },
    { label: 'Meals', icon: UtensilsCrossed, path: '/meals' },
    { label: 'Profile', icon: User, path: '/profile' }
  ];

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Fixed Bottom Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14213D]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {coreNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-[#087F5B] dark:text-emerald-400 font-black scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Slide-out Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs bg-white dark:bg-[#14213D] h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <img
                    src="/snapfit-logo.png"
                    alt="SnapFit"
                    className="h-9 w-auto object-contain"
                  />
                  <span className="text-xl font-black text-[#087F5B] dark:text-emerald-400">
                    SnapFit
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation list */}
              <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {coreNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${
                        isActive
                          ? 'bg-[#087F5B] text-white shadow-md shadow-[#087F5B]/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {user?.name || "SnapFit User"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {user?.email || "user@snapfit.ai"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
