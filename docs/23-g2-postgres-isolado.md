# 23 — Banco de homologação isolado (Gate G2)

**Branch de testes:** `test/g2-postgres-isolado`. Não mesclar sem revisão.

## Ambiente
O workflow `.github/workflows/g2-postgres-isolado.yml` inicia um **PostgreSQL 16 efêmero** dentro do GitHub Actions, sem usar o Lovable Cloud ou chaves de Supabase. O banco é descartado ao encerrar o job. `scripts/g2/bootstrap.sql` cria roles e um `auth.uid()` fictícios; a migração `drizzle/migrations/0000_migration.sql` é aplicada ao banco temporário. `scripts/g2/assert.sql` testa funcionalidades dentro de uma transação encerrada por `ROLLBACK`.

**Nunca execute `scripts/g2/bootstrap.sql` ou `scripts/g2/assert.sql` no SQL Editor do Lovable.** Uma branch GitHub sozinha não isola o banco; a separação vem do serviço PostgreSQL efêmero.

## Verificações previstas
- Bloqueio `not_ready`, sem criar lead ou cota.
- Criação de lead fictício com status `novo`, código único e consentimento.
- Reenvio **sequencial** da mesma chave idempotente sem duplicar nem consumir quota adicional.
- Negativa por consentimento ausente.
- Rate limit por hash de telefone (3/dia) e IP (10/hora).
- Permissões da RPC e presença de RLS em `leads`.

Para testar a inserção positiva, o teste ativa `ready_for_real_data` **somente no banco descartável** com dados completamente fictícios, sem afetar o Cloud.

## Critério de aceite
Só marcar a homologação do banco isolado quando o GitHub Actions terminar com `success`. O teste local de SQL não substitui testes de chamadas concorrentes, HTTP, implementação Supabase real, proteção do admin nem persistência em um projeto Lovable independente.

## Segurança
Nenhum token ou segredo de produção foi adicionado. `CLIMACICLO_ENABLE_LEAD_SUBMISSION` permanece `false`. Os dados da base real do Lovable e o estado `ready_for_real_data=false` permanecem intocados.

## Resultado real do GitHub Actions — 29/10/2026

O Pull Request [#1](https://github.com/Black2026/climaciclo/pull/1) acionou as duas suites na branch de homologação:

- [G2 — PostgreSQL isolado, run #40964573062](https://github.com/Black2026/climaciclo/actions/runs/40964573062): `completed / success`; criação de roles fictícias, aplicação da migração real e execução dos testes SQL concluídas com sucesso.
- [CI geral, run #40964572878](https://github.com/Black2026/climaciclo/actions/runs/40964572878): `completed / success`.

**Conclusão:** suíte de banco descartável homologada nos cenários implementados. A idempotência testada é **sequencial**, não concorrente; não houve conexão com o Lovable Cloud, ativação real de cadastro ou teste de HTTP. O G2 completo continua aberto.
