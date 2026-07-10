import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Hearing } from '../types';

export const hearingService = {
  async getHearings(uid: string): Promise<Hearing[]> {
    const hearingsSnap = await getDocs(
      query(collection(db, 'hearings'), where('lawyerId', '==', uid))
    );
    const loadedHearings: Hearing[] = [];
    hearingsSnap.forEach((docSnap) => {
      loadedHearings.push({ id: docSnap.id, ...docSnap.data() } as Hearing);
    });
    return loadedHearings;
  },

  async createHearing(hearingData: Partial<Hearing>, uid: string): Promise<Hearing> {
    const addedDoc = await addDoc(collection(db, 'hearings'), {
      lawyerId: uid,
      ...hearingData
    });
    return {
      id: addedDoc.id,
      ...hearingData
    } as Hearing;
  },

  async updateHearingStatus(hearingId: string, status: 'Pending' | 'Completed' | 'Adjourned'): Promise<void> {
    await updateDoc(doc(db, 'hearings', hearingId), { status });
  },

  async deleteHearing(hearingId: string): Promise<void> {
    await deleteDoc(doc(db, 'hearings', hearingId));
  }
};
