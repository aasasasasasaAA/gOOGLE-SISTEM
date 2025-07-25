import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  MousePointer, 
  TrendingUp, 
  DollarSign, 
  Target,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { accountsApi } from '../services/api';
import { Account, AccountSummaryResponse } from '../types';

const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [summary, setSummary] = useState<AccountSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadAccountSummary();
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

  const loadAccountSummary = async () => {
    if (!selectedAccount) return;

    try {
      const summaryData = await accountsApi.getSummary(selectedAccount.id, dateRange);
      setSummary(summaryData);
      setError(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao carregar resumo da conta');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccountSummary();
    setRefreshing(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <LoadingSpinner size="lg" />
          <p className="text-center mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta encontrada</h3>
        <p className="text-gray-600 mb-6">
          Você precisa sincronizar suas contas do Google Ads primeiro.
        </p>
        <button
          onClick={() => window.location.href = '/settings'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Configurar Contas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Visão geral das suas campanhas do Google Ads
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

      {/* Metrics Cards */}
      {summary ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Impressões"
              value={formatNumber(summary.summary.impressions)}
              icon={Eye}
            />
            <MetricCard
              title="Cliques"
              value={formatNumber(summary.summary.clicks)}
              icon={MousePointer}
            />
            <MetricCard
              title="CTR"
              value={`${summary.summary.ctr}%`}
              icon={TrendingUp}
            />
            <MetricCard
              title="Custo Total"
              value={formatCurrency(summary.summary.cost)}
              icon={DollarSign}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Conversões"
              value={formatNumber(summary.summary.conversions)}
              icon={Target}
            />
            <MetricCard
              title="Valor das Conversões"
              value={formatCurrency(summary.summary.conversionsValue)}
              icon={DollarSign}
            />
            <MetricCard
              title="CPC Médio"
              value={formatCurrency(summary.summary.cpc)}
              icon={TrendingUp}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Timeline */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance ao Longo do Tempo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'dd/MM', { locale: ptBR })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'dd/MM/yyyy', { locale: ptBR })}
                    formatter={(value, name) => {
                      if (name === 'cost') return [formatCurrency(value), 'Custo'];
                      if (name === 'clicks') return [formatNumber(value), 'Cliques'];
                      if (name === 'impressions') return [formatNumber(value), 'Impressões'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" stroke="#3B82F6" name="impressions" />
                  <Line type="monotone" dataKey="clicks" stroke="#10B981" name="clicks" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cost Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Custos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'dd/MM', { locale: ptBR })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')), 'dd/MM/yyyy', { locale: ptBR })}
                    formatter={(value) => [formatCurrency(value), 'Custo']}
                  />
                  <Bar dataKey="cost" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando dados da conta...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;