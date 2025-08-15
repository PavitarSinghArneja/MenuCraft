import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorScreenProps {
  error: string | null;
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-sm border border-accent p-8">
          <div className="w-16 h-16 bg-light-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-black" />
          </div>
          
          <h2 className="text-xl font-semibold text-black mb-2">
            Unable to Load Restaurant
          </h2>
          
          <p className="text-black mb-6">
            {error || 'There was a problem loading the restaurant configuration. Please try again.'}
          </p>
          
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          
          <div className="mt-6 text-sm text-black">
            <p>If this problem persists, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}