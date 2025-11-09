import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type User = {
  user_id: number;
  nom?: string;
  email?: string;
  role: string;
} | null;

type AuthContextType = {
  token: string | null;
  user: User;
  login: (newToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState<User>(() => {
    const t = localStorage.getItem("access_token");
    if (!t) return null;
    try {
      return jwtDecode(t) as User;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
      try {
        setUser(jwtDecode(token));
      } catch {
        setUser(null);
      }
    } else {
      localStorage.removeItem("access_token");
      setUser(null);
    }
  }, [token]);

  // 👇 rendre login async
  const login = async (newToken: string) => {
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken) as User;
      setUser(decoded);
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};





// import React, { createContext, useContext, useState, useEffect } from "react";
// import { jwtDecode } from "jwt-decode";

// type User = {
//   user_id: number;
//   nom: string;
//   email: string;
//   role: string;
// }| null;

// const AuthContext = createContext<any>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
//   const [user, setUser] = useState<User>(() => {
//     const t = localStorage.getItem("access_token");
//     if (!t) return null;
//     try { return jwtDecode(t) as User; } catch { return null; }
//   });

//   useEffect(() => {
//     if (token) {
//       localStorage.setItem("access_token", token);
//       try { setUser(jwtDecode(token)); } catch { setUser(null); }
//     } else {
//       localStorage.removeItem("access_token");
//       setUser(null);
//     }
//   }, [token]);

//   const login = (newToken: string) => setToken(newToken);
//   const logout = () => setToken(null);

//   return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => useContext(AuthContext);
