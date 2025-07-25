import axios from 'axios';
import { 
  Account, 
  Campaign, 
  CampaignResponse, 
  AccountSummaryResponse, 
  ApiResponse,
  AuthTokens,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem('google_ads_tokens');
  if (tokens) {
    const parsedTokens = JSON.parse(tokens);
    config.headers.Authorization = `Bearer ${parsedTokens.access_token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('google_ads_tokens');
      localStorage.removeItem('google_ads_user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  getAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await api.get('/auth/url');
    return response.data;
  },

  handleCallback: async (code: string): Promise<{ tokens: AuthTokens; user: User }> => {
    const response = await api.post('/auth/callback', { code });
    return response.data;
  },

  validateToken: async (accessToken: string): Promise<{ valid: boolean; user?: User }> => {
    const response = await api.post('/auth/validate', { accessToken });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ tokens: AuthTokens }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Accounts API
export const accountsApi = {
  getAll: async (): Promise<Account[]> => {
    const response = await api.get('/accounts');
    return response.data;
  },

  sync: async (customerId: string): Promise<ApiResponse<Account[]>> => {
    const response = await api.post(`/accounts/sync/${customerId}`);
    return response.data;
  },

  getSummary: async (accountId: number, dateRange = '30'): Promise<AccountSummaryResponse> => {
    const response = await api.get(`/accounts/${accountId}/summary?dateRange=${dateRange}`);
    return response.data;
  },
};

// Campaigns API
export const campaignsApi = {
  getByAccount: async (accountId: number, dateRange = '30', refresh = false): Promise<CampaignResponse> => {
    const response = await api.get(`/campaigns/${accountId}?dateRange=${dateRange}&refresh=${refresh}`);
    return response.data;
  },

  getPerformance: async (accountId: number, campaignId: string, dateRange = '30') => {
    const response = await api.get(`/campaigns/${accountId}/${campaignId}/performance?dateRange=${dateRange}`);
    return response.data;
  },
};

// Reports API
export const reportsApi = {
  generate: async (accountId: number, dateRange = '30') => {
    const response = await api.get(`/reports/${accountId}?dateRange=${dateRange}`);
    return response.data;
  },

  export: async (accountId: number, dateRange = '30', format = 'json') => {
    const response = await api.get(`/reports/${accountId}/export?dateRange=${dateRange}&format=${format}`);
    return response.data;
  },
};

export default api;