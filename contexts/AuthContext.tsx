// frontend/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Import

type User = {
  id: number;
  name: string;
  email: string;
  date_of_birth: string;
  age: number;
  gender: string;
};

type AuthContextType = {
  userId: number | null;
  token: string | null;
  user: User | null; // ✅ Use a strong type
  login: (id: number, token: string, userData?: User) => void;
  logout: () => Promise<void>; // ✅ Make async
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = (id: number, token: string, userData?: User) => {
    setUserId(id);
    setToken(token);
    if (userData) setUser(userData);
  };

  const logout = async () => {
    // ✅ ENHANCEMENT: Clear user from storage on logout
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@transactions"); // Also clear local data
    setUserId(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ userId, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
};