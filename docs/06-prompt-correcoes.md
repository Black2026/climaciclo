# 06 — Correção G1-001: prompt de implementação

**Estado:** correção especificada, **não executada nem retestada**.

## Contexto
Na prévia Lovable, clicar em **Montar meu acompanhamento** abre uma página 404. A geração havia sido interrompida por falta de créditos. As causas são hipóteses: rota `/montar-plano` ausente ou link incorreto.

## Prompt de correção para Lovable
> Inspecione as rotas atuais do TanStack Start, confira o destino de todos os CTAs para **Montar meu acompanhamento** e confirme se existe `src/routes/montar-plano.tsx`. Corrija o destino ou implemente a rota dentro da arquitetura existente. Entregue configurador de três etapas com validação e preservação dos campos ao navegar, em layout responsivo. Não refaça o projeto nem altere o design da landing sem necessidade. Até o Gate G2 estar validado e a privacidade configurada, mantenha o envio de leads reais bloqueado. Teste navegação de ida e volta e documente alterações realizadas. Não execute os Gates G2–G5 nesta correção.

**Aceite:** botão abre a rota correta, formulário navega entre três etapas e consentimento desmarcado impede envio. Registrar captura de reteste somente quando o comportamento for observado.
