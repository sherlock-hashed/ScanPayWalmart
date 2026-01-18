import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser,
  updateProfile
} from 'firebase/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'staff';
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'customer' | 'staff') => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const isStaffMember = (
          firebaseUser.email === 'pensalwarranveer1@gmail.com' ||
          firebaseUser.email === 'staff@scanpay.com'
        );
        
        const userSession = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: isStaffMember ? 'staff' as const : 'customer' as const,
          photoURL: firebaseUser.photoURL || undefined
        };
        
        setUser(userSession);
        localStorage.setItem('scanpay-user', JSON.stringify(userSession));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('scanpay-user');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: 'customer' | 'staff' = 'customer'): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Use Firebase Auth for real login
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      const isStaffMember = (
        firebaseUser.email === 'pensalwarranveer1@gmail.com' ||
        firebaseUser.email === 'staff@scanpay.com'
      );
      const userSession = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: isStaffMember ? 'staff' as const : 'customer' as const,
        photoURL: firebaseUser.photoURL || undefined
      };
      setUser(userSession);
      localStorage.setItem('scanpay-user', JSON.stringify(userSession));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userSession.name}!`,
      });
      return true;
    } catch (error: any) {
      let errorMessage = "Invalid credentials. Please try again.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user is authorized staff member
      const isStaffMember = (
        firebaseUser.email === 'pensalwarranveer1@gmail.com' ||
        firebaseUser.email === 'staff@scanpay.com'
      );
      
      const userSession = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: isStaffMember ? 'staff' as const : 'customer' as const,
        photoURL: firebaseUser.photoURL || undefined
      };
      
      setUser(userSession);
      localStorage.setItem('scanpay-user', JSON.stringify(userSession));
      
      toast({
        title: "Google Login Successful",
        description: `Welcome, ${userSession.name}! ${isStaffMember ? 'Staff access granted.' : ''}`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      let errorMessage = "An error occurred during Google login.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Login was cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      }
      
      toast({
        title: "Google Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Use Firebase Auth for real registration
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;
      // Optionally update display name
      if (firebaseUser && name) {
        try {
          await updateProfile(firebaseUser, { displayName: name });
        } catch (profileError) {
          toast({
            title: "Profile Update Warning",
            description: "Account created, but failed to set display name.",
            variant: "warning",
          });
        }
      }
      const isStaffMember = (
        firebaseUser.email === 'pensalwarranveer1@gmail.com' ||
        firebaseUser.email === 'staff@scanpay.com'
      );
      const userSession = {
        id: firebaseUser.uid,
        name: name || firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: isStaffMember ? 'staff' as const : 'customer' as const,
        photoURL: firebaseUser.photoURL || undefined
      };
      setUser(userSession);
      localStorage.setItem('scanpay-user', JSON.stringify(userSession));
      toast({
        title: "Registration Successful",
        description: `Welcome to ScanPay, ${userSession.name}!`,
      });
      return true;
    } catch (error: any) {
      let errorMessage = "An error occurred during registration.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      }
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('scanpay-user');
      localStorage.removeItem('scanpay-cart');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to local logout
      setUser(null);
      localStorage.removeItem('scanpay-user');
      localStorage.removeItem('scanpay-cart');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
