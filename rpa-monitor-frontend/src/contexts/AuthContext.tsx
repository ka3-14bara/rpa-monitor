import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, getCurrentUser } from "../services/api";

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверка сессии при загрузке приложения
  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        console.log("getCurrentUser result:", data);
        if (data) setUser({ username: data.username });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    await auth.login(username, password);
    // После успешного логина запрашиваем пользователя
    const userData = await getCurrentUser();
    if (userData) {
      setUser({ username: userData.username });
    } else {
      throw new Error("Не удалось получить данные пользователя");
    }
  };

  const register = async (username: string, password: string) => {
    await auth.register(username, password);
    // Регистрация не логинит пользователя, просто создаёт учётку
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
