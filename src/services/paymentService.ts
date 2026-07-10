import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';
import { FeePayment } from '../types';

export const paymentService = {
  async getPayments(uid: string): Promise<FeePayment[]> {
    const paymentsSnap = await getDocs(
      query(collection(db, 'feePayments'), where('lawyerId', '==', uid))
    );
    const loadedPayments: FeePayment[] = [];
    paymentsSnap.forEach((docSnap) => {
      loadedPayments.push({ id: docSnap.id, ...docSnap.data() } as FeePayment);
    });
    return loadedPayments;
  },

  async createPayment(paymentData: Partial<FeePayment>, uid: string): Promise<FeePayment> {
    const addedDoc = await addDoc(collection(db, 'feePayments'), {
      lawyerId: uid,
      ...paymentData
    });
    return {
      id: addedDoc.id,
      ...paymentData
    } as FeePayment;
  },

  async deletePayment(paymentId: string): Promise<void> {
    await deleteDoc(doc(db, 'feePayments', paymentId));
  }
};
