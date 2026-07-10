import React from 'react';
import { Sparkles } from 'lucide-react';

interface UserProfileCardProps {
  user: any;
  isDemo: boolean;
  variant?: 'desktop' | 'mobile';
}

export default function UserProfileCard({ user, isDemo, variant = 'desktop' }: UserProfileCardProps) {
  const getDisplayName = () => {
    if (user.displayName) return user.displayName;
    if (user.email && (user.email.toLowerCase().includes('chaudhariamar') || user.email.toLowerCase().includes('amar'))) {
      return 'Adv. Amar';
    }
    return 'Advocate';
  };

  if (variant === 'mobile') {
    return (
      <div className="p-3 bg-slate-950/40 my-4 rounded-xl">
        <h2 className="text-xs font-semibold text-white">
          {getDisplayName()}
        </h2>
        <span className="text-[9px] text-slate-500 truncate block font-mono">{user.email}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-950/40 border-b border-slate-800/40 mx-4 my-3 rounded-2xl">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-amber-400 uppercase">
          {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'A')}
        </div>
        <div className="overflow-hidden">
          <h2 className="text-xs font-semibold text-white truncate">{getDisplayName()}</h2>
          <span className="text-[9px] text-slate-500 block truncate font-mono">{user.email}</span>
        </div>
      </div>
      {isDemo && (
        <div className="mt-2 text-center text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/15 py-0.5 rounded-md font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" /> Sandbox Mode
        </div>
      )}
    </div>
  );
}
