# 🚀 Guia de Configuração - Google Ads Dashboard

Este documento detalha como configurar o sistema do zero para funcionar com dados reais da Google Ads API.

## ✅ Status dos Erros Corrigidos

### Erros Backend Resolvidos:
- ❌ **SyntaxError: Identifier 'dotenv' has already been declared** → ✅ **CORRIGIDO**
- ❌ **Failed to load resource: net::ERR_CONNECTION_REFUSED** → ✅ **CORRIGIDO**
- ❌ **API Error: Network Error** → ✅ **CORRIGIDO**

### Erros Frontend Resolvidos:
- ❌ **React Router Future Flag Warnings** → ✅ **CORRIGIDO**
- ❌ **Failed to get auth URL: AxiosError** → ✅ **MELHORADO** (agora mostra instruções)

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **npm** ou **yarn**
3. **Conta Google Ads** com acesso à API
4. **Projeto no Google Cloud Console**

## 🔧 Configuração Passo a Passo

### 1. Configurar Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative as seguintes APIs:
   - Google Ads API
   - Google OAuth2 API

### 2. Configurar Credenciais OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Clique em **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**
3. Configure:
   - **Application type**: Web application
   - **Name**: Google Ads Dashboard
   - **Authorized redirect URIs**: `http://localhost:5173/auth/callback`
4. Salve o **Client ID** e **Client Secret**

### 3. Obter Developer Token

1. Acesse [Google Ads API Center](https://ads.google.com/nav/selectaccount?authuser=0&dst=/aw/apicenter)
2. Solicite um **Developer Token**
3. Aguarde aprovação (pode levar alguns dias)

### 4. Configurar Variáveis de Ambiente

#### Backend (`backend/.env`):
```env
# Google Ads API Configuration
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REFRESH_TOKEN=seu_refresh_token_aqui
GOOGLE_DEVELOPER_TOKEN=seu_developer_token_aqui

# Supabase Configuration (opcional para persistência)
SUPABASE_URL=sua_url_supabase_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`.env`):
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Supabase Configuration (opcional)
VITE_SUPABASE_URL=sua_url_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 5. Obter Refresh Token

Para obter o refresh token, execute este script temporário:

```javascript
// refresh-token-generator.js
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  'SEU_CLIENT_ID',
  'SEU_CLIENT_SECRET',
  'http://localhost:3001/oauth2callback'
);

const scopes = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('Acesse esta URL:', url);
console.log('Após autorizar, use o código retornado para obter o refresh token');
```

## 🚀 Executando o Sistema

### 1. Instalar Dependências

```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd ../
npm install
```

### 2. Iniciar os Serviços

```bash
# Backend (porta 3001)
cd backend
npm run dev

# Frontend (porta 5173)
cd ../
npm run dev
```

### 3. Acessar o Sistema

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## 🔍 Testando a Configuração

1. **Verificar Backend**: Acesse http://localhost:3001/health
2. **Verificar Auth**: Acesse http://localhost:3001/api/auth/url
3. **Verificar Frontend**: Deve mostrar a tela de login

## ⚠️ Solução de Problemas

### Backend não inicia
- Verifique se as portas 3001 e 5173 estão livres
- Confirme se o arquivo `.env` está no diretório `backend/`
- Verifique se todas as dependências foram instaladas

### Erro de autenticação
- Confirme se as credenciais no `.env` estão corretas
- Verifique se a URL de redirect está configurada no Google Cloud Console
- Certifique-se de que o Developer Token foi aprovado

### Frontend não conecta
- Confirme se o backend está rodando na porta 3001
- Verifique se o `VITE_API_URL` está correto no `.env`
- Limpe o cache do navegador

## 📊 Funcionalidades Disponíveis

Após a configuração completa, você terá acesso a:

- ✅ **Dashboard Principal**: Visão geral das campanhas
- ✅ **Gestão de Campanhas**: Lista e detalhes das campanhas
- ✅ **Métricas em Tempo Real**: Dados atualizados da Google Ads API
- ✅ **Relatórios**: Exportação de dados
- ✅ **Autenticação OAuth**: Login seguro com Google

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do console (F12 no navegador)
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Teste a conectividade com a Google Ads API
4. Consulte a documentação oficial do Google Ads API

---

**Nota**: Este sistema agora está preparado para funcionar com dados reais da Google Ads API, sem dados de exemplo.