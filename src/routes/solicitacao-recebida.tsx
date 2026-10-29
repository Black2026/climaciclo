import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, ClipboardCopy, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { contactQuery } from "@/lib/queries";
import { buildSummaryText } from "@/lib/lead-schema";
import { readConfirmation } from "@/lib/confirmation-store";

export const Route = createFileRoute("/solicitacao-recebida")({
  validateSearch: (search: Record<string, unknown>) => ({
    codigo: typeof search.codigo === "string" && /^CC-[A-Z0-9]{6}$/.test(search.codigo)
      ? search.codigo : "",
  }),
  head: () => ({
    meta: [
      { title: "Código da solicitação — ClimaCiclo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contactQuery),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { codigo } = Route.useSearch();
  const { data: contact } = useSuspenseQuery(contactQuery);
  const [copied, setCopied] = useState(false);
  const confirmed = readConfirmation(codigo);
  const text = confirmed ? buildSummaryText(codigo, confirmed.summary) : codigo;
  const whatsappLink = confirmed && contact.whatsappEnabled && contact.whatsappNumber
    ? `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`
    : null;

  async function copyCode() {
    if (!codigo || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
        <section className="rounded-3xl border bg-card p-6 shadow-soft sm:p-10">
          {confirmed ? <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden /> :
            <ShieldCheck className="h-12 w-12 text-primary" aria-hidden />}
          <h1 className="mt-5 text-3xl font-bold">
            {confirmed ? "Solicitação recebida" : "Consultar o código informado"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {confirmed
              ? "A gravação foi confirmada pelo servidor. Guarde o código para seu contato com o ClimaCiclo."
              : "Este endereço não permite verificar uma solicitação no banco. Se você recebeu um código após o envio, guarde-o para referência."}
          </p>
          {codigo && (
            <div className="mt-7 rounded-2xl bg-teal-soft p-5">
              <p className="text-sm font-semibold text-secondary-foreground">Código de referência</p>
              <p className="mt-2 break-all font-mono text-2xl font-bold text-foreground">{codigo}</p>
            </div>
          )}
          {confirmed && (
            <div className="mt-6 space-y-2 text-sm">
              <p><strong>Ambiente:</strong> {confirmed.summary.environment}</p>
              <p><strong>Aparelhos:</strong> {confirmed.summary.unitCount} · {confirmed.summary.unitType}</p>
              <p><strong>Cidade:</strong> {confirmed.summary.city}</p>
              <p><strong>Acompanhamento:</strong> {confirmed.summary.followUp}</p>
              <p><strong>Interesses:</strong> {confirmed.summary.interests.join(", ")}</p>
            </div>
          )}
          {codigo && (
            <button type="button" onClick={() => void copyCode()}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 font-semibold hover:bg-muted">
              <ClipboardCopy className="h-4 w-4" aria-hidden /> {copied ? "Copiado" : "Copiar código e resumo"}
            </button>
          )}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground">
              Continuar conversa no WhatsApp
            </a>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Ao atualizar esta página, o resumo temporário é descartado. Nenhum dado pessoal é consultado por código.
          </p>
          <Link to="/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-primary hover:underline">
            Voltar ao início
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
