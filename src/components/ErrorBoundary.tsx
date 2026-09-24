import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Almaa Care OS Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Terjadi Kendala Tampilan</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Sistem mendeteksi kendala pada modul yang sedang dibuka. Anda dapat memuat ulang aplikasi untuk kembali ke menu utama.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang Aplikasi
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
