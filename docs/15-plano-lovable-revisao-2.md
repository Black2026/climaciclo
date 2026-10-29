# ClimaCiclo — Plano do MVP (revisão 2)

> Transcrição organizada do plano devolvido pelo Lovable, recebida em 29/10/2026. A existência do plano **não comprova** a implementação.

## Mudanças acordadas
1. Substituir view pública de contato por Server Function GET `getPublicContact` que devolve só `whatsappEnabled`, `whatsappNumber` e `displayName`.
2. Requerer autenticação **e** role `admin` do lado servidor para toda função administrativa; manter proteção CSRF.
3. `submitLead` valida consentimento no servidor, chave de idempotência estável, deduplicação atômica e sucesso após INSERT confirmado.
4. Conversão de lead em cliente via operação SQL transacional e idempotente.
5. Provisionamento do primeiro admin via interface Cloud/SQL de forma controlada, sem cadastro público de administradores. Trava de coleta enquanto campos de privacidade não forem preenchidos.
6. Testes adicionais de API, autenticação, duplicação, falha de rede, conversão e privacidade.

## Stack e estrutura
TanStack Start (SSR, React 19), Lovable Cloud, server functions `createServerFn`, rotas `/`, `/montar-plano`, `/solicitacao-recebida`, `/privacidade`, `/admin/login` e telas admin: painel, leads, clientes, atendimentos, lembretes, configurações.

## Tabelas
`admin_roles`, `app_settings` (WhatsApp, controlador, contato e retenção), `leads` (código, consentimento, UUID de idempotência, status), `customers` (`lead_id` único), `service_orders`, `reminders`, `lead_rate_limits`. Sem acesso anônimo direto às tabelas; consultas públicas somente por funções com payload restrito; grants/RLS administrativos.

## Entrada do lead
Validação Zod e consentimento explícito; bloquear até `ready_for_real_data` verdadeiro; limites atômicos por hash/janela; `INSERT ON CONFLICT` da chave e retorno do mesmo código no retry. Resposta apenas depois da gravação. Resumo e código apresentados ao visitante; dados sensíveis não podem ser recuperados anonimamente pela URL.

## Admin e conversão
Middleware servidor `requireAdmin` com auth + role; consultas sob RLS. Conversão com lock do lead, criação idempotente de customer e atualização do status na mesma transação. Provisionar o primeiro admin no Cloud e desabilitar cadastro público.

## Privacidade
Informar responsável/controlador, canal de contato e retenção antes de receber dados reais; WhatsApp pode permanecer opcional.

## Gates
G1 UX e rotas; G2 Cloud/leads; G3 Auth/RLS; G4 Gestão; G5 WhatsApp/testes/segurança. Seguir critérios de `docs/13-gates-e-checklist.md`.

## Riscos e limitações
Teste vitest isolado não substitui teste real de banco e RLS; rate limit IP-hash é básico; formulário perde rascunho ao F5 por decisão de privacidade; cobrança, agendamento e comunicação continuam manuais.

**Status real:** Lovable iniciou a landing, mas CTA 404 e falta de créditos impediram concluir G1. Resto pendente.
