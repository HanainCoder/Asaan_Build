import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name:string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserFromToken: (user: User) => void; // ⭐ ADD THIS
  isAuthenticated: boolean;
  loading: boolean; // ⭐ ADD
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ AUTO LOGIN ON PAGE REFRESH
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      setUser({
        id: payload.id,
        email: payload.email,
      });
    } catch {
      localStorage.removeItem("token");
    }
  }

  setLoading(false); // ⭐ IMPORTANT
}, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);

    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  // 📝 REGISTER
  const register = async (name:string, email: string, password: string) => {
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!data.success) throw new Error(data.message);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ⭐ USED BY AuthSuccess PAGE
  const setUserFromToken = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        setUserFromToken, // ⭐ ADD HERE
        isAuthenticated: !!user,
        loading, // ⭐ ADD THIS

      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}