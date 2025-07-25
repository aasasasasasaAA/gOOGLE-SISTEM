import express from 'express';
import { GoogleAdsService } from '../services/googleAdsService.js';
import { DatabaseService } from '../services/databaseService.js';

const router = express.Router();
const dbService = new DatabaseService();

// Get campaigns for an account
router.get('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { dateRange = '30', refresh = 'false' } = req.query;

    // Get account from database
    const accounts = await dbService.getAccounts();
    const account = accounts.find(acc => acc.id === parseInt(accountId));

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let campaigns;

    if (refresh === 'true') {
      // Fetch fresh data from Google Ads
      const googleAdsService = new GoogleAdsService(account.google_ads_id);
      campaigns = await googleAdsService.getCampaigns(dateRange);
      
      // Save to database
      await dbService.saveCampaignData(accountId, campaigns);
    } else {
      // Get from database first, fallback to Google Ads if not found
      try {
        const { data: dbCampaigns, error } = await dbService.supabase
          .from('campaigns')
          .select('*')
          .eq('account_id', accountId);

        if (error || !dbCampaigns || dbCampaigns.length === 0) {
          // Fallback to Google Ads
          const googleAdsService = new GoogleAdsService(account.google_ads_id);
          campaigns = await googleAdsService.getCampaigns(dateRange);
          await dbService.saveCampaignData(accountId, campaigns);
        } else {
          // Transform database data to match expected format
          campaigns = dbCampaigns.map(campaign => ({
            id: campaign.google_ads_campaign_id,
            name: campaign.name,
            status: campaign.status,
            type: campaign.type,
            metrics: {
              impressions: campaign.impressions,
              clicks: campaign.clicks,
              ctr: campaign.ctr.toFixed(2),
              cost: campaign.cost.toFixed(2),
              conversions: campaign.conversions,
              conversionsValue: campaign.conversions_value,
              cpc: campaign.cpc.toFixed(2)
            }
          }));
        }
      } catch (dbError) {
        // Fallback to Google Ads on database error
        const googleAdsService = new GoogleAdsService(account.google_ads_id);
        campaigns = await googleAdsService.getCampaigns(dateRange);
      }
    }

    res.json({ campaigns, account: account.name });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get campaign performance over time
router.get('/:accountId/:campaignId/performance', async (req, res) => {
  try {
    const { accountId, campaignId } = req.params;
    const { dateRange = '30' } = req.query;

    const startDate = new Date(Date.now() - (parseInt(dateRange) * 24 * 60 * 60 * 1000))
      .toISOString().split('T')[0];

    const { data, error } = await dbService.supabase
      .from('daily_metrics')
      .select('*')
      .eq('account_id', accountId)
      .eq('campaign_id', campaignId)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({ performance: data });
  } catch (error) {
    console.error('Error fetching campaign performance:', error);
    res.status(500).json({ error: 'Failed to fetch campaign performance' });
  }
});

export default router;