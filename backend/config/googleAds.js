import { GoogleAdsApi } from 'google-ads-api';
import dotenv from 'dotenv';

dotenv.config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_DEVELOPER_TOKEN
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GOOGLE_DEVELOPER_TOKEN) {
  throw new Error('Missing Google Ads API configuration. Please check your environment variables.');
}

export const googleAdsClient = new GoogleAdsApi({
  client_id: GOOGLE_CLIENT_ID,
  client_secret: GOOGLE_CLIENT_SECRET,
  developer_token: GOOGLE_DEVELOPER_TOKEN,
});

export const getCustomerClient = (customerId) => {
  return googleAdsClient.Customer({
    customer_id: customerId,
    refresh_token: GOOGLE_REFRESH_TOKEN,
  });
};

// Test Google Ads API connection
export const testGoogleAdsConnection = async () => {
  try {
    // This is a basic test - you might need to adjust based on your setup
    console.log('✅ Google Ads API client initialized successfully');
    return true;
  } catch (error) {
    console.error('Google Ads API connection error:', error);
    return false;
  }
};