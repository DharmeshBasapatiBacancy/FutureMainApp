import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('adminUser');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
        // Test token: skip verify so login persists even when backend is down
        if (token.startsWith('test-token-')) {
          setLoading(false);
          return;
        }
        // Verify token is still valid with backend
        authAPI.verify()
          .then((res) => {
            if (res.data.success) {
              setAdmin(res.data.admin);
              localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
            } else {
              logout();
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (adminData, token) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    // Sign out from Supabase
    await supabase.auth.signOut().catch(() => {
      // Ignore errors on logout
    });
    authAPI.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

