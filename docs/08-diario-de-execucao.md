# 08 — Diário de execução do ClimaCiclo

## 29/10/2026 — planejamento e projeto
1. Enunciado do desafio DIO analisado; proposta ClimaCiclo selecionada para investigar demanda de manutenção preventiva.
2. Pesquisa exploratória de mercado, Business Model Canvas, hipóteses de validação e mega prompt preparados com ajuda do ChatGPT.
3. Material da mentoria DIO estudado como **referência metodológica**, sem impor exigências além do enunciado.
4. Planejamento enviado ao Lovable em modo **Plan** e revisado. Revisão 2 incorporou autorização server-side, consulta de contato restrita, idempotência, conversão transacional e trava de privacidade.
5. Aprovação do plano e geração inicial no Lovable: landing page e marca ClimaCiclo visíveis.
6. Aviso de créditos esgotados interrompeu desenvolvimento. CTA **Montar meu acompanhamento** testado e retornou **404**. Gate G1 ficou pendente.
7. Conexão Lovable–GitHub confirmada na interface: `Black2026/climaciclo`, `main`, status **Connected / In sync with GitHub**.
8. README de portfólio aplicado no repositório pelo GitHub; código do Lovable preservado.
9. Documentação complementar começou a ser publicada no GitHub. O envio de capturas deve ser verificado separadamente.

10. Teste visual G1-002 em andamento: duas novas capturas mostram Etapa 1 preenchida (residencial, dois Split) e Etapa 2 aberta/preenchida (Recife, Boa Viagem, acompanhamento semestral e limpeza). O avanço entre as etapas foi observado sem erro. Volta preservando campos, Etapa 3, consentimento e mobile ainda não testados. Capturas compartilhadas no chat, pendentes de upload para `evidencias/`.

11. Reteste G1-002: o usuário confirmou que o retorno preserva os dados entre etapas, e a Etapa 3 foi aberta e revisada. Captura do resumo mostra consentimento marcado e mensagem **«Nenhuma solicitação foi enviada ou armazenada»**; nenhum backend ou gravação foi comprovado. Necessário verificar consentimento desmarcado e responsividade. Captura compartilhada na conversa, ainda não adicionada a `evidencias/`.

12. Teste G1-004 e amostra mobile: captura enviada mostra checkbox de consentimento desmarcado, mensagem de validação "É preciso aceitar para enviar", botões de revisão/voltar visíveis e envio real desativado. A experiência móvel funciona no trecho exibido, mas ainda faltam verificações de responsividade completa em 320/375/390/768/1280 px. Captura do reteste foi apresentada no chat; upload ao repositório continua pendente.

## Pendências
Concluir o G1 (a rota 404 está corrigida, Etapas 1→2→3 e retorno preservando dados foram validados; o consentimento desmarcado foi validado; falta validar todas as larguras previstas de responsividade), implementar e validar G2–G5, configurar privacidade e administrador, revisar segurança, publicar URL e tornar repositório público para entrega na DIO.

**Não foi comprovada** validação comercial com clientes reais, persistência Cloud, autenticação funcional, cadastro de atendimentos ou publicação.

## Homologação G1 e início G2 — 29/10/2026
O participante confirmou os testes nas larguras 320, 375, 390, 768 e 1280 px sem cortes nem rolagem horizontal. Junto às evidências de navegação, preservação de campos e consentimento, o Gate G1 foi homologado por teste manual. Ainda faltam capturas de todas as larguras. Para G2, a auditoria de código localizou a migração SQL e a função servidor de envio de lead; sua aplicação no banco real e o teste de persistência ainda não estão comprovados. Nenhum dado real deve ser enviado até a configuração de privacidade, segurança e testes do Cloud.
