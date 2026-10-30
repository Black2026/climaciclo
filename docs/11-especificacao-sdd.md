# 11 — Especificação SDD v1.0 — ClimaCiclo

## Visão e fronteiras
MVP para organizar solicitações de manutenção preventiva, validar interesse de clientes e operar conversas comerciais via WhatsApp. O produto **não** garante serviço, técnico, data ou preço. Nada de pagamento integrado, bot, IA embarcada ou marketplace.

## Stack planejada
TanStack Start, React 19, TypeScript, rotas SSR e Server Functions (`createServerFn`), com Lovable Cloud para autenticação e persistência. Não usar banco externo.

## Histórias de usuário
- US01: visitante lê proposta, benefícios, três passos e FAQ.
- US02: interessado configura tipo/quantidade de aparelho e necessidade em formulário de três etapas.
- US03: interessado revisa campos e concede consentimento explicitamente antes de enviar.
- US04: ao enviar com sucesso, recebe um código para acompanhamento sem exposição de PII.
- US05: quando houver WhatsApp comercial habilitado, visitante abre uma mensagem de contato com resumo não sensível.
- US06: administrador autenticado e autorizado consulta, filtra e atualiza leads.
- US07: administrador converte lead em cliente sem duplicação.
- US08: administrador registra atendimento, status, retorno e lembrete.
- US09: administrador configura contato e conteúdo obrigatório de privacidade.

## Modelo de dados planejado
`admin_roles` (`user_id` UNIQUE, `role=admin`); `app_settings` (linha única, WhatsApp, controlador, canal, retenção, trava de dados reais); `leads` (código único, UUID de idempotência, dados do equipamento/local/contato, consentimento e status); `customers` (`lead_id` UNIQUE); `service_orders` (`customer_id`, tipo, status, anotação de agendamento manual); `reminders` (`customer_id`, `due_date`, título, concluído); `lead_rate_limits` (hash de IP/telefone, janela, contador).

## Regras de negócio
- Entradas públicas são validadas com Zod no servidor e não definem status interno.
- Consentimento explicitamente recebido, com versão e data.
- Bloquear coleta real enquanto privacidade não estiver configurada e revisada.
- Repetir submissão com mesma chave idempotente deve retornar mesma solicitação; limitar abuso atomicamente, com renovação da janela.
- Nenhuma função admin aceita requisição sem autenticação **e** role, inclusive chamadas diretas a APIs.
- Conversão para cliente deve ser transacional, idempotente e preservar origem.
- Somente campos de contato comercial necessários são retornados publicamente.
- Nada de credenciais privilegiadas no navegador, README ou logs.

## Rotas previstas
`/`, `/montar-plano`, `/solicitacao-recebida`, `/privacidade`, `/admin/login`, `/admin`, `/admin/leads`, `/admin/clientes`, `/admin/atendimentos`, `/admin/lembretes`, `/admin/configuracoes`.

## Critérios de aceite (gates)
**G1:** CTA abre /montar-plano, navegação entre três etapas com validação, 320/375/390/768/1280 sem overflow; envio real bloqueado.

**G2:** lead persiste, repetição não duplica, falha de servidor não gera falso sucesso; travas de privacidade respeitadas.

**G3:** login e role no servidor; leitura anônima e funções administrativas não autorizadas negadas; sessão resiste F5.

**G4:** dados reais, CRUD e conversão atômica; persistência depois F5.

**G5:** WhatsApp habilitado/desabilitado, testes, varredura de segurança e documentação das evidências.

**Estado:** especificação e planejamento, não implementação comprovada.
