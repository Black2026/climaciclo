# ClimaCiclo 🌬️

**Seu ar em dia. Sua rotina mais leve.**

> **Desafio DIO — Da ideia ao MVP com ChatGPT como co-founder e Lovable**  
> **Situação em 29/10/2026:** MVP em construção; primeira versão da landing page visível no Lovable. **o erro 404 da navegação ao configurador foi corrigido e retestado, com a Etapa 1 exibida** e a geração foi pausada por falta de créditos. Backend, painel administrativo, testes de segurança, publicação e entrega **não estão concluídos**.

**Idealização e organização do projeto:** conta GitHub [`Black2026`](https://github.com/Black2026)  
**Ferramentas de desenvolvimento:** ChatGPT (pesquisa, co-founder, arquitetura, SDD e revisão) + Lovable (planejamento e construção) + Lovable Cloud (backend previsto) + GitHub (versionamento e entrega).  
**Repositório sincronizado:** [`Black2026/climaciclo`](https://github.com/Black2026/climaciclo) — branch `main`; conexão **Connected** e **In sync with GitHub** confirmadas na interface do Lovable em 29/10/2026. O repositório está **privado**, e foi confirmada a presença de `package.json` e do código-fonte iniciado pelo Lovable no GitHub.  
**Aplicação pública:** **pendente** — inserir somente a URL efetivamente publicada e testada.

---

## 1. O desafio e o problema escolhido

A proposta da DIO é sair de uma dor real até um **MVP publicado**, capaz de testar uma tese de negócio com pessoas reais, sem construir funcionalidades desnecessárias antes de validar o interesse.

**Dor escolhida:** pessoas que possuem ar-condicionado podem esquecer ou adiar o cuidado preventivo, não sabem como estruturar um pedido de serviço e acabam resolvendo tudo por mensagens dispersas. Esta dor é uma **hipótese a validar com entrevistas e uso real**, não um comportamento já demonstrado pelo nosso piloto.

**Proposta de valor:** o ClimaCiclo reúne, em poucos passos, as informações do aparelho e a necessidade do usuário para facilitar o pedido de orçamento e a organização dos próximos contatos. A contratação e o pagamento podem continuar **manuais pelo WhatsApp** nesta primeira versão.

**Público inicial (ICP proposto):** moradores de Recife/PE com um ou mais aparelhos de ar-condicionado, interessados em simplificar a organização da manutenção preventiva. Pequenos negócios são um segmento secundário a explorar após a validação inicial.

**O que o produto não é:** uma empresa de manutenção já operacional, uma plataforma de agendamento garantido, um marketplace com técnicos credenciados ou uma assinatura cobrada automaticamente. Não há prestadores, depoimentos, preços ou resultados comerciais confirmados.

Detalhes: [seleção da dor](docs/00-selecao-da-dor.md) e [hipóteses e validação](docs/03-hipoteses-e-validacao.md).

## 2. Pesquisa de mercado — TAM, SAM e SOM

Os dados demográficos do IBGE são usados como base e as demais premissas abaixo **são hipóteses ilustrativas**, não estimativas oficiais de domicílios com ar-condicionado nem projeções de receita.

| Indicador | Cálculo de cenário | Resultado ilustrativo |
|---|---|---:|
| **TAM** — Brasil | 72.446.745 domicílios × 20% (hipótese de elegibilidade) | **14.489.349** domicílios |
| **SAM** — piloto Recife | 547.461 domicílios × 20% (hipótese de elegibilidade) | **109.492** domicílios |
| **SOM** — objetivo de teste no 1º ano | Meta de aquisição operacional, não previsão | **50 clientes** |

Para explorar escala, o exercício considera **2 atendimentos anuais a R$ 180 cada** (R$ 360/ano por cliente). Isso resultaria, no SOM hipotético, em R$ 18.000/ano de **volume bruto de serviços**, não faturamento do ClimaCiclo. Uma eventual comissão de 15% corresponderia a R$ 2.700/ano antes de custos, caso fosse negociada e aplicada; nenhuma dessas condições está validada.

Fonte dos domicílios: **IBGE, Censo 2022**. Contexto setorial: **ABRAVA, balanço 2025** (movimentação de todo o segmento AVACR, **não** TAM da plataforma). Metodologia, ressalvas, números e referências: [análise de mercado](docs/01-pesquisa-mercado.md).

## 3. Business Model Canvas — hipótese v0.1

| Bloco | Hipótese de negócio |
|---|---|
| **Segmentos de clientes** | Moradores com ar-condicionado; posteriormente pequenos negócios |
| **Proposta de valor** | Simplificar a solicitação e o acompanhamento de manutenção preventiva |
| **Canais** | Site, WhatsApp comercial, indicações e divulgação local |
| **Relacionamento** | Atendimento humano, retorno manual, lembretes organizados |
| **Fontes de receita** | Hipóteses futuras: comissão por serviço ou plano recorrente; **a validar** |
| **Recursos principais** | Aplicação, dados consentidos, operação comercial e possíveis parceiros |
| **Atividades principais** | Qualificar leads, encaminhar solicitações, acompanhar conversões |
| **Parcerias principais** | Técnicos/empresas habilitados, ainda não contratados |
| **Estrutura de custos** | Lovable/Cloud, divulgação, atendimento, operações e suporte |

Versão comentada: [Business Model Canvas completo](docs/02-business-model-canvas.md).

## 4. Tese a testar e métricas

> **Tese central:** pessoas com ar-condicionado demonstrarão interesse concreto em solicitar uma proposta de manutenção recorrente se conseguirem informar suas necessidades em um formulário simples e continuar a conversa pelo WhatsApp.

**Hipóteses mensuráveis:** clareza da proposta; conclusão do formulário; aceitação do contato; avanço para uma conversa de orçamento; e interesse em contratar. Metas iniciais de aprendizagem (não resultados): **10 entrevistas**, **20 visitas qualificadas**, **5 solicitações válidas**, **3 conversas sobre orçamento** e **1 intenção concreta de contratação**. Os valores serão revistos com feedback real.

**Não houve validação com clientes reais comprovada até o momento.** O roteiro está em [hipóteses e validação](docs/03-hipoteses-e-validacao.md) e [entrevistas](docs/14-validacao-primeiros-usuarios.md).

## 5. Escopo do MVP

**Jornada pública:** landing page → botão *Montar meu acompanhamento* → formulário de três etapas (equipamento, região e necessidade, contato com consentimento) → salvamento seguro → confirmação com código → opção de contato pelo WhatsApp, se número comercial estiver configurado.

**Operação administrativa planejada:** autenticação e autorização → leads → conversão em cliente → atendimentos → lembretes → configuração de contato e privacidade → indicadores calculados com dados reais.

**Intencionalmente manual:** negociação, elaboração do orçamento, envio de link de pagamento, combinação da data de serviço, acompanhamento e lembretes por WhatsApp. Esse limite preserva o foco da tese e reduz dependências.

**Fora do MVP:** Stripe, Resend, n8n, chatbot, IA embarcada, marketplace, pagamento integrado, integração com agenda, agendamento automático e promessas de atendimento. Uma possível evolução depende da validação da demanda.

## 6. Arquitetura planejada e segurança

O plano revisado do Lovable propõe **TanStack Start (React 19, SSR, TypeScript)** com **Lovable Cloud**, validação pelo servidor (`createServerFn`), banco gerenciado, autenticação e políticas **Row Level Security (RLS)**.

Entidades planejadas: `admin_roles`, `app_settings`, `leads`, `customers`, `service_orders`, `reminders` e `lead_rate_limits`. O plano prevê validação Zod, consentimento explícito, idempotência de envios, limitação de abuso, funções administrativas com checagem de role e conversão transacional de lead em cliente.

Esses controles estão **planejados, mas ainda não auditados no código**. Antes de usar dados reais, deverão ser verificados banco, políticas RLS, permissões, privacidade, fluxo do primeiro admin, armazenamento de segredos e relatório de segurança. O app não deve tratar nomes, telefones ou e-mails como dados públicos.

Documentação: [especificação SDD](docs/11-especificacao-sdd.md), [plano revisado do Lovable](docs/15-plano-lovable-revisao-2.md) e [segurança e LGPD](docs/07-seguranca-lgpd.md).

## 7. Desenvolvimento com IA: mega prompt, revisões e correções

O ChatGPT foi utilizado como **co-founder** para estruturar a ideia, comparar hipóteses, elaborar Canvas e TAM/SAM/SOM, desenhar o fluxo do MVP e preparar o mega prompt. No Lovable, o trabalho começou pelo modo **Plan**, com revisão técnica anterior ao Build.

Documentos correspondentes:

- [Mega prompt original](docs/04-mega-prompt-lovable.md)
- [Prompt usado para o Plan](docs/12-prompt-plan-mode-copiar.md)
- [Plano técnico — revisão 2](docs/15-plano-lovable-revisao-2.md)
- [Prompts de revisão e correção, com status](docs/18-prompts-revisoes-e-correcoes.md)
- [Gates e critérios de aceite](docs/13-gates-e-checklist.md)

**Ocorrência e reteste real:** em 29/10/2026, clicar no CTA *Montar meu acompanhamento* apresentou **404 — Página não encontrada**. A inspeção do código confirmou a ausência da rota `/montar-plano`. Após criá-la no GitHub, uma nova captura mostrou a **Etapa 1 do configurador carregada, sem 404**. Uma segunda rodada com capturas confirmou o avanço **da Etapa 1 para a Etapa 2**, com ambos os formulários preenchidos. Retorno preservando dados, Etapa 3, validações negativas e responsividade **ainda não foram concluídos**. Ver [registro do G1](docs/16-teste-g1-404.md).

## 8. Status verdadeiro de execução e testes

| Etapa | Situação em 29/10/2026 | Evidência / próxima condição |
|---|---|---|
| Dor, modelo de negócio, mercado e Canvas | **Planejados** | Documentos `docs/00`–`docs/03` |
| Prompt inicial, Plan e revisão SDD | **Concluídos** | `docs/04`, `docs/11`, `docs/12`, `docs/15` |
| **G1 — Landing e formulário** | **Parcial / rota corrigida** | Landing, etapa 1 e avanço para etapa 2 confirmados; faltam retorno, etapa 3, validações e mobile |
| G2 — Lovable Cloud e leads persistentes | **Não comprovado** | Envio real + consulta ao banco + teste de retry |
| G3 — Login administrativo e RLS | **Não comprovado** | Sessão, role, tentativas anônimas, APIs |
| G4 — Clientes, atendimentos, lembretes | **Não comprovado** | CRUD real e persistência após F5 |
| G5 — WhatsApp, testes, security scan | **Não comprovado** | Testes + revisão sem achados críticos |
| App publicado e acessível sem login | **Pendente** | URL pública real |
| Git sync com `Black2026/climaciclo` | **Conectado** | Lovable mostra `Connected`, branch `main`, e `In sync with GitHub`; confirmar arquivos de código no GitHub |
| Entrega do link do repositório na DIO | **Pendente** | Link do repositório **público**, não link de arquivo |

O Lovable exibiu uma mensagem de falta de créditos, interrompendo o desenvolvimento. Isso **não** comprova que os gates restantes foram executados. Registro cronológico em [diário de execução](docs/08-diario-de-execucao.md).

### Evidências reais já disponíveis

| Captura | O que comprova |
|---|---|
| [Primeira prévia da landing page](evidencias/g1-000-landing-preview.png) | Identidade visual e CTA exibidos; não prova backend |
| [Erro 404 após clicar no CTA](evidencias/g1-001-erro-404.png) | Falha histórica G1-001; a rota foi corrigida e a abertura retestada |
| [Conexão Lovable → GitHub](evidencias/git-001-lovable-github-sync.png) | `Black2026/climaciclo`, `main`, `Connected` e `In sync with GitHub` |

**Evidências conferidas:** as três capturas PNG foram enviadas e verificadas na pasta `evidencias/` do GitHub. Novas imagens só serão adicionadas **após testes reais**, sem dados pessoais. Inventário: [evidências](evidencias/README.md) e [roteiro de testes](docs/05-testes-evidencias.md).

## 9. Próximas etapas

1. **Concluído:** conectar o projeto Lovable à conta GitHub `Black2026`: repositório `climaciclo` na branch `main`, com mensagem `In sync with GitHub` no editor.
2. **Concluído:** README, 20 documentos `docs/`, inventário e três capturas PNG publicados no repositório, preservando o código do Lovable.
3. **Rota 404 corrigida e abertura retestada.** Validar avanço/retorno das etapas, consentimento, mobile e bloqueio de envio para homologar G1.
4. Concluir G2–G5 e documentar evidências reais e configurações de segurança.
5. Publicar e testar a URL pública, conferir ausência de credenciais no Git, tornar o repositório público e entregar o **link do repositório** na DIO.

Instruções detalhadas: [guia Lovable → GitHub](docs/17-guia-github-lovable.md) e [checklist final DIO](docs/19-checklist-entrega-dio.md).

## 10. Estrutura documental prevista

```text
README.md
.gitignore
docs/
  00-selecao-da-dor.md ... 14-validacao-primeiros-usuarios.md
  15-plano-lovable-revisao-2.md
  16-teste-g1-404.md
  17-guia-github-lovable.md
  18-prompts-revisoes-e-correcoes.md
  19-checklist-entrega-dio.md
evidencias/
  README.md
  g1-000-landing-preview.png
  g1-001-erro-404.png
  git-001-lovable-github-sync.png
```

**Observação:** a estrutura acima é da documentação preparada. A estrutura documental está incorporada ao repositório, junto ao código do Lovable; não substituir `src/`, configurações, migrações ou arquivos de dependências por esta documentação.

## 11. Fontes e referências

- **Enunciado oficial do desafio:** texto apresentado pelo participante na plataforma DIO; define os requisitos obrigatórios deste projeto.
- ABRAVA — [panorama AVACR, faturamento de 2025](https://abrava.com.br/setor-de-ventilacao-ar-condicionado-e-refrigeracao-no-brasil-teve-faturamento-da-ordem-de-r-5015-bilhoes-em-2025/).
- IBGE — [Censo 2022, domicílios](https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv102011.pdf) e [recorte municipal](https://www.ibge.gov.br/biblioteca/visualizacao/livros/liv102170.pdf).
- Lovable — [Git sync com GitHub](https://docs.lovable.dev/integrations/github), [Lovable Cloud](https://docs.lovable.dev/features/cloud), [Plan Mode](https://docs.lovable.dev/features/plan-mode) e [Security](https://docs.lovable.dev/features/security-view).

**Data de atualização:** 29 de outubro de 2026. A sincronização Lovable–GitHub foi confirmada por captura. README atualizado no repositório `main`. Os 20 documentos em `docs/` e as três capturas em `evidencias/` foram publicados e verificados. A publicação e os testes de ponta a ponta não foram realizados.