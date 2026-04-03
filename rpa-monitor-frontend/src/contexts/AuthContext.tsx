import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getAccessToken } from '../services/api';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(getAccessToken());

  const login = async (username: string, password: string) => {
    const data = await auth.login(username, password);
    setUser({ username: data.username });
    setToken(data.accessToken);
    localStorage.setItem('user', JSON.stringify({ username: data.username }));
  };

  const register = async (username: string, password: string) => {
    await auth.register(username, password);
  };

  const logout = () => {
    auth.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};