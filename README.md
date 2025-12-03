# FitChef IA - Seu Nutricionista Pessoal com IA

Aplicativo web moderno para geração de receitas fitness personalizadas usando Inteligência Artificial. Crie receitas saudáveis, deliciosas e personalizadas em segundos com base nos ingredientes que você tem disponível.

## 🚀 Funcionalidades

- **Geração de Receitas com IA**: Use Google Gemini AI para criar receitas personalizadas
- **Cardápio Completo do Dia**: Gere café da manhã, almoço, lanche e jantar em um clique (Premium)
- **Lista de Compras Automática**: Receba listas organizadas por categoria (Premium)
- **Cálculo de Macros**: Calorias, proteínas e tempo de preparo calculados automaticamente
- **Imagens Geradas**: Visualize como seu prato ficará com imagens geradas por IA
- **Histórico de Receitas**: Salve e acesse suas receitas favoritas
- **Sistema de Planos**: Plano gratuito (3 gerações/dia) e Premium (ilimitado)

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Supabase** - Autenticação e banco de dados
- **Google Gemini AI** - Geração de receitas
- **Tailwind CSS 4** - Estilização
- **Lucide React** - Ícones
- **Wiapy** - Processamento de pagamentos

## 📋 Pré-requisitos

- Node.js 18+ 
- npm, yarn, pnpm ou bun
- Conta no Supabase
- API Key do Google Gemini AI
- (Opcional) Conta no Wiapy para pagamentos

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd fitchefIA
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configure as variáveis de ambiente. Crie um arquivo `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase

# Google Gemini AI
GEMINI_API_KEY=sua_chave_do_gemini

# Wiapy (Opcional - para pagamentos)
WIAPY_WEBHOOK_TOKEN=seu_token_do_webhook

# Base URL (para callbacks de autenticação)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Configure o banco de dados no Supabase. Você precisará criar as seguintes tabelas:

### Tabela `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  plan_tier TEXT DEFAULT 'free',
  is_premium BOOLEAN DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela `daily_usage`
```sql
CREATE TABLE daily_usage (
  user_id UUID REFERENCES auth.users,
  date DATE,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
```

### Tabela `saved_recipes`
```sql
CREATE TABLE saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  recipe_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

5. Execute o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

6. Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
fitchefIA/
├── app/                    # App Router do Next.js
│   ├── api/                # Rotas de API
│   │   ├── generate/      # Endpoint de geração de receitas
│   │   └── webhooks/      # Webhooks (Wiapy)
│   ├── auth/              # Callback de autenticação
│   ├── components/        # Componentes React
│   ├── generate/          # Página de geração
│   ├── login/             # Página de login/cadastro
│   ├── premium/           # Página de planos
│   ├── profile/           # Página de perfil
│   └── page.tsx           # Página inicial
├── components/            # Componentes compartilhados
├── utils/                 # Utilitários
│   ├── supabase/          # Clientes Supabase
│   └── env.ts             # Validação de variáveis
├── public/                # Arquivos estáticos
├── middleware.ts          # Middleware do Next.js
└── package.json
```

## 🔐 Autenticação

O projeto usa Supabase Auth para autenticação. Os usuários podem:
- Criar conta com email e senha
- Fazer login
- Recuperar senha (via Supabase)
- Sessões gerenciadas automaticamente

## 💳 Sistema de Planos

### Plano Gratuito
- 3 gerações por dia
- Apenas objetivo "Low Carb"
- Apenas tempo "30 min (Rápido)"
- Receitas únicas

### Plano Performance (Premium)
- Gerações ilimitadas
- Todos os objetivos (Low Carb, Perda de peso, Ganho de massa, etc.)
- Todos os tempos de preparo
- Cardápio completo do dia
- Lista de compras automática

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outros Provedores

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificar código
```

### Validação de Variáveis

O projeto inclui validação automática de variáveis de ambiente. Se alguma variável obrigatória estiver faltando, você verá um erro claro.

## 📝 Melhorias Implementadas

- ✅ Middleware configurado corretamente
- ✅ Validação de dados de entrada
- ✅ Tratamento robusto de erros
- ✅ Validação de variáveis de ambiente
- ✅ Melhorias de acessibilidade (ARIA labels)
- ✅ Logs estruturados para debugging
- ✅ Validação de payloads de webhook
- ✅ Tratamento de edge cases

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

## 🆘 Suporte

Para suporte, entre em contato através do email ou abra uma issue no repositório.

---

Desenvolvido com ❤️ usando Next.js e IA
