import { Component, ReactNode, ErrorInfo } from "react";

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

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F0F0F" }}>
          <div className="text-center p-8 max-w-md">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.1)" }}>
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-white mb-3">حدث خطأ غير متوقع</h1>
            <p className="text-gray-400 text-sm mb-6">نأسف للإزعاج. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-xl font-bold text-base"
              style={{ background: `linear-gradient(135deg, #D4AF37, #E6D3A3)`, color: "#0F0F0F" }}
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
