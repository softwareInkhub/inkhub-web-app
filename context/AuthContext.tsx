'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: any | null;
  userProfile: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isInitialized: false,
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  const logout = async () => {
    try {
      // First clear all cookies and session
      await fetch('/api/auth/session', { method: 'DELETE' });
      Cookies.remove('token');
      Cookies.remove('session');
      
      // Then sign out from Firebase
      await signOut(auth);
      
      // Clear state
      setUserProfile(null);
      setUser(null);
      
      // Navigate home and refresh
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        setIsInitialized(true);
        
        if (user) {
          // Get fresh token
          const token = await user.getIdToken(true);
          
          // Update session
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: token }),
          });
          
          // Set up Firestore listener
          const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data());
            }
            setIsLoading(false);
          });
          
          return () => unsubProfile();
        } else {
          // Clear session
          await fetch('/api/auth/session', { method: 'DELETE' });
          setUserProfile(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setIsLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading, isInitialized, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}; 