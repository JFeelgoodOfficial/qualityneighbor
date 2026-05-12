import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-warm-brown text-sm">
            Something went wrong loading this section. Please refresh the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
