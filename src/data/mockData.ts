import { Client, Hearing, FeePayment } from '../types';

// Generates tomorrow's and other relative dates easily in YYYY-MM-DD
export const getRelativeDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_MOCK_CLIENTS: Client[] = [
  {
    id: 'mock_c1',
    lawyerId: 'demo_lawyer_123',
    name: 'Ramesh Chand',
    phone: '9876543210',
    village: 'Rampur City',
    caseType: 'Criminal Trial',
    court: 'District Sessions Court',
    caseNumber: 'CR/4021/2025',
    nextDate: getRelativeDateStr(0), // Today
    fee: 25000,
    advance: 10000,
    pending: 15000,
    documents: ['Aadhaar Card', 'PAN Card', 'FIR Copy'],
    notes: 'Alleged theft under IPC Sec 379. FIR lodged at Rampur Police Station.\n\nNext hearing is for cross-examination of prosecution witnesses.',
    privateNotes: 'Judge is strict regarding adjournments. Call witness one day before hearing.',
    createdAt: getRelativeDateStr(-25)
  },
  {
    id: 'mock_c2',
    lawyerId: 'demo_lawyer_123',
    name: 'Kamala Devi',
    phone: '8899776655',
    village: 'Sultanpur Village',
    caseType: 'Family Dispute',
    court: 'Family Court',
    caseNumber: 'FML/204/2026',
    nextDate: getRelativeDateStr(1), // Tomorrow
    fee: 15000,
    advance: 15000,
    pending: 0,
    documents: ['Aadhaar Card', 'PAN Card', 'Marriage Certificate', 'Affidavit'],
    notes: 'Mutual consent divorce petition under Hindu Marriage Act Section 13B.\n\nReconciliation counseling stage is complete. Tomorrow is for final order stage.',
    privateNotes: 'Client is emotional. Handle carefully.',
    createdAt: getRelativeDateStr(-10)
  },
  {
    id: 'mock_c3',
    lawyerId: 'demo_lawyer_123',
    name: 'Satish Kumar',
    phone: '9440123456',
    village: 'Ganeshpur',
    caseType: 'Property Dispute',
    court: 'Chief Judicial Magistrate',
    caseNumber: 'CS/892/2024',
    nextDate: getRelativeDateStr(3), // In 3 days
    fee: 40000,
    advance: 15000,
    pending: 25000,
    documents: ['Sale Deed', 'Mutation Copy', 'Tax Receipt'],
    notes: 'Boundary dispute with neighboring farm owners. Temporary injunction petition is currently active.\n\nDefense has requested an adjournment which we will oppose.',
    privateNotes: 'Client usually delays payment. Opposite counsel may request adjournment.',
    createdAt: getRelativeDateStr(-40)
  }
];

export const INITIAL_MOCK_HEARINGS: Hearing[] = [
  {
    id: 'mock_h1',
    clientId: 'mock_c1',
    clientName: 'Ramesh Chand',
    date: getRelativeDateStr(0),
    time: '10:30',
    courtNumber: 'Room 3',
    status: 'Pending',
    notes: 'Cross-examination of PW-1 and PW-2.'
  },
  {
    id: 'mock_h2',
    clientId: 'mock_c2',
    clientName: 'Kamala Devi',
    date: getRelativeDateStr(1),
    time: '11:45',
    courtNumber: 'Family Court 1',
    status: 'Pending',
    notes: 'Final judgment order declaration.'
  },
  {
    id: 'mock_h3',
    clientId: 'mock_c3',
    date: getRelativeDateStr(-12),
    clientName: 'Satish Kumar',
    status: 'Completed',
    courtNumber: 'Chamber 4',
    time: '14:00',
    notes: 'Interim arguments completed. Injunction maintained.'
  }
];

export const INITIAL_MOCK_PAYMENTS: FeePayment[] = [
  {
    id: 'mock_p1',
    clientId: 'mock_c1',
    clientName: 'Ramesh Chand',
    amount: 10000,
    date: getRelativeDateStr(-20),
    type: 'Advance',
    notes: 'Retainer signup advance received via GooglePay.'
  },
  {
    id: 'mock_p2',
    clientId: 'mock_c2',
    clientName: 'Kamala Devi',
    amount: 10000,
    date: getRelativeDateStr(-9),
    type: 'Advance',
    notes: 'Retainer fee partial payment.'
  },
  {
    id: 'mock_p3',
    clientId: 'mock_c2',
    clientName: 'Kamala Devi',
    amount: 5000,
    date: getRelativeDateStr(-4),
    type: 'Final',
    notes: 'Final settlement clearance. Receipt compiled.'
  },
  {
    id: 'mock_p4',
    clientId: 'mock_c3',
    clientName: 'Satish Kumar',
    amount: 15000,
    date: getRelativeDateStr(-35),
    type: 'Advance',
    notes: 'Agreed case retainer advance received.'
  }
];
