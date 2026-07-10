import React from 'react';
import { Client, Hearing, FeePayment } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  MessageSquare, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsViewProps {
  clients: Client[];
  hearings: Hearing[];
  payments: FeePayment[];
  onNavigateToView: (view: string, data?: any) => void;
}

export default function ReportsView({
  clients,
  hearings,
  payments,
  onNavigateToView
}: ReportsViewProps) {
  // Calculations
  const totalAgreedFees = clients.reduce((sum, c) => sum + c.fee, 0);
  const totalReceivedFees = clients.reduce((sum, c) => sum + c.advance, 0);
  const totalPendingFees = totalAgreedFees - totalReceivedFees;
  const collectedPercentage = totalAgreedFees > 0 ? Math.round((totalReceivedFees / totalAgreedFees) * 100) : 0;

  // Group clients by month of creation (simulated based on createdAt)
  const getMonthlyRegistrations = () => {
    // Let's create an array of the last 6 months
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const yearStr = d.getFullYear().toString().slice(-2);
      
      // Filter clients created in this month
      const count = clients.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === d.getFullYear();
      }).length;

      result.push({ name: `${monthName} '${yearStr}`, count });
    }
    return result;
  };

  const monthlyData = getMonthlyRegistrations();
  const maxRegistrationCount = Math.max(...monthlyData.map(d => d.count), 4); // default base to avoid division by zero

  // Outstanding fee list (Clients with balance due)
  const debtorClients = clients.filter(c => c.fee - c.advance > 0)
    .sort((a, b) => (b.fee - b.advance) - (a.fee - a.advance));

  const triggerWhatsAppReminder = (client: Client) => {
    const pending = client.fee - client.advance;
    // Format Indian phone format
    const phoneNo = client.phone.trim().startsWith('91') || client.phone.trim().startsWith('+91') 
      ? client.phone.trim() 
      : `91${client.phone.trim()}`;
    const sanitizedPhone = phoneNo.replace(/[^0-9]/g, '');

    const text = encodeURIComponent(
      `Dear ${client.name},\n\nThis is to kindly remind you regarding your pending professional fee of ₹${pending.toLocaleString('en-IN')} for your case (${client.caseType}) in the ${client.court}.\n\nNext scheduled court hearing is on ${new Date(client.nextDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}.\n\nThank you,\nDigital Chamber Office`
    );

    const waUrl = `https://wa.me/${sanitizedPhone}?text=${text}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-500" />
          Law Office Business Metrics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Review financial receivables, client register growth, and trigger client WhatsApp reminders.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total revenue metrics */}
        <div className="md:col-span-2 bg-slate-850/40 border border-slate-800 p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold">Billed Retainers</span>
            <span className="text-2xl font-bold text-white">₹{totalAgreedFees.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-1">total agreed fees value</span>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold text-emerald-400">Total Cleared</span>
            <span className="text-2xl font-bold text-emerald-400">₹{totalReceivedFees.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-1">✓ {collectedPercentage}% collection rate</span>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 sm:pl-6 pt-4 sm:pt-0">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold text-amber-400">Receivables</span>
            <span className="text-2xl font-bold text-amber-400">₹{totalPendingFees.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-400 block mt-1">outstanding balance due</span>
          </div>
        </div>

        {/* Collection percentage radial gauge */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fee Collection</h4>
            <p className="text-[11px] text-slate-500">Ratio of advances to total agreed retainer values.</p>
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/10">
              <Award className="h-3.5 w-3.5" /> High Margin
            </span>
          </div>
          
          <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500"
                strokeDasharray={`${collectedPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute font-bold text-lg text-white">
              {collectedPercentage}%
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Visualizer Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Monthly Client Registrations (Custom SVG Chart) */}
        <div className="bg-slate-850/40 border border-slate-700/30 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Monthly Client Registration Growth</h3>
            <span className="text-[10px] text-slate-500 font-semibold">Past 6 Months</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-6 pb-2 px-2 relative border-b border-slate-800">
            {monthlyData.map((data, i) => {
              const heightPercent = maxRegistrationCount > 0 ? (data.count / maxRegistrationCount) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute top-[-30px] bg-slate-950 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {data.count} Clients
                  </div>

                  {/* Visual Bar with glow */}
                  <div 
                    className="w-full bg-gradient-to-t from-amber-600/30 to-amber-500 rounded-t-lg transition-all duration-500 border border-amber-500/10 group-hover:from-amber-500/50 group-hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.05)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer"
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                  />

                  {/* Label */}
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                    {data.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Debtor List / WhatsApp Overdue Reminders (Phase 3) */}
        <div className="bg-slate-850/40 border border-slate-700/30 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Overdue Fee Accounts ({debtorClients.length})</h3>
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/10 animate-pulse">Action Required</span>
            </div>

            <div className="divide-y divide-slate-800/40 max-h-[190px] overflow-y-auto pr-1 mt-2 no-scrollbar">
              {debtorClients.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs italic">
                  Excellent! Zero clients with pending accounts receivables.
                </div>
              ) : (
                debtorClients.map((client) => {
                  const pending = client.fee - client.advance;
                  return (
                    <div key={client.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/10 px-1 rounded transition-colors">
                      <div>
                        <div 
                          onClick={() => onNavigateToView('client-details', { clientId: client.id })}
                          className="font-semibold text-white hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          {client.name}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Phone: {client.phone}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-amber-400">₹{pending.toLocaleString('en-IN')}</span>
                          <span className="text-[9px] text-slate-500 block">due</span>
                        </div>
                        <button
                          onClick={() => triggerWhatsAppReminder(client)}
                          className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 p-2 rounded-xl border border-emerald-500/20 transition-all flex items-center gap-1"
                          title="Trigger WhatsApp Reminder Notice"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Reminder templates auto-inject client-specific dates and fee totals.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
