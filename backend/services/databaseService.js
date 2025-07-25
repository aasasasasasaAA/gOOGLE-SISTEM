import { supabase } from '../config/database.js';

export class DatabaseService {
  // Account management
  async saveAccount(accountData) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .upsert({
          google_ads_id: accountData.id,
          name: accountData.name,
          currency: accountData.currency,
          time_zone: accountData.timeZone,
          status: accountData.status,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving account:', error);
      throw new Error('Failed to save account data');
    }
  }

  async getAccounts() {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Failed to fetch accounts');
    }
  }

  // Campaign data management
  async saveCampaignData(accountId, campaigns) {
    try {
      const campaignInserts = campaigns.map(campaign => ({
        account_id: accountId,
        google_ads_campaign_id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        type: campaign.type,
        impressions: campaign.metrics.impressions,
        clicks: campaign.metrics.clicks,
        ctr: parseFloat(campaign.metrics.ctr),
        cost: parseFloat(campaign.metrics.cost),
        conversions: campaign.metrics.conversions,
        conversions_value: campaign.metrics.conversionsValue,
        cpc: parseFloat(campaign.metrics.cpc),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('campaigns')
        .upsert(campaignInserts, { 
          onConflict: 'account_id,google_ads_campaign_id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;

      // Save daily data
      for (const campaign of campaigns) {
        if (campaign.dailyData && campaign.dailyData.length > 0) {
          await this.saveDailyData(accountId, campaign.id, campaign.dailyData);
        }
      }

      return data;
    } catch (error) {
      console.error('Error saving campaign data:', error);
      throw new Error('Failed to save campaign data');
    }
  }

  async saveDailyData(accountId, campaignId, dailyData) {
    try {
      const dailyInserts = dailyData.map(day => ({
        account_id: accountId,
        campaign_id: campaignId,
        date: day.date,
        impressions: day.impressions,
        clicks: day.clicks,
        ctr: day.ctr,
        cost: day.cost,
        conversions: day.conversions
      }));

      const { error } = await supabase
        .from('daily_metrics')
        .upsert(dailyInserts, { 
          onConflict: 'account_id,campaign_id,date',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving daily data:', error);
      throw new Error('Failed to save daily metrics');
    }
  }

  // Report generation
  async generateReport(accountId, dateRange = 30) {
    try {
      const startDate = new Date(Date.now() - (dateRange * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_metrics')
        .select(`
          *,
          campaigns(name, type)
        `)
        .eq('account_id', accountId)
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  // Save account summary
  async saveAccountSummary(accountId, summaryData) {
    try {
      const { data, error } = await supabase
        .from('account_summaries')
        .upsert({
          account_id: accountId,
          impressions: summaryData.summary.impressions,
          clicks: summaryData.summary.clicks,
          ctr: parseFloat(summaryData.summary.ctr),
          cost: parseFloat(summaryData.summary.cost),
          conversions: summaryData.summary.conversions,
          conversions_value: parseFloat(summaryData.summary.conversionsValue),
          cpc: parseFloat(summaryData.summary.cpc),
          date_range: 30, // Default range
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving account summary:', error);
      throw new Error('Failed to save account summary');
    }
  }
}