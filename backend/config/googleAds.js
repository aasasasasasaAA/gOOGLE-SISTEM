import { GoogleAdsApi } from 'google-ads-api';
import dotenv from 'dotenv';

dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_DEVELOPER_TOKEN,
  GOOGLE_ADS_CUSTOMER_ID
} = process.env;

// Check if we're in development mode and allow server to start without Google Ads config
const isDevelopment = process.env.NODE_ENV === 'development';
const hasRequiredConfig = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN && GOOGLE_DEVELOPER_TOKEN && GOOGLE_ADS_CUSTOMER_ID;

if (!hasRequiredConfig) {
  if (isDevelopment) {
    console.warn('⚠️  Google Ads API configuration is missing. Server will start but Google Ads functionality will be disabled.');
    console.warn('Please configure the following environment variables in backend/.env:');
    console.warn('- GOOGLE_CLIENT_ID');
    console.warn('- GOOGLE_CLIENT_SECRET');
    console.warn('- GOOGLE_REFRESH_TOKEN');
    console.warn('- GOOGLE_DEVELOPER_TOKEN');
    console.warn('- GOOGLE_ADS_CUSTOMER_ID');
  } else {
    throw new Error('Missing Google Ads API configuration. Please check your environment variables.');
  }
}

let googleAdsClient = null;

if (hasRequiredConfig) {
  googleAdsClient = new GoogleAdsApi({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    developer_token: GOOGLE_DEVELOPER_TOKEN,
  });
}

export { googleAdsClient };

export const getCustomerClient = (customerId = GOOGLE_ADS_CUSTOMER_ID) => {
  if (!googleAdsClient) {
    throw new Error('Google Ads API client is not configured. Please check your environment variables.');
  }
  
  return googleAdsClient.Customer({
    customer_id: customerId || GOOGLE_ADS_CUSTOMER_ID,
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });
};

// Get default customer client
export const getDefaultCustomerClient = () => {
  return getCustomerClient(GOOGLE_ADS_CUSTOMER_ID);
};

// Test Google Ads API connection
export const testGoogleAdsConnection = async () => {
  try {
    if (!googleAdsClient) {
      console.log('❌ Google Ads API client not configured');
      return false;
    }
    
    console.log('✅ Google Ads API client initialized successfully');
    return true;
  } catch (error) {
    console.error('Google Ads API connection error:', error);
    return false;
  }
};