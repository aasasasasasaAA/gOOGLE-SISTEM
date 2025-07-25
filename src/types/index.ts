// Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expiry_date?: number;
}

// Account types
export interface Account {
  id: number;
  google_ads_id: string;
  name: string;
  currency: string;
  time_zone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  status: string;
  type: string;
  metrics: CampaignMetrics;
  dailyData?: DailyMetric[];
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  ctr: string;
  cost: string;
  conversions: number;
  conversionsValue: number;
  cpc: string;
}

export interface DailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  conversions: number;
}

// Dashboard types
export interface DashboardSummary {
  impressions: number;
  clicks: number;
  ctr: string;
  cost: string;
  conversions: number;
  conversionsValue: string;
  cpc: string;
}

export interface ChartData {
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr?: number;
}

// API Response types
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CampaignResponse {
  campaigns: Campaign[];
  account: string;
}

export interface AccountSummaryResponse {
  summary: DashboardSummary;
  dailyData: ChartData[];
}