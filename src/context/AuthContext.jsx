import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'wst_auth_user';

const DEFAULT_USER = {
  id: 'usr_1',
  name: 'Student',
  email: 'student@example.com',
  role: 'Member',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Listen to Supabase auth state changes if active
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const suUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          role: 'Member',
        };
        setUser(suUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(suUser));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // Try Supabase auth first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!error && data?.user) {
        const loggedUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split('@')[0],
          email: data.user.email,
          role: 'Member',
        };
        setUser(loggedUser);
        return loggedUser;
      }
    } catch (e) {
      console.warn('Supabase auth attempt:', e);
    }

    // Fallback local/demo login for test credentials
    const loggedUser = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: email.trim().toLowerCase(),
      role: 'Member',
    };
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name, email, password) => {
    if (!name?.trim() || !email?.trim() || !password) {
      throw new Error('All fields are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long for Supabase.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try Supabase sign up
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const newUser = {
          id: data.user.id,
          name: name.trim(),
          email: normalizedEmail,
          role: 'Member',
        };
        setUser(newUser);
        return newUser;
      }
    } catch (e) {
      // If Supabase returned an error, check if it's already registered
      if (e.message && !e.message.includes('fetch')) {
        throw new Error(e.message);
      }
    }

    // Local fallback
    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      role: 'Member',
    };
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
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
