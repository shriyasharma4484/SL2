import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sevadeep_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sevadeep_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify session on mount
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('sevadeep_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('sevadeep_token', res.data.token);
      localStorage.setItem('sevadeep_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('sevadeep_token', res.data.token);
      localStorage.setItem('sevadeep_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sevadeep_token');
    localStorage.removeItem('sevadeep_user');
  };

  const switchDemo = async (role) => {
    const res = await authService.switchDemo(role);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('sevadeep_token', res.data.token);
      localStorage.setItem('sevadeep_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const isCoordinator = user?.role === 'coordinator';
  const isVolunteer = user?.role === 'volunteer';
  const isCommunityMember = user?.role === 'community_member';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchDemo,
        isCoordinator,
        isVolunteer,
        isCommunityMember,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
