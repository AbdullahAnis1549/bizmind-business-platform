import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, businessService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bizmind_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bizmind_token') || null);
  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem('bizmind_business');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bizmind_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('bizmind_user', JSON.stringify(res.user));

          if (res.user.business) {
            setBusiness(res.user.business);
            localStorage.setItem('bizmind_business', JSON.stringify(res.user.business));
          } else if (res.user.businessId) {
            const bRes = await businessService.getBusiness();
            if (bRes.success) {
              setBusiness(bRes.business);
              localStorage.setItem('bizmind_business', JSON.stringify(bRes.business));
            }
          }
        }
      } catch (err) {
        console.warn('[Auth] Verification failed:', err.message);
        localStorage.removeItem('bizmind_token');
        localStorage.removeItem('bizmind_user');
        localStorage.removeItem('bizmind_business');
        setUser(null);
        setBusiness(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success) {
      // If owner, OTP is required — don't store token yet
      if (res.requiresOTP) {
        return res; // { success, requiresOTP, email, maskedEmail, message }
      }

      // Non-owner: direct login
      setToken(res.token);
      localStorage.setItem('bizmind_token', res.token);
      setUser(res.user);
      localStorage.setItem('bizmind_user', JSON.stringify(res.user));

      if (res.user.business) {
        setBusiness(res.user.business);
        localStorage.setItem('bizmind_business', JSON.stringify(res.user.business));
      } else {
        setBusiness(null);
        localStorage.removeItem('bizmind_business');
      }
      return res;
    }
  };

  const verifyOwnerOTP = async (email, otp) => {
    const res = await authService.verifyOTP({ email, otp });
    if (res.success) {
      setToken(res.token);
      localStorage.setItem('bizmind_token', res.token);
      setUser(res.user);
      localStorage.setItem('bizmind_user', JSON.stringify(res.user));

      if (res.user.business) {
        setBusiness(res.user.business);
        localStorage.setItem('bizmind_business', JSON.stringify(res.user.business));
      } else {
        setBusiness(null);
        localStorage.removeItem('bizmind_business');
      }
      return res;
    }
  };

  const register = async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    if (res.success) {
      setToken(res.token);
      localStorage.setItem('bizmind_token', res.token);
      setUser(res.user);
      localStorage.setItem('bizmind_user', JSON.stringify(res.user));
      setBusiness(null);
      localStorage.removeItem('bizmind_business');
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('bizmind_token');
    localStorage.removeItem('bizmind_user');
    localStorage.removeItem('bizmind_business');
    setUser(null);
    setBusiness(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('bizmind_user', JSON.stringify(res.user));
        if (res.user.business) {
          setBusiness(res.user.business);
          localStorage.setItem('bizmind_business', JSON.stringify(res.user.business));
        }
      }
    } catch (err) {
      console.warn('[Auth] Refresh failed', err.message);
    }
  };

  const updateBusinessState = (newBusiness) => {
    setBusiness(newBusiness);
    localStorage.setItem('bizmind_business', JSON.stringify(newBusiness));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        needsOnboarding: Boolean(user && !user.businessId),
        login,
        verifyOwnerOTP,
        register,
        logout,
        refreshUser,
        updateBusinessState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
