import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteFooter, SiteHeader, NotReadyBanner } from "@/components/site/SiteChrome";
import { privacyQuery } from "@/lib/queries";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade — ClimaCiclo" },
      { name: "description", content: "Como o ClimaCiclo usa os dados enviados nas solicitações de manutenção." },
      { property: "og:title", content: "Privacidade — ClimaCiclo" },
      { property: "og:description", content: "Como usamos os dados enviados nas solicitações." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(privacyQuery),
  component: Privacy,
});

const pending = <em className="text-warning">[a preencher pelo operador]</em>;

function Privacy() {
  const { data: p } = useSuspenseQuery(privacyQuery);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold md:text-4xl">Privacidade</h1>
        {!p.readyForRealData && (
          <div className="mt-6">
            <NotReadyBanner>Texto provisório: os dados do responsável ainda não foram informados. Não envie dados reais até lá.</NotReadyBanner>
          </div>
        )}
        <div className="mt-8 space-y-6 leading-relaxed text-foreground">
          <section>
            <h2 className="text-xl font-semibold">Quem é responsável pelos dados</h2>
            <p className="mt-2">Responsável: {p.controllerName ?? pending}{p.controllerDocument ? ` (${p.controllerDocument})` : ""}.</p>
            <p>Canal para dúvidas e pedidos sobre seus dados: {p.contactChannel ?? pending}.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Quais dados coletamos</h2>
            <p className="mt-2">Ao enviar uma solicitação: nome, WhatsApp, e-mail (opcional), cidade, bairro e as informações sobre seus aparelhos e preferências. Registramos também a data do seu aceite.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Para que usamos</h2>
            <p className="mt-2">Somente para analisar e responder à sua solicitação de manutenção, combinar orçamento e acompanhar o atendimento, se você seguir conosco. Não vendemos seus dados.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Por quanto tempo guardamos</h2>
            <p className="mt-2">{p.retentionPeriod ?? pending}.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Seus pedidos</h2>
            <p className="mt-2">Você pode pedir acesso, correção ou exclusão dos seus dados pelo canal indicado acima.</p>
          </section>
          {p.updatedAt && <p className="text-sm text-muted-foreground">Atualizado em {new Date(p.updatedAt).toLocaleDateString("pt-BR")}.</p>}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
