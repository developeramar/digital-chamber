import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { 
  ArrowLeft, 
  Scale, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  FileText,
  Save
} from 'lucide-react';
import { motion } from 'motion/react';

interface AddClientViewProps {
  onAddClient: (clientData: any) => void;
  onNavigateBack: () => void;
  editClientData?: Client | null;
}

const COMMON_CASE_TYPES = [
  'Criminal Trial',
  'Civil Suit',
  'Family Dispute',
  'Bail Application',
  'Cheque Bounce (Sec 138)',
  'Property Dispute',
  'Motor Accident Claim',
  'Revenue Appeal'
];

const COMMON_COURTS = [
  'District & Sessions Court',
  'Chief Judicial Magistrate (CJM)',
  'Sub-Divisional Magistrate (SDM)',
  'High Court',
  'Family Court',
  'Revenue Court',
  'Consumer Forum'
];

export default function AddClientView({ onAddClient, onNavigateBack, editClientData }: AddClientViewProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [caseType, setCaseType] = useState('');
  const [court, setCourt] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [fee, setFee] = useState('');
  const [advance, setAdvance] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editClientData) {
      setName(editClientData.name);
      setPhone(editClientData.phone);
      setVillage(editClientData.village);
      setCaseType(editClientData.caseType);
      setCourt(editClientData.court);
      setCaseNumber(editClientData.caseNumber || '');
      setNextDate(editClientData.nextDate);
      setFee(editClientData.fee.toString());
      setAdvance(editClientData.advance.toString());
      setNotes(editClientData.notes || '');
    } else {
      // Set default nextDate to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const day = String(tomorrow.getDate()).padStart(2, '0');
      setNextDate(`${year}-${month}-${day}`);
    }
  }, [editClientData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Client Name is required');
    if (!phone.trim()) return setError('Phone Number is required');
    if (!village.trim()) return setError('Village / City is required');
    if (!caseType.trim()) return setError('Case Type is required');
    if (!court.trim()) return setError('Court is required');
    if (!nextDate) return setError('Next Hearing Date is required');
    
    const feeVal = parseFloat(fee) || 0;
    const advanceVal = parseFloat(advance) || 0;

    if (advanceVal > feeVal) {
      return setError('Advance received cannot be greater than the total fee');
    }

    const clientPayload = {
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      caseType: caseType.trim(),
      court: court.trim(),
      caseNumber: caseNumber.trim() || undefined,
      nextDate,
      fee: feeVal,
      advance: advanceVal,
      pending: feeVal - advanceVal,
      notes: notes.trim(),
      // Keep existing documents checklist if editing, otherwise start empty
      documents: editClientData ? editClientData.documents : []
    };

    onAddClient(clientPayload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onNavigateBack}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl border border-slate-700/60 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {editClientData ? 'Modify Case File' : 'Add New Client Record'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {editClientData ? 'Update client particulars and fee metrics.' : 'Create a fresh legal entry in your Digital Chamber.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 lg:p-8 space-y-6">
        
        {/* Section: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider border-b border-slate-700/60 pb-2">
            1. Client & Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Client Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Village / City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rampur"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Legal Particulars */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider border-b border-slate-700/60 pb-2">
            2. Case Particulars
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Case Type</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Select or enter e.g. Criminal Trial"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_CASE_TYPES.slice(0, 4).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCaseType(type)}
                    className="text-[10px] bg-slate-900/40 hover:bg-slate-900 border border-slate-700/50 hover:border-amber-500/45 text-slate-300 px-2 py-1 rounded transition-all"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Court</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Select or enter e.g. District Court"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_COURTS.slice(0, 3).map((courtName) => (
                  <button
                    key={courtName}
                    type="button"
                    onClick={() => setCourt(courtName)}
                    className="text-[10px] bg-slate-900/40 hover:bg-slate-900 border border-slate-700/50 hover:border-amber-500/45 text-slate-300 px-2 py-1 rounded transition-all"
                  >
                    {courtName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Case Number (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. CR/5042/2026"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Dates & Billing */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider border-b border-slate-700/60 pb-2">
            3. Scheduled Trial & Retainer Fees
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">First / Next Hearing Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="date"
                  required
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Total Agreed Fee (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Advance Received (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={advance}
                  onChange={(e) => setAdvance(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white pl-11 pr-4 py-2.5 rounded-xl text-sm transition-all placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Notes */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-medium text-slate-400 tracking-wide uppercase px-1">Brief Case Notes & Reminders</label>
          <textarea
            rows={4}
            placeholder="Record client statements, allegations, or upcoming filing tasks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white p-4 rounded-xl text-sm transition-all placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-700/60 pt-6">
          <button
            type="button"
            onClick={onNavigateBack}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            {editClientData ? 'Update Record' : 'Commit to Diary'}
          </button>
        </div>

      </form>
    </div>
  );
}
