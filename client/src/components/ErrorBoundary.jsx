import React from 'react';
import toast from 'react-hot-toast';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React error boundary caught an error:', error, errorInfo);
    toast.error('A page error occurred. Please try again.');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3l9 16H3L12 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The page encountered an unexpected error and was prevented from crashing the app.
            </p>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-left text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/10 p-3 rounded">
                <div className="font-medium">Error:</div>
                <div className="truncate break-words">{String(this.state.error.message || this.state.error)}</div>
                <details className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <summary>Stack trace</summary>
                  <pre className="whitespace-pre-wrap text-[11px] mt-2">{this.state.error.stack}</pre>
                </details>
              </div>
            )}
            <button
              onClick={this.handleRetry}
              className="mt-6 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}