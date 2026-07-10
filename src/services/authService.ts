import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase';

export const authService = {
  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signup(email: string, password: string, fullName: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    try {
      await updateProfile(userCredential.user, { displayName: fullName.trim() });
    } catch (err) {
      console.error('Error setting displayName during signup:', err);
    }
    return userCredential;
  },

  async logout(): Promise<void> {
    return signOut(auth);
  }
};
