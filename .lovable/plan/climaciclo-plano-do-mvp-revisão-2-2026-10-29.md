# ClimaCiclo — Plano do MVP (revisão 2)

"Seu ar em dia. Sua rotina mais leve." Site em português, pensado primeiro para celular, para testar a demanda por manutenção preventiva de ar-condicionado com orçamento feito à mão pelo WhatsApp. Nada de profissionais, preços, depoimentos, números ou contadores inventados. Ficam fora: Stripe, Resend, n8n, chatbot e IA.

## Mudanças desta revisão

1. A view `public_contact` saiu. No lugar dela entra a server function GET pública `getPublicContact`, que só devolve o contato.
2. Toda server function de admin passa a validar a sessão e a role `admin` no servidor. A proteção visual das rotas não conta como segurança. O CSRF continua ativo.
3. `submitLead`: o consentimento é validado de forma explícita, a chave de idempotência fica estável entre tentativas, a deduplicação é atômica no banco e o sucesso só é declarado depois da gravação.
4. A conversão de lead em cliente vira uma função SQL transacional e idempotente.
5. O procedimento do primeiro admin foi conferido com a interface atual do Cloud. A privacidade ganha campos reais e uma trava de "pronto para dados reais".
6. Entram novos testes: autorização, envio duplicado, falha de rede, conversão e privacidade.

## 1. Arquitetura e rotas (sem mudanças)

TanStack Start (SSR) + Lovable Cloud. A lógica de servidor usa `createServerFn`, sem Edge Functions.

```text
src/routes/
  index.tsx  montar-plano.tsx  solicitacao-recebida.tsx  privacidade.tsx
  admin.login.tsx                      /admin/login (público)
  _authenticated/route.tsx             proteção (gerenciada pela integração)
  _authenticated/admin.tsx             layout + aviso "sem permissão"
  _authenticated/admin.index.tsx       painel (contagens reais)
  _authenticated/admin.leads.tsx / admin.leads.$id.tsx
  _authenticated/admin.clientes.tsx / admin.clientes.$id.tsx
  _authenticated/admin.atendimentos.tsx  admin.lembretes.tsx  admin.configuracoes.tsx
src/components/{brand,plan,admin}/
src/lib/lead-schema.ts            zod compartilhado
src/lib/public.functions.ts       submitLead, getPublicContact, getPrivacyInfo
src/lib/admin.functions.ts        todas as funções de admin
src/lib/require-admin.ts          middleware requireAdmin
```

## 2. Modelo de dados

O modelo continua o da versão anterior (admin_roles, leads, customers, service_orders, reminders, lead_rate_limits), com estes ajustes:
- `public_contact_settings` foi renomeada para `app_settings` (linha única, id=1). Guarda: `whatsapp_number` (CHECK no formato E.164 BR), `whatsapp_enabled`, `display_name` e os campos de privacidade: `controller_name`, `controller_document` (CNPJ/CPF opcional), `privacy_contact_channel`, `retention_period`, `privacy_updated_at`. Mais `updated_by` e `updated_at`.
- `ready_for_real_data` é uma coluna gerada: fica verdadeira só quando controller_name, privacy_contact_channel e retention_period estão preenchidos.
- `leads.idempotency_key` uuid NOT NULL UNIQUE; `leads.consent` CHECK (consent = true); `leads.status` com padrão `novo`.
- `customers.lead_id` UNIQUE NOT NULL → leads (ON DELETE RESTRICT, para preservar a origem).

## 3. RLS por operação

| Tabela | anon | authenticated sem role | admin |
|---|---|---|---|
| leads, customers, service_orders, reminders | sem grant | sem acesso (RLS) | S/I/U/D via has_role |
| app_settings | sem grant | sem acesso | S/U |
| admin_roles | sem grant | S só da própria linha | S só da própria linha; I/U/D apenas via SQL do console |
| lead_rate_limits | sem grant | sem acesso | sem acesso (só service_role) |

Nenhuma tabela concede acesso a `anon`. As leituras públicas passam só pelas server functions, que devolvem campos fixos.

## 4. Funções públicas

**`getPublicContact` (GET, sem autenticação)**: lê `app_settings` no servidor e devolve só `{ whatsappEnabled, whatsappNumber | null, displayName }`. Nenhum outro campo sai dali.

**`getPrivacyInfo` (GET)**: devolve os campos de privacidade e `readyForRealData`.

**`submitLead` (POST)**:
1. O zod valida tudo de novo no servidor. A função rejeita explicitamente quando `consent !== true` e grava `consent_text_version`.
2. Se `readyForRealData` for falso, recusa com a mensagem "Ainda não estamos recebendo solicitações", e o formulário mostra esse aviso já na etapa 3.
3. Rate limit atômico: `INSERT ... ON CONFLICT DO UPDATE SET count = count+1 RETURNING count`, por phone_hash e ip_hash, numa única instrução.
4. Idempotência atômica: `INSERT ... ON CONFLICT (idempotency_key) DO NOTHING RETURNING public_code`. Se não voltar linha, faz SELECT pela chave e devolve o mesmo código. Assim não há corrida entre duplo clique e retry.
5. O servidor força status `novo`, internal_notes nulo e consent_at = now().
6. Responde `{ public_code, resumo não sensível }` só depois do INSERT confirmado. Os logs não levam PII.

**Chave estável no cliente**: a chave é gerada uma vez quando o usuário entra na etapa 3 (estado em memória) e reaproveitada em todas as tentativas, inclusive depois de falha de rede. Só é renovada se ele editar dados depois de um envio bem-sucedido, o que não acontece porque o fluxo segue para a confirmação. Se a rede falhar ou houver timeout, aparece "Não conseguimos confirmar o envio. Tentar novamente", e a nova tentativa usa a mesma chave. Não há tela de sucesso nem WhatsApp antes da confirmação.

**Confirmação**: o resumo segue em memória (router state) e só `?codigo=` vai na URL. Não há consulta anônima a leads.

## 5. Funções de admin

O middleware `requireAdmin` encadeia `requireSupabaseAuth`, que valida o bearer no servidor, e depois `has_role(userId,'admin')` via `context.supabase`. Se falhar, a função lança 401/403 antes de qualquer consulta. Todas as funções em `admin.functions.ts` usam esse middleware, e as consultas rodam como o usuário, com a RLS valendo também. O cliente privilegiado (`client.server`) só é importado dentro de handlers públicos (`submitLead`, `getPublicContact`) e nunca chega ao bundle do navegador. O `csrfMiddleware` existente em `start.ts` fica, e o anexador de bearer é adicionado sem remover nada.

## 6. Conversão de lead em cliente

A função SQL `convert_lead_to_customer(p_lead_id)` é SECURITY INVOKER, chamada por RPC pelo admin, e roda numa única transação:
1. `SELECT ... FROM leads WHERE id = p_lead_id FOR UPDATE`; se o lead não existir, erro.
2. `INSERT INTO customers (...) VALUES (...) ON CONFLICT (lead_id) DO NOTHING`.
3. `UPDATE leads SET status='convertido'`.
4. Devolve o customer_id, seja o novo ou o que já existia.

Chamar duas vezes devolve o mesmo cliente. Se qualquer passo falhar, nada é gravado. Se quem chama não for admin, a RLS bloqueia.

## 7. Primeiro administrador (procedimento conferido no Cloud atual)

1. Em Cloud → **Users → Add user**, criar o operador com e-mail e senha. Usuários criados direto ali já saem confirmados.
2. Em Cloud → **Database → Manage → SQL editor**, rodar o INSERT em `admin_roles` buscando pelo e-mail. A instrução fica documentada no README e numa nota em /admin/configuracoes.
3. O cadastro público fica desligado. /admin/login só faz login. Não há endpoint de promoção, e `admin_roles` não aceita INSERT/UPDATE pelo app.

## 8. Privacidade e trava de dados reais

`/privacidade` mostra os campos preenchidos pelo admin em /admin/configuracoes: controlador, documento, canal de contato e prazo de retenção, além de um texto-base sem alegações de conformidade. Com algum campo vazio, a página mostra a faixa "Texto provisório", a landing e o configurador mostram "Em preparação: ainda não recebemos solicitações", e o `submitLead` recusa o envio. O painel do admin ganha um checklist de "Pronto para dados reais" (privacidade + WhatsApp opcional).

## 9. Gates e critérios de aceitação

- **G1 UX/público**: marca, tokens de cor, landing, configurador, privacidade, 404 e SEO. Aceite: percorrer as 3 etapas e voltar sem perder dados; consentimento desmarcado bloqueia; sem rolagem horizontal em 320/375/390/768/1280; contraste AA; alvos de toque de 44 px.
- **G2 Cloud + persistência**: tabelas, grants, `submitLead` e `getPublicContact`. Aceite: um envio válido cria uma linha `novo`; 5 cliques rápidos geram 1 linha; uma falha de rede simulada mostra erro e o retry devolve o mesmo código; com `ready_for_real_data` falso, o envio é recusado; o banco indisponível nunca mostra sucesso.
- **G3 Auth + RLS**: login, `requireAdmin` e políticas. Aceite: um anônimo direto na API de cada tabela é negado; chamar funções de admin sem token dá 401 e com usuário sem role dá 403; F5 no admin mantém a sessão; /admin anônimo redireciona.
- **G4 Gestão**: leads, conversão, clientes, ordens, lembretes e painel. Aceite: converter duas vezes gera 1 cliente com status `convertido`; uma falha forçada não deixa cliente órfão; tudo persiste depois de F5.
- **G5 WhatsApp + testes + segurança**: configuração, botão e fallback "Copiar resumo", testes e scan. Aceite: desligado mostra só "Copiar"; ligado, o link leva código e resumo sem PII; `getPublicContact` devolve só os 3 campos; o scan de segurança sai sem achados críticos.

Testes automatizados (vitest): schema e consentimento obrigatório; status forçado `novo`; formato do telefone; idempotência (mesma chave dá mesmo código); recusa sem `ready_for_real_data`; payload de `getPublicContact` restrito; `requireAdmin` rejeitando sem sessão e sem role; regra da conversão idempotente. Os testes de banco reais (corrida, transação, RLS) são verificados no G2 a G4 por consultas no banco e chamadas à API como anônimo e como usuário comum.

Nenhum gate avança sem passar no anterior.

## 10. Limitações da plataforma e dependências

- Os testes vitest rodam sem banco real. Concorrência, transação e RLS são validadas manualmente por consultas e chamadas reais em cada gate, e não em CI.
- O rate limit por IP-hash é básico; não haverá captcha (exigiria serviço externo).
- O F5 no configurador perde o rascunho (escolha de privacidade).
- **Depende do operador**: criar o primeiro admin, preencher os dados de privacidade, configurar o WhatsApp e publicar.
- **Depende de clientes reais**: conversão do funil, clareza do FAQ e ajuste dos limites.
- O texto de privacidade não é parecer jurídico.
