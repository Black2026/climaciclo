# 26 — Homologação de regressão Zod 4 e abertura do Gate G3

**Data do reteste:** 30/10/2026 (relato do participante; capturas fornecidas na conversa).  
**Projeto:** ClimaCiclo — Desafio DIO  
**Base:** `main`, após o merge de segurança PR #5 (`zod@4.6.6` e outras correções).

## Reteste de interface G1 após Zod 4

O participante confirmou expressamente a execução e aprovação de **seis verificações manuais**, com **cinco capturas** das etapas e mensagens de erro. Evidências observadas/referidas:

| Caso | Verificação | Resultado declarado |
|---|---|---|
| Z4-UI-01 | Etapa 1: seleção de ambiente, quantidade e tipo | Aprovado |
| Z4-UI-02 | Etapa 2: cidade, bairro, preferência e interesses | Aprovado |
| Z4-UI-03 | Etapa 3: contato e revisão | Aprovado |
| Z4-UI-04 | Voltar sem perder os dados | Aprovado |
| Z4-UI-05 | Consentimento desmarcado gera erro; marcado libera revisão e resumo | Aprovado |
| Z4-UI-06 | Envio permanece bloqueado na demonstração G2 | Aprovado |

**Resultado:** regressão funcional das 3 etapas **homologada por teste manual relatado e capturas fornecidas**; não corresponde a envio real ou registro persistente. Os cinco arquivos de captura ainda **não foram publicados** na pasta `evidencias/`, portanto não afirmar que estão no GitHub.

Os workflows de CI pós-merge e a revisão de dependências Lovable já haviam sido validados separadamente: 53 pacotes e 0 alertas conhecidos. Nenhum desses resultados comprova a segurança absoluta de um sistema.

## Próximo Gate: G3 — Autenticação e autorização de operador

**Objetivo mínimo:** login por e-mail/senha de usuário pré-criado no Lovable Cloud, sem registro público; proteção de acesso ao painel, verificação da role admin no servidor e RLS; logout e persistência controlada de sessão após F5. Não implementar cadastro de operador na interface nem privilégio via frontend.

**Critérios de aceite (pendentes até teste na prévia):**

1. G3-001: abrir `/admin/login`, fazer login com conta administrativa real criada pelo operador **fora do aplicativo**, acessar `/admin` e manter sessão após F5.
2. G3-002: acesso anônimo direto ao painel **não retorna leads**; usuário autenticado sem role recebe **Sem permissão**, sem dados privados.
3. G3-003: operações administrativas (dashboard/leads) passam exclusivamente por server functions com `requireAdmin` e políticas RLS, sem `service_role` no navegador.
4. G3-004: logout revoga sessão, impedindo acesso administrativo após F5.

**Fora do G3:** conversão de lead, CRUD de atendimento e lembretes (G4); envio positivo de lead (G2 ainda aberto); publicação e captação real. O painel nunca deve gerar registros fictícios para aparentar funcionamento.

**Operações dependentes do responsável:** criar conta admin no painel Users do Lovable Cloud e inserir role no SQL Editor usando o ID de usuário confirmado, com consulta prévia. Nunca publicar senha, token ou e-mail real em captura ou repositório.

**Segurança:** `ready_for_real_data=false` continua como último estado inspecionado; não habilitar envio nem preencher dados pessoais reais para homologação de UI.


## Teste visual preliminar G3 — 30/10/2026

O participante apresentou captura do Lovable em **Visualização** com o seletor no topo indicando `/admin/login`, porém o conteúdo renderizado aparece como **Painel do operador** com `Verificando autorização...` e botão `Sair da conta`. No código da `main`, `src/routes/admin.login.tsx` contém o formulário de login, enquanto `src/routes/admin.tsx` contém precisamente a mensagem de autorização. Assim, a imagem é **inconclusiva** para os critérios de aceite de login: pode ser transição de rota, seleção/navegação ainda não concluída, cache da prévia ou problema de roteamento. Não afirmar que o login funcionou nem que há vulnerabilidade comprovada.

**Roteiro seguro de reprodução:** atualizar a visualização, abrir `/admin/login` diretamente sem dados pessoais, confirmar que aparece o formulário `E-mail / Senha / Entrar`; tentar `/admin` sem sessão e confirmar redirecionamento à tela de login; se persistir tela `Verificando autorização...` por tempo prolongado, registrar erro de console e falha de requisição sem tokens/senhas e corrigir em branch isolada. O arquivo `src/routeTree.gen.ts` versionado aparenta estar desatualizado, pois inclui somente rotas `/` e `/privacidade`; o CI recompila/gera a árvore automaticamente. Conferir se a prévia do Lovable gerou as rotas novas.

**Estado G3:** implementado no GitHub (PR #6 mesclado), ainda **não homologado na interface**. Os critérios de acesso anônimo, permissão administrativa e logout permanecem pendentes. Não habilitar `ready_for_real_data`.


## Correção homologada: rota de login — 30/10/2026

- PR [#7](https://github.com/Black2026/climaciclo/pull/7) foi integrado à `main` no commit `46ee36e817b5dc3236ec8be6a8be2a87cd28ae40`.
- Causa corrigida: `admin.login.tsx` era tratado como filho de `admin.tsx` (rota pai sem `Outlet`). Arquivo alterado para `src/routes/admin_.login.tsx` e identificador de rota `/admin_/login`, mantendo URL `/admin/login` sem aninhamento.
- Participante apresentou **captura da Visualização Lovable mostrando o formulário correto de Área do operador**, campos E-mail/Senha, botão Entrar e aviso de acesso exclusivo. A mensagem `Verificando autorização...` não aparece nessa página. **Correção visual homologada.**
- **Ainda pendente:** criação segura da primeira conta de operador no Cloud (Users); concessão da role `admin` por operação restrita no SQL Editor, testes de autenticação efetiva, rejeição de usuário sem role, acesso anônimo, F5 e logout. Não há evidência de login efetivo; nenhuma credencial deve ser registrada no repositório ou em captura.
- A coleta `ready_for_real_data` deve permanecer bloqueada enquanto G2, G3 e privacidade não estiverem homologados.


## Concessão controlada da role administrativa — 30/10/2026

O participante apresentou captura do **Lovable Cloud → Database → SQL editor** com um `INSERT INTO public.admin_roles (user_id, role) ... RETURNING role` executado para uma conta previamente criada e confirmada. O resultado exibido contém uma única linha com `role = admin`, evidenciando a atribuição de privilégio à conta selecionada.

**Privacidade:** o e-mail visível na captura foi deliberadamente **omitido** deste documento; nenhuma senha, UUID de usuário ou token foi versionado. O operador também apresentou captura de **Authentication settings** com login por Email habilitado, **Disable sign-up** habilitado e **Enable anonymous users** desligado.

**Concluído:** autenticação por e-mail configurada; cadastro público desabilitado; primeira role `admin` concedida no banco. O comando ter retornado uma linha demonstra a concessão para a conta selecionada, mas **não comprova autenticação efetiva via interface, acesso ao dashboard ou segurança integral**.

**Próximos testes G3 (não executados ainda):**

1. Entrar na URL `/admin/login` usando credenciais apenas na prévia do Lovable (não compartilhar).
2. Confirmar redirecionamento para `/admin`, dados e contadores reais sem inventar registros.
3. Atualizar `/admin` com F5 e confirmar que a sessão persiste.
4. Clicar em `Sair da conta`, atualizar e confirmar que painel não permite acesso anônimo.
5. Caso viável, validar conta autenticada sem role, acessos anônimos à API/RLS e ausência de dados privados na resposta.

**Proteção:** manter `ready_for_real_data=false` e o envio real de leads desabilitado.


## Teste G3-001 — login e painel exibido no Lovable (30/10/2026)

Participante apresentou captura da prévia visual do Lovable após autenticação do primeiro operador com role `admin`. A tela **Painel do operador** foi exibida com o botão **Sair da conta**, contagens de banco com **0 novos leads, 0 leads, 0 clientes, 0 atendimentos abertos e 0 lembretes vencidos**, lista vazia com mensagem **Nenhuma solicitação registrada**, aviso **Recebimento de leads: bloqueado para dados reais** e **WhatsApp comercial: desabilitado**.

**Conclusão de escopo:** acesso inicial ao painel administrativo **aprovado visualmente**, após habilitação de Email Authentication, bloqueio de cadastro público e atribuição da role no SQL Editor. A captura é evidência da renderização do painel, não prova por si só persistência da sessão após F5, revogação após logout nem rejeição de usuário sem role. Esses casos continuam pendentes.

**Próximos testes:** (1) F5 em `/admin` e verificar se o painel permanece autenticado; (2) clicar **Sair da conta** e confirmar retorno ao login; (3) tentar abrir `/admin` sem sessão e validar redirecionamento; (4) se possível, validar uma conta sem role `admin` (sem conceder privilégio). Não registrar segredos ou dados pessoais nas evidências.

**Segurança operacional:** manter `ready_for_real_data=false` e o botão de envio de solicitação real desabilitado. A imagem foi apresentada na conversa, mas não há indicação de upload à pasta `evidencias/` do GitHub.
