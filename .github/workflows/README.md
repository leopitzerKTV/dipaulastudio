# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD do projeto.

## `ci.yml` - Continuous Integration Pipeline

### O que faz
Executa testes, linting e build automaticamente quando há:
- **Push** para a branch `main`
- **Pull Request** aberto contra `main`

### Passos executados
1. **Setup**: Checkout do código e configuração do Node.js
2. **Dependências**: Instala pacotes com cache
3. **Lint**: Verifica qualidade do código com ESLint
4. **Build**: Constrói a aplicação com Vite
5. **Test**: Executa testes (quando disponíveis)

### Versões testadas
- Node.js 18.x, 20.x, 22.x

### Mudanças recentes
- ✅ Substituído webpack por Vite (npm run build)
- ✅ Adicionado step de linting (npm run lint)
- ✅ Adicionado cache npm para melhor performance
- ✅ Adicionado step de testes (npm test)

### Como testar localmente
```bash
# Lint
npm run lint

# Build
npm run build

# Tests (quando implementados)
npm test
```

### Próximas melhorias
- [ ] Adicionar coverage reporting quando testes forem implementados
- [ ] Adicionar step de deploy automático após build bem-sucedido
- [ ] Adicionar notificações de falha
- [ ] Adicionar relatórios de performance
