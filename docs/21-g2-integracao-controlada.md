# Gate G2 — Implementação controlada no GitHub

Data: 29/10/2026. Commit de implementação: `5ff1ac8`.

## Alterações verificadas no repositório
- `src/routes/montar-plano.tsx`: prepara validação, idempotency key estável nas tentativas de uma mesma solicitação, chamada `submitLead` e tratamento de erros.
- `src/routes/solicitacao-recebida.tsx`: rota de confirmação, somente após retorno positivo; código público e resumo não sensível em memória.
- `src/lib/confirmation-store.ts`: estado temporário restrito ao navegador, sem armazenamento de dados pessoais.
- `src/lib/g2-release.ts`: chave de liberação de interface explicitamente `false`.
- `src/lib/public.functions.ts`: trava adicional no servidor, exigindo `CLIMACICLO_ENABLE_LEAD_SUBMISSION=true` para qualquer tentativa de gravação por essa Server Function.

## Controle de segurança
**Não habilitado para uso real.** O botão de envio segue desabilitado com a flag da interface desligada. Mesmo que a flag seja alterada acidentalmente, a Server Function retorna `not_ready` enquanto a variável privada de liberação não estiver definida como `true`. A RPC SQL ainda exige `app_settings.ready_for_real_data=true`, atualmente `false`.

**Não configurar a variável de liberação nem ativar a flag nesta etapa.** Essas mudanças demandam revisão posterior de privacidade e de riscos.

## O que NÃO foi validado
- Compilação e execução da nova rota no Lovable;
- testes automatizados, TypeScript e lint;
- chamada ponta a ponta e envio positivo ao banco;
- idempotência sob concorrência, rate limit e falha de rede;
- autorização prática de usuários anônimos/sem role;
- exibição da confirmação após um INSERT real.

## Próximo teste seguro
1. Confirmar em Lovable/GitHub status `In sync`.
2. Atualizar a prévia e navegar diretamente para `/solicitacao-recebida?codigo=CC-ABC123`; ela não deve mostrar sucesso não confirmado nem expor PII.
3. Verificar que o formulário segue com envio indisponível e que a navegação G1 continua intacta.
4. Se houver erro de compilação, registrar a mensagem antes de modificar código.
5. Conservar `ready_for_real_data=false` e não enviar dados reais.

**Estado:** código versionado e recuperado do GitHub após commit; testes de compilação e browser ainda pendentes. Gate G2 aberto.

## Verificação visual do formulário após a integração — 29/10/2026

O participante enviou quatro capturas da prévia Lovable com o código integrado. Foram observados: Etapa 3 (Contato e revisão) carregada, campos preenchidos apenas com dados fictícios, consentimento desmarcado rejeitado com a mensagem "É preciso aceitar para enviar", consentimento marcado gerando resumo de demonstração, aviso "Nenhuma solicitação foi enviada ou armazenada", mensagem "Envio de solicitação desativado durante o Gate G2" e botão "Enviar solicitação — em breve" indisponível.

**Resultado:** aprovado para o comportamento demonstrativo e bloqueio visual do G2. Isso NÃO prova ainda a execução da Server Function pela UI, a configuração efetiva da variável de ambiente, a persistência positiva, idempotência ou a página de confirmação.

**Próximo teste:** navegar diretamente para `/solicitacao-recebida?codigo=CC-ABC123` usando a URL da prévia. Deve mostrar a consulta do código sem afirmar recebimento real e sem exibir informações pessoais. Confirmar também F5 na rota. Capturas ainda precisam ser anexadas ao repositório para servirem de evidência visual de portfólio.


## G2-CONF-001 — Rota de confirmação sem consulta pública (29/10/2026)

O participante abriu a prévia externa do Lovable diretamente em `/solicitacao-recebida?codigo=CC-ABC123` e confirmou que a página continuou funcional após pressionar **F5**. A captura mostra:

- Título **“Consultar o código informado”** e aviso de que o endereço não permite verificar uma solicitação no banco;
- Código fictício `CC-ABC123`, botão “Copiar código e resumo” e retorno ao início;
- Ausência de “Solicitação recebida” e de dados pessoais;
- Layout do ClimaCiclo renderizado com rodapé.

**Resultado: aprovado — navegação direta e recarga F5 sem falsa confirmação.** Essa evidência verifica somente a rota de consulta sem estado em memória. Não demonstra recebimento bem-sucedido, gravação real, funcionamento de WhatsApp ou persistência. A imagem foi compartilhada na conversa e ainda não foi anexada ao GitHub.

### Próximas etapas técnicas

1. Validar build/testes automatizados, sem liberar os envios.
2. Testar o botão de copiar o código, sem dados reais.
3. Preparar ambiente isolado de testes para **persistência positiva, idempotência, retries e rate limit**. Não alterar `ready_for_real_data=false` no projeto atual nem remover travas de liberação para testar na produção.
4. Somente após privacidade completa e segurança revisada, planejar abertura controlada ao público.

## G2-CONF-002 — Copiar código de referência (29/10/2026)

O participante clicou no botão **“Copiar código e resumo”** na rota de confirmação acessada com o código fictício `CC-ABC123`. A primeira captura mostra o botão com rótulo **“Copiado”**. Na segunda captura, o Bloco de Notas contém exatamente `CC-ABC123`, sem nome, telefone, e-mail ou dados do formulário.

**Resultado: aprovado para o cenário sem resumo em memória após recarga.** A cópia do código funciona na prévia externa do Lovable. Isso não verifica cópia de resumo após gravação efetiva de uma solicitação, nem persistência de leads no banco. Duas capturas foram fornecidas na conversa, mas ainda precisam ser adicionadas à pasta `evidencias/`.

**Próximos testes:** executar `npm run test` e `npm run build` no repositório (ou pipeline de CI) e preparar ambiente isolado para persistência/idempotência, sem alterar o bloqueio atual `ready_for_real_data=false`.
