import React from 'react';
import { Scale, LogOut, X } from 'lucide-react';
import { motion } from 'motion/react';
import UserProfileCard from './UserProfileCard';
import NavigationMenu from './NavigationMenu';
import GlobalSearch from '../common/GlobalSearch';
import { Client } from '../../types';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isDemo: boolean;
  currentView: string;
  clients: Client[];
  onNavigate: (view: string, data?: any) => void;
  onLogout: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  user,
  isDemo,
  currentView,
  clients,
  onNavigate,
  onLogout,
}: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm lg:hidden" onClick={onClose}>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-slate-900 border-r border-slate-800 h-full flex flex-col z-50 p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-4 flex items-center gap-3 border-b border-slate-800/80">
          <Scale className="h-5 w-5 text-amber-500" />
          <div>
            <h1 className="font-bold text-white text-sm">Digital Chamber</h1>
            <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold">Law Diary</span>
          </div>
        </div>

        <UserProfileCard user={user} isDemo={isDemo} variant="mobile" />

        {/* Global Search Component for Mobile */}
        <div className="px-1 mb-4">
          <GlobalSearch clients={clients} onNavigate={onNavigate} />
        </div>

        <div className="flex-grow pt-2">
          <NavigationMenu currentView={currentView} onNavigate={onNavigate} fontClass="font-semibold" />
        </div>

        <button
          onClick={onLogout}
          className="mt-auto w-full flex items-center gap-3 px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold border border-transparent transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </motion.aside>
    </div>
  );
}
