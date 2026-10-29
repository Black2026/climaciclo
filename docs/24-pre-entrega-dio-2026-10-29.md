# ClimaCiclo — Preparação para entrega na DIO (29/10/2026)

## Síntese: não submeter ainda como MVP completo

A entrega da DIO exige, conforme enunciado fornecido, um **MVP publicado que abra pelo endereço**, com **GitHub público com código e README** narrando dor, mercado, Canvas, tese, o que é manual, mega prompt/correções e URL publicada. Capturas do painel e telas e evidência real de funcionamento são relevantes.

### Estado comprovado

| Item | Resultado registrado |
|---|---|
| Dor, proposta, TAM/SAM/SOM ilustrativos e Canvas | Documentados em README e docs |
| Landing e configurador de 3 etapas | Homologados em teste manual no Gate G1 |
| Aviso de bloqueio e consentimento | Testados na interface |
| Confirmação apenas informativa com código fictício, F5 e copiar | Testados na prévia |
| RLS da tabela leads e permissões da função submit_lead | Inspecionados no Cloud |
| RPC com privacidade incompleta | `not_ready`, `leads=0`, `lead_rate_limits=0` |
| CI (14 testes, build e TypeScript) | GitHub Actions #40963214831 aprovado |
| PostgreSQL efêmero: persistência positiva e reenvio sequencial | Actions #40964573062 aprovado **fora do Cloud** |
| Concorrência com mesma chave | Falhou: apenas um lead, mas duas cotas. Issue #2 |
| Painel administrativo e autenticação no app publicado | **Não implementados/testados**; /admin/login é provisório |
| URL pública do Lovable | **Pendente**; `id-preview` não comprova publicação |
| Repositório público | **Pendente**; privado na última consulta |
| Formulário com gravação real | **Bloqueado por design** nas três camadas (UI, server e app_settings) |

## Sequência mínima e segura para concluir

1. Revisar e integrar a preparação de repositório, validando CI; nunca publicar o histórico Git sem varredura e revisão dos arquivos de ambiente.
2. Completar a identidade do controlador, contato de privacidade e prazo de retenção no **ambiente real**, com verificação da política e orientação jurídica adequada. Não inventar dados.
3. Implementar, na `main` ou por PR revisado, o login, autorização de administrador, painel mínimo de leads e rotina para transformar lead em cliente, lançar atendimentos e lembretes. Validar no Lovable com contas de teste e RLS.
4. Corrigir a falha de concorrência de consumo de cota antes de abrir um endpoint público de captação real, ou documentar mitigação/limitação rigorosamente e manter a coleta desabilitada enquanto a segurança não for suficiente.
5. Habilitar o fluxo de envio somente após privacidade e revisão de segurança. Testar com dados fictícios pela **aplicação** e confirmar no banco `status=novo`, reenvio, F5, fallback WhatsApp e gestão administrativa.
6. No Lovable, executar a revisão de segurança, corrigir achados críticos e publicar a aplicação. Testar a URL publicada em janela anônima em desktop e celular.
7. Inserir a URL **verificada** no README. Adicionar capturas reais na pasta `evidencias/`, removendo PII e tokens. Verificar todos os links relativos.
8. Confirmar ausência de segredos e alterar visibilidade para **Public** em GitHub → Settings → Danger Zone → Change visibility. Confirmar abertura por visitante sem login.
9. Entregar à DIO somente o **link raiz** do repositório: https://github.com/Black2026/climaciclo

## Protocolo de aceite final

- [ ] Formulário público envia solicitação fictícia e mostra confirmação somente após INSERT.
- [ ] Backend guarda exatamente um lead no reenvio sequencial, sem vazamento de PII.
- [ ] Admin faz login, consulta leads, converte em cliente e mantém informações após F5.
- [ ] Atendimentos e lembretes ficam persistentes; processos comerciais podem continuar manuais.
- [ ] Política de privacidade completa; controles de autorização e segurança auditados.
- [ ] URL publicada abre sem autenticação e não exibe páginas 404 inesperadas.
- [ ] Github público, código completo, `.env` ausente dos arquivos rastreados, histórico e segredos verificados.
- [ ] README aponta URL publicada e prints reais de landing, formulário e painel.
- [ ] URL raiz correta entregue no campo da DIO.

## Decisões de escopo

Pagamento integrado, Stripe, notificações automáticas, bot no WhatsApp, agendamento e marketplace podem ficar para depois. **Não é adequado deixar para depois a coleta segura, a gestão básica e a publicação**, que formam o MVP descrito no desafio.

**Observação:** Branch de preparação não é uma implantação. Não alterar `ready_for_real_data=false` somente para cumprir checklist. Não divulgar a URL de prévia privada como URL pública.


## Registro de segurança do Lovable — 29/10/2026

Captura da interface do Lovable (**Mais → Segurança**) fornecida pelo participante:

- **Quick security scan**: última varredura cerca de 3 horas antes da captura; mensagem "No issues found". Isso não garante ausência de falhas.
- **Deep security scan**: indicado como recomendado, gratuito e "Not scanned yet"; **pendente de execução**.
- **Project dependencies**: **53 packages / 12 known issues**. A captura não discrimina severidade, pacote ou explorabilidade. **Exige abrir "Review" e tratar achados aplicáveis**.
- Nenhum botão de publicação foi acionado; não foi atestada uma URL pública.

**Decisão:** não marcar revisão de segurança como concluída nem habilitar recebimento de dados reais. Próximas evidências: resultado completo do Deep Scan e lista de alertas de dependências com severidades, sem divulgar qualquer segredo. Documentar correções e nova execução dos checks. As capturas continuam fornecidas via conversa e devem ser adicionadas a `evidencias/` quando preparadas para o portfólio.


## Resultado do Deep Security Scan — 29/10/2026

O participante executou o **Deep security scan** no Lovable e compartilhou captura da tela **Security**. A interface mostra:
- Deep security scan: **Up to date**, última análise há cerca de 2 segundos;
- Quick security scan: **Up to date**, última análise há cerca de 2 segundos;
- Painel central: **No issues found** ("The last security scan didn't surface any issues. The scanner can't catch every possible risk.");
- Project dependencies: **53 packages · 12 known issues**; os detalhes e severidades ainda não foram exibidos.

**Conclusão parcial:** os dois scans estão atualizados e nenhum problema foi reportado no relatório geral apresentado. Não declarar ausência universal de vulnerabilidades: ainda são **12 alertas conhecidos em dependências** não classificados, além das pendências de funcionamento/admin/privacidade/publicação. Antes da entrega, abrir **Review** nas dependências, registrar pacote, versão, severidade, recomendação de correção e eventual impacto em produção. Não atualizar pacotes de forma indiscriminada.

**Evidência:** captura enviada em conversa; o PNG ainda precisa ser incluído em `evidencias/` para o portfólio. O projeto continua em preparação; **não publicado nem pronto para coletar dados pessoais reais**.
