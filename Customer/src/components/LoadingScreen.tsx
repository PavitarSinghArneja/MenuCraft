import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-black mb-2">Loading Restaurant</h2>
        <p className="text-black">Preparing your dining experience...</p>
      </div>
    </div>
  );
}