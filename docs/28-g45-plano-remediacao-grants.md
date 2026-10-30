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


### Preflight 1 — proprietários, RLS e ACLs (CSV 30/10/2026 12:09)

O participante anexou `query-results-export-2026-10-30_12-09-12.csv`, exportado após executar **somente a primeira consulta** de `security/sql/10_preflight_read_only.sql`. Arquivo delimitado por ponto e vírgula, 7 linhas, sem entradas ausentes:

| Tabela | Proprietário | RLS | ACL |
|---|---|---|---|
| `admin_roles` | `postgres` | true | compartilhada entre as sete |
| `app_settings` | `postgres` | true | idem |
| `customers` | `postgres` | true | idem |
| `lead_rate_limits` | `postgres` | true | idem |
| `leads` | `postgres` | true | idem |
| `reminders` | `postgres` | true | idem |
| `service_orders` | `postgres` | true | idem |

ACL original em todas: `{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}`.

**Constatações:** as sete tabelas mantêm RLS ativado, proprietário `postgres`; os grants diretos e excessivos para `anon` e `authenticated` foram confirmados na ACL original. Nenhuma entrada explícita com beneficiário `PUBLIC` (formato `=...`) aparece nesse resultado. Existe a role adicional `sandbox_exec` com `INSERT` e `SELECT`; investigar sua finalidade, eventuais memberships e o alcance prático do RLS, sem modificar a role. Este CSV é evidência do **estado anterior à correção**, não da execução do script.

**Status:** preflight 1 concluído e revisado. Pendente preflight 2 (ACLs decompostas, concessões `PUBLIC`), preflight 3 (EXECUTE de funções), backup e teste mais representativo do banco real antes de aplicar `20_restrict_grants_manual.sql`. Não marcar G4.5-03 como homologado. Não ativar `ready_for_real_data`.


### Preflight 2 — concessões explícitas de ACL (CSV 30/10/2026 12:13)

Foi analisado o anexo `query-results-export-2026-10-30_12-13-23.csv`, gerado ao executar isoladamente a **consulta 2** do preflight; 238 linhas, colunas `beneficiario`, `concedente`, `delegavel`, `privilegio`, `tabela`.

- **Sete tabelas presentes:** `admin_roles`, `app_settings`, `customers`, `lead_rate_limits`, `leads`, `reminders`, `service_orders`.
- Por papel nas sete tabelas: `anon` **56** concessões, `authenticated` **56**, `service_role` **56**, `postgres` **56** e `sandbox_exec` **14**, totalizando **238**.
- Cada tabela concede a `anon` e `authenticated` **DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE e UPDATE** (8 concessões por tabela). A concessão `MAINTAIN` amplia o escopo da remediação; `REVOKE ALL PRIVILEGES` pretende removê-la junto das demais (verificar resultado na versão do PostgreSQL do Lovable).
- `sandbox_exec` tem apenas `INSERT` e `SELECT` em cada tabela. O script de remediação atual **não altera `sandbox_exec`**; sua finalidade e vínculos de role/membership ainda requerem confirmação.
- Todas as 238 linhas indicam `concedente=postgres` e `delegavel=false`.
- **Nenhum beneficiário `PUBLIC`** apareceu no export. Esse achado é favorável à guarda de ACL do script, mas não exclui privilégios herdados de outras roles, privilégios no esquema, grants em objetos futuros nem EXECUTE em funções.

**Resultado:** Consulta 2 **concluída e documentada**, sem alteração do banco. A Consulta 3, que verifica os privilégios EXECUTE das funções, ainda falta. O script `20_restrict_grants_manual.sql` **não está autorizado a executar no Lovable Cloud**; a CI usa uma fixture simplificada e não substitui avaliação com o ambiente real.

**Nota:** CSV de origem foi entregue na conversa; não afirmar que os bytes foram anexados ao GitHub.


### Preflight 3 — privilégios EXECUTE (CSV 30/10/2026 12:15)

CSV `query-results-export-2026-10-30_12-15-51.csv` analisado: três funções, sem identificação pessoal.

| Função | SECURITY DEFINER | anon EXECUTE | authenticated EXECUTE | service_role EXECUTE |
|---|---|---|---|---|
| `convert_lead_to_customer(uuid)` | false | false | true | true |
| `has_role(uuid,app_role)` | true | false | true | true |
| `submit_lead(...)` (15 parâmetros) | true | false | false | true |

O resultado **corresponde às concessões declaradas na migração original**. `has_role` é security definer para permitir checagem de role sob RLS; `convert_lead_to_customer` é security invoker e valida a role admin; `submit_lead` usa security definer e restringe EXECUTE a service_role. Não se identificou EXECUTE anônimo nessas três funções. Ainda é necessário validar diretamente o bloqueio de funções com token de usuário sem role e revisão da lógica/ownership de SECURITY DEFINER antes da homologação completa.

**Compatibilidade do ensaio:** CSV de ACL anterior apresentou `MAINTAIN`. Por isso o workflow de PostgreSQL descartável foi ajustado de 16 para **17** e ampliado para testar retirada explícita de `MAINTAIN` em `anon` e `authenticated`. A aprovação anterior em PostgreSQL 16 não cobre esse privilégio. **Aguardar execução do novo workflow**; nenhum comando de revogação foi aplicado no Lovable Cloud.


### Revisão adicional para execução no Lovable (30/10/2026)

Após inspecionar os resultados, foi ampliada a verificação de pós-condições em `20_restrict_grants_manual.sql` para também rejeitar `MAINTAIN` em `anon`/`authenticated`, além de `TRUNCATE`, `REFERENCES` e `TRIGGER`. O teste com PostgreSQL 17 é a referência para a versão que oferece esse privilégio. Foi criado `security/sql/15_preflight_roles_read_only.sql`, que consulta memberships/herança de papéis, privilégios sobre o esquema `public` e ACLs padrão para novos objetos. **Esses resultados do Lovable Cloud ainda não foram recebidos.**

**Critérios mínimos antes de aplicar no Lovable:** conferir esses três resultados, ter backup/snapshot restaurável verificado e responsável autorizado para execução, revisar eventuais grants herdados, e confirmar a flag `ready_for_real_data=false`. Em seguida, executar a correção de forma supervisionada e produzir `30_postflight_read_only.sql`, além dos testes de regressão. A aprovação do workflow isolado não dispensa esses procedimentos; nenhuma modificação remota foi realizada nesta revisão.


### Diagnóstico complementar — herança de papéis (CSV 30/10/2026 12:30)

O participante executou no Lovable SQL Editor a primeira consulta de `security/sql/15_preflight_roles_read_only.sql` e enviou `query-results-export-2026-10-30_12-30-26.csv` (10 linhas, separado por `;`). **Nenhuma modificação no banco foi executada.**

Resumo exato das associações diretas (`papel` = membro, `papel_herdado` = papel do qual o membro é associado):

| Membro | Papel associado | admin_option | inherit_option | set_option |
|---|---|---|---|---|
| `authenticator` | `anon` | false | false | true |
| `authenticator` | `authenticated` | false | false | true |
| `authenticator` | `service_role` | false | false | true |
| `postgres` | `anon` | true | true | true |
| `postgres` | `authenticated` | true | true | true |
| `postgres` | `sandbox_exec` | true | false | false |
| `postgres` | `service_role` | true | true | true |
| `supabase_realtime_admin` | `anon` | false | false | true |
| `supabase_realtime_admin` | `authenticated` | false | false | true |
| `supabase_realtime_admin` | `service_role` | false | false | true |

**Interpretação:** nenhum registro contém `anon`, `authenticated`, `service_role` ou `sandbox_exec` como **membro** de outra role, portanto não aparece herança de grants de terceiros por essas quatro roles no conjunto consultado. O fato de `authenticator` e `supabase_realtime_admin` poderem `SET ROLE` para as roles de API **não implica** que essas roles possam assumir `authenticator` ou `supabase_realtime_admin`; as associações são direcionais. O `postgres` tem associação a `sandbox_exec` sem `INHERIT` e sem `SET`. Nenhuma dessas associações deve ser alterada durante esta remediação.

**Status:** primeira consulta do diagnóstico complementar **concluída**, sem sinal de grants herdados para `anon`/`authenticated`. Permanecem pendentes as consultas de USAGE/CREATE no schema `public` e de privilégios padrão (default ACL), além de backup verificado e aplicação supervisionada da correção. O script de remediação NÃO foi aplicado. O PR #13 segue em rascunho.
