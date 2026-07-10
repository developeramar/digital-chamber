import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, updateCurrentUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: any;
  isDemo: boolean;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, fullName: string) => Promise<any>;
  logout: () => Promise<void>;
  handleLoginSuccess: (user: any, isDemoMode: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If the user was just created, they might not have a displayName yet.
        // We reload to fetch the latest profile state.
        if (!user.displayName) {
          try {
            await user.reload();
            user = auth.currentUser || user;
          } catch (err) {
            console.error('Error reloading user in auth observer:', err);
          }
        }

        // Ensure Firestore reads only begin after the authenticated user is completely initialized.
        // If they still lack a displayName, we wait for the next trigger/token refresh.
        if (!user.displayName) {
          return;
        }

        setCurrentUser(user);
        setIsDemo(false);
      } else {
        // Only reset if they aren't actively in demo sandbox mode
        if (!isDemo) {
          setCurrentUser(null);
        }
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const login = async (email: string, password: string) => {
    const credential = await authService.login(email, password);
    setIsDemo(false);
    return credential.user;
  };

  const signup = async (email: string, password: string, fullName: string) => {
    // 1. Create Firebase Auth user & Update displayName
    const credential = await authService.signup(email, password, fullName);
    const user = credential.user;

    // 2. Create /users/{uid} document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: fullName.trim(),
      createdAt: new Date().toISOString()
    });

    // 3. Force an ID token refresh (Wait for Firebase authentication state to stabilize)
    await user.getIdToken(true);

    // 4. Reload user profile locally to sync the updated displayName
    await user.reload();

    // 5. Notify the auth state observer to update application state naturally
    const updatedUser = auth.currentUser;
    if (updatedUser) {
      await updateCurrentUser(auth, updatedUser);
    }

    return user;
  };

  const logout = async () => {
    if (isDemo) {
      setIsDemo(false);
      setCurrentUser(null);
    } else {
      await authService.logout();
      setCurrentUser(null);
    }
  };

  const handleLoginSuccess = (user: any, isDemoMode: boolean) => {
    setIsDemo(isDemoMode);
    setCurrentUser(user);
    if (isDemoMode) {
      // Trigger instant load from local mock setup
      localStorage.removeItem('dc_clients');
      localStorage.removeItem('dc_hearings');
      localStorage.removeItem('dc_payments');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isDemo,
        authChecked,
        login,
        signup,
        logout,
        handleLoginSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
