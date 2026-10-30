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
