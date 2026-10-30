# 07 — Segurança, privacidade e LGPD

**Documento de planejamento, não parecer jurídico.** Antes de dados reais, completar informações do controlador e revisar o fluxo com as regras aplicáveis.

## Dados mínimos
Nome, WhatsApp, e-mail opcional, cidade/bairro, características do aparelho, interesses, consentimento, versão do texto aceito e data do consentimento. Não colocar informações pessoais em URLs, logs públicos ou repositório.

## Controles obrigatórios
- Funções públicas validam payload via Zod **no servidor**, inclusive consentimento explícito.
- Respostas públicas são estritamente limitadas; não disponibilizar lista de leads ou detalhes de solicitações sem autenticação.
- Todas as funções admin exigem sessão e role verificados no servidor; RLS por tabela e operação.
- Credencial de serviço somente do lado servidor; sem tokens em commits.
- Idempotência e rate limits resistentes a condições de corrida; verificar tratamento de janela temporal.
- Conversão de lead em cliente transacional; testar repetição e falha parcial.
- Guardar e expor por rota pública apenas contato comercial necessário, se habilitado.
- Sem coleta real até preenchimento de responsável, canal de privacidade, retenção e revisão das informações.
- Política de exclusão/retificação, acesso mínimo e logs sem PII, conforme implantação real.

## Revisão antes de publicar
Rodar revisão de segurança do Lovable, validar grant/RLS, tentar acessar tabelas e funções como anônimo e usuário sem role, revisar commits para segredos e arquivos de configuração. Não publicar para coleta de dados reais enquanto houver achados críticos, configurações legais ausentes ou testes de segurança pendentes.

**Estado:** controles descritos no plano Lovable; implementação ainda não comprovada.
