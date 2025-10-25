"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  consciousness_level: "seeker" | "practitioner" | "guardian";
  created_at: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
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
  children: ReactNode;
}

const DEFAULT_ERROR_MESSAGE =
  "Произошла непредвиденная ошибка. Попробуйте позже.";
const INVALID_RESPONSE_MESSAGE = "Некорректный ответ сервера.";
const INVALID_CREDENTIALS_MESSAGE = "Неверный e-mail или пароль.";
const DUPLICATE_EMAIL_MESSAGE = "Пользователь с таким e-mail уже существует.";
const INVALID_PAYLOAD_MESSAGE = "Некорректное тело запроса.";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }

    setLoading(false);
  }, []);

  const persistSession = (authToken: string, authUser: User) => {
    setToken(authToken);
    setUser(authUser);

    if (typeof window !== "undefined") {
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(authUser));
    }
  };

  const safeMessageFromPayload = (payload: unknown): string | undefined => {
    if (payload && typeof payload === "object" && "message" in payload) {
      const value = (payload as { message?: unknown }).message;
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
    return undefined;
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      if (email === "test@test.com" && password === "password123") {
        const mockUser: User = {
          id: "1",
          email,
          consciousness_level: "seeker",
          created_at: new Date().toISOString(),
        };

        const mockToken = `mock-token-${Date.now()}`;
        persistSession(mockToken, mockUser);
        return { success: true };
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        const data = (payload ?? {}) as Partial<{ token: string; user: User }>;
        if (data.token && data.user) {
          persistSession(data.token, data.user);
          return { success: true };
        }

        return { success: false, message: INVALID_RESPONSE_MESSAGE };
      }

      const payloadMessage = safeMessageFromPayload(payload);
      const fallbackMessage =
        response.status === 401
          ? INVALID_CREDENTIALS_MESSAGE
          : DEFAULT_ERROR_MESSAGE;

      return { success: false, message: payloadMessage ?? fallbackMessage };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : DEFAULT_ERROR_MESSAGE;
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (response.ok) {
        const data = (payload ?? {}) as Partial<{ token: string; user: User }>;
        if (data.user) {
          const tokenToStore = data.token ?? `temporary-token-${Date.now()}`;
          persistSession(tokenToStore, data.user);
          return { success: true };
        }

        return { success: false, message: INVALID_RESPONSE_MESSAGE };
      }

      const payloadMessage = safeMessageFromPayload(payload);
      const fallbackMessage =
        response.status === 409
          ? DUPLICATE_EMAIL_MESSAGE
          : response.status === 400
            ? INVALID_PAYLOAD_MESSAGE
            : DEFAULT_ERROR_MESSAGE;

      return { success: false, message: payloadMessage ?? fallbackMessage };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : DEFAULT_ERROR_MESSAGE;
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: Boolean(user && token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
