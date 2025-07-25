# Google Ads Dashboard

Sistema completo para monitoramento e análise de campanhas do Google Ads com autenticação OAuth2, dashboard interativo e integração com Supabase.

## 🚀 Funcionalidades

- **Autenticação OAuth2**: Login seguro com Google
- **Dashboard Interativo**: Métricas em tempo real com gráficos
- **Gestão de Campanhas**: Visualização e análise detalhada
- **Relatórios Avançados**: Geração e exportação de dados
- **Base de Dados Robusta**: Armazenamento com Supabase
- **Design Responsivo**: Interface moderna e mobile-friendly

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **Conta Google Ads**: Com acesso de desenvolvedor
2. **Conta Supabase**: Para banco de dados
3. **Node.js**: Versão 16 ou superior
4. **Credenciais Google Ads API**:
   - Client ID
   - Client Secret
   - Developer Token
   - Refresh Token

## 🛠️ Configuração do Google Ads API

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Ads API**
4. Vá para "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
5. Configure o tipo de aplicativo como "Aplicação web"
6. Adicione URLs autorizadas:
   - `http://localhost:5173` (desenvolvimento)
   - Sua URL de produção

### 2. Obter Developer Token

1. Acesse [Google Ads](https://ads.google.com/)
2. Vá para "Ferramentas e configurações" > "Configuração" > "Acesso à API"
3. Solicite um Developer Token (pode levar alguns dias para aprovação)

### 3. Gerar Refresh Token

Execute este código Node.js para obter o refresh token:

```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'SEU_CLIENT_ID',
  'SEU_CLIENT_SECRET',
  'http://localhost:3000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/adwords'];
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('Acesse esta URL:', url);

// Após autorizar, use o código retornado:
// const { tokens } = await oauth2Client.getToken('CODIGO_DA_URL');
// console.log('Refresh Token:', tokens.refresh_token);
```

## 🗄️ Configuração do Supabase

### 1. Criar Projeto Supabase

1. Acesse [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Anote a URL e as chaves de API

### 2. Criar Tabelas

Execute estes comandos SQL no editor do Supabase:

```sql
-- Tabela de contas Google Ads
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  google_ads_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  time_zone VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de campanhas
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  google_ads_campaign_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  type VARCHAR(50) NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  conversions DECIMAL(8,2) DEFAULT 0,
  conversions_value DECIMAL(12,2) DEFAULT 0,
  cpc DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, google_ads_campaign_id)
);

-- Tabela de métricas diárias
CREATE TABLE daily_metrics (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  campaign_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  conversions DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, campaign_id, date)
);

-- Tabela de resumos de conta
CREATE TABLE account_summaries (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  conversions DECIMAL(8,2) DEFAULT 0,
  conversions_value DECIMAL(12,2) DEFAULT 0,
  cpc DECIMAL(8,2) DEFAULT 0,
  date_range INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_campaigns_account_id ON campaigns(account_id);
CREATE INDEX idx_daily_metrics_account_date ON daily_metrics(account_id, date);
CREATE INDEX idx_daily_metrics_campaign_date ON daily_metrics(campaign_id, date);
```

### 3. Configurar RLS (Row Level Security)

```sql
-- Ativar RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_summaries ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme necessário)
CREATE POLICY "Allow all operations" ON accounts FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON campaigns FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON daily_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON account_summaries FOR ALL USING (true);
```

## ⚙️ Instalação e Configuração

### 1. Clonar e Instalar Dependências

```bash
# Instalar dependências do frontend e backend
npm install

# Ou instalar separadamente
npm install  # Frontend
cd backend && npm install  # Backend
```

### 2. Configurar Variáveis de Ambiente

Copie os arquivos de exemplo e configure suas credenciais:

```bash
# Frontend (.env)
cp .env.example .env

# Backend (backend/.env)
cp backend/.env.example backend/.env
```

### 3. Configurar .env (Frontend)

```env
# Google Ads API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DEVELOPER_TOKEN=your_developer_token_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### 4. Configurar backend/.env (Backend)

```env
# Google Ads API Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DEVELOPER_TOKEN=your_developer_token_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🚀 Executar o Projeto

### Desenvolvimento

```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou executar separadamente
npm run dev:frontend  # Frontend na porta 5173
npm run dev:backend   # Backend na porta 3001
```

### Produção

```bash
# Build do frontend
npm run build

# Executar backend em produção
cd backend && npm start
```

## 📁 Estrutura do Projeto

```
/
├── src/                     # Frontend React
│   ├── components/          # Componentes reutilizáveis
│   ├── pages/              # Páginas principais
│   ├── hooks/              # Custom hooks
│   ├── services/           # APIs e integrações
│   └── types/              # Definições TypeScript
├── backend/                # Backend Node.js
│   ├── routes/             # Rotas da API
│   ├── services/           # Lógica de negócio
│   ├── config/             # Configurações
│   └── middleware/         # Middlewares
└── README.md               # Este arquivo
```

## 🔧 Scripts Disponíveis

```bash
# Frontend
npm run dev              # Desenvolvimento
npm run build           # Build para produção
npm run preview         # Preview da build

# Backend
npm run dev:backend     # Desenvolvimento do backend
npm run build:backend   # Build do backend

# Ambos
npm run dev            # Frontend + Backend
```

## 🚀 Deploy no Vercel

### 1. Preparar para Deploy

```bash
# Build do projeto
npm run build
```

### 2. Configurar Vercel

Crie um arquivo `vercel.json`:

```json
{
  "functions": {
    "backend/server.js": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/backend/server.js"
    }
  ]
}
```

### 3. Variáveis de Ambiente no Vercel

Configure as mesmas variáveis do `.env` no painel do Vercel.

## 📊 Funcionalidades Principais

### Dashboard
- Métricas em tempo real
- Gráficos interativos
- Resumo de performance
- Filtros por período

### Campanhas
- Lista de todas as campanhas
- Filtros por status e nome
- Métricas detalhadas
- Atualização em tempo real

### Relatórios
- Geração de relatórios personalizados
- Exportação em CSV/JSON
- Análise histórica
- Comparações de período

## 🔒 Segurança

- Autenticação OAuth2 com Google
- Tokens seguros com refresh automático
- Rate limiting na API
- Validação de dados
- CORS configurado

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router
- Recharts (gráficos)
- Axios (HTTP client)

### Backend  
- Node.js + Express
- Google Ads API
- Google APIs
- Supabase (PostgreSQL)
- JWT para autenticação

## 📝 Troubleshooting

### Erro de Autenticação
- Verifique se o Client ID e Secret estão corretos
- Confirme se o Developer Token foi aprovado
- Teste o Refresh Token separadamente

### Erro de Conexão com Banco
- Verifique as credenciais do Supabase
- Confirme se as tabelas foram criadas
- Teste a conexão diretamente

### Erro de CORS
- Verifique se o FRONTEND_URL está correto no backend
- Confirme as URLs autorizadas no Google Cloud Console

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Se precisar de ajuda:

1. Verifique a documentação do Google Ads API
2. Consulte a documentação do Supabase
3. Abra uma issue no repositório
4. Entre em contato com o desenvolvedor

---

**Desenvolvido com ❤️ para gestores de tráfego que precisam de dados precisos e em tempo real.**