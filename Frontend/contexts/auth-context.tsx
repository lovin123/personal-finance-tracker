"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiService } from "@/lib/api-service";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = Cookies.get("accessToken");
    const userData = Cookies.get("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        Cookies.remove("accessToken");
        Cookies.remove("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login(email, password);
    const { user: userData, tokens } = response.data.data;

    Cookies.set("accessToken", tokens.accessToken);
    Cookies.set("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiService.register(name, email, password);
    const { user: userData, tokens } = response.data;

    Cookies.set("accessToken", tokens.accessToken);
    Cookies.set("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
