# 10 — Roteiro de execução controlada no Lovable

1. Abrir o projeto ClimaCiclo existente; nunca criar outro projeto para corrigir a falha atual.
2. Usar **Plan** para pedidos complexos, revisar a proposta e custos antes de aprovar.
3. Priorizar a conclusão do **Gate G1**: landing, configurador, navegação, consentimento e privacidade provisória. Corrigir o incidente 404 no CTA.
4. **G2:** ativar Lovable Cloud, aplicar schema e RLS, validar envio de lead, idempotência, rate limit e estado de privacidade.
5. **G3:** provisionar primeiro administrador de modo suportado, autenticação e autorização real no servidor; testar anônimo e sem role.
6. **G4:** implementar gestão de leads, clientes, atendimentos, lembretes e contagens reais; testar F5.
7. **G5:** configurar WhatsApp, testar fallback e realizar revisão de segurança, privacidade e logs.
8. Publicar apenas após requisitos mínimos, segurança e ausência de segredos; registrar URL real e evidências. Sincronizar GitHub e verificar README, pastas e commits.
9. Tornar repositório público após revisão final e enviar **link do repositório** à DIO.

**Regra:** não avançar de gate com erro crítico anterior. Evitar custos de geração de imagens e funcionalidades extras.
