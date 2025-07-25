import express from 'express';
import { GoogleAdsService } from '../services/googleAdsService.js';
import { DatabaseService } from '../services/databaseService.js';

const router = express.Router();
const dbService = new DatabaseService();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await dbService.getAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Sync accounts from Google Ads
router.post('/sync/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    const googleAdsService = new GoogleAdsService(customerId);
    const accounts = await googleAdsService.getAccounts();
    
    // Save accounts to database
    const savedAccounts = [];
    for (const account of accounts) {
      const savedAccount = await dbService.saveAccount(account);
      savedAccounts.push(savedAccount);
    }

    res.json({ 
      success: true, 
      accounts: savedAccounts,
      message: `Synced ${savedAccounts.length} accounts`
    });
  } catch (error) {
    console.error('Error syncing accounts:', error);
    res.status(500).json({ error: 'Failed to sync accounts from Google Ads' });
  }
});

// Get account summary
router.get('/:accountId/summary', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { dateRange = '30' } = req.query;

    // Get account from database
    const { data: account, error } = await dbService.supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get fresh data from Google Ads
    const googleAdsService = new GoogleAdsService(account.google_ads_id);
    const summaryData = await googleAdsService.getAccountSummary(dateRange);
    
    // Save summary to database
    await dbService.saveAccountSummary(accountId, summaryData);

    res.json(summaryData);
  } catch (error) {
    console.error('Error fetching account summary:', error);
    res.status(500).json({ error: 'Failed to fetch account summary' });
  }
});

export default router;