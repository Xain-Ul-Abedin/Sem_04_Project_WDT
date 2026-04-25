import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getApiData, getApiMessage } from '../services/apiResponse';
import AuthContext from './auth-context';

const getStoredToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken);
  const [persistSession, setPersistSession] = useState(() => !!localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const storeToken = (nextToken, shouldPersist = persistSession) => {
    if (nextToken) {
      if (shouldPersist) {
        localStorage.setItem('token', nextToken);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', nextToken);
        localStorage.removeItem('token');
      }
    } else {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  };

  const applySession = (nextUser, nextToken, shouldPersist = persistSession) => {
    setPersistSession(shouldPersist);
    setUser(nextUser);
    setToken(nextToken);
    storeToken(nextToken, shouldPersist);
  };

  // Fetch profile on initial load if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(getApiData(response));
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // If token is invalid/expired, log out
        if (error.status === 401 || error.status === 403) {
          logout();
          toast.error('Session expired. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password, options = {}) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const sessionData = getApiData(response, {});
      applySession(sessionData.user, sessionData.token, !!options.rememberMe);
      toast.success('Successfully logged in!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const sessionData = getApiData(response, {});
      applySession(sessionData.user, sessionData.token, true);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    applySession(null, null, false);
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/auth/me', updates);
      setUser(getApiData(response));
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      const sessionData = getApiData(response, {});
      applySession(sessionData.user, sessionData.token, persistSession);
      toast.success(getApiMessage(response, 'Password changed successfully'));
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(getApiMessage(response, 'OTP sent successfully'));
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
      return false;
    }
  };

  const resetPassword = async (email, otp, password) => {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, password });
      toast.success(getApiMessage(response, 'Password reset successfully'));
      return true;
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
      return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  };

  // Give a full-page loading state while fetching profile
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-blue-50 dark:bg-black">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
