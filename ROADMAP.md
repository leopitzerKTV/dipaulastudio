# 🗺️ Roadmap - DiPaula Studio

Visão de longo prazo e planejamento de features para o DiPaula Studio.

---

## 📊 Status Atual

**Versão**: 0.1.0 (MVP)  
**Status**: Em desenvolvimento ativo  
**Última atualização**: 2026-07-15

### Concluído ✅
- ✅ Editor interativo com preview ao vivo
- ✅ 4 temas de cores (Champanhe, Marfim, Blush, Mogno)
- ✅ Upload de imagem customizável
- ✅ Exportação em PNG, JPG, PDF
- ✅ Versionamento de convites
- ✅ Publicação e compartilhamento
- ✅ Autenticação com Supabase
- ✅ Refatoração: 1,734 linhas → 245 linhas
- ✅ Error Handling padronizado
- ✅ localStorage com validação segura

### Em Progresso 🔄
- 🔄 Documentação técnica (CLAUDE.md, README.md, ROADMAP.md)

---

## 🎯 Próximas Fases

### Phase 3: Testes Automatizados (2-3 semanas)

#### 3.1 Setup de Framework
- [ ] Instalar Vitest + @testing-library/react
- [ ] Configurar `vitest.config.ts`
- [ ] Setup de coverage reporting
- [ ] Adicionar scripts: `test`, `test:watch`, `test:coverage`

#### 3.2 Unit Tests (Hooks)
- [ ] `useInviteDraft` - Testes de estado
- [ ] `useInviteAuth` - Testes de autenticação
- [ ] `useInviteExport` - Testes de exportação
- [ ] `useBatchExport` - Testes de lote + progresso
- [ ] `useErrorHandler` - Testes de error handling
- [ ] Utils: `safeStorage`, `inviteUtils`

#### 3.3 Component Tests
- [ ] `EditorHeader` - Testes de renderização
- [ ] `EditorForm` - Testes de input
- [ ] `EditorPreview` - Testes de preview
- [ ] `ErrorBoundary` - Testes de captura de erro
- [ ] Shared components: Field, Section, etc

#### 3.4 E2E Tests (Playwright)
- [ ] Criar convite completo (input → export)
- [ ] Publicar e compartilhar
- [ ] Carregar versão anterior
- [ ] Mobile responsiveness

**Target**: 80%+ code coverage em componentes críticos

---

### Phase 4: Features Novas (4+ semanas)

#### 4.1 Invite Templates
- [ ] 10+ templates pré-desenhados
- [ ] Categories: Clássico, Moderno, Boho, Minimalista
- [ ] Drag-and-drop para customizar template
- [ ] Save custom template

#### 4.2 Animations & Effects
- [ ] Entrada animada ao abrir convite
- [ ] Hover effects em elementos
- [ ] Transition de temas
- [ ] Música de fundo (opcional)

#### 4.3 Collaborative Features
- [ ] Link para edição compartilhada
- [ ] Real-time comments no convite
- [ ] Permissões: Editor, Visualizador, Comentarista
- [ ] History de quem editou quando

#### 4.4 Advanced Timeline
- [ ] Upload múltiplas fotos
- [ ] Drag-and-drop para reordenar
- [ ] Captions para cada foto
- [ ] Timeline automático por data

#### 4.5 Guest Management
- [ ] Lista de convidados
- [ ] RSVP tracking
- [ ] Dietary restrictions
- [ ] Export para CSV

#### 4.6 Analytics & Insights
- [ ] Dashboard de views
- [ ] Tempo médio de visualização
- [ ] Device breakdown (mobile/desktop)
- [ ] Traffic sources

---

### Phase 5: Monetização (6+ semanas)

#### 5.1 Freemium Model
- [ ] **Free Tier**
  - 1 convite ativo
  - 4 temas básicos
  - Exportação limitada (3 downloads/dia)
  - 30 dias de histórico

- [ ] **Pro Tier** ($9.99/mês)
  - Convites ilimitados
  - Templates premium (20+)
  - Exportação ilimitada
  - Álbum colaborativo
  - Análise completa

- [ ] **Business Tier** ($29.99/mês)
  - Tudo do Pro
  - White-label
  - API access
  - Priority support

#### 5.2 Payment Integration
- [ ] Stripe checkout
- [ ] Subscription management
- [ ] Invoicing automático
- [ ] Cancelamento self-service

#### 5.3 Marketing
- [ ] Landing page otimizada
- [ ] Email marketing (Sendgrid)
- [ ] SEO optimization
- [ ] Social media integration

---

### Phase 6: Platform (8+ semanas)

#### 6.1 Mobile App
- [ ] React Native app (iOS + Android)
- [ ] Share to social media
- [ ] Offline editing
- [ ] Push notifications

#### 6.2 Print Integration
- [ ] Integração com serviço de impressão
- [ ] Preview 1:1 com impresso
- [ ] Envio direto para gráfica
- [ ] QR code para convite online

#### 6.3 Payment Gateway
- [ ] Venda de convites prontos
- [ ] Marketplace de templates
- [ ] Affiliate program

---

## 🐛 Bugs Conhecidos

| ID | Descrição | Severity | Status |
|----|-----------|----------|--------|
| B001 | PDF A4 às vezes corta imagem em devices lentos | 🟡 Medium | Open |
| B002 | localStorage quota error em conexões lentas | 🟡 Medium | Open |
| B003 | Preview não atualiza em tempo real em Safari | 🟡 Medium | Open |

---

## ⚠️ Technical Debt

| Item | Descrição | Effort | Priority |
|------|-----------|--------|----------|
| TD001 | Adicionar lint rule para console.log | 🟢 Baixo | 🔴 Alta |
| TD002 | Refatorar rota de histórias (800+ linhas) | 🔴 Alto | 🟡 Média |
| TD003 | Adicionar type checking em Edge Functions | 🟡 Médio | 🔴 Baixa |
| TD004 | Implementar caching de imagens | 🟡 Médio | 🟡 Média |

---

## 📈 Métricas Alvo

### Performance
- Build time: < 1s
- Initial load: < 2s
- Preview update: < 100ms
- Export PNG: 2-5s

### Qualidade
- Code coverage: 80%+
- Lighthouse score: 90+
- Zero critical security issues
- Zero unhandled errors

### UX
- Time to create invite: < 5 minutes
- Export success rate: > 99.5%
- User retention: > 40%

---

## 🔄 Release Timeline

### v0.1 (MVP) - Julho 2025
- ✅ Core editing
- ✅ Export (PNG/JPG/PDF)
- ✅ Versionamento
- ✅ Publicação

### v0.2 (Improvements) - Agosto 2025
- 🔄 Error handling + documentation
- [ ] Unit tests
- [ ] Performance optimizations
- [ ] UI/UX refinements

### v0.3 (Templates) - Setembro 2025
- [ ] 10+ templates
- [ ] Animations
- [ ] Advanced timeline

### v1.0 (Production Ready) - Outubro 2025
- [ ] E2E tests
- [ ] Monitoring (Sentry)
- [ ] Freemium model
- [ ] Marketing site

### v1.1+ (Platform) - 2026
- [ ] Colaboração em tempo real
- [ ] Mobile apps
- [ ] Print integration
- [ ] Marketplace

---

## 🤔 Decisões de Design

### Por que não Redux/Zustand?
- Projeto pequeno: Custom hooks são suficientes
- Melhor type safety com hooks
- Menos boilerplate
- Facilita testing

### Por que Supabase?
- Backend como serviço (sem infra)
- Auth + Database + Real-time
- Row Level Security built-in
- Bom para MVP

### Por que TanStack Start?
- Full-stack React (client + server)
- File-based routing
- Menos boilerplate que Next.js
- Melhor SSR support

---

## 🎓 Learning Resources

### Para Contribute
- [CLAUDE.md](./CLAUDE.md) - Padrões técnicos
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React 19 Docs](https://react.dev)
- [TanStack Docs](https://tanstack.com)

### Comunidade
- Issues no GitHub
- Discussions para ideias
- Code reviews em PRs

---

## 💡 Ideias Futuras

- [ ] AR viewer para preview em tempo real
- [ ] Voice-to-text para convites
- [ ] AI-powered sugestões de mensagens
- [ ] Integration com calendários (Google Calendar, Outlook)
- [ ] Video invitations
- [ ] QR code com URL shortener customizado
- [ ] Webhook para integrações externas

---

## 📞 Feedback & Sugestões

Tem uma ideia? Abra uma issue com label `feature-request`.

Votes nas features favoritas via 👍 nos issues.

---

**Roadmap criado**: 2026-07-15  
**Próxima revisão**: 2026-08-15  
**Responsável**: Team DiPaula
