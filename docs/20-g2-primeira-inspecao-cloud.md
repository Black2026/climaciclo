# Gate G2 — Inspeção inicial do Lovable Cloud

Data: 29/10/2026. Estado: em preparação, sem homologação.

## Código identificado
- Migração de banco: `drizzle/migrations/0000_migration.sql`.
- Validação: `src/lib/lead-schema.ts` e `src/lib/lead-logic.ts`.
- Server Function: `submitLead` em `src/lib/public.functions.ts`.
- O formulário em `src/routes/montar-plano.tsx` permanece como demonstração, sem enviar dados.

## Limitação
A presença dessas rotinas no repositório não comprova migração executada no banco do Lovable Cloud. O Gate G2 só estará aprovado depois de verificar as tabelas, a persistência, a idempotência, a autorização e as falhas de rede.

## Verificação inicial solicitada
Abra o projeto ClimaCiclo no Lovable, vá ao painel Cloud/Database e confirme a existência das tabelas `app_settings`, `leads` e `lead_rate_limits`. Não execute SQL nem inclua dados pessoais neste primeiro passo. Compartilhe uma captura sem credenciais.

## Testes pendentes
- Com privacidade incompleta, o servidor rejeita submissões.
- Com ambiente seguro de testes configurado, uma solicitação válida cria apenas um lead.
- Reenvio com a mesma chave não duplica o lead.
- Erros não mostram falso sucesso.
- Usuários anônimos não podem ler dados privados.
- Revisão de segurança antes de habilitar dados reais.

O Gate G1 foi homologado por relatos de testes manuais nas larguras 320, 375, 390, 768 e 1280 px. As capturas completas dessas larguras ainda não foram incluídas no repositório.

## Inspeção visual do Cloud — 29/10/2026
Captura fornecida pelo participante na tela **Mais → Database** do Lovable. Foram observadas sete tabelas: `admin_roles` (0 linhas), `app_settings` (1), `customers` (0), `lead_rate_limits` (0), `leads` (0), `reminders` (0), `service_orders` (0).

**Resultado:** a presença das tabelas no banco foi confirmada visualmente. Isto não comprova ainda que a RPC `submit_lead`, suas permissões ou políticas RLS estejam corretas, nem a persistência de um novo lead. Próximo teste: inspecionar apenas os campos não sensíveis da configuração, principalmente o estado de `ready_for_real_data`, sem modificar valores ou coletar dados reais. A captura desta inspeção ainda precisa ser adicionada à pasta `evidencias/`.

## Verificação de configurações de privacidade — 29/10/2026

O participante apresentou captura da tabela `app_settings` no Lovable Cloud mostrando a única linha existente. O campo **`ready_for_real_data` está `false`**; `controller_name`, `controller_document`, `privacy_contact_channel`, `retention_period` e `privacy_updated_at` aparecem como `null`. Os campos não foram alterados.

**Conclusão limitada:** a trava de preparação está desligada no estado consultado. Ainda é necessário comprovar que a função `submit_lead` respeita esse valor, que as políticas RLS estão corretamente aplicadas e que a persistência funciona. A próxima inspeção será visual das políticas RLS de `app_settings`, seguida das políticas da tabela `leads`, sem executar SQL ou criar dados pessoais. A captura adicional ainda aguarda upload no repositório.

## Verificação visual de RLS — app_settings

Em 29/10/2026, captura do Lovable Cloud mostrou que a tabela `app_settings` está com **RLS enabled** e apresenta **duas políticas**:
- `admin read settings` — comando `SELECT`, aplicada a `authenticated`.
- `admin update settings` — comando `UPDATE`, aplicada a `authenticated`.

**Status: verificação parcial.** As condições `USING` e `WITH CHECK` ainda não aparecem na captura porque os detalhes das políticas estão recolhidos. Não é possível concluir apenas pelo nome que há checagem efetiva da role `admin`; é preciso expandir as políticas e confirmar a expressão. O SQL versionado no repositório prevê `public.has_role(auth.uid(), 'admin')`, mas isso ainda precisa ser comparado com a configuração realmente implantada. Também serão necessários testes reais de acesso sem autorização.

**Próxima evidência solicitada:** expansão das duas políticas no Lovable, sem alterar configurações, seguida de inspeção de RLS da tabela `leads`.


## Expansão das políticas RLS de app_settings — 29/10/2026

Nova captura de tela do participante confirma a expressão **`USING has_role(auth.uid(), 'admin'::app_role)`** em ambas as políticas existentes:
- `admin read settings`: `SELECT`, papel `authenticated`, expressão `USING` restringindo a role `admin`.
- `admin update settings`: `UPDATE`, papel `authenticated`, expressão `USING` restringindo a role `admin`.

**Resultado:** checagem de administrador na cláusula `USING` **confirmada visualmente** para leitura e atualização. A captura **não exibe `WITH CHECK`**, de modo que essa cláusula não foi validada separadamente pela interface. A migração SQL do repositório prevê `WITH CHECK` para `UPDATE`, mas é necessário verificar os detalhes no banco se houver divergência. O teste prático de acesso por usuário sem privilégios **continua pendente**. Não declarar segurança totalmente homologada.

**Próximo passo:** inspecionar a RLS da tabela `leads`, especialmente as políticas `SELECT`, `INSERT`, `UPDATE` e `DELETE`, confirmando quais roles estão autorizadas e se há uma cláusula `has_role` restritiva. Não editar políticas nem criar leads reais neste momento.


## Inspeção inicial das políticas RLS de leads — 29/10/2026

Captura da interface **Database → leads → RLS policies** confirma que a tabela `leads` apresenta `RLS enabled` e quatro políticas para `authenticated`:
- `admin select leads` — `SELECT` (coluna `USING`);
- `admin insert leads` — `INSERT` (coluna `CHECK`);
- `admin update leads` — `UPDATE` (coluna `USING`);
- `admin delete leads` — `DELETE` (coluna `USING`).

**Limite da evidência:** as condições das regras ainda não estão expandidas, portanto a captura não comprova que cada uma verifica `has_role(auth.uid(), 'admin'::app_role)`. A ausência de política `anon` na lista é coerente com o desenho do projeto, mas os privilégios, a RLS, os caminhos de Server Function e testes reais de acesso precisam ser conferidos antes da homologação de segurança.

**Próximo teste:** expandir as quatro políticas e documentar `USING`/`WITH CHECK` sem editar nenhuma regra. A captura enviada na conversa ainda requer inclusão em `evidencias/` caso seja usada no portfólio.


## Auditoria detalhada de RLS em leads — 29/10/2026

O participante apresentou captura com **todas as quatro políticas de `leads` expandidas**, RLS habilitado e papel `authenticated`. As expressões mostradas foram:

| Política | Operação | Expressão visualizada |
|---|---|---|
| `admin select leads` | SELECT (USING) | `has_role(auth.uid(), 'admin'::app_role)` |
| `admin insert leads` | INSERT (WITH CHECK) | `has_role(auth.uid(), 'admin'::app_role)` |
| `admin update leads` | UPDATE (USING) | `has_role(auth.uid(), 'admin'::app_role)` |
| `admin delete leads` | DELETE (USING) | `has_role(auth.uid(), 'admin'::app_role)` |

**Resultado parcial aprovado:** as expressões apresentadas estão alinhadas ao projeto e restringem as operações diretas da tabela a usuários autenticados com role administrativa. A interface não mostra um `WITH CHECK` separado na política UPDATE; se não houver cláusula explícita, o PostgreSQL aplica a expressão USING também à nova linha, conforme sua documentação. O arquivo SQL versionado define WITH CHECK explicitamente.

**Ainda pendente:** testes reais de acesso por usuário anônimo e autenticado sem role, checagem de GRANTs, verificação da função `submit_lead` e de sua restrição ao serviço, teste de persistência/idempotência/rate limit e revisão de vazamentos de dados pessoais. A presença de RLS não impede, por si só, bypass através de credenciais privilegiadas no servidor; essas credenciais e seus handlers também precisam de auditoria.

**Próximo passo:** inspecionar a existência e permissões de `submit_lead` no ambiente Lovable Cloud sem executar SQL mutável nem inserir dados reais. A captura deve ser adicionada a `evidencias/` após remoção de quaisquer informações sensíveis.

## Inspeção SQL da função submit_lead

Em 29/10/2026, consulta somente leitura ao catálogo PostgreSQL via SQL Editor do Lovable Cloud apresentou uma linha para a função `public.submit_lead` com `SECURITY DEFINER`. Permissões efetivas retornadas: `anon_can_execute=false`, `authenticated_can_execute=false`, `service_role_can_execute=true`. **Resultado da configuração de execução: aprovado.**

A consulta não executou a função nem comprovou ausência de efeitos colaterais, comportamento de privacidade, idempotência, rate limit ou persistência. **Gate G2 permanece pendente** até os testes. Próxima checagem: inspecionar definição da função por consulta de leitura, sem executá-la ou alterar `ready_for_real_data`.

## Consulta da definição SQL — resultado abreviado

Em 29/10/2026, foi executada consulta somente leitura com `pg_get_functiondef` para a função `public.submit_lead`. O Lovable Cloud retornou uma linha e o começo de `CREATE OR REPLACE FUNCTION public.submit_lead(...`, confirmando que a definição SQL é recuperável. **A interface truncou a exibição; o corpo da função ainda não foi inspecionado nem comparado integralmente.**

Próximo teste: consulta somente leitura com indicadores de presença de verificações de consentimento, privacidade, idempotência e rate limit. Esses indicadores textuais não provam o comportamento da implementação; a homologação dependerá de testes de execução em ambiente controlado.

## Verificação estática dos seis mecanismos de submit_lead — 29/10/2026

A consulta ao catálogo PostgreSQL com `pg_get_functiondef` e expressões `ILIKE` retornou `true` em **seis de seis** verificações textuais: validação de `p_consent`, presença de `ready_for_real_data`, `idempotency_key`, `lead_rate_limits`, `ON CONFLICT` e `public.leads`.

**Evidência:** captura da tela SQL Editor enviada pelo participante, ainda não anexada ao repositório. A verificação apenas confirma que o texto implantado contém esses trechos; não comprova a sequência de execução nem o comportamento em falhas, duplicidades ou acessos sem autorização.

**Próxima verificação funcional:** testar a recusa `not_ready` enquanto `app_settings.ready_for_real_data=false`, com dados fictícios e transação de somente leitura/rollback; nenhuma liberação de captura de leads reais está autorizada nesta etapa.


## Confirmação da trava de configuração (SELECT) — 29/10/2026

O participante executou uma consulta somente leitura a `public.app_settings` para o registro `id=1`. O Lovable Cloud retornou `ready_for_real_data=false` e o texto calculado `BLOQUEIO CONFIGURADO`.

**Resultado:** estado de configuração confirmado. O texto `BLOQUEIO CONFIGURADO` é produzido pelo `CASE` da própria consulta e não comprova, por si, que a função `submit_lead` recusa solicitações. O Gate G2 continua aberto.

**Próximo ensaio proposto:** invocar `submit_lead` somente com valores fictícios dentro de transação `READ ONLY`, encerrada por `ROLLBACK`. Espera-se `public_code=null`, `created=false`, `error=not_ready`. O teste deverá ser interrompido se a interface não oferecer execução confiável do bloco ou ocorrer erro. Não alterar `ready_for_real_data` nem enviar dados reais.

A captura desta verificação está na conversa e ainda precisa ser incorporada a `evidencias/` se for usada no portfólio.


## Ordem da trava de privacidade no código SQL

**29/10/2026 — verificação estática confirmada por captura.** A consulta ao catálogo retornou `true` nos três campos `possui_trava`, `possui_insercao` e `trava_antes_da_insercao`. O texto `ready_for_real_data` ocorre antes de `insert into public.leads` na definição da função.

Isso é evidência de **ordenação textual**, não prova de que toda chamada à função bloqueia a inserção. A configuração `ready_for_real_data=false` também foi comprovada em consulta separada. **Próxima condição:** realizar testes comportamentais somente com transação realmente isolada, ou após preparar ambiente específico de testes, sem liberação da coleta real. O usuário ainda não executou esse teste funcional.


## Trecho de privacidade observado (resposta abreviada) — 29/10/2026

A consulta SQL por `substring(pg_get_functiondef(...))` devolveu trecho contendo a leitura de `s.ready_for_real_data` de `public.app_settings` e o início da condição `if not coalesce(v_ready,false) then return query select ...`. A interface cortou o fim do retorno; a captura **não mostra integralmente** o literal `not_ready`. A migração SQL versionada apresenta o retorno `not_ready`.

**Conclusão:** evidência adicional de que a função lê a configuração e tem ramificação de bloqueio antes da inserção. Trata-se de inspeção estática; ainda não há ensaio funcional nem teste de persistência. A configuração `ready_for_real_data` deve continuar `false` enquanto o MVP não estiver pronto para coleta real.

**Próxima etapa:** ensaio funcional em condições controladas, usando unicamente dados fictícios, sem usar o painel de produção para executar mudanças não previstas e sem alterar as configurações de privacidade.

## Teste funcional de recusa `not_ready` — 29/10/2026

Foi executado no SQL Editor um ensaio de `public.submit_lead` com **dados fictícios**, utilizando o bloco de transação `BEGIN TRANSACTION READ ONLY` / `ROLLBACK` conforme instrução apresentada ao participante. A captura de resultado mostra uma linha com `created=false`, `error=not_ready` e `public_code=NULL`.

**Resultado: aprovado para o cenário de recusa pela trava de privacidade.** A função foi invocada e respondeu com o bloqueio esperado enquanto `app_settings.ready_for_real_data=false`. A captura de resultados isoladamente não verifica o bloco completo da transação; o procedimento executado foi o enviado anteriormente na conversa.

**Limites:** a captura não comprova que o banco continua sem linhas novas; por isso recomenda-se conferir contagens em `leads` e `lead_rate_limits` sem consultar informações pessoais. O comportamento de persistência quando habilitado, idempotência e rate limit ainda não foram testados. Não liberar envio real do formulário nem mudar `ready_for_real_data` nesta fase.
