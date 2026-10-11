import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validators';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, resetPassword } = useAuth();

  // Pick up registered email if user was redirected from register
  const initialEmail =
    location.state?.registeredEmail ||
    localStorage.getItem('snapfit_last_registered_email') ||
    'rahul.sharma@snapfit.ai';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(
    location.state?.registeredEmail ? '' : 'password123'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [justRegistered, setJustRegistered] = useState(Boolean(location.state?.justRegistered));

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
      setPassword('');
      setJustRegistered(true);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setErrors({});

    try {
      const res = await login(email, password);
      // Check onboarding status directly from returned user data or fallback
      const isOnboardingDone = Boolean(
        res?.onboardingCompleted ??
        res?.user?.onboardingCompleted ??
        (localStorage.getItem('onboardingCompleted') === 'true')
      );

      if (isOnboardingDone) {
        // Returning user flow: Directly to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // First-time user flow: Open Let's set up your profile (Step 1)
        navigate('/onboarding/step-1', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) {
      try {
        if (resetPassword) {
          await resetPassword(forgotEmail);
        }
        setForgotSuccess(true);
        setTimeout(() => {
          setForgotSuccess(false);
          setShowForgotModal(false);
        }, 2500);
      } catch (err) {
        setServerError(err.message || 'Failed to send reset email.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-y-auto transition-colors safe-area-pt safe-area-pb">
      {/* Background organic glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#087F5B]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-1 sm:space-y-3 shrink-0">
        {/* Official Brand Logo */}
        <Link to="/" className="inline-flex items-center space-x-2.5 sm:space-x-3 mb-0.5 sm:mb-2">
          <img
            src="/snapfit-logo.png"
            alt="SnapFit Logo"
            className="h-7 sm:h-12 w-auto object-contain"
          />
          <div className="flex flex-col text-left">
            <span className="text-lg sm:text-2xl font-black text-[#087F5B] dark:text-emerald-400 leading-none">
              SnapFit
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">
              AI Health Companion
            </span>
          </div>
        </Link>

        <h2 className="text-base sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Welcome Back!
        </h2>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 hidden xs:block">
          Enter credentials to access your AI health dashboard
        </p>
      </div>

      {/* Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 my-auto sm:my-0 sm:mt-8">
        <div className="bg-white dark:bg-slate-900 py-3.5 px-4 sm:py-8 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800">
          
          {justRegistered && (
            <div className="mb-2 sm:mb-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] sm:text-xs font-bold text-[#087F5B] dark:text-emerald-400 flex items-center space-x-1.5 sm:space-x-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Account created! Log in to complete setup.</span>
            </div>
          )}

          {serverError && (
            <div className="mb-2 sm:mb-4 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400">
              {serverError}
            </div>
          )}

          <form className="space-y-2.5 sm:space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-0.5 sm:mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl sm:rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border ${
                    errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#087F5B]`}
                  placeholder="name@snapfit.ai"
                />
              </div>
              {errors.email && <p className="mt-0.5 text-[10px] sm:text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] sm:text-xs font-bold text-[#087F5B] dark:text-emerald-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative rounded-xl sm:rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-1.5 sm:py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border ${
                    errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#087F5B]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-0.5 text-[10px] sm:text-xs text-rose-500">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-[#087F5B] rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Remember Me
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#087F5B]/25 transition-all flex items-center justify-center space-x-2 mt-1 sm:mt-2"
            >
              <span>{loading ? 'Logging In...' : 'Login'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>

          {/* Demo Credentials Helper Box */}
          <div className="mt-2.5 sm:mt-6 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#EFFAF5] dark:bg-slate-800/60 border border-[#087F5B]/20 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 sm:space-y-1">
            <p className="font-black text-[#087F5B] dark:text-emerald-400">⚡ Demo Credentials:</p>
            <p className="truncate">Email: <code className="font-bold">rahul.sharma@snapfit.ai</code></p>
            <p>Password: <code className="font-bold">password123</code></p>
          </div>

          <p className="mt-2.5 sm:mt-6 text-center text-[11px] sm:text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#087F5B] dark:text-emerald-400 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Spacer */}
      <div className="shrink-0 h-1 sm:h-4" />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Reset Your Password
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Enter your email address to receive password reset instructions.
            </p>
            <form onSubmit={handleSendReset} className="space-y-2.5 sm:space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="rahul.sharma@snapfit.ai"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-medium text-slate-900 dark:text-white"
              />
              {forgotSuccess ? (
                <div className="p-2.5 rounded-xl bg-emerald-100 text-[#087F5B] text-xs font-bold text-center">
                  Password reset link sent! Check your inbox.
                </div>
              ) : (
                <div className="flex space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-bold shadow"
                  >
                    Send Link
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
