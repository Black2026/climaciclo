# Checklist atualizado de entrega DIO — ClimaCiclo (30/10/2026)

## Entregáveis demonstrados

- [x] Dor selecionada, pesquisa de mercado, Canvas e hipóteses documentados.
- [x] Mega prompt, Lovable Plan, arquitetura SDD e processo de revisões documentados.
- [x] Código-fonte versionado no GitHub e integração Lovable–GitHub confirmada.
- [x] G1: navegação e formulário de três etapas, validações e responsividade aprovados segundo testes manuais.
- [x] G3: login, persistência de sessão após F5, logout, acesso anônimo e usuário sem role `admin` bloqueados no escopo dos testes visuais relatados.
- [x] G4: telas de leads, clientes, atendimentos e lembretes implementadas e verificadas em estado vazio; não implica CRUD homologado.
- [x] G4.5: 7 tabelas com RLS, 19 políticas inspecionadas, ACLs e EXECUTEs das funções essenciais auditados.
- [x] PR #13: script de remediação manual, plano de reversão e ensaio em PostgreSQL 17 isolado aprovados pela CI (não aplicado em produção).

## Pendências obrigatórias para declarar MVP completo e apto à operação

- [ ] Confirmar backup/snapshot recuperável do banco Lovable, revisar memberships e possíveis concessões herdadas, executar correção de menor privilégio com responsável autorizado.
- [ ] Exportar pós-auditoria e confirmar que `anon` não conserva grants; `authenticated` não possui `TRUNCATE`, `TRIGGER`, `REFERENCES` ou `MAINTAIN`; `service_role` intacto.
- [ ] Validar acesso às funções administrativas diretamente com conta sem role e controle RLS; repetir login, sessão, logout e dashboard.
- [ ] Fazer teste de persistência completa com dados **sintéticos** em ambiente controlado: lead → cliente → atendimento → lembrete. Sem habilitar captação real.
- [ ] Remover a segunda conta de teste não administradora após homologação, sem apagar administrador original.
- [ ] Conferir configurações de privacidade/LGPD antes de captar dados reais; `ready_for_real_data` continua falso.

## Pendências da submissão DIO

- [ ] Publicar e testar URL externa do aplicativo e registrar URL verificável no README, se exigido pelo desafio.
- [ ] Conferir e complementar capturas sem dados pessoais em `evidencias/`.
- [ ] Conferir integridade do repositório, ausência de credenciais e documentação de execução.
- [ ] Tornar o repositório **público**, após revisar dados/segredos, para que avaliadores tenham acesso.
- [ ] Submeter à DIO o link raiz: https://github.com/Black2026/climaciclo .

**Nunca marcar como concluídas atividades sem evidência.** O fato de o PR #13 apresentar testes verdes em ambiente isolado não comprova remediação no Lovable Cloud nem publicação do app. É possível submeter a documentação de um protótipo, caso o regulamento aceite, desde que as limitações sejam explicitadas.
