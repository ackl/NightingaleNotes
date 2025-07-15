import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Audio Context Error:', error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      return (
        fallback || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Audio System Error</h3>
            <p>
              The audio system encountered an error. Please refresh the page.
            </p>
          </div>
        )
      );
    }

    return children;
  }
}
