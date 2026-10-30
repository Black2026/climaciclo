# ClimaCiclo — resumo de entrega DIO (30/10/2026)

**Repositório do projeto:** https://github.com/Black2026/climaciclo

**Status:** código, aplicação em protótipo e documentação técnica preparados. **Não declarar que o MVP está publicado, seguro para dados reais ou integralmente homologado.** O repositório permanece **privado** até a revisão de segredos e a mudança manual de visibilidade.

## Propósito e execução

ClimaCiclo é um MVP para orientar solicitações de manutenção preventiva de ar-condicionado e auxiliar a operação administrativa. Elaborado com ChatGPT (pesquisa, tese, planejamento, prompts, análise e revisões), Lovable (app e Cloud) e GitHub (código, CI, documentação). Há análise de problema, TAM/SAM/SOM ilustrativos, Business Model Canvas e hipótese a validar, descritos em `docs/00`–`docs/03`.

### O que foi implementado e verificado

- Landing e formulário público de três etapas; fluxo visual e responsividade relatados como aprovados em G1. O envio real é bloqueado.
- Backend PostgreSQL no Lovable Cloud com sete tabelas, RLS em todas e 19 políticas auditadas; coleta real permanece desativada (`ready_for_real_data=false`).
- Login administrativo, F5, logout e bloqueio de contas sem perfil admin verificados por testes manuais relatados.
- Painel com gestão visual de leads, clientes, atendimentos e lembretes; testes de CRUD completo com registros persistidos pendentes.
- CI com testes, build e TypeScript; correção controlada de grants excessivos preparada em PR #13 e ensaiada com PostgreSQL 17 efêmero.

### Questão de segurança ainda aberta

O banco Lovable Cloud auditado ainda possui, conforme CSVs do participante, concessões excessivas a `anon` e `authenticated`, incluindo `TRUNCATE`, `TRIGGER`, `REFERENCES` e `MAINTAIN`. A PR #13 prepara o script `security/sql/20_restrict_grants_manual.sql`, mas **não comprova sua aplicação no banco Lovable**. O teste isolado não substitui backup, pré-verificação de ACL, revisão de roles herdadas, aplicação autorizada e auditoria posterior. Não expor dados pessoais reais nem ativar `ready_for_real_data`.

### Antes de entregar na DIO

1. Encerrar a correção de privilégios no Lovable mediante backup, execução supervisionada e auditoria posterior; testar APIs com conta sem role e login após a mudança.
2. Validar pelo menos o fluxo controlado com registros sintéticos em ambiente adequado; não gerar dados pessoais reais.
3. Publicar o aplicativo, testar endereço aberto sem login e inserir no README, se requerido no desafio.
4. Revisar o código e as capturas quanto a segredos, tokens e dados pessoais; tornar o repositório público no GitHub.
5. Enviar para a DIO o link raiz **https://github.com/Black2026/climaciclo** e, se pedido, a URL publicada do aplicativo.

**Documentos de referência:** `README.md`, `docs/19-checklist-entrega-dio.md`, `docs/26-regressao-zod4-g3.md`, `docs/27-g4-gestao-administrativa.md`, `docs/28-g45-plano-remediacao-grants.md`. Evidências verificadas estão descritas em `evidencias/README.md`; capturas de conversa não devem ser descritas como arquivos já enviados ao GitHub.

**Honestidade de entrega:** pode ser apresentado como protótipo técnico documentado, se a DIO aceitar esse escopo. Não alegar operação comercial validada, publicação externa, segurança final homologada ou dados reais coletados sem evidências.
