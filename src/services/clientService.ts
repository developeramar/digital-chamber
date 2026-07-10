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
import { Client } from '../types';

export const clientService = {
  async getClients(uid: string): Promise<Client[]> {
    const clientsSnap = await getDocs(
      query(collection(db, 'clients'), where('lawyerId', '==', uid))
    );
    const loadedClients: Client[] = [];
    clientsSnap.forEach((docSnap) => {
      loadedClients.push({ id: docSnap.id, ...docSnap.data() } as Client);
    });
    return loadedClients;
  },

  async createClient(clientData: Partial<Client>, uid: string): Promise<Client> {
    const createdAt = new Date().toISOString().split('T')[0];
    const addedDoc = await addDoc(collection(db, 'clients'), {
      lawyerId: uid,
      createdAt,
      documents: [],
      ...clientData,
      pending: (clientData.fee || 0) - (clientData.advance || 0)
    });
    return {
      id: addedDoc.id,
      lawyerId: uid,
      createdAt,
      documents: [],
      ...clientData,
      pending: (clientData.fee || 0) - (clientData.advance || 0)
    } as Client;
  },

  async updateClient(clientId: string, clientData: Partial<Client>): Promise<void> {
    const dataToUpdate: any = { ...clientData };
    if (clientData.fee !== undefined || clientData.advance !== undefined) {
      // If fee/advance are updated, recalculate pending automatically
      const fee = clientData.fee ?? 0;
      const advance = clientData.advance ?? 0;
      dataToUpdate.pending = fee - advance;
    }
    await updateDoc(doc(db, 'clients', clientId), dataToUpdate);
  },

  async deleteClient(clientId: string): Promise<void> {
    await deleteDoc(doc(db, 'clients', clientId));
  },

  async updateClientDocuments(clientId: string, documents: string[]): Promise<void> {
    await updateDoc(doc(db, 'clients', clientId), { documents });
  },

  async updateClientNotes(clientId: string, notes: string): Promise<void> {
    await updateDoc(doc(db, 'clients', clientId), { notes });
  }
};
