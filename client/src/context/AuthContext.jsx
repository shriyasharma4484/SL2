import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const DEFAULT_DEMO_USER = {
  id: 1,
  name: 'Dr. Ananya Joshi',
  email: 'coordinator@sevadeep.org',
  role: 'coordinator',
  points: 120
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sevadeep_user');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sevadeep_token') || 'demo-token');
  const [loading, setLoading] = useState(false);

  // Verify session on mount if backend is online, but do not clear demo user if offline
  useEffect(() => {
    async function loadUser() {
      if (token && token !== 'demo-token' && token !== 'offline-demo-token') {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('sevadeep_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session verification notice (running in offline mode):', error.message);
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
    try {
      const res = await authService.switchDemo(role);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('sevadeep_token', res.data.token);
        localStorage.setItem('sevadeep_user', JSON.stringify(res.data.user));
      }
      return res.data;
    } catch {
      const demoAccounts = {
        coordinator: { id: 1, name: 'Dr. Ananya Joshi', email: 'coordinator@sevadeep.org', role: 'coordinator', points: 120 },
        volunteer: { id: 3, name: 'Aarav Kulkarni', email: 'volunteer@sevadeep.org', role: 'volunteer', points: 85 },
        community_member: { id: 6, name: 'Sunita Deshmukh', email: 'citizen@sevadeep.org', role: 'community_member', points: 40 }
      };
      const fallbackUser = demoAccounts[role] || demoAccounts.coordinator;
      setUser(fallbackUser);
      setToken('offline-demo-token');
      localStorage.setItem('sevadeep_user', JSON.stringify(fallbackUser));
      localStorage.setItem('sevadeep_token', 'offline-demo-token');
      return { success: true, user: fallbackUser };
    }
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
