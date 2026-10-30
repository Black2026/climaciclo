import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOrders } from "@/lib/admin.functions";
import { Empty, ORDER_KIND_LABEL, PageTitle, StatusBadge, fmtDate } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/atendimentos")({ component: Orders });

function Orders() {
  const fn = useServerFn(listOrders);
  const { data, error } = useQuery({ queryKey: ["admin", "orders"], queryFn: () => fn() });
  return (
    <div>
      <PageTitle>Atendimentos</PageTitle>
      {error && <p className="text-destructive">Não foi possível carregar.</p>}
      {data && data.length === 0 && <Empty>Nenhum atendimento. Crie a partir da página de um cliente.</Empty>}
      <ul className="space-y-2">
        {data?.map((o) => {
          const c = o.customers as { name?: string; city?: string } | null;
          return (
            <li key={o.id}>
              <Link to="/admin/clientes/$id" params={{ id: o.customer_id }} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-4 hover:border-primary">
                <div className="min-w-0">
                  <p className="font-semibold">{ORDER_KIND_LABEL[o.kind]} · {c?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{c?.city} · {fmtDate(o.created_at)}{o.scheduled_note ? ` · ${o.scheduled_note}` : ""}</p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
