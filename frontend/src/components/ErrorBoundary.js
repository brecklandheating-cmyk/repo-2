import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a ResizeObserver error
    if (error && error.message && /ResizeObserver/.test(error.message)) {
      // Don't show error UI for ResizeObserver errors
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Suppress ResizeObserver errors completely
    if (error && error.message && /ResizeObserver/.test(error.message)) {
      // Reset state and continue rendering
      this.setState({ hasError: false });
      return;
    }
    
    // For other errors, log them
    console.error('Caught error:', error, errorInfo);
    
    // Auto-recover after a short delay for other errors
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
