# ⚠️ SECURITY NOTICE

## Credenciais Supabase Expostas

**Data de Descoberta**: 2026-07-15  
**Severidade**: ALTA

### Problema

As credenciais do Supabase foram commitadas no arquivo `.env` e expostas publicamente no histórico do Git:

- **Project ID**: `miszggfikfioehokhuzk`
- **Publishable Key (Anon)**: Exposta no git

### Ações Tomadas

✅ Removido `.env` do git  
✅ Adicionado `.env` ao `.gitignore`  
✅ Criado `.env.example` template  
✅ Armazenado credenciais em `.env.local` (não rastreado)

### ⚠️ AÇÃO OBRIGATÓRIA - Refazer Credenciais

Você **DEVE refazer as credenciais Supabase** imediatamente, pois foram expostas:

1. Acesse [Supabase Dashboard](https://app.supabase.com) com sua conta
2. Vá para **Project Settings → API**
3. **Regenere a Publishable Key (anon key)**:
   - Clique no ícone de refresh/regenerar
   - Copie a nova chave
4. Atualize `.env.local` com as novas credenciais
5. Implante a atualização em produção imediatamente

### Próximas Medidas de Segurança

- [ ] Refazer credenciais Supabase
- [ ] Verificar logs de acesso Supabase para atividade suspeita
- [ ] Considerar rotação periódica de credenciais (a cada 3 meses)
- [ ] Implementar GitHub Secrets para CI/CD (não usar `.env` em workflows)

### Referências

- [Supabase Security Guide](https://supabase.com/docs/guides/platform/security)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

_Este aviso pode ser removido após confirmar que as credenciais foram rotacionadas._
