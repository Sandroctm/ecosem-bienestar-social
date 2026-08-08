import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackModuleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React Error Boundary Capturado]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-8 rounded-3xl border border-rose-500/40 bg-slate-950/90 max-w-2xl mx-auto my-12 text-slate-100 shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100">
                Aislamiento de Excepción de Componente
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Módulo: <span className="font-bold text-rose-400">{this.props.fallbackModuleName || 'General'}</span> • Fallo interceptado sin colapsar la aplicación
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 font-mono">
            <div className="font-bold text-rose-400 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              <span>{this.state.error?.name || 'Runtime Error'}: {this.state.error?.message || 'Error no controlado'}</span>
            </div>
            {this.state.errorInfo && (
              <details className="text-[10px] text-slate-400 cursor-pointer pt-2 border-t border-slate-800">
                <summary className="hover:text-slate-200">Ver traza del componente (Stack Trace)...</summary>
                <pre className="mt-2 p-2 bg-slate-950 rounded overflow-x-auto text-rose-300/80">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <p className="text-xs text-slate-300">
            El sistema aisló la falla para prevenir la pantalla en blanco (White Screen of Death). Puede reiniciar el módulo o continuar navegando por otras funciones.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Recuperar Módulo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
