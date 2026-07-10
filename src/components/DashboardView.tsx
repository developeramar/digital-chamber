import React from 'react';
import { Client, Hearing } from '../types';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  FileText, 
  Clock, 
  MapPin, 
  Search, 
  AlertCircle,
  Plus,
  TrendingUp,
  Scale
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLocalDateString, normalizeDateStr } from '../utils/dateUtils';

interface DashboardViewProps {
  clients: Client[];
  hearings: Hearing[];
  onNavigateToView: (view: string, data?: any) => void;
  onUpdateHearingStatus: (hearingId: string, status: 'Pending' | 'Completed' | 'Adjourned') => void;
  user: any;
}

export default function DashboardView({ 
  clients, 
  hearings, 
  onNavigateToView, 
  onUpdateHearingStatus,
  user
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const todayStr = getLocalDateString();

  // Calculations
  const todaysHearings = hearings.filter(h => normalizeDateStr(h.date) === todayStr);
  const totalClients = clients.length;
  const totalPendingFees = clients.reduce((sum, c) => sum + (c.fee - c.advance), 0);
  
  // Pending documents: clients where checklist documents are missing
  // Let's assume a full standard set of checklist documents is 5 (Aadhaar, PAN, Sale Deed, Mutation, Tax Receipt)
  // If they have checked less than that, they have pending documents
  const clientsWithPendingDocs = clients.filter(c => c.documents.length < 5).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onNavigateToView('client-list', { search: searchTerm });
    }
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Advocate';
    if (user.displayName) return user.displayName;
    if (user.email) {
      const emailLower = user.email.toLowerCase();
      if (emailLower.includes('chaudhariamar') || emailLower.includes('amar')) {
        return 'Adv. Amar';
      }
      const prefix = user.email.split('@')[0];
      const clean = prefix.replace(/[0-9._-]+/g, ' ').trim();
      if (clean) {
        return 'Adv. ' + clean.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
    return 'Advocate';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 border border-slate-700/40 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">
            {getGreeting()}, {getUserDisplayName()}
          </h2>
          <p className="text-sm text-slate-400 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            {formatDate()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToView('add-client')}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10"
          >
            <Plus className="h-4 w-4" />
            New Case Record
          </button>
        </div>
      </div>

      {/* Fluid Responsive Grid for entire Dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* Left Column (8 cols): Today's Hearings (Diary) & Priority Metrics */}
        <div className="lg:col-span-8 space-y-6 w-full">
          
          {/* Today's Hearings Schedule (Physical Diary - HIGHER PRIORITY FOCUS) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Today's Hearings Schedule ({todaysHearings.length})
              </h3>
              <button 
                onClick={() => onNavigateToView('daily-register')}
                className="text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
              >
                Open Daily Diary View
              </button>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden shadow-xl">
              {todaysHearings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <Calendar className="h-10 w-10 text-slate-600 mb-3" />
                  <p className="text-sm">No hearings scheduled for today.</p>
                  <p className="text-xs text-slate-500 mt-1">Excellent day to update files and catch up on pending case studies.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/40">
                  {todaysHearings.map((hearing, idx) => {
                    const client = clients.find(c => c.id === hearing.clientId);
                    return (
                      <div key={hearing.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-slate-900 border border-slate-700/50 p-2.5 rounded-xl font-mono text-center min-w-[64px] shrink-0">
                            <span className="block text-xs text-amber-500 font-semibold">{hearing.time || '10:00'}</span>
                            <span className="block text-[10px] text-slate-400 uppercase mt-0.5">{hearing.courtNumber || 'Court 1'}</span>
                          </div>
                          <div>
                            <h4 
                              onClick={() => onNavigateToView('client-details', { clientId: hearing.clientId })}
                              className="font-medium text-white hover:text-amber-400 cursor-pointer transition-colors"
                            >
                              {hearing.clientName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                              <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-400 border border-amber-500/10">{client?.caseType || 'Criminal'}</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                {client?.court || 'District Court'}
                              </span>
                            </div>
                            {hearing.notes && (
                              <p className="text-xs text-slate-500 mt-2 bg-slate-900/30 p-2 rounded-lg border border-slate-700/10 italic">
                                Note: {hearing.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions / Status */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <select
                            value={hearing.status}
                            onChange={(e) => onUpdateHearingStatus(hearing.id, e.target.value as any)}
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl outline-none border transition-all ${
                              hearing.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : hearing.status === 'Adjourned'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 focus:border-amber-500'
                            }`}
                          >
                            <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                            <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                            <option value="Adjourned" className="bg-slate-900 text-white">Adjourned</option>
                          </select>
                          <button
                            onClick={() => onNavigateToView('client-details', { clientId: hearing.clientId, activeTab: 'hearings' })}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700/60 transition-colors"
                            title="View Case History"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Metric Cards Grid - Reorganized in priority order: Hearings, Fees, Missing Docs, Total Clients */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Metric 1: Today's Hearings */}
            <div 
              onClick={() => onNavigateToView('daily-register')}
              className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Hearings</span>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Scale className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{todaysHearings.length}</span>
                <span className="text-xs text-slate-500">hearings scheduled</span>
              </div>
            </div>

            {/* Metric 2: Pending Fees */}
            <div 
              onClick={() => onNavigateToView('reports')}
              className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Fees</span>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">₹{totalPendingFees.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-500">receivables</span>
              </div>
            </div>

            {/* Metric 3: Missing Documents */}
            <div 
              onClick={() => onNavigateToView('client-list')}
              className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Missing Documents</span>
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{clientsWithPendingDocs}</span>
                <span className="text-xs text-slate-500">incomplete checklists</span>
              </div>
            </div>

            {/* Metric 4: Total Clients */}
            <div 
              onClick={() => onNavigateToView('client-list')}
              className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clients</span>
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{totalClients}</span>
                <span className="text-xs text-slate-500">active files</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Secondary Panels / Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6 w-full">
          
          {/* Quick Search Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Quick Search Case</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search Client Name / Phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 outline-none text-white pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Overdue and Warnings Alert Box */}
          {totalPendingFees > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>Overdue Fee Alerts</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You have pending accounts receivable totaling <strong className="text-rose-300">₹{totalPendingFees.toLocaleString('en-IN')}</strong> across multiple case files. Use the Fee Reports to review pending billing.
              </p>
              <button
                onClick={() => onNavigateToView('reports')}
                className="w-full text-center text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 py-2.5 rounded-xl transition-all"
              >
                Review Receivables
              </button>
            </div>
          )}

          {/* Quick Checklist Info */}
          <div className="bg-slate-800/40 border border-slate-700/40 p-5 rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Chamber Guidelines</h3>
            <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 select-none">•</span>
                <span>Select a client and record upcoming dates directly in their profile to synch them with the calendar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 select-none">•</span>
                <span>Tap the microphone icon inside client notes to record dictation (AI Voice Note integration).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 select-none">•</span>
                <span>Store documents checklists to avoid missing files in upcoming trials.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
