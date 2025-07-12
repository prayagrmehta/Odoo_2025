import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI, userAPI, apiUtils } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          // Token is valid, fetch user profile
          fetchUserProfile();
        } else {
          apiUtils.logout();
        }
      } catch (error) {
        apiUtils.logout();
      }
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await userAPI.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      apiUtils.logout();
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh } = response;
      apiUtils.setTokens(access, refresh);
      
      // Fetch user profile
      const userData = await userAPI.getProfile();
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Check if tokens are returned directly from registration
      if (response.access && response.refresh) {
        apiUtils.setTokens(response.access, response.refresh);
        
        // Fetch user profile
        const profileData = await userAPI.getProfile();
        setUser(profileData);
        return { success: true };
      } else {
        // Fallback: try to login after registration
        const loginResponse = await authAPI.login({
          email: userData.email,
          password: userData.password
        });
        
        const { access, refresh } = loginResponse;
        apiUtils.setTokens(access, refresh);
        
        // Fetch user profile
        const profileData = await userAPI.getProfile();
        setUser(profileData);
        return { success: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    apiUtils.logout();
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 