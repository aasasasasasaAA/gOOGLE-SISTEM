import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart3, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const Login: React.FC = () => {
  const { login, getAuthUrl, isAuthenticated, loading, error } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authUrl, setAuthUrl] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Handle OAuth callback
    const code = searchParams.get('code');
    if (code) {
      handleAuthCallback(code);
    } else {
      loadAuthUrl();
    }
  }, [isAuthenticated, searchParams, navigate]);

  const loadAuthUrl = async () => {
    try {
      const url = await getAuthUrl();
      setAuthUrl(url);
    } catch (error) {
      console.error('Failed to load auth URL:', error);
    }
  };

  const handleAuthCallback = async (code: string) => {
    setAuthLoading(true);
    const success = await login(code);
    
    if (success) {
      navigate('/');
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Autenticando...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-full shadow-md">
              <BarChart3 className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Google Ads Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse sua conta para visualizar suas campanhas
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erro de Autenticação</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">O que você pode fazer:</h3>
              <ul className="space-y-3">
                {[
                  'Visualizar métricas de todas as campanhas',
                  'Acompanhar performance em tempo real',
                  'Gerar relatórios detalhados',
                  'Analisar dados históricos'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={!authUrl}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>

            {/* Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Ao fazer login, você concorda com nossos termos de uso e políticas de privacidade.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;