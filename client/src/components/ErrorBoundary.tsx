import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-xl max-w-lg w-full text-center">
            <h2 className="text-xl font-semibold text-[#963E56] mb-4">Er is iets misgegaan</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Er is een onverwachte fout opgetreden.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#963E56] text-white px-4 py-2 rounded hover:bg-[#6BB85C] transition-colors"
            >
              Vernieuw de pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
