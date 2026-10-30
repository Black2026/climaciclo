# 18 — Histórico dos prompts, revisões e correções

## Planejamento inicial
Mega prompt elaborado pelo ChatGPT: landing, configurador três etapas, contato WhatsApp, painel admin, Lovable Cloud, identidade visual e exclusão de funcionalidades fora do MVP. O Lovable produziu o plano inicial.

## Auditoria do plano
Revisão solicitada antes do Build:
1. Evitar view pública de contato possivelmente privilegiada.
2. Autorizar cada função admin no servidor, não apenas proteger a interface.
3. Consentimento explícito e idempotência atômica.
4. Conversão de lead em cliente transacional.
5. Provisionamento seguro do primeiro admin e bloqueio até privacidade preenchida.

O Lovable devolveu o **Plano revisão 2**, aceito conceitualmente. Ver [documento do plano](15-plano-lovable-revisao-2.md).

## Primeiro incidente após Build
**G1-001:** botão CTA levou a página 404. Foi criado prompt para inspecionar `/montar-plano`, corrigir a rota, implementar formulário em etapas e retestar. **O prompt ainda não foi executado** devido ao limite de créditos.

## Critérios de economia
Revisar requisitos no ChatGPT, usar Plan antes de Build, não incluir integrações pagas ou imagens desnecessárias, testar cada gate antes do próximo.

**Nenhuma correção de código está comprovada até esta data.**
