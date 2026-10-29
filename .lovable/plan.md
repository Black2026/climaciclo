# ClimaCiclo — Plano do MVP

"Seu ar em dia. Sua rotina mais leve." Site em português, pensado primeiro para celular, para testar a demanda por manutenção preventiva de ar-condicionado com orçamento feito à mão pelo WhatsApp. Nada de profissionais, preços, depoimentos, números ou contadores inventados.

## 1. Arquitetura e rotas

Stack: TanStack Start (React 19, SSR) + Lovable Cloud (autenticação, banco, RLS). A lógica de servidor usa server functions (`createServerFn`), não Edge Functions. Esse é o padrão desta stack e cumpre a exigência de ter um "endpoint com validação no servidor".

```text
src/routes/
  index.tsx                  /  landing (proposta, 3 passos, FAQ, CTA)
  montar-plano.tsx           /montar-plano  configurador em 3 etapas
  solicitacao-recebida.tsx   /solicitacao-recebida  confirmação
  privacidade.tsx            /privacidade
  admin.login.tsx            /admin/login  (público)
  _authenticated/route.tsx   proteção (gerenciada pela integração)
  _authenticated/admin.tsx            layout admin + verificação de role
  _authenticated/admin.index.tsx      /admin  painel (contagens reais)
  _authenticated/admin.leads.tsx      /admin/leads (+ $id)
  _authenticated/admin.clientes.tsx   /admin/clientes (+ $id)
  _authenticated/admin.atendimentos.tsx
  _authenticated/admin.lembretes.tsx
  _authenticated/admin.configuracoes.tsx
src/components/brand/   Logo (SVG ciclo/brisa), Wordmark
src/components/plan/    StepAmbiente, StepLocal, StepContato, Resumo, Stepper
src/components/admin/   AdminShell, LeadTable, StatusBadge, forms
src/lib/lead-schema.ts  schema zod compartilhado entre cliente e servidor
src/lib/*.functions.ts  server functions (lead público, admin)
```

A 404 já existe no root e vai ganhar o visual da marca. O layout será testado em 320, 375, 390, 768 e 1280 px.

## 2. Modelo de dados

- `app_role` enum: `admin`.
- `admin_roles` (id, user_id → auth.users UNIQUE com role, role, created_at). Função `has_role(uid, role)` como security definer.
- `public_contact_settings`: linha única (id fixo = 1, CHECK), `whatsapp_number` text nulo, validado por CHECK no formato E.164 BR, `whatsapp_enabled` bool, `display_name`, updated_at, updated_by.
- `leads`: id uuid, `public_code` (ex.: `CC-7K3Q9P`, UNIQUE, gerado no servidor), `idempotency_key` uuid UNIQUE, environment_type (residencial|comercial), unit_count int (CHECK 1–50), unit_type enum (split, janela, cassete, piso-teto, outro, não sei), city, neighborhood, follow_up_pref enum, interests text[] (limpeza|revisao|orientacao), name, whatsapp, email nulo, consent bool (CHECK = true), consent_at, consent_text_version, status enum (novo|em_contato|orcamento_enviado|convertido|descartado; padrão `novo`), internal_notes nulo, phone_hash (para detectar duplicidade), created_at, updated_at.
- `customers`: id, `lead_id` UNIQUE → leads, name, whatsapp, email, city, neighborhood, notes, created_at.
- `service_orders`: id, customer_id → customers, kind (limpeza|revisao|orientacao|outro), status (aberta|agendada_manual|concluida|cancelada), scheduled_note text (combinado manualmente, sem agenda integrada), notes, created_at, updated_at.
- `reminders`: id, customer_id, service_order_id nulo, due_date, title, done bool, created_at.
- `lead_rate_limits` (phone_hash/ip_hash, window_start, count) para conter abuso.

Cada tabela recebe GRANTs explícitos para `authenticated` e `service_role`. `anon` só recebe SELECT na view pública de contato.

## 3. RLS por operação

| Tabela | Anônimo | Admin (has_role) | Autenticado sem role |
|---|---|---|---|
| leads | nada (nenhum grant) | S/I/U/D | nada |
| customers, service_orders, reminders | nada | S/I/U/D | nada |
| admin_roles | nada | S apenas da própria linha; sem I/U/D pelo app | S da própria linha (para o painel saber que não tem acesso) |
| public_contact_settings | nada na tabela | S/U | nada |
| view `public_contact` (só número + enabled) | S | S | S |
| lead_rate_limits | nada | nada | nada (só o servidor) |

O INSERT público não passa por RLS anônima. A server function `submitLead` valida tudo com zod, força `status='novo'`, `internal_notes=null`, `consent=true` e `consent_at=now()`, aplica o rate limit e grava com o cliente admin do servidor. Esse cliente fica só no servidor e é carregado dentro do handler.

## 4. Entrada do lead

1. O configurador guarda o estado em memória (React state no nível da rota), então voltar uma etapa preserva tudo. Nada vai para localStorage nem para a URL. Ao dar F5 o formulário volta vazio; isso é intencional e o rascunho fica só em memória.
2. Na etapa 3 o consentimento começa desmarcado e o envio fica bloqueado até a validação passar.
3. O cliente gera uma `idempotency_key` (uuid) por tentativa. Um duplo clique ou um reenvio devolve o mesmo resultado.
4. O servidor valida e aplica os limites (ex.: 3 envios por telefone em 24 h, 10 por IP-hash por hora; IP só em hash, nunca guardado bruto). Os logs não registram campos pessoais.
5. A resposta só sai depois do INSERT confirmado e traz `{ public_code, resumo não sensível }` (ambiente, quantidade, tipo, cidade, interesses).
6. A navegação para `/solicitacao-recebida` leva esse resumo em memória (router state). Na URL fica só `?codigo=CC-XXXX`. A página não consulta o banco anonimamente: num F5 sem o state, aparece só o código e o aviso "guarde seu código".
7. Se o servidor falhar, aparece um erro claro com "tentar novamente". O WhatsApp não é aberto e não há mensagem de sucesso.

## 5. WhatsApp

- O número é configurado apenas pelo admin em /admin/configuracoes, validado e normalizado (55 + DDD + número).
- A tela de confirmação lê a view `public_contact`. Se estiver habilitado, mostra o botão `wa.me/<num>?text=` com o código e o resumo não sensível (sem nome nem telefone). Se não estiver, mostra "Copiar resumo" (clipboard) e "entraremos em contato pelo WhatsApp informado". Nenhum número aparece por padrão.

## 6. Primeiro administrador (seguro)

Não haverá cadastro público com privilégio nem endpoint de promoção. Passos:
1. O operador cria o próprio usuário no painel do Cloud (Users → Add user, com confirmação de e-mail).
2. Em Cloud → Database → SQL, roda `insert into admin_roles(user_id, role) select id,'admin' from auth.users where email='<seu e-mail>';` (instrução documentada na página de configurações e no README, sem o e-mail embutido).
3. `/admin/login` faz só login com e-mail e senha; o cadastro público fica desligado. Um usuário logado sem role vê "Sem permissão" e não recebe dado nenhum, porque a RLS bloqueia.

## 7. Implementação em gates

- **G1 UX/público**: tokens de design (#0F172A, #0D9488, #14B8A6, #F8FAFC, #F97316 em oklch), logo SVG, landing, configurador completo com validação, privacidade, 404 e head/SEO por rota. O envio fica desabilitado com o aviso "conexão pendente" até o G2. Aceite: navegar pelas 3 etapas, voltar sem perder dados, layout ok nos 5 tamanhos.
- **G2 Cloud + persistência**: ativar o Cloud, criar as migrações das tabelas e grants, a server function `submitLead` com idempotência e rate limit, e a página de confirmação real. Aceite: um envio cria a linha `novo`, o duplo clique não duplica e uma falha simulada não mostra sucesso.
- **G3 Auth + RLS**: login de admin, `has_role`, todas as políticas, verificação de role no layout admin. Aceite: um anônimo consultando `leads` pela API recebe erro ou vazio, e um usuário sem role recebe vazio.
- **G4 Gestão**: lista e filtro de leads, mudança de status, notas internas, conversão de lead em cliente (sem duplicar, graças ao UNIQUE em lead_id), CRUD de atendimentos e lembretes, painel com contagens reais. Aceite: o fluxo lead → cliente → ordem → lembrete persiste depois de F5.
- **G5 WhatsApp + testes + segurança**: configuração do número, botão e fallback, testes vitest (schema do lead, consentimento obrigatório, status forçado `novo`, formato do telefone, rate limit), scan de segurança, revisão de logs e de PII. Aceite: com o número desligado aparece só "Copiar"; com ele ligado, o link leva o código.

Só passo para o gate seguinte depois de verificar o anterior no navegador.

## 8. Testes de aceitação

F5 em cada etapa (o rascunho em memória se perde, como esperado). F5 na confirmação (só o código). F5 no admin (sessão mantida). Acesso anônimo direto a /admin/* (redireciona). Chamada da API anônima em cada tabela (negada). Envio com consentimento desmarcado e com campos inválidos via servidor (rejeitado). Celular em 320 px sem rolagem horizontal, com alvos de toque de 44 px e contraste AA.

## 9. O que é implementável agora e o que depende de terceiros

**Dá para implementar agora:** todas as telas, banco, RLS, server functions, login, gestão, fallback de WhatsApp e testes.

**Depende do operador:** criar o primeiro admin (passo 6), cadastrar o número comercial de WhatsApp, identificar o controlador, o canal de contato e o prazo de retenção para completar a página /privacidade (até lá ela mostra um aviso visível de "texto provisório; não usar com visitantes reais"), e publicar o site.

**Depende de validação com clientes reais:** a taxa de conclusão do configurador, a clareza do FAQ, os limites de rate limit e as opções de tipo de aparelho e de acompanhamento.

## 10. Riscos e decisões

- Rascunho só em memória: perde-se no F5, em troca de não guardar dados pessoais no navegador.
- O rate limit por IP-hash é básico; um bot sofisticado passa. Um captcha fica fora do escopo, pois exige serviço externo.
- A página de privacidade não é aconselhamento jurídico e precisa ser revisada antes do tráfego real.
- Não haverá e-mails automáticos; o operador acompanha os leads pelo painel.
