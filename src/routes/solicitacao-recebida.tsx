import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { readConfirmation } from "@/lib/confirmation-store";
import { buildSummaryText } from "@/lib/lead-schema";
import { contactQuery } from "@/lib/queries";

export const Route = createFileRoute("/solicitacao-recebida")({
  validateSearch: z.object({ codigo: z.string().regex(/^CC-[A-Z0-9]{6}$/).optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Solicitação recebida — ClimaCiclo" },
      { name: "description", content: "Sua solicitação foi registrada." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Solicitação recebida — ClimaCiclo" },
      { property: "og:description", content: "Sua solicitação foi registrada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Received,
});

function Received() {
  const { codigo } = Route.useSearch();
  const conf = codigo ? readConfirmation(codigo) : null;
  const { data: contact } = useQuery(contactQuery);

  if (!codigo) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Nenhuma solicitação para mostrar</h1>
        <p className="mt-2 text-muted-foreground">Monte seu acompanhamento para enviar uma solicitação.</p>
        <Link to="/montar-plano" className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground">Montar meu acompanhamento</Link>
      </Shell>
    );
  }

  const text = conf ? buildSummaryText(codigo, conf.summary) : `Olá! Fiz uma solicitação no ClimaCiclo. Código: ${codigo}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Resumo copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Shell>
      <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden />
      <h1 className="mt-4 text-3xl font-bold">Solicitação recebida</h1>
      <p className="mt-2 text-muted-foreground">Guarde seu código. Vamos analisar e responder pelo WhatsApp informado. Valores e atendimento sujeitos à confirmação.</p>
      <p className="mt-6 rounded-xl bg-teal-soft px-4 py-3 font-display text-2xl font-bold tracking-wider text-secondary-foreground">{codigo}</p>
      {conf && (
        <ul className="mt-6 space-y-1 text-sm text-muted-foreground">
          <li>{conf.summary.environment} · {conf.summary.unitCount} aparelho(s) · {conf.summary.unitType}</li>
          <li>{conf.summary.city}</li>
          <li>{conf.summary.followUp} · {conf.summary.interests.join(", ")}</li>
        </ul>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {contact?.whatsappEnabled && contact.whatsappNumber && (
          <a href={`https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
        )}
        <button type="button" onClick={copy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-6 font-semibold hover:bg-accent">
          <Copy className="h-4 w-4" /> Copiar resumo
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader cta={false} />
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-2xl border bg-card p-6 shadow-soft sm:p-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
