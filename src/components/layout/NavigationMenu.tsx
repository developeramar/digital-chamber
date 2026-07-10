import React from 'react';
import { LayoutDashboard, Users, BookOpen, TrendingUp } from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Hub', icon: LayoutDashboard },
  { id: 'client-list', label: 'Client Directory', icon: Users },
  { id: 'daily-register', label: 'Daily Diary Register', icon: BookOpen },
  { id: 'reports', label: 'Analytical Reports', icon: TrendingUp },
];

interface NavigationMenuProps {
  currentView: string;
  onNavigate: (view: string) => void;
  fontClass?: string;
}

export default function NavigationMenu({ currentView, onNavigate, fontClass = 'font-medium' }: NavigationMenuProps) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs ${fontClass} transition-all ${
              isActive
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
