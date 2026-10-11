import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export const PublicNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#102033]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LEFT: Official SnapFit Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/snapfit-logo.png"
            alt="SnapFit Logo"
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#087F5B] dark:text-emerald-400 tracking-tight leading-none">
              SnapFit
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
              AI Health Companion
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`relative py-1 transition-colors ${
                  active
                    ? 'text-[#078B68] font-bold'
                    : 'text-[#102033]/70 dark:text-slate-300 hover:text-[#078B68] dark:hover:text-[#078B68]'
                }`}
              >
                {item.name}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#078B68] rounded-full transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: CTAs & Theme Switcher */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-full bg-[#078B68] hover:bg-[#056B55] text-white text-sm font-bold shadow-md shadow-[#078B68]/20 transition-all flex items-center space-x-2"
            >
              <span>Go to App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-[#102033] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold transition-all"
              >
                Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#102033] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#102033] border-b border-slate-100 dark:border-slate-800 px-4 pt-2 pb-6 space-y-1 shadow-xl">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#078B68]'
                    : 'text-[#102033] dark:text-white hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-[#078B68]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          <div className="pt-4 flex flex-col space-y-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full py-3 rounded-full bg-[#078B68] text-white text-center font-bold text-sm shadow-md"
              >
                Go to App →
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-3 rounded-full border border-slate-200 dark:border-slate-700 text-center font-bold text-sm text-[#102033] dark:text-white"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
