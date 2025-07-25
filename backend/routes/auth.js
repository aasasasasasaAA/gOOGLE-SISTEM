import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Check if we have the required environment variables
const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && 
                            process.env.GOOGLE_CLIENT_SECRET && 
                            process.env.FRONTEND_URL &&
                            process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
                            process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here';

let oauth2Client = null;

if (hasGoogleCredentials) {
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.FRONTEND_URL}/auth/callback`
  );
}

// Generate auth URL
router.get('/url', (req, res) => {
  try {
    if (!hasGoogleCredentials) {
      return res.status(503).json({ 
        error: 'Google credentials not configured',
        message: 'Please configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and FRONTEND_URL in your .env file'
      });
    }

    const scopes = [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle OAuth callback
router.post('/callback', async (req, res) => {
  try {
    if (!hasGoogleCredentials) {
      return res.status(503).json({ 
        error: 'Google credentials not configured',
        message: 'Please configure Google credentials in your .env file'
      });
    }

    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    res.json({
      success: true,
      tokens,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      }
    });
  } catch (error) {
    console.error('Error handling auth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    if (!hasGoogleCredentials) {
      return res.status(503).json({ 
        error: 'Google credentials not configured',
        message: 'Please configure Google credentials in your .env file'
      });
    }

    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await oauth2Client.refreshAccessToken();

    res.json({ tokens: credentials });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Validate token
router.post('/validate', async (req, res) => {
  try {
    if (!hasGoogleCredentials) {
      return res.status(503).json({ 
        error: 'Google credentials not configured',
        message: 'Please configure Google credentials in your .env file'
      });
    }

    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    
    const { data: userInfo } = await oauth2.userinfo.get();
    
    res.json({ 
      valid: true, 
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      }
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

export default router;