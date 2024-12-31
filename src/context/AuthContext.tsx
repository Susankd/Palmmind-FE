import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "@/config";

interface AuthContextType {
  user: { name: string; email: string; role: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${baseUrl}/auth/login`, { email, password });
      const { user, tokens } = data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", tokens.access.token);

      setUser(user);
      setIsAuthenticated(true);

      navigate("/"); // Redirect to homepage or dashboard after login
    } catch (error) {
      alert("Invalid email or password.");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
