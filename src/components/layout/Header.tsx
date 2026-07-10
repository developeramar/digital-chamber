import React from 'react';
import { Menu, Scale } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  user: any;
}

export default function Header({ onMenuClick, user }: HeaderProps) {
  return (
    <header className="flex lg:hidden items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
      <button
        onClick={onMenuClick}
        className="text-slate-400 hover:text-white p-1 rounded-lg"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-2">
        <Scale className="h-4.5 w-4.5 text-amber-500" />
        <span className="font-bold text-white text-xs tracking-tight uppercase">Digital Chamber</span>
      </div>
      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-amber-400 text-sm uppercase border border-slate-700">
        {user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'A')}
      </div>
    </header>
  );
}
