# Checklist de publicação do repositório — ClimaCiclo

Data: 30/10/2026. **Repositório continua privado.**

## Verificações feitas com a integração GitHub
- Repositório `Black2026/climaciclo`, branch `main`, privado.
- `.gitignore` inclui `*.local` e `.dev.vars`, **mas não inclui `.env`**.
- O arquivo `.env` **está versionado**. Na inspeção atual, contém URLs de Lovable Cloud/Supabase e chaves `sb_publishable_...` (publicáveis/client-side), não chaves administrativas `service_role` visíveis nesse arquivo.
- `package.json` confirma stack TanStack Start/React, TypeScript, Vite, Supabase, Vitest.
- O índice de busca de código do repositório estava indisponível. Pesquisas por termos de credenciais retornaram vazio, **mas não permitem atestar ausência de segredos**.
- Não foi realizada revisão integral de todos os arquivos nem do histórico de commits.

## Antes de tornar público
- [ ] Revisar todos os arquivos rastreados e o histórico de commits, incluindo `.env`, `.dev.vars`, dumps, logs e artefatos.
- [ ] Confirmar que `sb_publishable_` é efetivamente chave pública da configuração cliente (não `service_role`/secret key).
- [ ] Preferir substituir o `.env` versionado por `.env.example` com placeholders; acrescentar `.env` ao `.gitignore` sem quebrar a sincronização Lovable.
- [ ] Se segredo privado tiver sido exposto, rotacioná-lo e avaliar remoção do histórico; apagá-lo apenas no commit atual não apaga versões anteriores.
- [ ] Rever política de licença e visibilidade, documentação LGPD, dados pessoais e permissões do GitHub.
- [ ] Testar build e sincronização Lovable/GitHub após eventuais mudanças.
- [ ] Confirmar o acesso externo ao repositório no navegador anônimo.
- [ ] Submeter o link na plataforma DIO apenas depois de escolher o acesso apropriado aos avaliadores.

**Atenção:** publicação do site de demonstração não equivale à autorização para coletar dados reais. O bloqueio de envio deve permanecer até conclusão dos testes de backend e privacidade.
