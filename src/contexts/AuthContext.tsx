import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'John Doe',
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      });
    }, 500);
  };

  const register = async (email: string, password: string) => {
    // Mock register
    setTimeout(() => {
      setUser({
        id: '1',
        name: email.split('@')[0],
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email,
      });
    }, 500);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
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
