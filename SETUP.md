# Configuração do Google Ads Dashboard

## Problemas Resolvidos ✅

Este commit resolve os seguintes problemas:

1. **Erro de crash do servidor**: `Missing Google Ads API configuration`
2. **Erro de conexão**: `ERR_CONNECTION_REFUSED` na porta 3001
3. **Servidor não iniciava**: Faltavam variáveis de ambiente

## Configuração Rápida

### 1. Backend

```bash
cd backend
npm install
```

### 2. Variáveis de Ambiente

**Backend** (`backend/.env`):
```env
# Google Ads API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DEVELOPER_TOKEN=your_developer_token_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Iniciar o Sistema

**Backend**:
```bash
cd backend
npm run dev
```

**Frontend**:
```bash
npm run dev
```

## Modo de Desenvolvimento

O sistema agora funciona **sem configuração completa** do Google Ads API:

- ⚠️ Mostra avisos sobre configuração faltante
- 📊 Retorna dados mock para desenvolvimento
- 🚀 Servidor inicia normalmente
- 🔧 Permite desenvolvimento sem credenciais reais

## Configuração Completa do Google Ads API

Para usar dados reais do Google Ads, configure:

1. **Google Cloud Console**:
   - Crie um projeto
   - Ative a Google Ads API
   - Crie credenciais OAuth 2.0

2. **Google Ads Account**:
   - Obtenha o Developer Token
   - Configure o refresh token

3. **Atualize o `.env`** com as credenciais reais

## Status dos Serviços

- ✅ Servidor backend inicia sem crash
- ✅ API responde na porta 3001
- ✅ Frontend conecta com backend
- ✅ Tratamento de erros implementado
- ✅ Dados mock para desenvolvimento