export interface Client {
  id: string;
  lawyerId: string;
  name: string;
  phone: string;
  village: string;
  caseType: string;
  court: string;
  caseNumber?: string;
  nextDate: string; // YYYY-MM-DD
  fee: number;
  advance: number;
  pending: number;
  documents: string[]; // List of documents present/checked
  notes: string;
  privateNotes?: string;
  scans?: {name: string, dataUrl: string, date: string}[];
  createdAt: string;
}

export interface Hearing {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  courtNumber?: string;
  status: 'Pending' | 'Completed' | 'Adjourned';
  notes: string;
}

export interface FeePayment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: 'Advance' | 'Installment' | 'Final';
  notes: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  barCouncilNumber?: string;
  chamberAddress?: string;
  createdAt: string;
}
