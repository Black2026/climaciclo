# 04 — Mega prompt ClimaCiclo para o Lovable

> Documento de requisitos e referência de planejamento. Histórico registrado; não substituir testes por declarações de funcionalidade.

## Objetivo
Construir um MVP em português brasileiro, **mobile-first**, com nome **ClimaCiclo** e slogan "Seu ar em dia. Sua rotina mais leve.", para testar a demanda por acompanhamento de manutenção preventiva de ar-condicionado com negociação humana via WhatsApp.

## Experiência pública
1. Landing page com proposta de valor, benefícios, funcionamento em três passos, FAQ e CTA **Montar meu acompanhamento**.
2. Configurador de três etapas: características dos aparelhos; localização e interesses; nome, contato, consentimento e revisão.
3. Após gravação confirmada no servidor, apresentar código público e resumo da solicitação. Não declarar sucesso quando o servidor falhar.
4. Botão WhatsApp com mensagem contendo código e resumo não sensível somente se houver número comercial configurado; caso contrário permitir copiar resumo.
5. Página de privacidade verdadeira, identificação de responsável e informações exigidas antes de coleta de dados reais.

## Administração
Autenticação, role de administrador validada no servidor, dashboard com contagens reais, gestão de leads, conversão em clientes, atendimentos, lembretes e configurações de contato e privacidade.

## Persistência
Lovable Cloud: tabelas `admin_roles`, `app_settings`, `leads`, `customers`, `service_orders`, `reminders`, `lead_rate_limits`. Validação Zod no servidor, RLS apropriada, chave de idempotência, limite de abuso, conversão transacional e nenhuma credencial privilegiada no navegador.

## Design
Azul-marinho #0F172A, verde-petróleo #0D9488, turquesa #14B8A6, fundo #F8FAFC. Identidade limpa, elementos SVG/CSS, contraste acessível, formulário com etapas claras. Validar larguras 320, 375, 390, 768 e 1280 px.

## Fora do escopo
Sem técnicos fictícios, depoimentos inventados, preços falsos, promessas de serviço, Stripe, Resend, n8n, IA embarcada, chatbot, marketplace ou pagamentos integrados.

## Processo
**Planejar → revisar → implementar por gates G1–G5 → testar → corrigir → revisar segurança → publicar.**
No Gate G1 o envio de dados reais permanece bloqueado; só no Gate G2 habilitar persistência, após as configurações legais aplicáveis. Nunca afirmar que o código está pronto apenas por haver um plano.
