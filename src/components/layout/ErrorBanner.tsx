import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  error: string;
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  return (
    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-300 text-xs shadow-lg animate-fadeIn">
      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-grow">
        <span className="font-semibold block text-rose-200 text-sm mb-1">Database Sync Warning</span>
        <p className="leading-relaxed">{error}</p>
      </div>
    </div>
  );
}
