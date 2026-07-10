import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '../types';
import { clientService } from '../services/clientService';
import { INITIAL_MOCK_CLIENTS } from '../data/mockData';

export function useClients() {
  const { currentUser, isDemo, authChecked } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authChecked || !currentUser) {
      setClients([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isDemo) {
          const localClients = localStorage.getItem('dc_clients');
          if (localClients) {
            setClients(JSON.parse(localClients));
          } else {
            setClients(INITIAL_MOCK_CLIENTS);
            localStorage.setItem('dc_clients', JSON.stringify(INITIAL_MOCK_CLIENTS));
          }
        } else {
          const loaded = await clientService.getClients(currentUser.uid);
          setClients(loaded);
        }
      } catch (err: any) {
        console.error('Error loading clients:', err);
        if (err.message && err.message.includes('permission')) {
          setError('Database permissions error. We have just updated and successfully deployed the Firestore database security rules! If you are still seeing this, please click "Leave Chamber" at the bottom left to Sign Out and then Sign In again to refresh your security credentials.');
        } else {
          setError(err.message || 'Error occurred while loading clients database.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser, isDemo, authChecked]);

  const persistClientsState = (updatedClients: Client[]) => {
    setClients(updatedClients);
    if (isDemo) {
      localStorage.setItem('dc_clients', JSON.stringify(updatedClients));
    }
  };

  const addClientLocal = (newClient: Client) => {
    persistClientsState([newClient, ...clients]);
  };

  const updateClientLocal = (clientId: string, clientData: Partial<Client>) => {
    const updated = clients.map(c => {
      if (c.id === clientId) {
        const nextFee = clientData.fee !== undefined ? clientData.fee : c.fee;
        const nextAdvance = clientData.advance !== undefined ? clientData.advance : c.advance;
        return {
          ...c,
          ...clientData,
          pending: nextFee - nextAdvance
        };
      }
      return c;
    });
    persistClientsState(updated);
  };

  const deleteClientLocal = (clientId: string) => {
    const updated = clients.filter(c => c.id !== clientId);
    persistClientsState(updated);
  };

  const updateClientDocuments = async (clientId: string, documents: string[]) => {
    try {
      const updated = clients.map(c => {
        if (c.id === clientId) return { ...c, documents };
        return c;
      });
      persistClientsState(updated);

      if (!isDemo) {
        await clientService.updateClientDocuments(clientId, documents);
      }
    } catch (err) {
      console.error('Error updating documents:', err);
      throw err;
    }
  };

  const updateClientNotes = async (clientId: string, notes: string) => {
    try {
      const updated = clients.map(c => {
        if (c.id === clientId) return { ...c, notes };
        return c;
      });
      persistClientsState(updated);

      if (!isDemo) {
        await clientService.updateClientNotes(clientId, notes);
      }
    } catch (err) {
      console.error('Error updating notes:', err);
      throw err;
    }
  };

  const updateClientPrivateNotes = async (clientId: string, privateNotes: string) => {
    try {
      const updated = clients.map(c => {
        if (c.id === clientId) return { ...c, privateNotes };
        return c;
      });
      persistClientsState(updated);

      if (!isDemo) {
        await clientService.updateClient(clientId, { privateNotes });
      }
    } catch (err) {
      console.error('Error updating private notes:', err);
      throw err;
    }
  };

  const updateClientScans = async (clientId: string, scans: {name: string, dataUrl: string, date: string}[]) => {
    try {
      const updated = clients.map(c => {
        if (c.id === clientId) return { ...c, scans };
        return c;
      });
      persistClientsState(updated);

      if (!isDemo) {
        await clientService.updateClient(clientId, { scans });
      }
    } catch (err) {
      console.error('Error updating client scans:', err);
      throw err;
    }
  };

  return {
    clients,
    setClients,
    loading,
    error,
    setError,
    addClientLocal,
    updateClientLocal,
    deleteClientLocal,
    updateClientDocuments,
    updateClientNotes,
    updateClientPrivateNotes,
    updateClientScans,
    persistClientsState
  };
}
export type UseClientsResult = ReturnType<typeof useClients>;
