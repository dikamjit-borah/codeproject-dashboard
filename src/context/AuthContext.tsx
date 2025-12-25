import { createContext, useContext, useEffect, useMemo, useState } from "react";
import backend from "../api/adapters/backendAPI";

export type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth:isAuthenticated");
    setIsAuthenticated(stored === "true");
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await backend.login({ email: email.trim(), password });
      // If request didn't throw, treat as success. Optionally store token if provided
      const token = (res as Record<string, unknown>)?.token as string | undefined;
      if (token) {
        localStorage.setItem("auth:token", token);
      }
      setIsAuthenticated(true);
      localStorage.setItem("auth:isAuthenticated", "true");
      return true;
    } catch (_err) {
      // Normalize to boolean false for callers
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("auth:isAuthenticated");
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
