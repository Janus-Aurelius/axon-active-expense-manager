import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService, User, UserRole } from "@/lib/api/auth-api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setDevRole: (role: UserRole) => void;
  getCurrentUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          // Try to get current user info
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } else {
          // Check if we have stored user info (for dev mode)
          const storedUser = apiService.getStoredUserInfo();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.log("Auth initialization failed:", error);
        // Clear any invalid stored data
        await apiService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const loginResponse = await apiService.login({ email, password });
    const userData: User = {
      userId: loginResponse.userId,
      fullName: loginResponse.fullName,
      email: loginResponse.email,
      role: loginResponse.role,
    };
    setUser(userData);
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  const setDevRole = (role: UserRole) => {
    apiService.setDevRole(role);
  };

  const getCurrentUser = async () => {
    const userData = await apiService.getCurrentUser();
    setUser(userData);
    return userData;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setDevRole,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
