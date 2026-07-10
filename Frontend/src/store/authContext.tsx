import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { authService } from "../services/authService";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(): boolean {
  try {
    const token = localStorage.getItem("token");
    if (!token) return true;
    const payload = decodeToken(token);
    if (!payload) return true;
    const now = Math.floor(Date.now() / 1000);
    return Number(payload.exp) < now;
  } catch {
    return true;
  }
}

// The backend issues the role in the standard Microsoft role claim URI.
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function readRole(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  return (payload[ROLE_CLAIM] as string) ?? (payload.role as string) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("token") && !isTokenExpired()
  );
  const [role, setRole] = useState<string | null>(() => readRole());

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setRole(null);
  }, []);

  useEffect(() => {
    if (isTokenExpired() && localStorage.getItem("token")) {
      logout();
    }
    const interval = setInterval(() => {
      if (isAuthenticated && isTokenExpired()) {
        logout();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  const login = useCallback(() => {
    setIsAuthenticated(true);
    setRole(readRole());
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
