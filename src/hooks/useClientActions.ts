import { useAuth } from '../contexts/AuthContext';
import { clientService } from '../services/clientService';
import { hearingService } from '../services/hearingService';
import { paymentService } from '../services/paymentService';
import { Client, Hearing, FeePayment } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

export function useClientActions(
  clientsHook: any,
  hearingsHook: any,
  paymentsHook: any,
  navigation: any
) {
  const { currentUser, isDemo } = useAuth();

  const handleSaveClient = async (clientData: any) => {
    try {
      if (navigation.viewParams && navigation.viewParams.editClient) {
        // UPDATE Existing Client
        const clientId = navigation.viewParams.editClient.id;
        
        clientsHook.updateClientLocal(clientId, clientData);

        if (!isDemo) {
          await clientService.updateClient(clientId, {
            ...clientData,
            pending: clientData.fee - clientData.advance
          });
        }
      } else {
        // ADD NEW Client
        if (isDemo) {
          const newId = `c_${Date.now()}`;
          const payload: Client = {
            id: newId,
            lawyerId: currentUser.uid,
            documents: [],
            createdAt: getLocalDateString(),
            ...clientData,
            pending: clientData.fee - clientData.advance
          };

          clientsHook.addClientLocal(payload);
          
          // Simultaneously schedule a hearing for the nextDate
          const firstHearing: Hearing = {
            id: `h_${Date.now()}`,
            clientId: payload.id,
            clientName: payload.name,
            date: payload.nextDate,
            time: '10:30',
            courtNumber: 'Room 1',
            status: 'Pending',
            notes: 'Initial client intake and trial briefing session.'
          };
          hearingsHook.addHearingLocal(firstHearing);

          // Simultaneously record their advance payment as transaction
          if (payload.advance > 0) {
            const firstPayment: FeePayment = {
              id: `p_${Date.now()}`,
              clientId: payload.id,
              clientName: payload.name,
              amount: payload.advance,
              date: payload.createdAt,
              type: 'Advance',
              notes: 'Advance retainer adjustment on case signup.'
            };
            paymentsHook.addPaymentLocal(firstPayment);
          }
        } else {
          // Real Firebase integration via services
          const createdClient = await clientService.createClient(clientData, currentUser.uid);
          clientsHook.setClients([createdClient, ...clientsHook.clients]);

          // Setup initial hearing
          const firstHearingData = {
            clientId: createdClient.id,
            clientName: clientData.name,
            date: clientData.nextDate,
            time: '10:30',
            courtNumber: 'Room 1',
            status: 'Pending' as const,
            notes: 'Initial client intake and trial briefing session.'
          };
          const createdHearing = await hearingService.createHearing(firstHearingData, currentUser.uid);
          hearingsHook.setHearings([createdHearing, ...hearingsHook.hearings]);

          // Setup initial advance payment ledger
          if (clientData.advance > 0) {
            const firstPaymentData = {
              clientId: createdClient.id,
              clientName: clientData.name,
              amount: clientData.advance,
              date: getLocalDateString(),
              type: 'Advance' as const,
              notes: 'Advance retainer adjustment on case signup.'
            };
            const createdPayment = await paymentService.createPayment(firstPaymentData, currentUser.uid);
            paymentsHook.setPayments([createdPayment, ...paymentsHook.payments]);
          }
        }
      }

      alert('Case file saved successfully!');
      navigation.navigateBack();
    } catch (err) {
      console.error(err);
      alert('Error updating case record.');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      // Local state deletions
      clientsHook.deleteClientLocal(clientId);
      const associatedHearings = hearingsHook.hearings.filter((h: any) => h.clientId === clientId);
      const associatedPayments = paymentsHook.payments.filter((p: any) => p.clientId === clientId);

      const nextHearings = hearingsHook.hearings.filter((h: any) => h.clientId !== clientId);
      hearingsHook.persistHearingsState(nextHearings);

      const nextPayments = paymentsHook.payments.filter((p: any) => p.clientId !== clientId);
      paymentsHook.persistPaymentsState(nextPayments);

      // Backend deletion
      if (!isDemo) {
        await clientService.deleteClient(clientId);
        for (const h of associatedHearings) {
          await hearingService.deleteHearing(h.id);
        }
        for (const p of associatedPayments) {
          await paymentService.deletePayment(p.id);
        }
      }

      // If viewing detail screen of deleted client, go back
      if (navigation.currentView === 'client-details' && navigation.viewParams?.clientId === clientId) {
        navigation.navigateToView('client-list');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    handleSaveClient,
    handleDeleteClient,
  };
}
