import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0f] p-6">
          <div className="text-center max-w-lg animate-slide-up">
            <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-2 max-w-sm mx-auto">
              An unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error && (
              <p className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg mb-8 font-mono">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-primary btn-lg"
              >
                <RefreshCw className="w-5 h-5" /> Try Again
              </button>
              <a href="/dashboard" className="btn-secondary btn-lg">
                <Home className="w-5 h-5" /> Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
