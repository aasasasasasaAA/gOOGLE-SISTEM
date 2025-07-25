import React, { useState, useEffect } from 'react';
import { 
  Target, 
  RefreshCw, 
  Filter,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  Search
} from 'lucide-react';
import { campaignsApi, accountsApi } from '../services/api';
import { Account, Campaign } from '../types';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Campaigns: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadCampaigns();
    }
  }, [selectedAccount, dateRange]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await accountsApi.getAll();
      setAccounts(accountsData);
      
      if (accountsData.length > 0 && !selectedAccount) {
        setSelectedAccount(accountsData[0]);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async (refresh = false) => {
    if (!selectedAccount) return;

    try {
      if (refresh) setRefreshing(true);
      
      const response = await campaignsApi.getByAccount(
        selectedAccount.id, 
        dateRange, 
        refresh
      );
      
      setCampaigns(response.campaigns);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar campanhas');
    } finally {
      if (refresh) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadCampaigns(true);
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: selectedAccount?.currency || 'BRL'
    }).format(numValue);
  };

  const formatNumber = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR').format(numValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enabled':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'enabled':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'removed':
        return 'Removida';
      default:
        return status;
    }
  };

  const getCampaignTypeText = (type: string) => {
    switch (type) {
      case 'SEARCH':
        return 'Pesquisa';
      case 'DISPLAY':
        return 'Display';
      case 'SHOPPING':
        return 'Shopping';
      case 'VIDEO':
        return 'Vídeo';
      case 'PERFORMANCE_MAX':
        return 'Performance Max';
      default:
        return type;
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totals = filteredCampaigns.reduce((acc, campaign) => ({
    impressions: acc.impressions + campaign.metrics.impressions,
    clicks: acc.clicks + campaign.metrics.clicks,
    cost: acc.cost + parseFloat(campaign.metrics.cost),
    conversions: acc.conversions + campaign.metrics.conversions
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 });

  const averageCTR = totals.impressions > 0 
    ? (totals.clicks / totals.impressions * 100).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <LoadingSpinner size="lg" />
          <p className="text-center mt-4 text-gray-600">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e monitore suas campanhas do Google Ads
          </p>
        </div>

        <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Account selector */}
          <select
            value={selectedAccount?.id || ''}
            onChange={(e) => {
              const account = accounts.find(acc => acc.id === parseInt(e.target.value));
              setSelectedAccount(account || null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>

          {/* Date range selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Impressões"
          value={formatNumber(totals.impressions)}
          icon={Eye}
        />
        <MetricCard
          title="Total Cliques"
          value={formatNumber(totals.clicks)}
          icon={MousePointer}
        />
        <MetricCard
          title="CTR Médio"
          value={`${averageCTR}%`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Custo Total"
          value={formatCurrency(totals.cost)}
          icon={DollarSign}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar campanhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos Status</option>
              <option value="enabled">Ativas</option>
              <option value="paused">Pausadas</option>
              <option value="removed">Removidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Campanhas ({filteredCampaigns.length})
          </h3>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {campaigns.length === 0 ? 'Nenhuma campanha encontrada' : 'Nenhuma campanha corresponde aos filtros'}
            </h3>
            <p className="text-gray-600">
              {campaigns.length === 0 
                ? 'Suas campanhas aparecerão aqui quando estiverem disponíveis.'
                : 'Tente ajustar seus filtros de busca.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressões
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliques
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversões
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {campaign.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getCampaignTypeText(campaign.type)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatNumber(campaign.metrics.impressions)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatNumber(campaign.metrics.clicks)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {campaign.metrics.ctr}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(campaign.metrics.cost)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatCurrency(campaign.metrics.cpc)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {formatNumber(campaign.metrics.conversions)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;