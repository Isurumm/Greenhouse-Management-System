import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await loginUser(email, password, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await signupUser(userData, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const syncUserProfile = (profileData) => {
    setUser((prev) => {
      if (!prev) return prev;

      const merged = {
        ...prev,
        ...profileData,
        token: prev.token,
      };

      localStorage.setItem('userInfo', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, syncUserProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
