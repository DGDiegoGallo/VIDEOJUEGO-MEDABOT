import React, { createContext, useContext } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types/user';

// Define the shape of the context using the return type of useAuth
export type AuthContextType = ReturnType<typeof useAuthStore> & {
  user: User | null;
};

type ExtendedAuthContextType = AuthContextType & {
  isUser: boolean;
  isAgent: boolean;
  isCompany: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthStore();
  
  // Check if user is admin based on username or email since roles are not used
  const isAdmin = auth.user?.username === 'admin' || 
                  auth.user?.email?.includes('admin') ||
                  auth.user?.rol === 'admin' ||
                  auth.user?.role?.name === 'admin';
  
  const value: ExtendedAuthContextType = {
    ...auth,
    isUser: !isAdmin,
    isAgent: false, // No roles in this system
    isCompany: false, // No roles in this system
    isAdmin: isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
