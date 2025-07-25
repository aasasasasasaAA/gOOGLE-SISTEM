import express from 'express';
import { DatabaseService } from '../services/databaseService.js';

const router = express.Router();
const dbService = new DatabaseService();

// Generate comprehensive report
router.get('/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { dateRange = '30' } = req.query;

    const reportData = await dbService.generateReport(accountId, parseInt(dateRange));
    
    // Process data for charts and insights
    const processedData = processReportData(reportData);
    
    res.json({
      ...processedData,
      generatedAt: new Date().toISOString(),
      dateRange: parseInt(dateRange)
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Export report data
router.get('/:accountId/export', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { dateRange = '30', format = 'json' } = req.query;

    const reportData = await dbService.generateReport(accountId, parseInt(dateRange));

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report-${accountId}-${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.json({
        data: reportData,
        exportedAt: new Date().toISOString(),
        format: 'json'
      });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// Helper functions
function processReportData(rawData) {
  const dailyTotals = {};
  const campaignPerformance = {};

  rawData.forEach(row => {
    const date = row.date;
    const campaignName = row.campaigns?.name || 'Unknown Campaign';

    // Daily totals
    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        date,
        impressions: 0,
        clicks: 0,
        cost: 0,
        conversions: 0
      };
    }

    dailyTotals[date].impressions += row.impressions;
    dailyTotals[date].clicks += row.clicks;
    dailyTotals[date].cost += row.cost;
    dailyTotals[date].conversions += row.conversions;

    // Campaign performance
    if (!campaignPerformance[campaignName]) {
      campaignPerformance[campaignName] = {
        name: campaignName,
        type: row.campaigns?.type || 'Unknown',
        impressions: 0,
        clicks: 0,
        cost: 0,
        conversions: 0
      };
    }

    campaignPerformance[campaignName].impressions += row.impressions;
    campaignPerformance[campaignName].clicks += row.clicks;
    campaignPerformance[campaignName].cost += row.cost;
    campaignPerformance[campaignName].conversions += row.conversions;
  });

  // Calculate CTR and CPC for daily data
  const dailyPerformance = Object.values(dailyTotals).map(day => ({
    ...day,
    ctr: day.impressions > 0 ? (day.clicks / day.impressions * 100).toFixed(2) : 0,
    cpc: day.clicks > 0 ? (day.cost / day.clicks).toFixed(2) : 0
  }));

  // Calculate CTR and CPC for campaigns
  const campaigns = Object.values(campaignPerformance).map(campaign => ({
    ...campaign,
    ctr: campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100).toFixed(2) : 0,
    cpc: campaign.clicks > 0 ? (campaign.cost / campaign.clicks).toFixed(2) : 0
  }));

  return {
    dailyPerformance,
    campaigns,
    summary: {
      totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
      totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
      totalCost: campaigns.reduce((sum, c) => sum + c.cost, 0).toFixed(2),
      totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
      averageCTR: campaigns.length > 0 
        ? (campaigns.reduce((sum, c) => sum + parseFloat(c.ctr), 0) / campaigns.length).toFixed(2)
        : 0,
      averageCPC: campaigns.filter(c => parseFloat(c.cpc) > 0).length > 0
        ? (campaigns.filter(c => parseFloat(c.cpc) > 0).reduce((sum, c) => sum + parseFloat(c.cpc), 0) / 
           campaigns.filter(c => parseFloat(c.cpc) > 0).length).toFixed(2)
        : 0
    }
  };
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

export default router;