import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type User = {
  user_id: number;
  nom: string;
  email: string;
  role: string;
}| null;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<User>(() => {
    const t = localStorage.getItem("access_token");
    if (!t) return null;
    try { return jwtDecode(t) as User; } catch { return null; }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
      try { setUser(jwtDecode(token)); } catch { setUser(null); }
    } else {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
