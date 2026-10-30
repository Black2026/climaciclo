import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCustomers } from "@/lib/admin.functions";
import { Empty, PageTitle, fmtDate, fmtPhone } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/clientes/")({ component: Customers });

function Customers() {
  const fn = useServerFn(listCustomers);
  const { data, error } = useQuery({ queryKey: ["admin", "customers"], queryFn: () => fn() });
  return (
    <div>
      <PageTitle>Clientes</PageTitle>
      {error && <p className="text-destructive">Não foi possível carregar.</p>}
      {data && data.length === 0 && <Empty>Nenhum cliente ainda. Converta um lead para começar.</Empty>}
      <ul className="space-y-2">
        {data?.map((c) => (
          <li key={c.id}>
            <Link to="/admin/clientes/$id" params={{ id: c.id }} className="block rounded-xl border bg-card p-4 hover:border-primary">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{fmtPhone(c.whatsapp)} · {c.city} — {c.neighborhood} · desde {fmtDate(c.created_at)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
