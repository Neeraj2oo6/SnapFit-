import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Instagram, Linkedin, Twitter, Github, ArrowRight, Send } from 'lucide-react';

export const PublicFooter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-white dark:bg-[#102033] border-t border-slate-100 dark:border-slate-800 text-[#102033] dark:text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col (spans 2) */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center space-x-3 w-fit">
              <img
                src="/snapfit-logo.png"
                alt="SnapFit Logo"
                className="h-10 w-auto object-contain"
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
            <p className="text-sm font-semibold text-[#078B68]">
              Your AI Health Companion
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Making Healthy Living as Easy as Social Media. Track meals through photo, voice, chat or barcode — powered by AI.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-xs font-bold text-[#102033] dark:text-white mb-2">
                Stay Updated
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Subscribe for health tips & updates.
              </p>
              {subscribed ? (
                <div className="px-4 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[#078B68] text-xs font-bold border border-[#078B68]/20">
                  ✅ Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 min-w-0 px-4 py-2.5 text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#102033] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#078B68]/40"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-full bg-[#078B68] hover:bg-[#056B55] text-white shadow-md transition-all shrink-0"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-2.5">
              <a href="#" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#078B68] hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#078B68] hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#078B68] hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#078B68] hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#102033] dark:text-white mb-5">
              Company
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li><Link to="/" className="hover:text-[#078B68] transition-colors">Home</Link></li>
              <li><Link to="/features" className="hover:text-[#078B68] transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#078B68] transition-colors">How It Works</Link></li>
              <li><Link to="/about" className="hover:text-[#078B68] transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-[#078B68] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#102033] dark:text-white mb-5">
              Product
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li><Link to="/features" className="hover:text-[#078B68] transition-colors">Food Scanner</Link></li>
              <li><Link to="/features" className="hover:text-[#078B68] transition-colors">AI Coach</Link></li>
              <li><Link to="/features" className="hover:text-[#078B68] transition-colors">Voice Logging</Link></li>
              <li><Link to="/features" className="hover:text-[#078B68] transition-colors">Barcode Scanner</Link></li>
              <li><Link to="/features" className="hover:text-[#078B68] transition-colors">Health Analytics</Link></li>
            </ul>
          </div>

          {/* Support Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#102033] dark:text-white mb-5">
              Support
            </h4>
            <ul className="space-y-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <li><Link to="/contact" className="hover:text-[#078B68] transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-[#078B68] transition-colors">FAQs</Link></li>
              <li><a href="#" className="hover:text-[#078B68] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#078B68] transition-colors">Terms of Use</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 SnapFit. All rights reserved. Made with ❤️ for healthier lives.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0 font-medium">
            <a href="#" className="hover:text-[#078B68] transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#078B68] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
