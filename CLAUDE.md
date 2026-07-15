# Documentação Técnica - DiPaula Studio

## 📚 Índice
1. [Stack e Dependências](#stack-e-dependências)
2. [Arquitetura](#arquitetura)
3. [Padrões de Código](#padrões-de-código)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
6. [Como Rodar Localmente](#como-rodar-localmente)
7. [Testes](#testes)
8. [Deployment](#deployment)

---

## Stack e Dependências

### Frontend
- **React 19** - UI framework
- **TanStack Start** - Full-stack React framework
- **TanStack Router** - Routing with file-based conventions
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Supabase** - PostgreSQL + Auth + Real-time
- **Edge Functions** - Serverless functions

### Build & Dev Tools
- **Vite** - Module bundler
- **Bun** - Package manager & runtime
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Export & Processing
- **html-to-image** - DOM to PNG/JPG
- **jsPDF** - PDF generation
- **jszip** - ZIP creation
- **html2canvas** - Canvas rendering

---

## Arquitetura

### Diagrama Camadas
```
┌─────────────────────────────────────────┐
│         Routes (page components)        │
│   (editor, convite.$slug, histórias)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Custom Hooks (state + logic)         │
│ useInviteDraft, useInviteAuth, etc     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Presentational Components              │
│ (EditorForm, EditorPreview, etc)        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Utilities & Integrations             │
│ (Supabase, localStorage, utils)         │
└─────────────────────────────────────────┘
```

### Padrão de Estado

**Não usamos Redux/Zustand**. Ao invés disso:

1. **Custom Hooks** - Cada domínio tem seu hook
   - `useInviteDraft()` - Gerencia rascunho + auto-save
   - `useInviteAuth()` - Auth + cloud sync
   - `useInviteExport()` - Exportação individual
   - `useBatchExport()` - Exportação em lote

2. **Composição** - Routes compõem hooks
   - Passam state + callbacks para components
   - Components são puros (sem estado)

3. **Persistência**
   - localStorage para rascunho + versões (dev mode)
   - Supabase para dados em produção
   - Migração automática local → cloud

### Fluxo de Dados

```
User Input (Form)
    ↓
Hook State Update
    ↓
Auto-save to localStorage (400ms debounce)
    ↓
Cloud Sync to Supabase (quando logado)
    ↓
Preview atualiza (real-time)
```

---

## Padrões de Código

### 1. Custom Hooks
Cada hook tem responsabilidade única:

```typescript
// ✅ BOM: Uma responsabilidade
export function useInviteDraft() {
  const [brideName, setBrideName] = useState("...");
  // ... 9 outros campos
  return { brideName, setBrideName, ... };
}

// ❌ RUIM: Múltiplas responsabilidades
export function useEverything() {
  const [draft, setDraft] = useState(...);
  const [versions, setVersions] = useState(...);
  const [batch, setBatch] = useState(...);
  // ... tudo junto
}
```

### 2. Componentes Funcionais Puros
Componentes não têm estado interno:

```typescript
// ✅ BOM: Componente puro
export function EditorForm({ 
  brideName, 
  setBrideName,
  // ... todas as props
}) {
  return <form>...</form>;
}

// ❌ RUIM: Estado interno
export function EditorForm() {
  const [brideName, setBrideName] = useState("...");
  // ... duplica lógica do hook
}
```

### 3. Type Safety
Sempre usar TypeScript:

```typescript
// ✅ BOM
type InviteDraft = {
  brideName: string;
  groomName: string;
  palette: Palette;
};

// ❌ RUIM
const draft: any = { ... };
```

### 4. Error Handling
Centralizado com `useErrorHandler`:

```typescript
// ✅ BOM
const { handleError, createSafeHandler } = useErrorHandler();

const safeSave = createSafeHandler(
  async () => await save(),
  { context: "saveInvite" }
);

// ❌ RUIM
try {
  await save();
} catch {
  // silencia erro
}
```

### 5. localStorage
Usar `safeStorage` sempre:

```typescript
// ✅ BOM
import { safeSetItem, safeGetItem } from "@/lib/safeStorage";

safeSetItem("key", JSON.stringify(value));
const value = loadJSON("key", fallback);

// ❌ RUIM
window.localStorage.setItem("key", ...);
```

---

## Estrutura de Pastas

```
src/
├── routes/              # TanStack Router pages
│   ├── __root.tsx      # Root layout com ErrorBoundary
│   ├── editor.tsx      # Editor principal (245 linhas)
│   ├── convite.$slug.tsx
│   └── ...
│
├── hooks/              # Custom React hooks
│   ├── useInviteDraft.ts
│   ├── useInviteAuth.ts
│   ├── useInviteExport.ts
│   ├── useBatchExport.ts
│   ├── useInviteTour.ts
│   ├── useInviteVersions.ts
│   ├── useErrorHandler.ts
│   └── useInvitePublish.ts
│
├── components/
│   ├── editor-shared/   # Componentes reutilizáveis
│   │   ├── Field.tsx
│   │   ├── Section.tsx
│   │   ├── EditorHeader.tsx
│   │   ├── EditorPreview.tsx
│   │   ├── EditorForm.tsx
│   │   ├── BatchExportModals.tsx
│   │   └── index.ts     # Barrel export
│   │
│   ├── ErrorBoundary.tsx
│   ├── CoupleGate.tsx
│   └── ...
│
├── lib/
│   ├── inviteTypes.ts   # Types, constants, defaults
│   ├── inviteUtils.ts   # Pure utility functions
│   ├── safeStorage.ts   # localStorage com validação
│   ├── album-undo.ts    # Undo/redo logic
│   └── ...
│
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client
│       └── types.ts     # Auto-generated types
│
├── assets/
│   ├── ceremony.jpg
│   └── ...
│
└── styles.css           # Tailwind + CSS vars
```

---

## Guia de Desenvolvimento

### Adicionando uma Nova Feature

1. **Criar tipos** em `src/lib/inviteTypes.ts`
   ```typescript
   type NewFeature = {
     id: string;
     name: string;
   };
   ```

2. **Criar hook** em `src/hooks/useNewFeature.ts`
   ```typescript
   export function useNewFeature() {
     const [data, setData] = useState<NewFeature[]>([]);
     return { data, setData, ... };
   }
   ```

3. **Criar componentes** em `src/components/editor-shared/`
   ```typescript
   export function NewFeatureComponent({ data, onChange }) {
     return <div>...</div>;
   }
   ```

4. **Integrar na rota** em `src/routes/editor.tsx`
   ```typescript
   const { data, setData } = useNewFeature();
   return <NewFeatureComponent data={data} onChange={setData} />;
   ```

### Refatorar Componente Monolítico

1. Extrair tipos para `inviteTypes.ts`
2. Extrair funções para `inviteUtils.ts`
3. Extrair estado para hook customizado
4. Criar componentes puros
5. Compor na rota principal

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- Bun (recomendado) ou npm
- Conta Supabase

### Setup Inicial

```bash
# 1. Clonar repositório
git clone <repo-url>
cd dipaulastudio

# 2. Instalar dependências
bun install
# ou
npm install

# 3. Criar arquivo .env.local
cp .env.example .env.local

# 4. Preencher variáveis Supabase
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=xxxxx

# 5. Rodar dev server
bun run dev
# ou
npm run dev
```

Acessar: http://localhost:5173

### Build para Produção

```bash
bun run build
npm run build
```

Outputs: `.output/public/` (static) e `.output/server/` (server)

---

## Testes

### Status Atual
❌ **Testes automatizados ainda não implementados**

### Plano para Phase 3
1. **Setup Vitest** - Framework de testes
2. **Unit Tests** - Hooks e utilities
3. **Component Tests** - Componentes renderizados
4. **E2E Tests** - Fluxos completos (Playwright)

### Como Rodar Testes (futuro)
```bash
npm run test                # Rodar testes
npm run test:watch        # Modo watch
npm run test:coverage     # Coverage report
```

---

## Deployment

### GitHub Actions
Pipeline em `.github/workflows/ci.yml`:
1. `npm install` - Instalar deps
2. `npm run lint` - Verificar code style
3. `npm run build` - Build para produção
4. Resultados: Artifacts disponíveis

### Ambiente de Produção
- **Host**: Cloudflare Workers (recomendado)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth

### Variáveis de Ambiente

**Desenvolvimento** (`.env.local`):
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Produção** (Cloudflare Secrets):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

---

## Boas Práticas

✅ **DO**
- Criar hooks customizados para cada domínio
- Componentes puros sem estado
- Type safety em tudo
- Usar `safeStorage` para localStorage
- Logging estruturado com contexto
- Error boundaries em rotas principais
- Auto-save com debounce (400ms)

❌ **DON'T**
- Copiar código (extrair para utilities)
- Componentes com muita lógica
- `any` types - sempre tipar
- Catch vazios - sempre log + tratamento
- localStorage direto sem validação
- Console.log em produção
- Estado duplicado entre hook e component

---

## Performance

### Otimizações Implementadas
- Auto-save debounced (400ms)
- Image compression antes de data URLs
- Lazy loading de módulos pesados (jsPDF, jszip)
- React.memo em componentes grandes

### Métricas Alvo
- Build: < 1s
- Initial Load: < 2s
- Preview update: < 100ms (real-time)

---

## Links Úteis

- [TanStack Start Docs](https://tanstack.com/start)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Última atualização**: 2026-07-15  
**Maintainer**: Claude (v4.5)
