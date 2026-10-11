import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Handshake,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Heart,
  AlertCircle,
} from 'lucide-react';

import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';

// --------------------------------------------------------------------------
// FAQ DATA
// --------------------------------------------------------------------------
const FAQ_LIST = [
  {
    q: 'What is SnapFit?',
    a: 'SnapFit is an AI-powered health and nutrition companion that helps you track your meals through photo, chat, voice, or barcode scanning. It gives you personalized nutrition insights and helps you build healthier daily habits.'
  },
  {
    q: 'How does AI food recognition work?',
    a: 'Our AI uses advanced computer vision and natural language processing. When you snap a photo of your meal, the AI identifies ingredients, estimates portion sizes, and calculates calories, protein, carbs, and fats automatically — all in seconds.'
  },
  {
    q: 'Can I scan packaged food?',
    a: 'Yes! SnapFit has a built-in barcode scanner. Simply scan any packaged food\'s QR code or barcode and instantly get its full nutritional information pulled from our food database.'
  },
  {
    q: 'Can I log meals using my voice?',
    a: 'Absolutely. SnapFit\'s voice logging lets you speak naturally — say something like "I had a bowl of oats with banana for breakfast" and SnapFit will automatically parse and log the meal with estimated nutrition.'
  },
  {
    q: 'Is SnapFit personalized?',
    a: 'Yes! SnapFit builds a personalized health profile based on your age, weight, height, activity level, and dietary goals. Every recommendation, suggestion, and AI coach response is tailored specifically to your health journey.'
  }
];

// --------------------------------------------------------------------------
// FAQ ACCORDION ITEM
// --------------------------------------------------------------------------
const FAQItem = ({ item, isOpen, onToggle }) => (
  <div
    className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-soft hover:shadow-soft-hover transition-shadow"
  >
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
    >
      <span className="text-sm font-bold text-[#102033] dark:text-white pr-4">{item.q}</span>
      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#078B68] transition-transform">
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium border-t border-slate-100 dark:border-slate-800 pt-4">
            {item.a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// --------------------------------------------------------------------------
// CONTACT PAGE
// --------------------------------------------------------------------------
export const Contact = () => {
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [openFaq, setOpenFaq] = useState(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setStatus('loading');
    await new Promise((res) => setTimeout(res, 1800));
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } else {
      setStatus('error');
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 rounded-2xl border text-sm font-medium text-[#102033] dark:text-white bg-slate-50 dark:bg-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#078B68]/40 transition-all ${
      errors[field]
        ? 'border-rose-400 focus:ring-rose-400/30'
        : 'border-slate-200 dark:border-slate-700 focus:border-[#078B68]'
    }`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#102033] text-[#102033] dark:text-slate-100 font-sans selection:bg-[#078B68] selection:text-white flex flex-col">
      <PublicNavbar />

      {/* ================================================================== */}
      {/* CONTACT HERO                                                        */}
      {/* ================================================================== */}
      <section className="relative bg-[#F3FCF9] dark:bg-[#102033]/60 pt-14 pb-20 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#C2EFE1]/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#E9F8F3]/60 dark:bg-[#078B68]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-[#078B68]/20 shadow-sm text-[#078B68] text-xs font-bold"
          >
            <span>💚</span>
            <span>Contact SnapFit</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#102033] dark:text-white tracking-tight leading-[1.1]"
          >
            Let's Talk About
            <br />
            <span className="text-[#078B68]">Your Health</span> Journey
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#102033]/70 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-medium"
          >
            Have a question, suggestion or feedback? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* MAIN CONTACT CONTENT: Two-Column                                    */}
      {/* ================================================================== */}
      <section className="py-20 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* LEFT: Get in Touch Info */}
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
                  Get in <span className="text-[#078B68]">Touch</span>
                </h2>
                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-md">
                  Whether you have a question about SnapFit, want to share feedback, or have an idea that could make healthy living easier, our team is here to listen.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-5 rounded-2xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/15 dark:border-slate-800">
                  <div className="w-11 h-11 rounded-2xl bg-[#E9F8F3] text-[#078B68] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email</p>
                    <a
                      href="mailto:hello@snapfit.ai"
                      className="text-sm font-bold text-[#102033] dark:text-white hover:text-[#078B68] transition-colors"
                    >
                      hello@snapfit.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-5 rounded-2xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/15 dark:border-slate-800">
                  <div className="w-11 h-11 rounded-2xl bg-[#EAF3FF] text-sky-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Location</p>
                    <p className="text-sm font-bold text-[#102033] dark:text-white">India 🇮🇳</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-5 rounded-2xl bg-[#F3FCF9] dark:bg-slate-900 border border-[#078B68]/15 dark:border-slate-800">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF3E5] text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Response Time</p>
                    <p className="text-sm font-bold text-[#102033] dark:text-white">Usually within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Quick Cards */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Quick Links</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: MessageSquare, title: 'General Questions', sub: 'Have questions about SnapFit?', cta: 'Contact Support →', color: 'bg-[#E9F8F3] text-[#078B68]' },
                    { icon: Lightbulb, title: 'Feedback', sub: 'Have an idea to improve SnapFit?', cta: 'Share Feedback →', color: 'bg-[#FFF3E5] text-amber-600' },
                    { icon: Handshake, title: 'Partnerships', sub: 'Interested in working with us?', cta: "Let's Connect →", color: 'bg-[#F2ECFF] text-purple-600' },
                  ].map((c) => (
                    <div
                      key={c.title}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 transition-all space-y-2 cursor-pointer"
                    >
                      <div className={`w-9 h-9 rounded-xl ${c.color} flex items-center justify-center`}>
                        <c.icon className="w-4.5 h-4.5" />
                      </div>
                      <p className="text-xs font-extrabold text-[#102033] dark:text-white">{c.title}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{c.sub}</p>
                      <p className="text-[11px] font-bold text-[#078B68]">{c.cta}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Contact Form Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft p-8 sm:p-10">
              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E9F8F3] flex items-center justify-center">
                    <Send className="w-4 h-4 text-[#078B68]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#102033] dark:text-white">Send Us a Message</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium">We'll get back to you within 24 hours.</p>
              </div>

              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-[#E9F8F3] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9 text-[#078B68]" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#102033] dark:text-white">
                    ✅ Message Sent Successfully!
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Thanks for reaching out. Our team will get back to you soon.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#078B68] text-white text-sm font-bold hover:bg-[#056B55] transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#102033] dark:text-white mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={inputClass('name')}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#102033] dark:text-white mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputClass('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-[#102033] dark:text-white mb-1.5">
                      Subject <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What is this about?"
                      className={inputClass('subject')}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-[#102033] dark:text-white mb-1.5">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us what's on your mind..."
                      className={`${inputClass('message')} resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Error Banner */}
                  {status === 'error' && (
                    <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      Something went wrong. Please try again.
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 rounded-2xl bg-[#078B68] hover:bg-[#056B55] disabled:bg-[#078B68]/60 text-white font-bold text-sm shadow-lg shadow-[#078B68]/25 hover:-translate-y-0.5 disabled:translate-y-0 transition-all flex items-center justify-center space-x-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FAQ SECTION                                                         */}
      {/* ================================================================== */}
      <section className="py-20 bg-[#F3FCF9] dark:bg-[#102033]/40 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102033] dark:text-white">
              Frequently Asked <span className="text-[#078B68]">Questions</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Quick answers to the most common questions about SnapFit.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((item, idx) => (
              <FAQItem
                key={idx}
                item={item}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CONTACT CTA                                                         */}
      {/* ================================================================== */}
      <section className="py-16 bg-white dark:bg-[#102033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[36px] bg-[#078B68] text-white p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#056B55] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center space-x-4 shrink-0">
              <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                <Lightbulb className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-2 text-center md:text-left flex-1 max-w-xl relative z-10">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Have an Idea for SnapFit?
              </h3>
              <p className="text-emerald-100 text-sm sm:text-base font-medium">
                Your feedback can help us make healthy living easier for everyone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#078B68] font-black text-base shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 text-[#078B68]" />
              </button>
              <Link
                to="/"
                className="px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-base border border-white/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
