# 13 — Gates e critérios de aceite

Gates são marcos que exigem comprovação, não apenas promessa do modelo.

| Gate | Entrega mínima | Verificação obrigatória | Estado |
|---|---|---|---|
| G1 | Landing, rotas, configurador, validações, política provisória | Clique CTA sem 404, navegação em etapas, tamanhos mobile, sem envio real | **Falhou 404** |
| G2 | Cloud, tabelas, server functions | Lead salvo, idempotência, rate limit, consentimento, privacidade, falha de rede | Pendente |
| G3 | Auth, roles, RLS | Admin autorizado, anônimo e usuário sem role negados, F5 | Pendente |
| G4 | Dashboard e gestão | Lead→cliente→ordem→lembrete, transação e persistência | Pendente |
| G5 | WhatsApp, testes, segurança | Link/fallback, testes, scan sem crítico, segredos ausentes | Pendente |

## Evidência mínima por gate
Registrar data e cenário, captura legível sem PII, resultado esperado, resultado observado, correção aplicada e reteste. Nunca assinalar concluído antes de executar. No desafio DIO, também documentar URL pública e repositório público com código real.
