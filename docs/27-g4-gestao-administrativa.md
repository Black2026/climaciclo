# Gate G4 — Gestão administrativa do ClimaCiclo

**Início:** 30/10/2026  
**Escopo:** implementação controlada, em PR, sem habilitar coleta de dados reais.

## Situação anterior

- Gate G3: login administrativo, F5 mantendo sessão, logout e bloqueio de acesso anônimo foram aprovados **segundo testes manuais relatados pelo participante**.
- Ainda faltam teste com usuário autenticado sem role `admin` e teste direto de políticas RLS/API.
- Backend disponível: `src/lib/admin.functions.ts` contém consultas protegidas por `requireAdmin`, atualização de status de lead, conversão para cliente, CRUD de atendimentos e lembretes.
- O banco Lovable Cloud contém `leads`, `customers`, `service_orders`, `reminders`, com RLS.
- O bloqueio `ready_for_real_data=false` deve continuar ativo. O banco não deve receber dados pessoais reais para estes testes.

## Entregas em etapas

| Subetapa | Interface | Critério |
|---|---|---|
| G4.1 | `/admin/leads`: filtro, status e conversão | Usa `listLeads`, `updateLead`, `convertLead`; permissões no servidor; confirmação antes de converter |
| G4.2 | `/admin/clientes` e detalhe | Consulta registros reais; permite notas autorizadas |
| G4.3 | `/admin/atendimentos` | Criar e atualizar atendimento com referência a cliente existente |
| G4.4 | `/admin/lembretes` | Criar lembretes, marcar concluídos e listar vencimentos |
| G4.5 | Retestes | Testar RLS, login, logout, F5, persistência e fluxo completo sem dados reais |

## Alterações previstas nesta primeira PR

- Nova rota **independente** `src/routes/admin_.leads.tsx` para preservar o padrão `admin_.login.tsx` e evitar o bug anterior de aninhamento de rotas.
- Link **Gerenciar leads** no painel `/admin`.
- Uma tabela vazia é estado normal se não houver registros.
- Não criar registros fictícios, não ativar envio e não incorporar service role no navegador.
- Não considerar G4 aprovado até CI, revisão do diff, merge controlado e testes de navegador.

## Cuidados para homologação

1. Verificar que acesso anônimo a `/admin/leads` retorna ao login; usuário sem role não vê dados.
2. Verificar que filtros operam sem criar linhas.
3. Com dados sintéticos inseridos de modo controlado **apenas se necessário e autorizados**, verificar atualização de status, conversão idempotente e F5. Não gerar dados aleatórios/identificadores de clientes reais.
4. Garantir que `ready_for_real_data` permanece `false`.
5. Registrar capturas e resultados, sem informações privadas, antes de avançar a G4.2.
