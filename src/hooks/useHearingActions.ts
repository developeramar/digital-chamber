import { useAuth } from '../contexts/AuthContext';
import { hearingService } from '../services/hearingService';
import { clientService } from '../services/clientService';
import { Hearing } from '../types';
import { normalizeDateStr } from '../utils/dateUtils';

export function useHearingActions(
  hearingsHook: any,
  clientsHook: any
) {
  const { currentUser, isDemo } = useAuth();

  const handleAddHearing = async (hearingData: any) => {
    try {
      if (isDemo) {
        const newId = `h_${Date.now()}`;
        const payload: Hearing = {
          id: newId,
          ...hearingData
        };
        hearingsHook.addHearingLocal(payload);
      } else {
        const createdHearing = await hearingService.createHearing(hearingData, currentUser.uid);
        hearingsHook.setHearings([createdHearing, ...hearingsHook.hearings]);
      }

      // Update client's nextDate automatically if this hearing date is in the future!
      const client = clientsHook.clients.find((c: any) => c.id === hearingData.clientId);
      if (client) {
        const normalizedClientNextDate = normalizeDateStr(client.nextDate);
        const normalizedNewHearingDate = normalizeDateStr(hearingData.date);
        
        // If the newly added hearing date is newer than or same as current client date, update nextDate
        if (normalizedNewHearingDate >= normalizedClientNextDate) {
          clientsHook.updateClientLocal(client.id, { nextDate: normalizedNewHearingDate });
          
          if (!isDemo) {
            await clientService.updateClient(client.id, { nextDate: normalizedNewHearingDate });
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    handleAddHearing,
    handleUpdateHearingStatus: hearingsHook.updateHearingStatus,
    handleDeleteHearing: hearingsHook.deleteHearing,
  };
}
