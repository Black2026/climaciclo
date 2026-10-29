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
