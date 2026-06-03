import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';
import { jwtDecode } from 'jwt-decode';
import { learnerApi, invalidateCache, prefetchLearnerData } from '../api/cachedLearnerApi';
import { profileFromApi } from '../utils/profileDisplay';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await learnerApi.getMe();
      if (res?.data) {
        setProfile(profileFromApi(res.data));
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('learner_token');
    const storedUser = localStorage.getItem('learner_user');

    const init = async () => {
      if (token && storedUser) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
            return;
          }
          setUser(JSON.parse(storedUser));
          await refreshProfile();
          prefetchLearnerData();
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await apiClient.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = response.data;
      const decoded = jwtDecode(access_token);
      const userData = { email: decoded.email, role: decoded.role };

      localStorage.setItem('learner_token', access_token);
      localStorage.setItem('learner_user', JSON.stringify(userData));
      setUser(userData);
      await refreshProfile();
      prefetchLearnerData();
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      await apiClient.post('/auth/register', userData);
      return await login(userData.email, userData.password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    invalidateCache('*');
    localStorage.removeItem('learner_token');
    localStorage.removeItem('learner_user');
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, profile, login, register, logout, loading, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
