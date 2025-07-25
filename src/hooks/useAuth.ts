import { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { User, AuthTokens } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedTokens = localStorage.getItem('google_ads_tokens');
      const storedUser = localStorage.getItem('google_ads_user');

      if (storedTokens && storedUser) {
        const parsedTokens = JSON.parse(storedTokens);
        const parsedUser = JSON.parse(storedUser);

        // Validate token
        const validation = await authApi.validateToken(parsedTokens.access_token);
        
        if (validation.valid) {
          setTokens(parsedTokens);
          setUser(parsedUser);
        } else {
          // Try to refresh token
          if (parsedTokens.refresh_token) {
            await refreshAccessToken(parsedTokens.refresh_token);
          } else {
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (code: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.handleCallback(code);
      
      setTokens(response.tokens);
      setUser(response.user);

      // Store in localStorage
      localStorage.setItem('google_ads_tokens', JSON.stringify(response.tokens));
      localStorage.setItem('google_ads_user', JSON.stringify(response.user));

      return true;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await authApi.refreshToken(refreshToken);
      const newTokens = { ...tokens, ...response.tokens };
      
      setTokens(newTokens);
      localStorage.setItem('google_ads_tokens', JSON.stringify(newTokens));
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('google_ads_tokens');
    localStorage.removeItem('google_ads_user');
  };

  const getAuthUrl = async () => {
    try {
      console.log('Attempting to get auth URL from API...');
      const response = await authApi.getAuthUrl();
      console.log('Auth URL response:', response);
      return response.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  };

  return {
    user,
    tokens,
    loading,
    error,
    login,
    logout,
    getAuthUrl,
    isAuthenticated: !!user && !!tokens,
  };
};