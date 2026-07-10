import React, { useState } from 'react';
import { Client, Hearing } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLocalDateString, normalizeDateStr } from '../utils/dateUtils';

interface DailyRegisterViewProps {
  clients: Client[];
  hearings: Hearing[];
  onNavigateToView: (view: string, data?: any) => void;
  onUpdateHearingStatus: (hearingId: string, status: 'Pending' | 'Completed' | 'Adjourned') => void;
}

export default function DailyRegisterView({
  clients,
  hearings,
  onNavigateToView,
  onUpdateHearingStatus
}: DailyRegisterViewProps) {
  // Use current date or selected date as YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const handleDateChange = (days: number) => {
    const parts = selectedDate.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    setSelectedDate(getLocalDateString(d));
  };

  // Find hearings for the selected date
  const selectedDateHearings = hearings.filter(h => normalizeDateStr(h.date) === selectedDate);

  // Helper to generate a 7-day horizontal date slider centered around selected date
  const getDateSlider = () => {
    const dates = [];
    const parts = selectedDate.split('-');
    const baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    // Start 3 days before selected date
    baseDate.setDate(baseDate.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);
      dates.push(getLocalDateString(d));
    }
    return dates;
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateStr: string) => {
    return new Date(dateStr).getDate();
  };

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-500" />
          Lawyer's Daily Register (Diary View)
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Step through dates in your traditional law diary to view schedules and outcomes.
        </p>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-slate-850/40 border border-slate-800/60 p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => handleDateChange(-1)}
            className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 p-2 rounded-xl transition-all"
            title="Previous Day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <span className="text-base font-semibold text-white block">
              {formatDateLabel(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-3 py-1 mt-1 rounded-lg outline-none focus:border-amber-500 cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 p-2 rounded-xl transition-all"
            title="Next Day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 7-day quick horizontal selector */}
        <div className="grid grid-cols-7 gap-2 border-t border-slate-800 pt-4">
          {getDateSlider().map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const hearingsCount = hearings.filter(h => normalizeDateStr(h.date) === dateStr).length;
            const isToday = dateStr === getLocalDateString();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md scale-105' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-slate-950' : 'text-slate-500'}`}>
                  {getDayName(dateStr)}
                </span>
                <span className="text-sm font-bold block my-0.5">
                  {getDayNumber(dateStr)}
                </span>
                {hearingsCount > 0 && (
                  <span className={`h-1.5 w-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-slate-950' : 'bg-amber-500'}`} />
                )}
                {isToday && !isSelected && (
                  <span className="text-[8px] uppercase tracking-widest text-amber-500 font-bold mt-0.5">Today</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diary Listings */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl overflow-hidden min-h-[300px]">
        {selectedDateHearings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="font-semibold text-slate-300">Diary Sheet is Empty</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
              No cases or hearings registered on this date sheet. Tap the button below or select a client file to schedule a hearing.
            </p>
            <button
              onClick={() => onNavigateToView('client-list')}
              className="mt-5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-400 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            >
              Select Client to Schedule Trial
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/40">
            {selectedDateHearings.map((hearing) => {
              const client = clients.find(c => c.id === hearing.clientId);
              return (
                <div key={hearing.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/15 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Time indicator */}
                    <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-center min-w-[72px] font-mono shrink-0">
                      <span className="block text-xs text-amber-400 font-bold">{hearing.time || '10:30'}</span>
                      <span className="block text-[9px] text-slate-500 uppercase mt-0.5">{hearing.courtNumber || 'Room 1'}</span>
                    </div>

                    <div>
                      <h4 
                        onClick={() => onNavigateToView('client-details', { clientId: hearing.clientId })}
                        className="font-semibold text-white hover:text-amber-400 cursor-pointer transition-colors text-base"
                      >
                        {hearing.clientName}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="bg-slate-900 px-2.5 py-0.5 rounded text-amber-400 border border-amber-500/10 font-medium">{client?.caseType}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          {client?.court || 'District Court'}
                        </span>
                      </div>

                      {hearing.notes && (
                        <p className="text-xs text-slate-400 bg-slate-950/20 border border-slate-850 p-3 rounded-xl italic mt-3">
                          Agenda / Comments: {hearing.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status controls */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
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
                      onClick={() => onNavigateToView('client-details', { clientId: hearing.clientId })}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                      title="Inspect case file"
                    >
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
