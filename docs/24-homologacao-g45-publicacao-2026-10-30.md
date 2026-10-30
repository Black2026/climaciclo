# ClimaCiclo — Evidências de homologação G4.5 e publicação

**Data de registro:** 30/10/2026  
**Ambiente:** Lovable Cloud (PostgreSQL), Lovable e GitHub  
**Situação:** MVP demonstrativo publicado; segurança avaliada parcialmente, com verificações adicionais de backend recomendadas antes de receber dados reais.

## Links

- Aplicação publicada: https://pixel-perfect-picture-9455.lovable.app
- Repositório: https://github.com/Black2026/climaciclo (privado na verificação de 30/10/2026)
- Branch sincronizada com Lovable: `main`, conforme a interface Git do Lovable.

## Auditorias SQL realizadas

- Backup PostgreSQL obtido antes de modificações.
- Sete tabelas analisadas: `admin_roles`, `app_settings`, `customers`, `lead_rate_limits`, `leads`, `reminders` e `service_orders`.
- RLS habilitado nas sete tabelas (`relrowsecurity = true`); `relforcerowsecurity = false` nas sete.
- Foram verificadas 19 políticas RLS distribuídas por seis tabelas, e ausência de política em `lead_rate_limits`.
- Privilégios `TRUNCATE`, `REFERENCES` e `TRIGGER` revogados de `anon` e `authenticated` nas sete tabelas; consulta pós-revogação não retornou concessões.
- Privilégios efetivos `SELECT`, `INSERT`, `UPDATE` e `DELETE` do papel `anon` confirmados como **false** nas tabelas `admin_roles`, `customers`, `reminders` e `service_orders` após correção.
- Revisadas as funções `has_role` e `submit_lead` (`SECURITY DEFINER`). `submit_lead` foi observado como executável por `service_role`, não por `anon` nem `authenticated`. As duas usam `search_path=public`; convém revisar o endurecimento adicional.
- Os papéis `anon`, `authenticated` e `service_role` não tinham permissão `CREATE` no esquema `public`, conforme consulta registrada.
- Contagens de `leads`, `customers`, `service_orders` e `reminders` eram zero no momento da consulta.

## Testes funcionais observados

1. Página inicial e navegação para configurador.
2. Configurador com três etapas: aparelhos, localização/preferências e contato/revisão.
3. Consentimento desmarcado bloqueou avanço; consentimento marcado permitiu revisão dos dados fictícios.
4. A interface exibiu mensagem de demonstração sem envio/armazenamento; a ausência de persistência foi corroborada por consulta pontual com contagem zero.
5. Rota administrativa direcionou visitante sem sessão para login.
6. Conta com papel administrativo acessou painel; logout e novo login funcionaram.
7. Conta sem papel administrativo recebeu mensagem de acesso negado.
8. Gestão de clientes abriu após revogação de permissões, exibindo lista vazia em conformidade com a contagem SQL.
9. Tela Security do Lovable: **Deep** e **Quick security scan** atualizados, **No issues found**; 53 pacotes e zero problemas conhecidos na ferramenta.
10. A publicação foi confirmada no Lovable com a mensagem **“Seu site está no ar”**; capturas posteriores mostram a home e a etapa 1 do configurador no domínio publicado.

## Limitações e pendências

- Capturas de tela e verificações de permissões não substituem testes diretos de autorização nas APIs e nas funções de backend sob papéis distintos.
- O envio de dados reais deve **permanecer desativado** até validar o bloqueio no servidor, privacidade/LGPD e fluxos reais autorizados.
- Não houve comprovação de persistência positiva de novos registros nem de operações administrativas de criação/edição/exclusão com dados de teste.
- É recomendável testar novamente as três etapas no domínio público, incluindo casos negativos e verificação de rede/servidor.
- O repositório continua privado; decidir como disponibilizá-lo à avaliação da DIO, após revisar segredos e conteúdo sensível.
- O Security Scan não assegura ausência integral de vulnerabilidades.

## Resultado

**MVP demonstrativo publicado com testes de interface e auditorias SQL documentados.** A homologação funcional observada é positiva. A **homologação integral de autorização/persistência para dados reais permanece pendente**, sendo indevida qualquer alegação de segurança completa.
