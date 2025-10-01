'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  consciousness_level: 'seeker' | 'practitioner' | 'guardian';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    // Ensure we're in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Mock login for testing UI
      if (email === 'test@test.com' && password === 'password123') {
        const mockUser = {
          id: '1',
          email: email,
          consciousness_level: 'seeker' as const,
          created_at: new Date().toISOString()
        };

        setToken('mock-token-' + Date.now());
        setUser(mockUser);

        // Store in localStorage (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'mock-token-' + Date.now());
          localStorage.setItem('user', JSON.stringify(mockUser));
        }

        return true;
      }

      // Fallback to real API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token: newToken, user: userData } = data;

        setToken(newToken);
        setUser(userData);

        // Store in localStorage (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(userData));
        }

        return true;
      } else {
        console.error('Login failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Mock registration for testing UI
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        consciousness_level: 'seeker' as const,
        created_at: new Date().toISOString()
      };

      setToken('mock-token-' + Date.now());
      setUser(mockUser);

      // Store in localStorage (browser only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
      }

      return true;

      // Fallback to real API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token: newToken, user: userData } = data;

        setToken(newToken);
        setUser(userData);

        // Store in localStorage (browser only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(userData));
        }

        return true;
      } else {
        console.error('Registration failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage (browser only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};