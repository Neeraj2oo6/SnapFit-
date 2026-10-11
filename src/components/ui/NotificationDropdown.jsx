import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, AlertCircle, Info, Trash2, X } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useHealth();

  if (!isOpen) return null;

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n?.read).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-0 top-14 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {safeNotifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {safeNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No new notifications right now.
            </div>
          ) : (
            safeNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-4 flex items-start space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  !item.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                }`}
              >
                {item.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
                {item.type === 'info' && <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />}

                <div className="flex-1">
                  <p className={`text-xs sm:text-sm ${!item.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                </div>

                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
