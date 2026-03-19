import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { vendorAPI } from '../services/api';

const VendorAuthContext = createContext(null);

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider');
  }
  return context;
};

export const VendorAuthProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    const savedVendor = localStorage.getItem('vendorUser');

    if (token && savedVendor) {
      try {
        setVendor(JSON.parse(savedVendor));
        vendorAPI.auth.verify()
          .then((res) => {
            if (res.data.success && res.data.vendor) {
              setVendor(res.data.vendor);
              localStorage.setItem('vendorUser', JSON.stringify(res.data.vendor));
            } else {
              logout();
            }
          })
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (vendorData, token) => {
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorUser', JSON.stringify(vendorData));
    setVendor(vendorData);
  };

  const logout = async () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorUser');
    setVendor(null);
    await supabase.auth.signOut().catch(() => {});
    vendorAPI.auth.logout().catch(() => {});
  };

  return (
    <VendorAuthContext.Provider
      value={{
        vendor,
        loading,
        login,
        logout,
        isAuthenticated: !!vendor,
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
};
