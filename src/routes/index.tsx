import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, MessageCircle, Wind } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { NotReadyBanner, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { privacyQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClimaCiclo — Seu ar em dia. Sua rotina mais leve." },
      { name: "description", content: "Monte em 3 passos o acompanhamento de manutenção do seu ar-condicionado e peça orçamento pelo WhatsApp." },
      { property: "og:title", content: "ClimaCiclo — Seu ar em dia" },
      { property: "og:description", content: "Organize a manutenção preventiva do seu ar-condicionado em 3 passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(privacyQuery),
  component: Home,
});

const steps = [
  { icon: Wind, title: "Conte sobre seus aparelhos", text: "Ambiente, quantidade e tipo. Leva menos de um minuto." },
  { icon: ClipboardList, title: "Diga onde e como prefere", text: "Cidade, bairro e com que frequência quer cuidar do seu ar." },
  { icon: MessageCircle, title: "Receba o retorno", text: "Analisamos manualmente e respondemos pelo WhatsApp informado." },
];

const faq = [
  { q: "Quanto custa?", a: "O valor depende dos aparelhos e da sua região. Enviar a solicitação é gratuito e não gera compromisso; qualquer orçamento é combinado antes, pelo WhatsApp." },
  { q: "Vocês já atendem na minha cidade?", a: "O ClimaCiclo está em fase de teste. O atendimento depende de disponibilidade na sua região e é sempre confirmado antes." },
  { q: "O atendimento é agendado automaticamente?", a: "Não. Nada é agendado sem conversa. Datas e detalhes são combinados com você manualmente." },
  { q: "O que vocês fazem com meus dados?", a: "Usamos apenas para responder à sua solicitação. Veja a página de Privacidade para detalhes." },
];

function Home() {
  const { data: privacy } = useSuspenseQuery(privacyQuery);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="bg-gradient-calm">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 md:grid-cols-[1.2fr_1fr] md:items-center md:pt-20">
            <div>
              <p className="inline-flex rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-secondary-foreground">
                Manutenção preventiva de ar-condicionado
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl md:text-6xl">
                Seu ar em dia.
                <br />
                <span className="text-primary">Sua rotina mais leve.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Monte o acompanhamento ideal para seus aparelhos e peça um orçamento sem compromisso.
                Atendimento e valores sujeitos à confirmação.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/montar-plano"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
                >
                  Montar meu acompanhamento <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#como-funciona" className="inline-flex h-12 items-center justify-center rounded-xl border bg-card px-6 font-semibold hover:bg-accent">
                  Como funciona
                </a>
              </div>
              {!privacy.readyForRealData && <div className="mt-6 max-w-xl"><NotReadyBanner /></div>}
            </div>
            <BreezeArt />
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold">Como funciona</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-soft text-primary">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">Passo {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-8">
          <h2 className="text-3xl font-bold">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-6 rounded-2xl border bg-card px-5">
            {faq.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12">
          <div className="rounded-3xl bg-ink p-8 text-ink-foreground md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">Pronto para organizar seu ar?</h2>
            <p className="mt-2 opacity-80">Três passos rápidos. Sem compromisso.</p>
            <Link to="/montar-plano" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-teal px-6 font-semibold text-ink hover:opacity-90">
              Montar meu acompanhamento <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function BreezeArt() {
  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-sm">
      <svg viewBox="0 0 300 300" className="h-full w-full">
        <circle cx="150" cy="150" r="130" className="fill-teal-soft" />
        <circle cx="150" cy="150" r="96" fill="none" className="stroke-primary" strokeWidth="10" strokeLinecap="round" strokeDasharray="420 200" />
        <path d="M70 135h110a22 22 0 1 0-22-22" fill="none" className="stroke-ink" strokeWidth="12" strokeLinecap="round" />
        <path d="M70 170h140a22 22 0 1 1-22 22" fill="none" className="stroke-teal" strokeWidth="12" strokeLinecap="round" />
        <circle cx="236" cy="96" r="10" className="fill-warning" />
      </svg>
    </div>
  );
}
