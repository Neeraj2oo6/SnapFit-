import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { HealthProvider } from './context/HealthContext';
import { useAuth } from './hooks/useAuth';
import { useHealth } from './hooks/useHealth';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Toast } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Public Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Features } from './pages/Features';
import { HowItWorks } from './pages/HowItWorks';
import { Onboarding } from './pages/Onboarding';

// Authenticated Pages
import { Dashboard } from './pages/Dashboard';
import { SnapFood } from './pages/SnapFood';
import { LogMeal } from './pages/LogMeal';
import { AICoach } from './pages/AICoach';
import { VoiceLog } from './pages/VoiceLog';
import { BarcodeScannerPage } from './pages/BarcodeScannerPage';
import { Progress } from './pages/Progress';
import { Rewards } from './pages/Rewards';
import { Meals } from './pages/Meals';
import { Recommendations } from './pages/Recommendations';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { FoodAnalysisPage } from './pages/FoodAnalysis';

// Sleek loading screen while Firebase authentication initializes
const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-[#102033] flex flex-col items-center justify-center space-y-4">
    <img src="/snapfit-logo.png" alt="SnapFit Logo" className="h-10 w-auto animate-pulse" />
    <div className="w-8 h-8 border-2 border-[#087F5B] border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-semibold text-slate-400">Loading SnapFit...</p>
  </div>
);

// Logout Helper Route Component
const LogoutRoute = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/login" replace />;
};

// Home Route Router Guard:
// Unauthenticated visitors ALWAYS see the Welcome Page (Landing).
// Returning authenticated users go to Dashboard (if complete) or Onboarding (if incomplete).
const HomeRoute = () => {
  const { isLoggedIn, onboardingCompleted, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (isLoggedIn && onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isLoggedIn && !onboardingCompleted) {
    return <Navigate to="/onboarding/step-1" replace />;
  }
  return <Landing />;
};

// Auth Route Guard for /login and /register
const AuthPublicRoute = ({ children }) => {
  const { isLoggedIn, onboardingCompleted, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (isLoggedIn && onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }
  if (isLoggedIn && !onboardingCompleted) {
    return <Navigate to="/onboarding/step-1" replace />;
  }
  return children;
};

// Onboarding Guard: Requires login, only accessible while onboarding is incomplete
const OnboardingRoute = () => {
  const { isLoggedIn, onboardingCompleted, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Onboarding />;
};

// Protected Inner Shell for Authenticated Routes
const AuthenticatedShell = () => {
  const { isLoggedIn, onboardingCompleted, loading } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { toast } = useHealth();

  if (loading) return <LoadingScreen />;

  // If unauthenticated, redirect to login with return path
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If authenticated but onboarding not complete, redirect to onboarding step 1
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding/step-1" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#102033] text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen overflow-hidden">
        <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Routes>
              {/* 1. Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* 2. Food Camera / Food Photo Analysis */}
              <Route path="/snap-food" element={<SnapFood />} />
              <Route path="/food-scan" element={<Navigate to="/snap-food" replace />} />
              <Route path="/food-analysis" element={<Navigate to="/snap-food" replace />} />

              {/* 3. Food Chat / AI Food Logging */}
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="/food-chat" element={<Navigate to="/ai-coach" replace />} />
              <Route path="/voice-log" element={<Navigate to="/ai-coach" replace />} />

              {/* 4. Meal History */}
              <Route path="/meals" element={<Meals />} />
              <Route path="/log-meal" element={<Navigate to="/meals" replace />} />

              {/* 5. Basic Profile */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Navigate to="/profile" replace />} />

              {/* 6. Barcode Scanner */}
              <Route path="/barcode" element={<BarcodeScannerPage />} />
              <Route path="/scanner" element={<Navigate to="/barcode" replace />} />

              {/* Redirect remaining secondary features */}
              <Route path="/progress" element={<Navigate to="/dashboard" replace />} />
              <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
              <Route path="/rewards" element={<Navigate to="/dashboard" replace />} />
              <Route path="/achievements" element={<Navigate to="/dashboard" replace />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <Toast toast={toast} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthProvider>
          <Routes>
            {/* Public Marketing Routes */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <AuthPublicRoute>
                  <Login />
                </AuthPublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <AuthPublicRoute>
                  <Register />
                </AuthPublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthPublicRoute>
                  <Register />
                </AuthPublicRoute>
              }
            />
            <Route path="/logout" element={<LogoutRoute />} />

            {/* 4-Step Onboarding Profile Setup Routes */}
            <Route path="/onboarding" element={<OnboardingRoute />} />
            <Route path="/onboarding/:step" element={<OnboardingRoute />} />
            <Route path="/profile-setup" element={<Navigate to="/onboarding/step-1" replace />} />
            <Route path="/routine" element={<Navigate to="/onboarding/step-2" replace />} />
            <Route path="/meal-times" element={<Navigate to="/onboarding/step-3" replace />} />
            <Route path="/activity" element={<Navigate to="/onboarding/step-4" replace />} />

            {/* Authenticated Dashboard Routes (Protected) */}
            <Route path="/*" element={<AuthenticatedShell />} />
          </Routes>
        </HealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
