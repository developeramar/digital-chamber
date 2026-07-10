import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Scale, 
  DollarSign, 
  ChevronRight, 
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface ClientListViewProps {
  clients: Client[];
  onNavigateToView: (view: string, data?: any) => void;
  onDeleteClient: (clientId: string) => void;
  initialSearchTerm?: string;
}

export default function ClientListView({ 
  clients, 
  onNavigateToView, 
  onDeleteClient,
  initialSearchTerm = ''
}: ClientListViewProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCaseType, setSelectedCaseType] = useState('All');
  const [selectedCourt, setSelectedCourt] = useState('All');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('All');

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  // Extract unique filters
  const uniqueCaseTypes = ['All', ...Array.from(new Set(clients.map(c => c.caseType)))];
  const uniqueCourts = ['All', ...Array.from(new Set(clients.map(c => c.court)))];

  // Filtering Logic
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.caseNumber && client.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCaseType = selectedCaseType === 'All' || client.caseType === selectedCaseType;
    const matchesCourt = selectedCourt === 'All' || client.court === selectedCourt;
    
    const isFeePending = client.fee - client.advance > 0;
    const matchesFeeStatus = 
      selectedFeeStatus === 'All' ||
      (selectedFeeStatus === 'Pending' && isFeePending) ||
      (selectedFeeStatus === 'Fully Paid' && !isFeePending);

    return matchesSearch && matchesCaseType && matchesCourt && matchesFeeStatus;
  });

  const handleDeleteClick = (e: React.MouseEvent, clientId: string, clientName: string) => {
    e.stopPropagation();
    if (confirm(`Are you absolutely sure you want to delete the case record of ${clientName}? All scheduled hearings and fee history for this client will be permanently purged.`)) {
      onDeleteClient(clientId);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Chamber Client Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, filter, and inspect case files inside your digital diary.
          </p>
        </div>
        
        {/* Dynamic Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Name, Phone, Village or Case No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/60 focus:border-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-slate-850/40 border border-slate-800/60 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-2">Filter By:</span>
        
        {/* Case Type filter */}
        <div className="flex flex-col gap-1">
          <select
            value={selectedCaseType}
            onChange={(e) => setSelectedCaseType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg outline-none focus:border-amber-500 transition-all max-w-[150px]"
          >
            <option value="All">All Case Types</option>
            {uniqueCaseTypes.filter(t => t !== 'All').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Court filter */}
        <div className="flex flex-col gap-1">
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg outline-none focus:border-amber-500 transition-all max-w-[180px]"
          >
            <option value="All">All Courts</option>
            {uniqueCourts.filter(c => c !== 'All').map(courtName => (
              <option key={courtName} value={courtName}>{courtName}</option>
            ))}
          </select>
        </div>

        {/* Fee Status filter */}
        <div className="flex flex-col gap-1">
          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg outline-none focus:border-amber-500 transition-all"
          >
            <option value="All">All Fee Status</option>
            <option value="Pending">Fee Pending</option>
            <option value="Fully Paid">Fully Paid</option>
          </select>
        </div>

        {/* Reset button if filters active */}
        {(searchTerm || selectedCaseType !== 'All' || selectedCourt !== 'All' || selectedFeeStatus !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCaseType('All');
              setSelectedCourt('All');
              setSelectedFeeStatus('All');
            }}
            className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Directory Count */}
      <div className="text-xs text-slate-400 px-1 flex justify-between items-center">
        <span>Showing {filteredClients.length} of {clients.length} clients</span>
        {filteredClients.length === 0 && clients.length > 0 && (
          <span className="text-amber-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> No clients match your filter criteria.
          </span>
        )}
      </div>

      {/* Clients Display - Grid list */}
      {filteredClients.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl py-20 flex flex-col items-center justify-center text-slate-400 text-center px-4">
          <User className="h-12 w-12 text-slate-600 mb-4" />
          <p className="font-medium text-slate-300">No client records found.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {clients.length === 0 
              ? "Start adding clients using the 'New Case Record' button on the dashboard to populate your digital diary."
              : "Try adjusting your search query or removing active filters to display matching results."}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => onNavigateToView('add-client')}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-amber-500/10"
            >
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const isPendingFee = client.fee - client.advance > 0;
            return (
              <div
                key={client.id}
                onClick={() => onNavigateToView('client-details', { clientId: client.id })}
                className="bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer hover:bg-slate-800/60 transition-all group shadow-sm hover:shadow-lg relative overflow-hidden"
              >
                {/* Visual accent bar for client card */}
                <div className={`absolute top-0 left-0 w-1 h-full ${isPendingFee ? 'bg-amber-500/60' : 'bg-emerald-500/60'}`} />

                <div>
                  {/* Name and Delete Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors text-base">
                        {client.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {client.caseNumber || 'No Case Number'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, client.id, client.name)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all self-start"
                      title="Delete client case file"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Main Details */}
                  <div className="space-y-2 mt-4 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 animate-pulse" />
                      <span>{client.village}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-amber-500/10">{client.caseType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scale className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate">{client.court}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Hearing Date and Fee Summary */}
                <div className="border-t border-slate-700/50 pt-3 flex items-center justify-between mt-2 text-xs">
                  <div className="flex flex-col gap-0.5 text-slate-400">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Next Hearing
                    </span>
                    <span className="text-white font-medium">{formatDate(client.nextDate)}</span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Balance Fee
                    </span>
                    <span className={`font-semibold ${isPendingFee ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isPendingFee ? `₹${(client.fee - client.advance).toLocaleString('en-IN')}` : 'Fully Paid'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
