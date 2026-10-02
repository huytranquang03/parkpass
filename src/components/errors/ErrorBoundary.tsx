import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  private handleReset = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section>
          <h2>Đã xảy ra lỗi</h2>
          <p>
            {this.props.fallbackMessage ??
              "Không thể hiển thị nội dung này. Vui lòng thử lại."}
          </p>

          <button type="button" onClick={this.handleReset}>
            Thử lại
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
