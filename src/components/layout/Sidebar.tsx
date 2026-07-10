import React from 'react';
import { Scale, LogOut } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import NavigationMenu from './NavigationMenu';
import GlobalSearch from '../common/GlobalSearch';
import { Client } from '../../types';

interface SidebarProps {
  user: any;
  isDemo: boolean;
  currentView: string;
  clients: Client[];
  onNavigate: (view: string, data?: any) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, isDemo, currentView, clients, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 shrink-0 select-none overflow-hidden">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3 shrink-0">
        <div className="bg-amber-500/10 p-2 border border-amber-500/25 text-amber-400 rounded-xl">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight leading-tight">Digital Chamber</h1>
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block">Advocate Diary</span>
        </div>
      </div>

      {/* User profile card */}
      <div className="shrink-0">
        <UserProfileCard user={user} isDemo={isDemo} variant="desktop" />
      </div>

      {/* Global Search component */}
      <div className="px-4 mb-4 shrink-0">
        <GlobalSearch clients={clients} onNavigate={onNavigate} />
      </div>

      {/* Nav Links */}
      <div className="flex-grow px-3 py-2 overflow-y-auto">
        <NavigationMenu currentView={currentView} onNavigate={onNavigate} fontClass="font-medium" />
      </div>

      {/* Logout area */}
      <div className="p-4 border-t border-slate-800/80 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-semibold transition-all border border-transparent hover:border-rose-500/15"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Leave Chamber
        </button>
      </div>
    </aside>
  );
}
