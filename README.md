# 💍 DiPaula Studio - Convites Animados

**Crie e compartilhe convites de casamento personalizados e interativos.**

Aplicação web full-stack moderna para criar, editar, exportar e compartilhar convites de casamento digitais com design elegante, themes personalizáveis e funcionalidades colaborativas.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Node](https://img.shields.io/badge/node-18%2B-blue?style=flat-square)

---

## 🌟 Features

### Editor Interativo
- ✏️ **Editor WYSIWYG** - Edite nome dos noivos, data, local, mensagens
- 🎨 **4 Temas de Cores** - Champanhe, Marfim, Blush, Mogno
- 🖼️ **Upload de Imagem** - Sua foto em destaque (proporção 9:16)
- 👀 **Preview ao Vivo** - Veja as mudanças em tempo real
- 💾 **Auto-save** - Rascunho salvo automaticamente a cada 400ms

### Exportação
- 📱 **PNG 9:16** - Alta resolução (4x pixelRatio)
- 📷 **JPG 9:16** - Qualidade 95%
- 📄 **PDF A4** - Layout vertical pronto para impressão
- 📦 **ZIP em Lote** - PNG + JPG + PDF em um arquivo
- ↩️ **Retomar Exportação** - Continue de onde parou

### Versionamento
- 💾 **Salve Versões** - Até 12 variações diferentes
- 📋 **Histórico** - Data/hora de cada versão
- 🔄 **Carregar Versão** - Volte a qualquer versão anterior
- 🗑️ **Deletar** - Remova versões que não precisa

### Publicação
- 🌐 **Compartilhamento** - Gere URL única para compartilhar
- 📊 **Contador de Visualizações** - Veja quantas pessoas viram
- 🔐 **Seguro** - Apenas você controla as publicações

### Colaborativo
- 📸 **Álbum de Fotos** - Timeline com fotos dos noivos
- 🎬 **História** - Seção narrativa da relação
- 👥 **Convites** - Gerenciar lista de convidados (manual)

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- Conta Supabase (gratuita)

### Instalação

```bash
# 1. Clonar
git clone https://github.com/leopitzerktv/dipaulastudio.git
cd dipaulastudio

# 2. Instalar dependências
bun install
# ou
npm install

# 3. Criar arquivo .env.local
cp .env.example .env.local

# 4. Preencher variáveis Supabase
# Copie de: https://supabase.com/dashboard/project/[seu-projeto]/api
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# 5. Rodar localmente
bun run dev
```

Abrir: **http://localhost:5173**

---

## 📁 Estrutura do Projeto

```
dipaulastudio/
├── src/
│   ├── routes/           # Páginas (TanStack Router)
│   ├── hooks/            # Custom React hooks
│   ├── components/       # Componentes reutilizáveis
│   ├── lib/              # Utilities e tipos
│   ├── integrations/     # Supabase client
│   └── assets/           # Imagens e fontes
├── .github/workflows/    # CI/CD pipelines
├── CLAUDE.md             # Documentação técnica
├── README.md             # Este arquivo
├── ROADMAP.md            # Próximas features
└── vite.config.ts        # Configuração do build
```

---

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Dev server (hot reload)

# Build
npm run build            # Build para produção
npm run preview          # Preview do build

# Qualidade
npm run lint             # ESLint
npm run format           # Prettier (auto-fix)

# Testes (future)
npm run test             # Vitest
npm run test:watch       # Modo watch
npm run test:coverage    # Coverage report
```

### Padrões de Código

**Tecnologias**:
- React 19 + TypeScript
- TanStack Router
- Tailwind CSS
- Custom Hooks (não Redux/Zustamd)

**Estrutura**:
- Componentes **puros** (sem estado)
- Hooks **customizados** (lógica centralizada)
- Tipos **TypeScript** em tudo
- Error Boundary em **rotas principais**

**Estilos**:
- Tailwind CSS com CSS custom properties
- Tema dark/light automático
- Proporções 9:16 padrão

Para detalhes técnicos, ver [CLAUDE.md](./CLAUDE.md).

---

## 🗄️ Database

### Schema Supabase

```sql
-- Convites salvos
CREATE TABLE saved_invites (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  date TEXT,
  time TEXT,
  venue TEXT,
  city TEXT,
  message TEXT,
  tagline TEXT,
  palette_id TEXT,
  image_src TEXT,
  label TEXT DEFAULT '__autosave__',
  published_url TEXT,
  share_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fotos do álbum
CREATE TABLE album_photos (
  id UUID PRIMARY KEY,
  invite_id UUID REFERENCES saved_invites,
  photo_url TEXT NOT NULL,
  order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS (Row Level Security)
- Usuários só veem seus próprios convites
- Publicação = acesso público a URL específica

---

## 🔐 Segurança

### Variáveis de Ambiente
**Nunca** commit `.env.local`:
```bash
# .gitignore
.env.local
.env.*.local
node_modules/
.DS_Store
```

Use `.env.example` como template.

### Supabase RLS
- Auth obrigatória para editar
- Publicação com slug aleatório
- Sem acesso direto ao user_id

### localStorage
- Limite: 5MB por chave
- Validação de quota automática
- Migração automática → Supabase

---

## 📊 Performance

### Build
- **Dev**: Hot reload < 100ms
- **Prod**: Build < 1s, bundle ~200KB (gzip)

### Runtime
- Auto-save: 400ms debounce
- Preview update: < 100ms
- Export PNG: 2-5s (4x resolution)

### Otimizações
- Code splitting por rota
- Lazy loading de jsPDF, jszip
- Image compression antes de data URL
- React.memo em componentes > 300 linhas

---

## 🐛 Reporting Issues

Encontrou um bug? Abra uma issue:
1. Título claro (ex: "Editor não salva customização de cores")
2. Passo a passo para reproduzir
3. Screenshots/videos se possível
4. Seu browser e SO

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Processo:

1. **Fork** o repositório
2. **Crie branch** (`git checkout -b feature/minha-feature`)
3. **Commit** com mensagem clara (`git commit -m "feat: adicionar X"`)
4. **Push** (`git push origin feature/minha-feature`)
5. **Abra Pull Request**

### Dicas
- Siga os padrões em [CLAUDE.md](./CLAUDE.md)
- Execute `npm run lint && npm run format` antes de PR
- Adicione testes se possível
- Atualize [ROADMAP.md](./ROADMAP.md) se impactar features

---

## 📝 Licença

MIT © 2025 DiPaula Studio

---

## 🙋 Suporte

Dúvidas?
- 📖 Ver [CLAUDE.md](./CLAUDE.md) para documentação técnica
- 🗺️ Ver [ROADMAP.md](./ROADMAP.md) para próximas features
- 💬 Abrir issue no GitHub

---

## 🎯 Roadmap

Veja [ROADMAP.md](./ROADMAP.md) para:
- Features em desenvolvimento
- Bugs conhecidos
- Melhorias planejadas
- Timeline de releases

**Versão atual**: 0.1.0 (MVP)  
**Última atualização**: 2026-07-15
