import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { clientService } from '../services/clientService';
import { FeePayment } from '../types';

export function usePaymentActions(
  paymentsHook: any,
  clientsHook: any
) {
  const { currentUser, isDemo } = useAuth();

  const handleAddPayment = async (paymentData: any) => {
    try {
      if (isDemo) {
        const newId = `p_${Date.now()}`;
        const payload: FeePayment = {
          id: newId,
          ...paymentData
        };
        paymentsHook.addPaymentLocal(payload);
      } else {
        const createdPayment = await paymentService.createPayment(paymentData, currentUser.uid);
        paymentsHook.setPayments([createdPayment, ...paymentsHook.payments]);
      }

      // Increment Client Advance/Pending parameters
      const client = clientsHook.clients.find((c: any) => c.id === paymentData.clientId);
      if (client) {
        const newAdvance = client.advance + paymentData.amount;
        clientsHook.updateClientLocal(client.id, {
          advance: newAdvance,
          pending: client.fee - newAdvance
        });

        if (!isDemo) {
          await clientService.updateClient(client.id, {
            advance: newAdvance,
            pending: client.fee - newAdvance
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const payment = paymentsHook.payments.find((p: any) => p.id === paymentId);
      if (!payment) return;

      paymentsHook.deletePaymentLocal(paymentId);

      if (!isDemo) {
        await paymentService.deletePayment(paymentId);
      }

      // Decrement Client Advance/Pending parameters
      const client = clientsHook.clients.find((c: any) => c.id === payment.clientId);
      if (client) {
        const newAdvance = Math.max(0, client.advance - payment.amount);
        clientsHook.updateClientLocal(client.id, {
          advance: newAdvance,
          pending: client.fee - newAdvance
        });

        if (!isDemo) {
          await clientService.updateClient(client.id, {
            advance: newAdvance,
            pending: client.fee - newAdvance
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    handleAddPayment,
    handleDeletePayment,
  };
}
