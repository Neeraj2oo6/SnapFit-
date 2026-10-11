import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error in development mode
    if (import.meta.env.DEV) {
      console.error('Captured in ErrorBoundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#102033] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#14213D] rounded-3xl p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                An unexpected error occurred while rendering this view. You can reload the page or return to the dashboard.
              </p>
            </div>

            {/* Error Message Details in Dev Mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-left border border-rose-200 dark:border-rose-900 max-h-36 overflow-y-auto">
                <p className="text-[11px] font-mono text-rose-700 dark:text-rose-300 font-bold">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoDashboard}
                className="flex-1 py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-extrabold text-xs shadow-lg shadow-[#087F5B]/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
