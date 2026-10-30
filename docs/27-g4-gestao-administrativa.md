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


## Homologação visual G4.1 — gestão de leads (30/10/2026)

- O [PR #9](https://github.com/Black2026/climaciclo/pull/9) foi **mesclado** na `main` (`3832e35bbb9fcd6a65e2c8892ee04c485487867f`).
- A [CI pós-merge](https://github.com/Black2026/climaciclo/actions/runs/41062728529) concluiu com sucesso.
- O participante apresentou **duas capturas** da Visualização Lovable na rota `/admin/leads`, mostrando o título **Gestão de leads**, link **Voltar ao painel**, filtro **Filtrar status** e a tabela com as colunas Código, Nome, Cidade, Status e Ação.
- A lista de opções do filtro foi visualmente observada: **Todos**, **novo**, **em contato**, **orçamento enviado**, **convertido**, **descartado**.
- O estado vazio **Nenhum lead encontrado** é coerente com a ausência de registros no banco, e nenhum dado fictício é exibido.
- **Aprovado:** acesso visual à página de gestão pelo operador, componentes renderizados e opções de filtro presentes.
- **Não verificado:** efeito de aplicar filtros a registros existentes, persistência de mudança de status, conversão de lead em cliente, usuário autenticado sem role, tentativa anônima de abrir `/admin/leads`. Não tratar como homologação integral de G4.1.
- Capturas fornecidas na conversa; pendente incluí-las manualmente na pasta `evidencias/` do GitHub.

**Próximo passo:** desenvolver a interface G4.2 de clientes em branch separada; manter bloqueio `ready_for_real_data=false`. Não inserir dados pessoais reais nem inventar clientes para preencher a tabela.


## Implementação proposta G4.2 — 30/10/2026

- Rota independente `/admin/clientes` criada em `src/routes/admin_.clientes.tsx`, seguindo o padrão que evita o erro anterior de aninhamento.
- Busca local por nome/cidade/bairro, tabela de clientes existentes e estado vazio sem dados inventados.
- Seleção de cliente exibe detalhes, código de origem, contagem de ordens e lembretes; edição de notas internas com limite de 4.000 caracteres.
- Todas as consultas e alterações são realizadas por `listCustomers`, `getCustomer` e `updateCustomer`, server functions com `requireAdmin`.
- Tela não apresenta telefone e não armazena credenciais no browser. Não modifica o banco, `ready_for_real_data` ou o bloqueio de captação.

**Aceite pendente:** CI e segurança aprovados, revisão do PR, integração `main`, abertura de `/admin/clientes` no Lovable autenticado, verificação de lista vazia, pesquisa e detalhes (quando houver registros), persistência das notas após F5 e acesso negado sem permissão. Não cadastrar clientes fictícios automaticamente.
