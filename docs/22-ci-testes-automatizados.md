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
5. `bun run build` (Vite/TanStack Start; gera a árvore de rotas);
6. `bunx tsc --noEmit` (TypeScript, após geração das rotas).

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

## Homologação da CI — execução real em 29/10/2026

**Resultado confirmado pelo GitHub Actions:** [Run #40963214831](https://github.com/Black2026/climaciclo/actions/runs/40963214831), commit `c466e67cd56a9887593d7e7f723e40f56ca15ba4`, estado `completed`, conclusão `success`. Os passos de instalação do Bun, dependências, testes unitários, compilação e checagem de TypeScript foram todos concluídos com `success`. A captura fornecida pelo participante mostra **3 arquivos e 14 testes aprovados**.

### Histórico honesto de correções
1. A execução #40962890170 passou nos testes unitários e falhou em TypeScript por árvore de rotas gerada desatualizada e campos opcionais no Supabase.
2. A execução #40963071743 passou nos testes e compilação, mas TypeScript identificou ausência da rota `/admin/login`.
3. O commit `c466e67` adicionou um **placeholder sem acesso administrativo** para essa rota, preservando o Gate G3 como pendente.
4. A execução #40963214831 passou completamente, comprovando o critério de aceite desta fase da CI.

**Observação:** validação do pipeline não implica teste end-to-end da persistência, proteção de todas as rotas administrativas, publicação do MVP ou liberação para dados reais. `ready_for_real_data=false` permanece como último estado verificado no Cloud.
