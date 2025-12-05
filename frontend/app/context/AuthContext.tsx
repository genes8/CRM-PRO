import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '~/lib/api';
import type { User } from '~/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Dev mode for testing - set to false for production
const DEV_MODE = import.meta.env.DEV && false;

const mockUser: User = {
  id: 'dev-user',
  email: 'leslie.watson@example.com',
  name: 'Leslie Watson',
  picture: null,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_MODE ? mockUser : null);
  const [isLoading, setIsLoading] = useState(!DEV_MODE);

  const checkAuth = async () => {
    if (DEV_MODE) {
      setUser(mockUser);
      setIsLoading(false);
      return;
    }
    try {
      const response = await authApi.check();
      if (response.data.authenticated && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
