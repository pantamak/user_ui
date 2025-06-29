'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={resetError} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Error boundary class component
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Connection error component
interface ConnectionErrorProps {
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  showOfflineMessage?: boolean;
}

export const ConnectionError: React.FC<ConnectionErrorProps> = ({
  message = "Unable to connect to the server. Please check your internet connection and try again.",
  onRetry,
  isRetrying = false,
  showOfflineMessage = false
}) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
      {showOfflineMessage ? (
        <WifiOff className="h-12 w-12 text-red-500" />
      ) : (
        <AlertCircle className="h-12 w-12 text-red-500" />
      )}
    </div>
    <h3 className="text-2xl font-bold mb-2">
      {showOfflineMessage ? 'You are offline' : 'Connection Error'}
    </h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <Button
        onClick={onRetry}
        disabled={isRetrying}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </>
        )}
      </Button>
    )}
  </div>
);

// Loading skeleton component
export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        <CardContent className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty state component
interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  icon,
  action
}) => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
      {icon || <AlertCircle className="h-12 w-12 text-gray-400" />}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
    {action}
  </div>
);

// Inline error component for smaller errors
interface InlineErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  onRetry,
  className = ""
}) => (
  <Alert className={`border-red-200 bg-red-50 ${className}`}>
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800 flex items-center justify-between">
      <span>{error}</span>
      {onRetry && (
        <Button
          variant="link"
          size="sm"
          onClick={onRetry}
          className="ml-2 p-0 h-auto text-red-600 hover:text-red-800"
        >
          Try again
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

// Offline indicator component
export const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-2 text-sm">
      <WifiOff className="inline h-4 w-4 mr-1" />
      You are currently offline. Some features may not be available.
    </div>
  );
};
