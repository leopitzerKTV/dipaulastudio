import { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
            <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-[var(--ivory)] p-6 shadow-[var(--shadow-luxe)]">
              <div className="mb-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h2 className="font-display text-lg text-[var(--cocoa)]">Algo deu errado</h2>
              </div>
              <p className="mb-4 font-display text-sm text-[var(--cocoa)]/80">
                Desculpe, encontramos um erro inesperado. Tente recarregar a página.
              </p>
              <details className="mb-4 rounded-lg bg-red-50 p-3">
                <summary className="cursor-pointer font-serif-caps text-[10px] text-red-700">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 overflow-auto text-[10px] text-red-600">
                  {this.state.error?.toString()}
                </pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-full bg-red-600 px-4 py-2 font-serif-caps text-[10px] text-white hover:bg-red-700"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
