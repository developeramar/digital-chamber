import React, { useState, useEffect } from 'react';
import { Client, Hearing, FeePayment } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  Mic, 
  MicOff, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  Briefcase, 
  Scale, 
  Edit,
  Save,
  CheckCircle,
  FileCheck,
  Upload,
  AlertCircle,
  Trash,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Camera,
  Phone,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLocalDateString } from '../utils/dateUtils';

interface ClientDetailsViewProps {
  client: Client;
  hearings: Hearing[];
  payments: FeePayment[];
  onNavigateBack: () => void;
  onNavigateToEdit: (client: Client) => void;
  onAddHearing: (hearingData: any) => void;
  onUpdateHearingStatus: (hearingId: string, status: 'Pending' | 'Completed' | 'Adjourned') => void;
  onDeleteHearing: (hearingId: string) => void;
  onAddPayment: (paymentData: any) => void;
  onDeletePayment: (paymentId: string) => void;
  onUpdateClientDocuments: (clientId: string, documents: string[]) => void;
  onUpdateClientNotes: (clientId: string, notes: string) => void;
  onUpdateClientPrivateNotes?: (clientId: string, privateNotes: string) => void;
  onUpdateClientScans?: (clientId: string, scans: {name: string, dataUrl: string, date: string}[]) => void;
  initialTab?: string;
}

const DOCUMENT_OPTIONS = [
  'Aadhaar Card',
  'PAN Card',
  'Sale Deed',
  'Mutation Copy',
  'Tax Receipt',
  'Power of Attorney',
  'FIR Copy',
  'Affidavit'
];

export default function ClientDetailsView({
  client,
  hearings,
  payments,
  onNavigateBack,
  onNavigateToEdit,
  onAddHearing,
  onUpdateHearingStatus,
  onDeleteHearing,
  onAddPayment,
  onDeletePayment,
  onUpdateClientDocuments,
  onUpdateClientNotes,
  onUpdateClientPrivateNotes,
  onUpdateClientScans,
  initialTab = 'info'
}: ClientDetailsViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // States for Adding Hearings
  const [showAddHearing, setShowAddHearing] = useState(false);
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('10:30');
  const [courtNumber, setCourtNumber] = useState('');
  const [hearingNotes, setHearingNotes] = useState('');

  // States for Adding Fee Payments
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentType, setPaymentType] = useState<'Advance' | 'Installment' | 'Final'>('Installment');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Simulated Document Photo Uploads
  const [uploadedPhotos, setUploadedPhotos] = useState<{name: string, dataUrl: string, date: string}[]>(client.scans || []);
  const [uploadError, setUploadError] = useState('');

  const [previewIdx, setPreviewIdx] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setUploadedPhotos(client.scans || []);
  }, [client.id, client.scans]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewIdx(null);
        setShowDeleteConfirm(false);
      } else if (e.key === 'ArrowRight' && previewIdx !== null && uploadedPhotos.length > 1) {
        setPreviewIdx((previewIdx + 1) % uploadedPhotos.length);
        setShowDeleteConfirm(false);
      } else if (e.key === 'ArrowLeft' && previewIdx !== null && uploadedPhotos.length > 1) {
        setPreviewIdx((previewIdx - 1 + uploadedPhotos.length) % uploadedPhotos.length);
        setShowDeleteConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIdx, uploadedPhotos]);

  // Web Speech API Notes Dictation States
  const [isRecording, setIsRecording] = useState(false);
  const [noteText, setNoteText] = useState(client.notes || '');
  const [recognition, setRecognition] = useState<any>(null);

  // Advocate's Private Notes States
  const [privateNotesText, setPrivateNotesText] = useState(client.privateNotes || '');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    setNoteText(client.notes || '');
  }, [client]);

  useEffect(() => {
    setPrivateNotesText(client.privateNotes || '');
    setSaveStatus('idle');
  }, [client.id, client.privateNotes]);

  useEffect(() => {
    if (privateNotesText === (client.privateNotes || '')) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        if (onUpdateClientPrivateNotes) {
          await onUpdateClientPrivateNotes(client.id, privateNotesText);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Failed to autosave private notes:', err);
        setSaveStatus('idle');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [privateNotesText, client.id, onUpdateClientPrivateNotes]);

  const handlePrivateNotesBlur = async () => {
    if (privateNotesText !== (client.privateNotes || '')) {
      setSaveStatus('saving');
      try {
        if (onUpdateClientPrivateNotes) {
          await onUpdateClientPrivateNotes(client.id, privateNotesText);
          setSaveStatus('saved');
        }
      } catch (err) {
        console.error('Failed to save private notes on blur:', err);
        setSaveStatus('idle');
      }
    }
  };

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN'; // Indian-English works amazingly well for Indian legal dialects!

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setNoteText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error', err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech-to-Text is not supported on this browser or iframe. Please try in Chrome or Edge in a new tab.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter client-specific hearings & payments
  const clientHearings = hearings.filter(h => h.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first
  const clientPayments = payments.filter(p => p.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculations
  const pendingFee = client.fee - client.advance;

  // Sync checklist changes
  const handleDocCheckboxChange = (docName: string) => {
    let updatedDocs = [...client.documents];
    if (updatedDocs.includes(docName)) {
      updatedDocs = updatedDocs.filter(d => d !== docName);
    } else {
      updatedDocs.push(docName);
    }
    onUpdateClientDocuments(client.id, updatedDocs);
  };

  const handleSaveNotes = () => {
    onUpdateClientNotes(client.id, noteText);
    alert('Case notes saved successfully to client registry.');
  };

  const handleHearingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hearingDate) return;

    onAddHearing({
      clientId: client.id,
      clientName: client.name,
      date: hearingDate,
      time: hearingTime || undefined,
      courtNumber: courtNumber.trim() || undefined,
      status: 'Pending',
      notes: hearingNotes.trim()
    });

    // Reset Form
    setHearingDate('');
    setHearingTime('10:30');
    setCourtNumber('');
    setHearingNotes('');
    setShowAddHearing(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(paymentAmount);
    if (!amountVal || !paymentDate) return;

    onAddPayment({
      clientId: client.id,
      clientName: client.name,
      amount: amountVal,
      date: paymentDate,
      type: paymentType,
      notes: paymentNotes.trim()
    });

    // Reset Form
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentType('Installment');
    setPaymentNotes('');
    setShowAddPayment(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 safety
      setUploadError('File size is too large. Limit is 2MB for browser persistence.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        const newPhoto = {
          name: file.name,
          dataUrl: base64Url,
          date: getLocalDateString()
        };
        const nextPhotos = [newPhoto, ...uploadedPhotos];
        setUploadedPhotos(nextPhotos);
        if (onUpdateClientScans) {
          try {
            await onUpdateClientScans(client.id, nextPhotos);
          } catch (err) {
            console.error('Failed to save upload scans reference:', err);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (idx: number) => {
    const nextPhotos = uploadedPhotos.filter((_, i) => i !== idx);
    setUploadedPhotos(nextPhotos);
    if (onUpdateClientScans) {
      try {
        await onUpdateClientScans(client.id, nextPhotos);
      } catch (err) {
        console.error('Failed to sync deleted scan:', err);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const parseHearingDetails = (h: Hearing) => {
    const rawNotes = h.notes || '';
    let purpose = `${client.caseType} Proceeding`;
    let notes = '';

    // Check if the note contains a separator like a colon, semi-colon, dash, or newline
    const separators = ['\n', ' - ', ':', '—'];
    let found = false;
    for (const sep of separators) {
      if (rawNotes.includes(sep)) {
        const parts = rawNotes.split(sep);
        const firstPart = parts[0].trim();
        const secondPart = parts.slice(1).join(sep).trim();
        if (firstPart && secondPart) {
          purpose = firstPart;
          notes = secondPart;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      if (rawNotes.length > 0 && rawNotes.length < 40) {
        purpose = rawNotes;
        notes = 'No additional notes.';
      } else if (rawNotes.length >= 40) {
        purpose = `${client.caseType} Proceeding`;
        notes = rawNotes;
      } else {
        purpose = `${client.caseType} Hearing`;
        notes = 'No notes provided.';
      }
    }

    return { purpose, notes };
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl border border-slate-700/60 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{client.name}</h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pendingFee > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'}`}>
                {pendingFee > 0 ? 'Due' : 'Settled'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{client.caseNumber || 'NO CASE REGISTERED'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToEdit(client)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white text-slate-300 font-medium rounded-xl text-xs flex items-center gap-2 transition-all"
          >
            <Edit className="h-4 w-4 text-amber-500" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex overflow-x-auto gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800/80 no-scrollbar">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            activeTab === 'info' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
          }`}
        >
          Case File Info
        </button>
        <button
          onClick={() => setActiveTab('hearings')}
          className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'hearings' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
          }`}
        >
          Hearing History ({clientHearings.length})
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'fees' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
          }`}
        >
          Fee Ledger (₹{pendingFee})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'documents' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
          }`}
        >
          Checklist & Scans
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'notes' ? 'bg-amber-500 text-slate-950 font-semibold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
          }`}
        >
          Dictate Notes
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 min-h-[400px]">
        
        {/* Tab 1: CASE FILE INFO */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Case Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-850/50 border border-slate-800/60 p-5 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Type of Case</span>
                    <span className="font-semibold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/60 inline-block text-xs">{client.caseType}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Jurisdiction Court</span>
                    <span className="font-medium text-slate-200 text-sm flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-amber-500 shrink-0" />
                      {client.court}
                    </span>
                  </div>
                  <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Next Hearing Date</span>
                    <span className="font-semibold text-amber-400 text-sm flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0" />
                      {formatDate(client.nextDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-3">Case Background</h3>
                <div className="bg-slate-850/50 border border-slate-800/60 p-5 rounded-2xl min-h-[120px]">
                  {client.notes ? (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{client.notes}</p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No background logged for this client record. Edit client profile to add statements.</p>
                  )}
                </div>
              </div>

              {/* Advocate's Private Notes Section */}
              <div className="space-y-3 pt-4 border-t border-slate-700/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                        <Lock className="h-4 w-4" />
                      </span>
                      Advocate's Private Notes
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Only visible to you. These notes are never shared with clients.
                    </p>
                  </div>
                  
                  {/* Autosave status badge */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                    {saveStatus === 'saving' && (
                      <span className="flex items-center gap-1 text-amber-400 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        Saving...
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        Saved ✓
                      </span>
                    )}
                    {saveStatus === 'idle' && (
                      <span className="text-slate-500">
                        Ready
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    rows={6}
                    value={privateNotesText}
                    onChange={(e) => setPrivateNotesText(e.target.value)}
                    onBlur={handlePrivateNotesBlur}
                    placeholder="Judge is strict regarding adjournments. Prepare affidavit before next date..."
                    className="w-full bg-slate-900/40 border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 outline-none text-slate-200 p-4 rounded-2xl text-xs leading-relaxed transition-all placeholder:text-slate-600 resize-y min-h-[120px]"
                  />
                  <div className="absolute bottom-3 right-3 text-[9px] text-slate-600 select-none group-hover:text-slate-500 transition-colors">
                    Drafting Pad
                  </div>
                </div>
              </div>

              {/* Hearing Timeline Section */}
              <div className="space-y-4 pt-4 border-t border-slate-700/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4.5 w-4.5 text-amber-400" />
                    Hearing Timeline
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                    {clientHearings.length} Sessions
                  </span>
                </div>

                {clientHearings.length === 0 ? (
                  <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl text-center text-xs text-slate-500 italic flex flex-col items-center justify-center">
                    <Calendar className="h-8 w-8 text-slate-700 mb-2" />
                    <p>No history of hearings logged for this client.</p>
                    <button 
                      onClick={() => setActiveTab('hearings')}
                      className="text-amber-500 hover:underline mt-1 font-semibold text-[11px]"
                    >
                      Schedule Hearing
                    </button>
                  </div>
                ) : (
                  <div className="relative border-l border-slate-700/60 ml-3.5 pl-6 space-y-6 pt-2">
                    {clientHearings.map((hearing) => {
                      const { purpose, notes } = parseHearingDetails(hearing);
                      const displayStatus = hearing.status === 'Pending' ? 'Upcoming' : hearing.status;
                      const statusColorClass = 
                        hearing.status === 'Completed' ? 'bg-emerald-500' :
                        hearing.status === 'Adjourned' ? 'bg-rose-500' : 'bg-amber-500';
                      
                      const badgeColorClass = 
                        hearing.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        hearing.status === 'Adjourned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20';

                      return (
                        <div key={hearing.id} className="relative group">
                          {/* Chronological Vertical Dot */}
                          <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-slate-950 ${statusColorClass} ${hearing.status === 'Pending' ? 'animate-pulse' : ''}`} />

                          <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl space-y-3 transition-all shadow-md relative overflow-hidden">
                            {/* Accent highlight strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColorClass}`} />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-1.5">
                              <span className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                {formatDate(hearing.date)}
                                {hearing.time && (
                                  <span className="text-xs text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 font-medium">
                                    {hearing.time}
                                  </span>
                                )}
                              </span>
                              
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${badgeColorClass}`}>
                                Status: {displayStatus}
                              </span>
                            </div>

                            <div className="border-t border-slate-800/80 pt-3 pl-1.5 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Purpose</span>
                                  <span className="font-semibold text-slate-200 text-xs bg-slate-950/30 px-2 py-1 rounded border border-slate-850 inline-block">{purpose}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Court Name</span>
                                  <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                                    <Scale className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                    {client.court} {hearing.courtNumber ? `(${hearing.courtNumber})` : ''}
                                  </span>
                                </div>
                              </div>

                              {notes && (
                                <div className="pt-2.5 border-t border-slate-850/60">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Notes</span>
                                  <p className="text-xs text-slate-400 bg-slate-950/20 p-3 rounded-xl border border-slate-850/60 leading-relaxed italic whitespace-pre-line">
                                    {notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Client Particulars</h3>
                <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Phone className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Phone Number</span>
                      <a href={`tel:${client.phone}`} className="text-sm text-white hover:text-amber-400 font-medium transition-colors">{client.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-slate-800/60 pt-3">
                    <MapPin className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Village / City</span>
                      <span className="text-slate-200">{client.village}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-slate-800/60 pt-3">
                    <Clock className="h-4.5 w-4.5 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Created On</span>
                      <span className="text-slate-400">{formatDate(client.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee overview on Sidebar */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Overview</h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Agreed Fee:</span>
                  <span className="text-white font-semibold">₹{client.fee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400">Advance Paid:</span>
                  <span className="text-emerald-400 font-semibold">₹{client.advance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-slate-300 font-medium">Balance Due:</span>
                  <span className={`font-bold ${pendingFee > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>₹{pendingFee.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: HEARING HISTORY & TIMELINE */}
        {activeTab === 'hearings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Hearing Logs</h3>
              <button
                onClick={() => setShowAddHearing(!showAddHearing)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                Schedule Hearing
              </button>
            </div>

            {showAddHearing && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleHearingSubmit}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hearing Date</label>
                  <input
                    type="date"
                    required
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-2 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hearing Time</label>
                  <input
                    type="time"
                    value={hearingTime}
                    onChange={(e) => setHearingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-2 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Court / Room No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Court Room 3"
                    value={courtNumber}
                    onChange={(e) => setCourtNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-2 rounded-lg text-xs placeholder:text-slate-600"
                  />
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Hearing Notes (Agenda / Results)</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state target goals, arguments, or the date's legal orders..."
                    value={hearingNotes}
                    onChange={(e) => setHearingNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-3 rounded-lg text-xs placeholder:text-slate-600 resize-none"
                  />
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddHearing(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition-all flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" /> Save Entry
                  </button>
                </div>
              </motion.form>
            )}

            {/* Timeline Vertical */}
            {clientHearings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Calendar className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-sm">No trials logged.</p>
                <p className="text-xs text-slate-500 mt-1">Add a hearing using the button above to start your trial history log.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-700/60 ml-3.5 pl-6 space-y-6 pt-2">
                {clientHearings.map((hearing) => {
                  const { purpose, notes } = parseHearingDetails(hearing);
                  const displayStatus = hearing.status === 'Pending' ? 'Upcoming' : hearing.status;
                  const statusColorClass = 
                    hearing.status === 'Completed' ? 'bg-emerald-500' :
                    hearing.status === 'Adjourned' ? 'bg-rose-500' : 'bg-amber-500';
                  
                  const badgeColorClass = 
                    hearing.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    hearing.status === 'Adjourned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <div key={hearing.id} className="relative group">
                      {/* Chronological Vertical Dot */}
                      <span className={`absolute -left-[31px] top-1.5 h-4.5 w-4.5 rounded-full border-2 border-slate-950 ${statusColorClass} ${hearing.status === 'Pending' ? 'animate-pulse' : ''}`} />

                      <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 p-5 rounded-2xl space-y-4 transition-all shadow-md relative overflow-hidden">
                        {/* Accent highlight strip */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColorClass}`} />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-1.5">
                          <span className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            {formatDate(hearing.date)}
                            {hearing.time && (
                              <span className="text-xs text-slate-400 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 font-medium">
                                {hearing.time}
                              </span>
                            )}
                          </span>
                          
                          {/* Status Dropdown & Action row inside timeline */}
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={hearing.status}
                              onChange={(e) => onUpdateHearingStatus(hearing.id, e.target.value as any)}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg outline-none border transition-all ${
                                hearing.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                hearing.status === 'Adjourned' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/20 focus:border-amber-500'
                              }`}
                            >
                              <option value="Pending" className="bg-slate-900 text-white">Upcoming (Pending)</option>
                              <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                              <option value="Adjourned" className="bg-slate-900 text-white">Adjourned</option>
                            </select>
                            
                            <button
                              onClick={() => {
                                if (confirm('Delete this hearing entry from history logs?')) onDeleteHearing(hearing.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                              title="Purge hearing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-slate-800/80 pt-3 pl-1.5 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Purpose</span>
                              <span className="font-semibold text-slate-200 text-xs bg-slate-950/30 px-2 py-1 rounded border border-slate-850 inline-block">{purpose}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Court Name</span>
                              <span className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                                <Scale className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                {client.court} {hearing.courtNumber ? `(${hearing.courtNumber})` : ''}
                              </span>
                            </div>
                          </div>

                          {notes && (
                            <div className="pt-2.5 border-t border-slate-850/60">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">Notes</span>
                              <p className="text-xs text-slate-400 bg-slate-950/20 p-3 rounded-xl border border-slate-850/60 leading-relaxed italic whitespace-pre-line">
                                {notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: FEE LEDGER & PAYMENTS */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Total Retainer Fee</span>
                <span className="text-2xl font-bold text-white">₹{client.fee.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Total Collected</span>
                <span className="text-2xl font-bold text-emerald-400">₹{client.advance.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-4.5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Outstanding Receivable</span>
                <span className="text-2xl font-bold text-amber-400">₹{pendingFee.toLocaleString('en-IN')}</span>
                <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-500/30" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Fee Receipt Ledger</h3>
              {pendingFee > 0 && (
                <button
                  onClick={() => setShowAddPayment(!showAddPayment)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Record Payment
                </button>
              )}
            </div>

            {showAddPayment && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handlePaymentSubmit}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Payment Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3000"
                    max={pendingFee}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-2 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Date Received</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-2 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Installment Category</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-2 rounded-lg text-xs"
                  >
                    <option value="Installment">Installment</option>
                    <option value="Advance">Advance Adjustment</option>
                    <option value="Final">Final Clearance</option>
                  </select>
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Payment Description / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Received via cash / UPI in court chamber..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 outline-none text-white p-3 rounded-lg text-xs placeholder:text-slate-600"
                  />
                </div>

                <div className="md:col-span-3 flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors border border-slate-700/40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs transition-all flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" /> Commit Payment
                  </button>
                </div>
              </motion.form>
            )}

            {/* List payments */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Transaction History ({clientPayments.length})</span>
                <span>Type & Amount</span>
              </div>
              
              {clientPayments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  No payment ledger details recorded yet. Use 'Record Payment' to credit fees.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/40">
                  {clientPayments.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-800/20 transition-colors">
                      <div>
                        <div className="font-semibold text-white">{formatDate(p.date)}</div>
                        {p.notes && <p className="text-[11px] text-slate-400 mt-1">{p.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-emerald-400 block text-sm">₹{p.amount.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-500 uppercase">{p.type}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction ledger record? This will adjust outstanding balance totals.')) {
                              onDeletePayment(p.id);
                            }
                          }}
                          className="text-slate-600 hover:text-rose-400 p-1 rounded-md transition-colors"
                          title="Delete transaction record"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: DOCUMENTS CHECKLIST & SCANS */}
        {activeTab === 'documents' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Checklist details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Documents Checklist</h3>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                    {client.documents.length} / {DOCUMENT_OPTIONS.length} Collected
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Select and verify physical documents collected in chamber for trial preparation. Missing records will highlight alerts in directory.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {DOCUMENT_OPTIONS.map((doc) => {
                    const isChecked = client.documents.includes(doc);
                    return (
                      <label 
                        key={doc}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked 
                            ? 'bg-amber-500/5 border-amber-500/30 text-white' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDocCheckboxChange(doc)}
                          className="h-4 w-4 rounded text-amber-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer accent-amber-500 shrink-0"
                        />
                        <span className="text-xs font-medium">{doc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Document Scanning Uploads (Phase 2) */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-700/40 lg:pl-8 pt-6 lg:pt-0">
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Case File Document Scans</h3>
                <p className="text-xs text-slate-400">
                  Upload PDF, Photo Scans, or court orders to attach digital images to this client profile (Max 2MB).
                </p>

                {uploadError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    {uploadError}
                  </div>
                )}

                {/* Upload Trigger Area */}
                <div className="relative border-2 border-dashed border-slate-700/60 rounded-2xl p-6 hover:border-amber-500/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Camera className="h-8 w-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2.5" />
                  <span className="text-xs font-semibold text-white">Select Photo or Order Scan</span>
                  <span className="text-[10px] text-slate-500 mt-1">Drag-and-drop or tap to snap from mobile camera</span>
                </div>

                {/* Uploaded List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Attached Scans ({uploadedPhotos.length})</h4>
                  
                  {uploadedPhotos.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center text-xs text-slate-500 italic">
                      No photographic files uploaded yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                      {uploadedPhotos.map((photo, i) => (
                        <div 
                          key={i} 
                          onClick={() => setPreviewIdx(i)}
                          className="relative bg-slate-900 border border-slate-800 p-2 rounded-xl group overflow-hidden cursor-pointer hover:border-amber-500/30 transition-all"
                        >
                          <img 
                            src={photo.dataUrl} 
                            alt={photo.name} 
                            className="w-full h-24 object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-2 bg-slate-950/85 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-center text-[9px]">
                            <span className="text-white truncate max-w-full font-medium">{photo.name}</span>
                            <span className="text-slate-500">{photo.date}</span>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this attached scan permanently?')) {
                                  await handleDeletePhoto(i);
                                }
                              }}
                              className="bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white px-2 py-0.5 rounded transition-all text-[8px] cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 5: ADVANCED NOTES & AI VOICE NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider">AI Voice Notes Recorder</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record verbal thoughts, hearing summaries, or client testimonials. System updates the notes log.
                </p>
              </div>

              {/* Mic buttons */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all ${
                  isRecording 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-amber-400'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4.5 w-4.5" />
                    Listening (Tap to stop)
                  </>
                ) : (
                  <>
                    <Mic className="h-4.5 w-4.5" />
                    Start Voice Dictation
                  </>
                )}
              </button>
            </div>

            {/* Note text field */}
            <div className="space-y-3 relative">
              <textarea
                rows={10}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Click 'Start Voice Dictation' to dictate your thoughts, or type manually inside this field..."
                className="w-full bg-slate-900/60 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none text-white p-5 rounded-2xl text-sm transition-all placeholder:text-slate-600 leading-relaxed resize-none"
              />
              
              {isRecording && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full text-[10px] text-rose-400 font-semibold uppercase tracking-wider animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Rec Mode Active
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setNoteText(client.notes || '')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors border border-slate-700/40"
              >
                Reset Changes
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Save className="h-4 w-4" /> Save Chamber Notes
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Fullscreen Preview Modal */}
      {previewIdx !== null && uploadedPhotos[previewIdx] && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 md:p-10 animate-fade-in"
          onClick={() => {
            if (!isDeleting && !showDeleteConfirm) {
              setPreviewIdx(null);
            }
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setPreviewIdx(null);
              setShowDeleteConfirm(false);
            }}
            className="absolute top-4 right-4 z-50 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 p-2.5 rounded-full border border-slate-800 transition-all cursor-pointer"
            title="Close (ESC)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {uploadedPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIdx((previewIdx - 1 + uploadedPhotos.length) % uploadedPhotos.length);
                setShowDeleteConfirm(false);
              }}
              className="absolute left-4 sm:left-6 md:left-10 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 p-3 rounded-full border border-slate-800 transition-all cursor-pointer"
              title="Previous"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {uploadedPhotos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewIdx((previewIdx + 1) % uploadedPhotos.length);
                setShowDeleteConfirm(false);
              }}
              className="absolute right-4 sm:right-6 md:right-10 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 p-3 rounded-full border border-slate-800 transition-all cursor-pointer"
              title="Next"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Centered Image Container */}
          <div 
            className="relative flex flex-col items-center max-w-4xl w-full h-full justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={uploadedPhotos[previewIdx].dataUrl}
              alt={uploadedPhotos[previewIdx].name}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-slate-800/60"
              referrerPolicy="no-referrer"
            />
            
            {/* Metadata & Actions Panel */}
            <div className="w-full max-w-lg mt-5 bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left min-w-0">
                <div className="text-xs font-semibold text-white truncate">{uploadedPhotos[previewIdx].name}</div>
                <div className="text-[10px] text-slate-400 mt-1">Uploaded: {uploadedPhotos[previewIdx].date}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Trash className="h-3.5 w-3.5" />
                  Delete Scan
                </button>
              </div>
            </div>

            {/* Custom confirmation overlay dialog */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm rounded-2xl p-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                  <div className="bg-rose-500/10 text-rose-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-rose-500/20">
                    <Trash className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-semibold text-white">Delete this attached scan permanently?</h4>
                    <p className="text-xs text-slate-400">This action cannot be undone and will remove the document reference.</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors border border-slate-700/40 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={async () => {
                        setIsDeleting(true);
                        try {
                          const updated = uploadedPhotos.filter((_, i) => i !== previewIdx);
                          setUploadedPhotos(updated);
                          
                          if (onUpdateClientScans) {
                            await onUpdateClientScans(client.id, updated);
                          }
                          
                          setShowDeleteConfirm(false);
                          if (updated.length === 0) {
                            setPreviewIdx(null);
                          } else {
                            setPreviewIdx(Math.max(0, previewIdx - 1));
                          }
                        } catch (err) {
                          console.error('Error deleting scan:', err);
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isDeleting ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
