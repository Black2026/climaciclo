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
