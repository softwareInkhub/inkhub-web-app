'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  userProfile: any;
  isLoading: boolean;
  isInitialized: boolean;
  handleLogin: (redirectTo?: string) => void;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  isInitialized: false,
  handleLogin: () => {},
  signInWithPhone: async () => {},
  verifyOtp: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          setUserProfile(userDoc.data());
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (redirectTo: string = '/account') => {
    if (user) {
      // If already logged in, redirect directly
      router.push(redirectTo);
    } else {
      // If not logged in, redirect to account page which will handle the auth flow
      router.push('/account');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      isLoading, 
      isInitialized, 
      handleLogin,
      signInWithPhone: async (phone: string) => {
        // Implement phone sign in logic
      },
      verifyOtp: async (otp: string) => {
        // Implement OTP verification logic
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 