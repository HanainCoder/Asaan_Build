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
  provider?: string;        // ⭐ NEW
  github_username?: string; // ⭐ NEW
    has_password?: boolean; // ⭐ ADD
      login_method?: 'local' | 'google' | 'github'; // ⭐ ADD


}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUserFromToken: (user: User) => void;
  updateUser: (updated: Partial<User>) => void; // ⭐ NEW
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ PAGE REFRESH PE FULL PROFILE FETCH KARO
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    // JWT se login_method nikalo
    const payload = JSON.parse(atob(token.split(".")[1]));
    const loginMethod = payload.login_method;

    fetch("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser({ ...data.user, login_method: loginMethod }); // ⭐ merge
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
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

    // ✅ profile fetch + login_method set karo
    const profileRes = await fetch("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${data.token}` },
    });
    const profileData = await profileRes.json();
    if (profileData.success) {
      setUser({ ...profileData.user, login_method: 'local' }); // ⭐ local hardcode
    } else {
      setUser({ ...data.user, login_method: 'local' });
    }
  };

  // 📝 REGISTER
  const register = async (name: string, email: string, password: string) => {
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

  // ⭐ GOOGLE/GITHUB LOGIN KE BAAD
  const setUserFromToken = (userData: User) => {
    setUser(userData);
  };

  // ⭐ SETTINGS PAGE PE UPDATE KE BAAD
  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        setUserFromToken,
        updateUser, // ⭐ NEW
        isAuthenticated: !!user,
        loading,
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