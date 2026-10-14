import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return (data as UserProfile | null) ?? null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("invalid login")) {
        throw new Error("Credenciais inválidas. Verifique seu e-mail e senha.");
      }
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
      }
      throw new Error(error.message);
    }
    const profile = data.user ? await fetchProfile(data.user.id) : null;
    setUser(profile);
  };

  const register = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || "" } },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new Error("Já existe uma conta com este e-mail. Faça login.");
      }
      throw new Error(error.message);
    }
    if (!data.session) {
      // Email confirmation is required before first access.
      throw new Error("CONFIRM_EMAIL");
    }
    if (data.user) {
      // Wait for the signup trigger to create the profile row.
      let profile = await fetchProfile(data.user.id);
      if (!profile) {
        await new Promise((r) => setTimeout(r, 800));
        profile = await fetchProfile(data.user.id);
      }
      setUser(profile);
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
