import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle } from "lucide-react";
import { getDashboard } from "@/lib/admin.functions";
import { Card, PageTitle } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(getDashboard);
  const { data, error } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => fn() });
  if (error) return <p className="text-destructive">Não foi possível carregar o painel.</p>;
  if (!data) return <p className="text-muted-foreground">Carregando…</p>;
  const stats = [
    { label: "Leads novos", value: data.newLeads, to: "/admin/leads" },
    { label: "Leads no total", value: data.totalLeads, to: "/admin/leads" },
    { label: "Clientes", value: data.customers, to: "/admin/clientes" },
    { label: "Atendimentos em aberto", value: data.openOrders, to: "/admin/atendimentos" },
    { label: "Lembretes vencidos ou de hoje", value: data.dueReminders, to: "/admin/lembretes" },
  ] as const;
  return (
    <div>
      <PageTitle>Painel</PageTitle>
      <Card className="mb-6">
        <h2 className="font-semibold">Pronto para dados reais?</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <Check ok={data.readyForRealData} text="Responsável, canal de contato e prazo de retenção preenchidos (obrigatório)" />
          <Check ok={data.whatsappEnabled} text="WhatsApp comercial configurado (opcional)" />
        </ul>
        {!data.readyForRealData && (
          <Link to="/admin/configuracoes" className="mt-3 inline-block text-sm font-semibold text-primary underline">Preencher agora</Link>
        )}
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="hover:border-primary">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Check({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2">
      {ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /> : <Circle className="h-5 w-5 shrink-0 text-warning" />}
      {text}
    </li>
  );
}
