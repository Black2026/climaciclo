# 05 — Roteiro de testes e evidências para a DIO

Testes previstos e observações reais. Nunca rotular como aprovado algo ainda não executado.

| ID | Cenário | Critério de aceite | Estado |
|---|---|---|---|
| G1-001 | CTA "Montar meu acompanhamento" | Abrir `/montar-plano` sem erro | **Reteste aprovado: Etapa 1 exibida; antes 404** |
| G1-002 | Etapas do formulário | Avançar/voltar preservando campos | **Aprovado no teste manual:** etapas 1→2→3 e retorno preservando dados confirmados pelo usuário; resumo exibido |
| G1-003 | Responsividade | 320, 375, 390, 768 e 1280 px sem overflow | **Parcial:** captura mobile mostra formulário, erro e botões acessíveis; ainda não foram conferidas todas as larguras |
| G1-004 | Consentimento desmarcado | Bloquear revisão e envio; envio real indisponível no G1 | **Aprovado em teste visual:** consentimento desmarcado apresenta erro "É preciso aceitar para enviar"; envio real aparece desativado |
| G2-001 | Submeter lead válido | Persistir `status=novo` e código | Pendente |
| G2-002 | Envio repetido | Uma única linha para uma chave | Pendente |
| G2-003 | Falha de rede e retry | Nenhum falso sucesso; mesmo código | Pendente |
| G2-004 | Privacidade incompleta | Bloquear dados reais | Pendente |
| G3-001 | Administrador | Login válido, logout, F5 mantém sessão | Pendente |
| G3-002 | Anônimo/usuário sem role | Sem acesso a dados ou funções privadas | Pendente |
| G4-001 | Conversão | Um cliente por lead; status sincronizado | Pendente |
| G4-002 | Ordens e lembretes | CRUD real e persistência após F5 | Pendente |
| G5-001 | WhatsApp | Link correto; fallback sem número | Pendente |
| G5-002 | Revisão de segurança | Sem achados críticos, sem segredos no repo | Pendente |
| PUB-001 | Aplicação publicada | URL pública abre sem login | Pendente |
| DIO-001 | Repositório | Público, código e README existentes | Pendente |

## Protocolo de evidência
Capturar tela, rota/URL, data, resultado esperado, resultado observado, correção e reteste. Ocultar nomes, telefones, e-mails, tokens e credenciais. Screenshots de prévia não demonstram funcionamento de backend.

Evidências registradas no GitHub: prévia da landing, erro 404 original e sincronização Lovable–GitHub. Em 29/10/2026 o usuário mostrou a Etapa 1 da rota `/montar-plano` funcionando, mas a captura deste reteste ainda aguarda upload no repositório. G1-002 parcialmente verificado com captura adicional das Etapas 1 e 2 (ambiente residencial, 2 aparelhos Split, cidade Recife, bairro Boa Viagem, preferência semestral e interesse em limpeza). Em novo teste, o usuário confirmou retorno preservando valores e funcionalidade da Etapa 3; a captura mostra consentimento marcado, resumo de ambiente residencial, 2 aparelhos Split, Recife/Boa Viagem, acompanhamento semestral, interesse em limpeza e aviso explícito «Nenhuma solicitação foi enviada ou armazenada». G1-002 passou na execução manual relatada. Novo teste no celular: o consentimento desmarcado acionou a validação "É preciso aceitar para enviar", e o botão "Enviar solicitação — em breve" permaneceu desativado. A captura apresenta layout mobile sem desalinhamento evidente na região visível; a largura exata e os demais tamanhos não foram comprovados (G1-003 pendente de homologação completa). A nova captura ainda aguarda upload em `evidencias/`. Ver [incidente e reteste G1-001](16-teste-g1-404.md).
