import { getCustomerClient } from '../config/googleAds.js';

export class GoogleAdsService {
  constructor(customerId) {
    this.customerId = customerId;
    this.customer = getCustomerClient(customerId);
  }

  async getAccounts() {
    try {
      const query = `
        SELECT
          customer.id,
          customer.descriptive_name,
          customer.currency_code,
          customer.time_zone,
          customer.status
        FROM customer
        WHERE customer.status = 'ENABLED'
      `;

      const response = await this.customer.query(query);
      return response.map(row => ({
        id: row.customer.id,
        name: row.customer.descriptive_name,
        currency: row.customer.currency_code,
        timeZone: row.customer.time_zone,
        status: row.customer.status
      }));
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new Error('Failed to fetch Google Ads accounts');
    }
  }

  async getCampaigns(dateRange = '30') {
    try {
      const endDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const startDate = new Date(Date.now() - (parseInt(dateRange) * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0].replace(/-/g, '');

      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          segments.date
        FROM campaign
        WHERE segments.date >= '${startDate}'
          AND segments.date <= '${endDate}'
          AND campaign.status = 'ENABLED'
        ORDER BY segments.date DESC
      `;

      const response = await this.customer.query(query);
      
      // Group by campaign and aggregate metrics
      const campaignMap = new Map();
      
      response.forEach(row => {
        const campaignId = row.campaign.id;
        const date = row.segments.date;
        
        if (!campaignMap.has(campaignId)) {
          campaignMap.set(campaignId, {
            id: campaignId,
            name: row.campaign.name,
            status: row.campaign.status,
            type: row.campaign.advertising_channel_type,
            metrics: {
              impressions: 0,
              clicks: 0,
              cost: 0,
              conversions: 0,
              conversionsValue: 0
            },
            dailyData: []
          });
        }

        const campaign = campaignMap.get(campaignId);
        const costInCurrency = row.metrics.cost_micros / 1000000;
        
        // Aggregate total metrics
        campaign.metrics.impressions += parseInt(row.metrics.impressions || 0);
        campaign.metrics.clicks += parseInt(row.metrics.clicks || 0);
        campaign.metrics.cost += costInCurrency;
        campaign.metrics.conversions += parseFloat(row.metrics.conversions || 0);
        campaign.metrics.conversionsValue += parseFloat(row.metrics.conversions_value || 0);
        
        // Add daily data
        campaign.dailyData.push({
          date,
          impressions: parseInt(row.metrics.impressions || 0),
          clicks: parseInt(row.metrics.clicks || 0),
          ctr: parseFloat(row.metrics.ctr || 0),
          cost: costInCurrency,
          conversions: parseFloat(row.metrics.conversions || 0)
        });
      });

      // Calculate CTR for each campaign
      const campaigns = Array.from(campaignMap.values()).map(campaign => ({
        ...campaign,
        metrics: {
          ...campaign.metrics,
          ctr: campaign.metrics.impressions > 0 
            ? (campaign.metrics.clicks / campaign.metrics.impressions * 100).toFixed(2)
            : 0,
          cpc: campaign.metrics.clicks > 0 
            ? (campaign.metrics.cost / campaign.metrics.clicks).toFixed(2)
            : 0
        }
      }));

      return campaigns;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error('Failed to fetch campaign data');
    }
  }

  async getAccountSummary(dateRange = '30') {
    try {
      const endDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const startDate = new Date(Date.now() - (parseInt(dateRange) * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0].replace(/-/g, '');

      const query = `
        SELECT
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          segments.date
        FROM account_performance_view
        WHERE segments.date >= '${startDate}'
          AND segments.date <= '${endDate}'
        ORDER BY segments.date DESC
      `;

      const response = await this.customer.query(query);
      
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalCost = 0;
      let totalConversions = 0;
      let totalConversionsValue = 0;
      const dailyData = [];

      response.forEach(row => {
        const costInCurrency = row.metrics.cost_micros / 1000000;
        
        totalImpressions += parseInt(row.metrics.impressions || 0);
        totalClicks += parseInt(row.metrics.clicks || 0);
        totalCost += costInCurrency;
        totalConversions += parseFloat(row.metrics.conversions || 0);
        totalConversionsValue += parseFloat(row.metrics.conversions_value || 0);
        
        dailyData.push({
          date: row.segments.date,
          impressions: parseInt(row.metrics.impressions || 0),
          clicks: parseInt(row.metrics.clicks || 0),
          ctr: parseFloat(row.metrics.ctr || 0),
          cost: costInCurrency,
          conversions: parseFloat(row.metrics.conversions || 0)
        });
      });

      return {
        summary: {
          impressions: totalImpressions,
          clicks: totalClicks,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
          cost: totalCost.toFixed(2),
          conversions: totalConversions,
          conversionsValue: totalConversionsValue.toFixed(2),
          cpc: totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : 0
        },
        dailyData: dailyData.reverse() // Reverse to show chronological order
      };
    } catch (error) {
      console.error('Error fetching account summary:', error);
      throw new Error('Failed to fetch account summary');
    }
  }
}