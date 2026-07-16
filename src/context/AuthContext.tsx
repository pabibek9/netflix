"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type AdminRole = "Owner" | "Admin" | "Moderator" | "Support" | "Viewer";

export interface AdminUser {
  email: string;
  displayName: string;
  role: AdminRole;
  avatarUrl: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateRole: (role: AdminRole) => void;
  hasPermission: (requiredRole: AdminRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_RANKINGS: Record<AdminRole, number> = {
  Owner: 5,
  Admin: 4,
  Moderator: 3,
  Support: 2,
  Viewer: 1,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if session exists in localStorage
    const savedUser = localStorage.getItem("control_center_admin");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Protected route checking
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = pathname === "/";
      if (!user && !isPublicRoute) {
        router.push("/");
      } else if (user && isPublicRoute) {
        router.push("/dashboard");
      }
    }
  }, [user, pathname, isLoading, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simple validation for premium demo
    if (email === "admin@controlcenter.co" && password === "admin123") {
      const newUser: AdminUser = {
        email,
        displayName: "Alexander Wright",
        role: "Owner",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      };
      setUser(newUser);
      localStorage.setItem("control_center_admin", JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("control_center_admin");
    router.push("/");
  };

  const updateRole = (role: AdminRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem("control_center_admin", JSON.stringify(updated));
    }
  };

  const hasPermission = (requiredRole: AdminRole): boolean => {
    if (!user) return false;
    return ROLE_RANKINGS[user.role] >= ROLE_RANKINGS[requiredRole];
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
