import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setVaultKey } from "../utils/crypto";

interface AuthContextType {
  user: { token: string } | null;
  isVaultUnlocked: boolean;
  isLoading: boolean;
  loginUser: (token: string, vaultKey: CryptoKey) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ token: string } | null>(null);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem("token");
    setVaultKey(null);
    setUser(null);
    setIsVaultUnlocked(false);
    setIsLoading(false);
  }, []);

  const loginUser = (token: string, vaultKey: CryptoKey) => {
    localStorage.setItem("token", token);
    setVaultKey(vaultKey);
    setUser({ token });
    setIsVaultUnlocked(true);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setVaultKey(null);
    setUser(null);
    setIsVaultUnlocked(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isVaultUnlocked, isLoading, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};