# G4.5 — Remediação controlada de privilégios SQL (NÃO EXECUTADA)

Data: 30/10/2026. Banco: Lovable Cloud PostgreSQL. Situação: proposta para revisão; **não aplicar automaticamente**.

## Evidências de partida

Os CSVs exportados no SQL Editor do projeto apontam, para `anon` e `authenticated`, SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER nas sete tabelas operacionais. A consulta `has_table_privilege` confirmou TRUNCATE/REFERENCES/TRIGGER e SELECT. Todas as sete tabelas têm RLS habilitado; há 19 políticas, nas quais os dados operacionais são protegidos por `has_role(auth.uid(),'admin')`.

A migração original `drizzle/migrations/0000_migration.sql` descreve privilégios mais estritos, portanto a configuração real diverge da intenção do código. **RLS não protege TRUNCATE/REFERENCES**. Não há comprovação de incidente de segurança nem de endpoint HTTP expondo TRUNCATE.

## Arquivos preparados

- `security/sql/10_preflight_read_only.sql`: obtém ACL e proprietário originais, grants a PUBLIC, permissões de execução das funções `has_role`, `submit_lead` e `convert_lead_to_customer`, além da flag de coleta. **Salvar saída fora do repositório**, com controle de acesso.
- `security/sql/20_restrict_grants_manual.sql`: remediação com transação, limites de tempo, pré-condições de RLS e coleta bloqueada, aborta caso PUBLIC tenha grants na ACL das sete tabelas, remove todos os privilégios de `anon`/`authenticated` nessas tabelas e concede apenas os necessários ao `authenticated`. Não altera `service_role`, funções, dados nem políticas. Garante ausência de TRUNCATE/TRIGGER/REFERENCES e DML de `anon` antes do COMMIT; se uma verificação falhar, PostgreSQL desfaz a transação.
- `security/sql/30_postflight_read_only.sql`: relatório de privilégios efetivos, RLS e flag após execução.

## Procedimento de execução (somente após aprovação)

1. Faça backup/snapshot verificável e capture a saída do preflight; analise proprietários, ACL de PUBLIC, funções, schema e políticas. **Se os grants foram herdados via outro papel, o script poderá abortar ou produzir resultado inesperado: investigar antes.**
2. Em **banco isolado**, com mesma estrutura e privilégios, execute `20_restrict_grants_manual.sql` e exporte `30_postflight_read_only.sql`. Refaça testes do app com usuário admin, comum e anônimo.
3. Exija revisão de segurança e backup de recuperação antes de qualquer execução no Lovable Cloud. Executar no SQL Editor apenas manualmente e com operador autorizado.
4. Confirme que `anon` não tem DML; `authenticated` tem só SELECT em `admin_roles`, SELECT/UPDATE em `app_settings`, e SELECT/INSERT/UPDATE/DELETE nas quatro tabelas operacionais; nenhum tem TRUNCATE/REFERENCES/TRIGGER. `service_role` conserva permissões.
5. Repita testes: formulário ainda bloqueado; login, F5 e logout; usuário sem role negado; dashboard real; funções públicas de consulta; testes diretos de autorização e RLS. **Não ativar recebimento de leads reais**.
6. Verifique também default privileges de objetos criados futuramente e EXECUTE das funções: esta correção **não altera** privilégios de função nem privilégios de tabelas futuras. Tratar separadamente após revisão.

## Plano de reversão

- **Durante a transação**: qualquer erro faz `ROLLBACK` automático; se executada manualmente antes de COMMIT, emitir `ROLLBACK`.
- **Depois de COMMIT**: recuperar a ACL original de cada tabela a partir da captura do preflight ou do backup, reproduzindo *apenas* os GRANTs originais necessários em transação supervisionada. **Não há script genérico de rollback**: `GRANT ALL TO anon` restauraria justamente a configuração excessiva encontrada. Em caso de falha, preferir restaurar apenas permissões mínimas de operação conhecidas ou reverter a partir de snapshot revisado em ambiente isolado.
- Não alterar roles do primeiro administrador, apagar clientes, alterar políticas RLS ou executar `TRUNCATE`.

## Resultado esperado x estado atual

**Preparado:** proposta de remediação e scripts de diagnóstico. **Ainda não comprovado:** execução em ambiente isolado, testes integrados, aplicação ao Lovable Cloud e pós-validação de privilégios. Gate G4.5-03 permanece **bloqueado** até esses passos. Branch e PR não alteram automaticamente o banco.


## Ensaio automatizado adicional (branch)

O workflow `.github/workflows/g45-grants-isolado.yml` inicia um PostgreSQL 16 **efêmero**, sem acesso ao Lovable Cloud. Usa `security/sql/test_fixture_isolated.sql` para criar sete tabelas de teste, RLS habilitado, `ready_for_real_data=false` e grants intencionalmente excessivos. Valida: estado inseguro reproduzido; guarda aborta se há grant a `PUBLIC` e mantém privilégios originais após o rollback; remediação transacional retira TRUNCATE de `anon`/`authenticated`; `service_role` mantém privilégios; flag false; e segunda aplicação não falha (idempotência).

**Limite:** a fixture é simplificada e não substitui a migração completa do projeto, nem prova compatibilidade de todas as funções com Lovable Cloud. Além do CI verde, a aplicação real exige preflight e aprovação de um responsável. Não mesclar ou executar por inferência automática.
