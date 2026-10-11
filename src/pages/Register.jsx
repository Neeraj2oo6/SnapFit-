import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validateName } from '../utils/validators';

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (nameErr || emailErr || passErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr
      });
      return;
    }

    setErrors({});

    try {
      // 1. Create Firebase Authentication account
      // 2. Create Firestore user document with onboardingCompleted: false
      // 3. Initialize onboarding status
      await register(name, email, password);

      // 4. Navigate directly to Profile Setup Step 1
      navigate('/onboarding/step-1', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-y-auto transition-colors safe-area-pt safe-area-pb">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#087F5B]/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-1 sm:space-y-3 shrink-0">
        <Link to="/" className="inline-flex items-center space-x-2.5 sm:space-x-3 mb-0.5 sm:mb-2">
          <img
            src="/snapfit-logo.png"
            alt="SnapFit Logo"
            className="h-8 sm:h-12 w-auto object-contain"
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

        <h2 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Create Account
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sign up to begin your personalized health journey
        </p>
      </div>

      {/* Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 my-auto sm:my-0 sm:mt-6 mb-8">
        <div className="bg-white dark:bg-slate-900 py-6 px-5 sm:py-8 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          
          {serverError && (
            <div className="p-3 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 dark:text-rose-400">
              {serverError}
            </div>
          )}

          <form className="space-y-3.5 sm:space-y-4" onSubmit={handleSubmit}>
            {/* 1. Full Name */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl sm:rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="register-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border ${
                    errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#087F5B]`}
                  placeholder="Rahul Sharma"
                />
              </div>
              {errors.name && <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>}
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl sm:rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="register-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border ${
                    errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#087F5B]`}
                  placeholder="rahul.sharma@snapfit.ai"
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>}
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative rounded-xl sm:rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border ${
                    errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  } text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#087F5B]`}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-rose-500">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="create-account-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl sm:rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#087F5B]/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#087F5B] dark:text-emerald-400 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
