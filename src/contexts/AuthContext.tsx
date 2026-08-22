import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginUser: (email: string, password?: string) => Promise<User>;
  registerUser: (name: string, email: string, whatsapp?: string, password?: string) => Promise<User>;
  loginAdmin: (email: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      const adminAuth = await authService.isAdminAuthenticated();
      setUser(currentUser);
      setIsAdmin(Boolean(adminAuth && currentUser?.role === 'admin'));
    } catch {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const adminAuth = await authService.isAdminAuthenticated();
        if (isMounted) {
          setUser(currentUser);
          setIsAdmin(Boolean(adminAuth && currentUser?.role === 'admin'));
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginAdmin = async (email: string, password?: string): Promise<User> => {
    const adminUser = await authService.loginAdmin(email, password);
    setUser(adminUser);
    setIsAdmin(true);
    return adminUser;
  };

  const loginUser = async (email: string, password?: string): Promise<User> => {
    const loggedUser = await authService.loginUser(email, password);
    setUser(loggedUser);
    setIsAdmin(loggedUser.role === 'admin');
    return loggedUser;
  };

  const registerUser = async (name: string, email: string, whatsapp?: string, password?: string): Promise<User> => {
    const newUser = await authService.registerUser(name, email, whatsapp, password);
    setUser(newUser);
    setIsAdmin(false);
    return newUser;
  };

  const logout = async () => {
    await authService.logoutUser();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        loginUser,
        registerUser,
        loginAdmin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};