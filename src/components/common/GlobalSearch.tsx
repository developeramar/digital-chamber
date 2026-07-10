import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, FileText, Landmark, X } from 'lucide-react';
import { Client } from '../../types';

interface GlobalSearchProps {
  clients: Client[];
  onNavigate: (view: string, data?: any) => void;
}

export default function GlobalSearch({ clients, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    const filtered = clients.filter((client) => {
      const nameMatch = client.name?.toLowerCase().includes(lowerQuery);
      const phoneMatch = client.phone?.toLowerCase().includes(lowerQuery);
      const caseNumberMatch = client.caseNumber?.toLowerCase().includes(lowerQuery);
      const caseTypeMatch = client.caseType?.toLowerCase().includes(lowerQuery);
      const courtMatch = client.court?.toLowerCase().includes(lowerQuery);
      
      return nameMatch || phoneMatch || caseNumberMatch || caseTypeMatch || courtMatch;
    });

    setResults(filtered.slice(0, 5)); // Limit to top 5 results for speed and cleanliness
  }, [query, clients]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (clientId: string) => {
    onNavigate('client-details', { clientId, activeTab: 'info' });
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative w-full" id="global-search-container">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search client, case, phone..."
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 text-xs text-slate-100 placeholder-slate-500 rounded-xl py-2 pl-9 pr-8 outline-none transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {results.length > 0 ? (
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-slate-950/40 border-b border-slate-800/40">
                Matching Case Files
              </div>
              <ul className="divide-y divide-slate-800/40">
                {results.map((client) => (
                  <li key={client.id}>
                    <button
                      onClick={() => handleSelectClient(client.id)}
                      className="w-full text-left px-3 py-2.5 hover:bg-slate-800/40 flex flex-col gap-1 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-white group-hover:text-amber-400 transition-colors">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          {client.name}
                        </div>
                        {client.caseNumber && (
                          <span className="text-[9px] font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/60 text-slate-400">
                            {client.caseNumber}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 text-slate-500" />
                            {client.phone}
                          </span>
                        )}
                        {client.caseType && (
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <FileText className="h-2.5 w-2.5 text-slate-500" />
                            {client.caseType}
                          </span>
                        )}
                        {client.court && (
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <Landmark className="h-2.5 w-2.5 text-slate-500" />
                            {client.court}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching client or case records found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
