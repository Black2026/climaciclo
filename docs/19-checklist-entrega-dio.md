# 19 — Checklist de entrega DIO

- [x] Dor escolhida e justificativa documentadas
- [x] TAM/SAM/SOM com hipóteses identificadas
- [x] Business Model Canvas documentado
- [x] Tese e operação manual descritas
- [x] Mega prompt, plano e revisão técnica documentados
- [x] GitHub conectado ao projeto Lovable, branch `main`
- [x] Corrigir 404 do CTA e validar configurador G1 (homologado manualmente em 29/10/2026)
- [ ] Persistir leads e comprovar G2
- [ ] Validar login, autenticação, role e RLS G3
- [ ] Validar gestão de clientes, ordens e lembretes G4
- [ ] Configurar WhatsApp, testes e revisão de segurança G5
- [ ] Validar privacidade e responsável antes de dados reais
- [ ] Publicar aplicação e testar URL pública sem login
- [ ] Inserir URL publicada no README
- [ ] Adicionar capturas legíveis da landing, formulário, painel e testes
- [ ] Checar se todos os links e caminhos do README existem
- [ ] Verificar que nenhum segredo, token ou dado pessoal está versionado
- [ ] Tornar repositório público
- [ ] Entregar na DIO o link raiz `https://github.com/Black2026/climaciclo`

**Não concluir o desafio enquanto pendências de funcionamento, publicação e segurança persistirem.**

## Revisão de pré-entrega em 29/10/2026

A fase de documentação é sólida, mas a entrega final ainda depende de URL pública funcional, formulário e painel operacionais, segurança e visibilidade pública do repositório. Teste isolado de inserção positiva no PostgreSQL `success` não substitui gravação no Lovable Cloud. O teste adicional de concorrência falhou (Issue #2), mas não consta explicitamente entre as exigências da DIO; manter como pendência técnica real.

**Higiene de repositório:** havia um arquivo `.env` com identificadores, URLs e chaves `SUPABASE_PUBLISHABLE_KEY` (não `service_role`) versionado. A branch `chore/preparacao-entrega-dio` propõe removê-lo dos arquivos rastreados, adicioná-lo ao `.gitignore` e publicar `.env.example` somente com nomes de variáveis. Como arquivos antigos continuam no histórico Git, inspecionar o histórico e fazer varredura antes de mudar a visibilidade para pública. Caso apareça qualquer segredo privilegiado em algum commit, revogá-lo/rotacioná-lo e limpar histórico antes de publicar. Não configurar chaves privadas como variáveis `VITE_*`.
