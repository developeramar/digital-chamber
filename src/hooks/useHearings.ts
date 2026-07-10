import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Hearing } from '../types';
import { hearingService } from '../services/hearingService';
import { INITIAL_MOCK_HEARINGS } from '../data/mockData';

export function useHearings() {
  const { currentUser, isDemo, authChecked } = useAuth();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authChecked || !currentUser) {
      setHearings([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isDemo) {
          const localHearings = localStorage.getItem('dc_hearings');
          if (localHearings) {
            setHearings(JSON.parse(localHearings));
          } else {
            setHearings(INITIAL_MOCK_HEARINGS);
            localStorage.setItem('dc_hearings', JSON.stringify(INITIAL_MOCK_HEARINGS));
          }
        } else {
          const loaded = await hearingService.getHearings(currentUser.uid);
          setHearings(loaded);
        }
      } catch (err: any) {
        console.error('Error loading hearings:', err);
        setError(err.message || 'Error occurred while loading hearings database.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser, isDemo, authChecked]);

  const persistHearingsState = (updatedHearings: Hearing[]) => {
    setHearings(updatedHearings);
    if (isDemo) {
      localStorage.setItem('dc_hearings', JSON.stringify(updatedHearings));
    }
  };

  const addHearingLocal = (newHearing: Hearing) => {
    persistHearingsState([newHearing, ...hearings]);
  };

  const updateHearingStatusLocal = (hearingId: string, status: 'Pending' | 'Completed' | 'Adjourned') => {
    const updated = hearings.map(h => {
      if (h.id === hearingId) return { ...h, status };
      return h;
    });
    persistHearingsState(updated);
  };

  const deleteHearingLocal = (hearingId: string) => {
    const updated = hearings.filter(h => h.id !== hearingId);
    persistHearingsState(updated);
  };

  const updateHearingStatus = async (hearingId: string, status: 'Pending' | 'Completed' | 'Adjourned') => {
    try {
      updateHearingStatusLocal(hearingId, status);
      if (!isDemo) {
        await hearingService.updateHearingStatus(hearingId, status);
      }
    } catch (err) {
      console.error('Error updating hearing status:', err);
      throw err;
    }
  };

  const deleteHearing = async (hearingId: string) => {
    try {
      deleteHearingLocal(hearingId);
      if (!isDemo) {
        await hearingService.deleteHearing(hearingId);
      }
    } catch (err) {
      console.error('Error deleting hearing:', err);
      throw err;
    }
  };

  return {
    hearings,
    setHearings,
    loading,
    error,
    addHearingLocal,
    updateHearingStatusLocal,
    deleteHearingLocal,
    updateHearingStatus,
    deleteHearing,
    persistHearingsState
  };
}
export type UseHearingsResult = ReturnType<typeof useHearings>;
