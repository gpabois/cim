import React from "react";

export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
    state: {hasError: boolean};

    constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(_error: any) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error: any, info: any) {
      // Example "componentStack":
      //   in ComponentThatThrows (created by App)
      //   in ErrorBoundary (created by App)
      //   in div (created by App)
      //   in App
      console.error(error, info.componentStack);
    }
  
    render() {
      if (this.state.hasError) {
        return this.props.fallback || <span>#!error</span>;
      }
      
      return this.props.children;
    }
  }