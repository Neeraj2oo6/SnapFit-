import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  Crown,
  HelpCircle,
  LogOut,
  Sparkles,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useHealth } from '../../hooks/useHealth';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { UpgradeModal } from '../ui/UpgradeModal';

export const Header = ({ onOpenMobileNav }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const healthCtx = useHealth();
  const notifications = healthCtx?.notifications ?? [];
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => n && !n.read).length;

  // Search suggestions
  const searchSuggestions = [
    { title: 'Grilled Chicken Bowl', category: 'High Protein Meal', type: 'meal' },
    { title: 'Oats with Fruits and Nuts', category: 'Breakfast • 320 kcal', type: 'meal' },
    { title: 'I ate 2 rotis and dal', category: 'Log via Food Chat', type: 'ai' },
    { title: 'Paneer Rice', category: 'High Protein Lunch', type: 'meal' },
  ];

  const safeSuggestions = Array.isArray(searchSuggestions) ? searchSuggestions : [];
  const filteredSuggestions = searchQuery.trim()
    ? safeSuggestions.filter(s => s && s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : safeSuggestions.slice(0, 4);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/meals?search=${encodeURIComponent(searchQuery)}`);
      setSearchFocused(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    if (item.type === 'ai') {
      navigate(`/ai-coach?q=${encodeURIComponent(item.title)}`);
    } else if (item.type === 'barcode') {
      navigate('/barcode');
    } else {
      navigate(`/meals?search=${encodeURIComponent(item.title)}`);
    }
    setSearchFocused(false);
    setSearchQuery('');
  };

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/90 dark:bg-[#14213D]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile trigger & Welcome text */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Header Greeting as specified */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Hi Everyone 👋
            </h1>
          </div>
          <p className="text-xs text-[#087F5B] dark:text-emerald-400 font-semibold hidden sm:block">
            Let's make today a healthy day!
          </p>
        </div>
      </div>

      {/* Center: Search Box */}
      <div ref={searchRef} className="relative hidden md:flex items-center flex-1 max-w-md mx-6 lg:mx-10">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search meals, insights, or ask AI..."
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-transparent focus:border-[#087F5B] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F5B]/20 transition-all"
          />
        </form>

        {/* Search Suggestions Dropdown */}
        {searchFocused && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 px-3 py-1 block">
              Suggestions & Quick Search
            </span>
            <div className="space-y-1 mt-1">
              {filteredSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EFFAF5] dark:hover:bg-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#087F5B] dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-[#087F5B]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#087F5B] ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* User Profile Avatar with Name and Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-[#087F5B]"
            />
            <span className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block">
              {user?.name || "Rahul Sharma"}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#14213D] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  {user?.name || "Rahul Sharma"}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || "rahul.sharma@snapfit.ai"}
                </p>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFFAF5] dark:hover:bg-slate-800 hover:text-[#087F5B] transition-colors text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFFAF5] dark:hover:bg-slate-800 hover:text-[#087F5B] transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    setShowUpgradeModal(true);
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors text-left"
                >
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Upgrade to Pro</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    navigate('/contact');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#EFFAF5] dark:hover:bg-slate-800 hover:text-[#087F5B] transition-colors text-left"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help & Support</span>
                </button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </header>
  );
};
