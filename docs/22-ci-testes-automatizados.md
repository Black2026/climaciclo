# 22 — Integração contínua e testes automatizados — ClimaCiclo

**Data de configuração:** 29/10/2026  
**Objetivo:** verificar código sem liberar cadastros e sem precisar de créditos Lovable.

## GitHub Actions
Arquivo: `.github/workflows/ci.yml`

Disparo a cada push/PR para `main` e manualmente por `workflow_dispatch`.

O job usa:
1. `actions/checkout@v4`;
2. `oven-sh/setup-bun@v2` (Bun);
3. `bun install --frozen-lockfile` (usa `bun.lock`);
4. `bun run test` (Vitest);
5. `bunx tsc --noEmit` (TypeScript);
6. `bun run build` (Vite/TanStack Start).

## Proteções
- Permissões GitHub Actions somente `contents: read`.
- Nenhuma credencial do Cloud/Supabase deve ser adicionada ao workflow.
- A variável de liberação `CLIMACICLO_ENABLE_LEAD_SUBMISSION` é fixada como `false` no CI.
- A flag da UI `PUBLIC_LEAD_SUBMISSION_RELEASED` continua `false`; o banco permanece `ready_for_real_data=false`.
- Os testes são locais e **não executam INSERTs** no banco do Lovable.

## Cobertura inicial
O arquivo `src/test/g2-lead-logic.test.ts` testa o bloqueio da UI, aceitação/recusa de payload fictício, ausência de campos administrativos no payload RPC, consentimento, UUID, normalização do telefone, erros da RPC e minimização de dados retornados.

## Critério de aceite
**Somente marcar CI aprovado** quando houver um run do GitHub Actions com os três passos (teste, tipos e build) concluídos com sucesso. Commit do workflow não é prova de execução. Registrar número/URL do run, data e eventuais falhas e correções.

## Como conferir
No GitHub: **Actions → CI - testes e build → execução mais recente**. Se GitHub exigir habilitação manual do Actions, usar o botão disponível no repositório sem configurar segredos. Capturar status, etapas e logs de erro, ocultando quaisquer informações sensíveis.

## Pendências de G2 não cobertas pelo CI
Persistência positiva no Cloud, idempotência concorrente, RLS com contas não autorizadas, retries e falhas de rede continuam pendentes de ambiente isolado. O pipeline não homologará esses cenários.
