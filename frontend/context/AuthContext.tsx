"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authLogin, authRegister, authGetMe, AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("careerflow_token");
    const savedUser = localStorage.getItem("careerflow_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with backend
        authGetMe(savedToken).then((u) => {
          if (u) {
            setUser(u);
            localStorage.setItem("careerflow_user", JSON.stringify(u));
          }
        }).catch(() => {});
      } catch (e) {
        localStorage.removeItem("careerflow_token");
        localStorage.removeItem("careerflow_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await authLogin(email, pass);
      if (res && res.token) {
        setToken(res.token);
        const u: AuthUser = { id: res.id, email: res.email, fullName: res.fullName };
        setUser(u);
        localStorage.setItem("careerflow_token", res.token);
        localStorage.setItem("careerflow_user", JSON.stringify(u));
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: "Invalid credentials" };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const res = await authRegister(email, pass, name);
      if (res && res.token) {
        setToken(res.token);
        const u: AuthUser = { id: res.id, email: res.email, fullName: res.fullName };
        setUser(u);
        localStorage.setItem("careerflow_token", res.token);
        localStorage.setItem("careerflow_user", JSON.stringify(u));
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const demoLogin = async () => {
    await login("demo@careerflow.dev", "demo123");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("careerflow_token");
    localStorage.removeItem("careerflow_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
