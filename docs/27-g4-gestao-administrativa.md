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


## Homologação visual G4.2 — Gestão de Clientes (30/10/2026)

- **PR #10** `feat/g4-clientes` integrado à `main` no commit `3d9c15f407e7f0545b6f8056249d0743f4080924`; [CI pós-merge](https://github.com/Black2026/climaciclo/actions/runs/41064293381) concluída com sucesso.
- O participante enviou duas capturas da Visualização do Lovable: `/admin/clientes` e `/admin`, evidenciando **Gestão de clientes**, busca por nome/cidade/bairro, tabela com Nome/Cidade/Bairro/Cadastro/Ação, estado `Nenhum cliente encontrado.` e o botão `Gerenciar clientes` no painel.
- O painel mostra contagens zeradas e aviso de bloqueio de recebimento de leads reais e WhatsApp desativado.
- **Aprovado visualmente:** renderização da rota, da pesquisa, da tabela vazia e acesso pelo painel.
- **Ainda pendente de teste funcional:** buscas com registros, abrir detalhes, atualizar notas, persistência após F5, acesso por usuário sem role e bloqueio da API/RLS.
- Capturas compartilhadas na conversa, **ainda não anexadas à pasta `evidencias/` no GitHub**; não reproduzir dados pessoais na documentação.
- O bloqueio de coleta real continua obrigatório. A evolução para a interface G4.3 não implica aprovação completa das operações de G4.2.


## Implementação proposta G4.3 — Atendimentos (30/10/2026)

- Página protegida `/admin/atendimentos` implementada via `admin_.atendimentos.tsx`, independente da rota de painel para evitar aninhamento indevido.
- Lista atendimentos e permite filtrar por status (aberta, agendada manualmente, concluída e cancelada).
- Formulário de novo atendimento exige cliente já cadastrado. Sem clientes, exibe aviso e não permite criar ordens; não gera cadastros fictícios.
- O registro usa `createOrder`, a listagem `listOrders` e a alteração de status `updateOrder`. Todas são server functions sob `requireAdmin`.
- Agendamento é apenas texto combinado manualmente, sem calendário externo; observações limitadas a 4.000 caracteres.
- `ready_for_real_data` permanece inalterado; não há modificação do esquema do banco.

**Aceite pendente:** revisão, CI e varredura de segurança, merge do PR, visualização autenticada no Lovable, estado vazio, confirmação de bloqueio anônimo e regressões. Persistência de criação e mudança de status só poderá ser aprovada quando houver cliente legítimo de teste de forma controlada. Não registrar dados reais de clientes para demonstrar a funcionalidade.


## Homologação visual G4.3 — Atendimentos (30/10/2026)

- O [PR #11](https://github.com/Black2026/climaciclo/pull/11) foi **mesclado** em `main` (commit `ff15f41a3317bccafcd43172b8e0a4d1377b6583`); a [CI após merge](https://github.com/Black2026/climaciclo/actions/runs/41065465332) concluiu com sucesso.
- Três capturas do participante mostram o painel `/admin` com o link **Gerenciar atendimentos** e a rota `/admin/atendimentos` com título **Gestão de atendimentos**, seção **Novo atendimento**, tabela **Atendimentos cadastrados** e filtro de status.
- O seletor apresenta as opções: **Todos**, **aberta**, **agendada manual**, **concluída**, **cancelada**. O texto **Nenhum cliente cadastrado. A criação de atendimentos estará disponível depois que houver um cliente legítimo no banco** é exibido corretamente; a tabela indica **Nenhum atendimento encontrado**.
- **Aprovado visualmente:** navegação, renderização da página, estado sem clientes/atendimentos, opções de filtro e bloqueio da criação sem cliente existente.
- **Ainda não testado:** execução dos filtros com ordens existentes, criação/alteração de atendimento no banco, persistência após F5, negação a usuário autenticado sem `admin` e testes diretos de RLS. Estas capturas **não comprovam CRUD completo**.
- As capturas estão na conversa, mas o upload dos PNGs em `evidencias/` ainda não foi verificado. Não inserir dados pessoais nem clientes fictícios na homologação de interface.
- A coleta real de leads e o WhatsApp comercial continuam desativados conforme capturas. `ready_for_real_data=false` permanece requisito obrigatório para os próximos Gates.

**Próximo Gate:** G4.4 — lembretes, mantendo a API de gestão protegida e o processo de PR + CI + revisão + teste visual.


## Implementação proposta G4.4 — Lembretes (30/10/2026)

- Rota independente `/admin/lembretes`, com consulta via `listReminders` e autenticação + role `admin` obrigatórias.
- Filtros **Pendentes**, **Concluídos** e **Todos**; tabela vazia sem dados fictícios, com descrição, cliente, vencimento e ação.
- Formulário de criação exige cliente existente, título e data válida; utiliza `createReminder` no servidor e não dispara mensagens automáticas.
- Ação **Concluir/Reabrir** utiliza `toggleReminder` no servidor. Apenas administradores autorizados podem alterar o estado.
- Com zero clientes, apenas o aviso informativo é apresentado; nenhuma criação é liberada, preservando a integridade referencial.
- `ready_for_real_data` e as políticas RLS permanecem inalteradas. Sem modificações de esquema ou segredos.

**Aceite pendente:** CI e segurança verdes, revisão do PR, merge controlado, renderização da rota no Lovable, filtro de estados e controle sem clientes. Persistência real após F5 e mudança de status precisam de um cliente/registro legítimo de teste e ainda não estarão homologadas apenas pelas capturas da tela vazia. G4.5 tratará o teste de usuário autenticado sem role e os testes diretos de RLS/API.


## Homologação visual G4.4 — Lembretes (30/10/2026)

- PR [#12](https://github.com/Black2026/climaciclo/pull/12) mesclado em `main` (commit `f56bd508694a45abd375795e604249c29a259c45`); [CI pós-merge aprovada](https://github.com/Black2026/climaciclo/actions/runs/41066434619).
- O participante enviou três capturas da Visualização Lovable: painel `/admin` com botão **Gerenciar lembretes**, rota `/admin/lembretes`, tabela e filtro com as opções **Pendentes**, **Concluídos** e **Todos**.
- Estado vazio exibido: **Nenhum lembrete encontrado**; sem clientes cadastrados, aparece aviso de que não é possível criar lembretes sem cliente.
- O painel mantém contagens zero, recepção real de leads bloqueada e WhatsApp comercial desabilitado.
- **Aprovado visualmente:** rota, navegação, filtro, tabela vazia e bloqueio de criação sem cliente.
- **Pendente:** testar criação, conclusão/reabertura e persistência após F5 com registros de ensaio autorizados, negação de acesso a usuário autenticado sem role e controles de RLS/API.
- Capturas compartilhadas na conversa, mas upload em `evidencias/` não foi verificado.

## G4.5 — Plano de homologação final (a executar)

| Caso | Ação controlada | Aceite | Estado |
|---|---|---|---|
| G4.5-01 | Usuário sem login abre `/admin`, `/admin/leads`, `/admin/clientes`, `/admin/atendimentos` e `/admin/lembretes` | Redirecionamento para login, sem dados | Pendente |
| G4.5-02 | Usuário autenticado sem role `admin` tenta as mesmas rotas | Acesso negado; sem dados privados | Pendente |
| G4.5-03 | Conta sem role chama funções administrativas diretamente | Servidor nega leitura e mutação, RLS mantém restrições | Pendente |
| G4.5-04 | Admin acessa painel, atualiza F5 e sai | Sessão preservada e logout efetivo | Aprovado anteriormente em G3; repetir regressão |
| G4.5-05 | Revalidar `ready_for_real_data=false` e botão de envio público inativo | Nenhuma coleta real habilitada | Pendente (captura mostra aviso, não prova teste de backend) |
| G4.5-06 | Testes isolados de lead, conversão, cliente, atendimento e lembrete | Alterações persistem, sem duplicação indevida | Pendente — requer base de testes isolada e dados sintéticos, não banco real |
| G4.5-07 | Revisar CI, dependências, responsividade e evidências | Sem regressões; capturas sem dados pessoais | Pendente |

**Regra de segurança:** não ativar `ready_for_real_data`, não habilitar cadastro público e não adicionar dados pessoais reais para obter evidências. Não executar testes destrutivos na base de produção. Registros de ensaio devem ocorrer somente em ambiente separado, sem usuários/clientes reais, com autorização explícita e possibilidade de limpeza.


### Evidência de acesso anônimo — bloqueio do projeto Lovable (30/10/2026)

O participante apresentou captura em **janela anônima** abrindo `lovable.dev`, com o aviso **You don't have access — This project is private**. Esse bloqueio corresponde à **permissão do projeto/editor ou prévia interna Lovable**, e **não** é prova do controle de acesso do ClimaCiclo nas rotas `/admin/*`.

**Resultado G4.5-01:** **inconclusivo / pendente**. Para executar o teste sem publicar o aplicativo, usar **Share → Share preview → Create preview link** e abrir esse link temporário em janela anônima. A prévia compartilhada permite acesso à aplicação sem conceder acesso ao editor; testar as rotas administrativas sem sessão, observar o redirecionamento e ausência de dados, e revogar o link ao concluir. Os links de preview podem expor o app em desenvolvimento a qualquer pessoa que tenha a URL; não divulgar o link nem inserir dados pessoais reais. A prévia compartilha o mesmo backend do app publicado, segundo documentação da Lovable. Não alterar `ready_for_real_data=false` nem publicar o site por causa deste teste.


### Nova evidência G4.5-01 — prévia anônima do aplicativo (30/10/2026)

O participante apresentou **duas capturas de navegador em modo anônimo** abrindo a prévia do aplicativo ClimaCiclo (diferente da interface privada de edição Lovable):
- A landing pública é exibida com o aviso **Em preparação: ainda não recebemos solicitações** e CTA para o formulário.
- Uma tela intitulada **Entrar — Operador** apresenta **Área do operador**, campos de e-mail/senha e botão **Entrar**, sem contadores de leads, clientes ou outros dados do painel. A imagem foi fornecida como retorno do teste de acesso sem sessão a `/admin`; a barra de endereço não mostra claramente o caminho completo, portanto a captura é **compatível** com o redirecionamento esperado, mas não comprova o acesso direto a todas as rotas.

**Resultado parcial:** aplicativo acessível em prévia anônima; login administrativo exibido sem dados privados. O G4.5-01 segue **parcial / pendente**, pois faltam evidências de navegação direta anônima para `/admin/leads`, `/admin/clientes`, `/admin/atendimentos` e `/admin/lembretes` e ausência de dados administrativos em cada caso. Não confundir o bloqueio de editor do Lovable do teste anterior com a autorização do aplicativo.

**Próximo teste:** na mesma janela anônima e sem iniciar sessão, substituir apenas o caminho na URL da prévia por cada rota acima, confirmar redirecionamento ao formulário de login e inexistência de dados privados; registrar sem dados pessoais ou tokens. Nenhum teste de RLS direto foi realizado por essas capturas. O bloqueio de coleta real deve permanecer ativo.

**Evidências:** capturas apresentadas na conversa; upload de PNGs para o GitHub ainda não verificado.


### G4.5-01 — bloqueio visual de acesso anônimo homologado (30/10/2026)

O participante confirmou, após teste na janela anônima da prévia do ClimaCiclo, que o acesso direto às quatro rotas abaixo foi **bloqueado sem autenticação**:

| Rota | Resultado relatado |
|---|---|
| `/admin/leads` | Bloqueado |
| `/admin/clientes` | Bloqueado |
| `/admin/atendimentos` | Bloqueado |
| `/admin/lembretes` | Bloqueado |

A captura anterior já mostrava a tela de login na prévia anônima em vez do painel. **G4.5-01 aprovado no escopo da navegação/controle visual segundo confirmação do participante**. Nenhum teste de chamada direta das funções de servidor, políticas RLS ou permissão de usuário autenticado sem role foi demonstrado; esses cenários seguem pendentes (G4.5-02 e G4.5-03). Os resultados foram relatados em conversa, sem novas capturas individuais publicadas no repositório.

**Próximo passo:** criar manualmente uma conta de teste autorizada, sem atribuir `admin`, mantendo cadastro público desativado, e comprovar negação de acesso à área administrativa após autenticação. Não alterar a role do administrador existente nem `ready_for_real_data=false`. Remover a conta de teste depois da homologação.


### G4.5-02 — bloqueio de conta autenticada sem role admin (30/10/2026)

O participante criou uma segunda conta de teste sem atribuir role `admin` e realizou teste em janela anônima da prévia do ClimaCiclo. Captura fornecida mostra a página **Área do operador** com mensagem explícita, em vermelho: **"Sem permissão: esta conta não possui o papel de administrador."** O dashboard e seus dados não são apresentados.

**Conclusão:** G4.5-02 **aprovado no escopo do fluxo visual de login/negação de role**, de acordo com teste manual e captura. Essa evidência não equivale a teste direto de endpoints e RLS, que continua pendente em G4.5-03. A conta testada e qualquer senha/e-mail ficam fora da documentação. A captura está na conversa, mas o upload do PNG ao GitHub não foi verificado.

**Próxima etapa:** inspeção somente leitura de configuração RLS e políticas de `public.admin_roles`, `public.leads`, `public.customers`, `public.service_orders`, `public.reminders`, `public.app_settings` e `public.lead_rate_limits`. Uma inspeção de metadados não substitui ensaio com credenciais de usuário comum, com verificação de rejeição das operações no servidor. Evitar executar `SET ROLE`, desligar RLS, modificar políticas ou testar mutações na base operacional.

**Após os testes:** remover a segunda conta de teste, sem apagar a conta administradora, e registrar a revogação.
