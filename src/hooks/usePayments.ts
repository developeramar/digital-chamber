import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeePayment } from '../types';
import { paymentService } from '../services/paymentService';
import { INITIAL_MOCK_PAYMENTS } from '../data/mockData';

export function usePayments() {
  const { currentUser, isDemo, authChecked } = useAuth();
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authChecked || !currentUser) {
      setPayments([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isDemo) {
          const localPayments = localStorage.getItem('dc_payments');
          if (localPayments) {
            setPayments(JSON.parse(localPayments));
          } else {
            setPayments(INITIAL_MOCK_PAYMENTS);
            localStorage.setItem('dc_payments', JSON.stringify(INITIAL_MOCK_PAYMENTS));
          }
        } else {
          const loaded = await paymentService.getPayments(currentUser.uid);
          setPayments(loaded);
        }
      } catch (err: any) {
        console.error('Error loading payments:', err);
        setError(err.message || 'Error occurred while loading payments database.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser, isDemo, authChecked]);

  const persistPaymentsState = (updatedPayments: FeePayment[]) => {
    setPayments(updatedPayments);
    if (isDemo) {
      localStorage.setItem('dc_payments', JSON.stringify(updatedPayments));
    }
  };

  const addPaymentLocal = (newPayment: FeePayment) => {
    persistPaymentsState([newPayment, ...payments]);
  };

  const deletePaymentLocal = (paymentId: string) => {
    const updated = payments.filter(p => p.id !== paymentId);
    persistPaymentsState(updated);
  };

  return {
    payments,
    setPayments,
    loading,
    error,
    addPaymentLocal,
    deletePaymentLocal,
    persistPaymentsState
  };
}
export type UsePaymentsResult = ReturnType<typeof usePayments>;
