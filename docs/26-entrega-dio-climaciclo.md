# Entrega DIO — ClimaCiclo

**Data:** 30/10/2026  
**Projeto:** ClimaCiclo — Seu ar em dia. Sua rotina mais leve.  
**Categoria:** MVP demonstrativo desenvolvido com ChatGPT e Lovable.

## Links
- Aplicação demonstrativa: https://pixel-perfect-picture-9455.lovable.app
- Repositório: https://github.com/Black2026/climaciclo

## Resumo
ClimaCiclo é um MVP de organização de solicitações de manutenção preventiva de aparelhos de ar-condicionado. O configurador de três etapas permite simular tipo e quantidade de equipamentos, localidade, periodicidade, serviços de interesse, contato e revisão com consentimento. A aplicação também possui área administrativa protegida por autenticação e verificação de papel.

## Tecnologias e trabalho realizado
- ChatGPT para ideação, pesquisa, planejamento, documentação, revisão técnica e apoio à homologação.
- Lovable para desenvolvimento visual e publicação.
- TanStack Start, React, TypeScript, Vite e Supabase/Lovable Cloud conforme o código do repositório.
- PostgreSQL, políticas RLS e revisão de privilégios.
- GitHub para versionamento e documentação; testes automatizados são descritos no README e em documentos de CI.

## Evidências de 30/10/2026
- Publicação confirmada na interface Lovable e páginas inicial e primeira etapa do configurador carregadas no domínio público.
- Configurador de três etapas, consentimento, resumo e fluxos de login/logout testados no preview.
- RLS habilitado em sete tabelas; restrição de privilégios sensíveis verificada em SQL.
- Conta sem papel administrativo impedida de acessar o painel na interface.
- Quatro tabelas operacionais consultadas com zero registros.
- Lovable Security mostrou 'No issues found' na captura do dia, com verificações Quick e Deep atualizadas.
- Sincronização GitHub-Lovable confirmada na interface.
- `.env` retirado da versão atual; `.gitignore` atualizado e `.env.example` criado.

## Limitações e ética da demonstração
- Formulário demonstrativo: envio de solicitações reais desativado.
- Nenhuma comprovação de clientes reais, receita ou prestadores contratados.
- Ausência de teste independente e abrangente de autorização em endpoints de backend e de persistência positiva.
- Uma análise automatizada sem alertas não comprova ausência de vulnerabilidades.
- O arquivo de ambiente removido ainda consta do histórico Git.
- Antes de abrir o repositório para a avaliação, revisar integralmente o histórico e confirmar a ausência de credenciais privadas.

## Documentos complementares
- [README](../README.md)
- [Auditoria e publicação G4.5](24-homologacao-g45-publicacao-2026-10-30.md)
- [Checklist de visibilidade](25-checklist-visibilidade-github.md)
- [Segurança e LGPD](07-seguranca-lgpd.md)

## Situação de entrega
**MVP demonstrativo publicado e documentação disponível para acesso autorizado.** Submissão na plataforma DIO e acesso externo ao repositório aguardam confirmação. Não declarar a entrega como submetida até receber confirmação da plataforma.
