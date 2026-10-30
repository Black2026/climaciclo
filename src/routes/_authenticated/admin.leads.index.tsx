import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listLeads } from "@/lib/admin.functions";
import { Empty, LEAD_STATUS_LABEL, PageTitle, StatusBadge, fmtDate, inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/leads/")({ component: Leads });

function Leads() {
  const [status, setStatus] = useState("");
  const fn = useServerFn(listLeads);
  const { data, error } = useQuery({
    queryKey: ["admin", "leads", status],
    queryFn: () => fn({ data: status ? { status: status as never } : {} }),
  });
  return (
    <div>
      <PageTitle action={
        <select aria-label="Filtrar status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">Todos</option>
          {Object.entries(LEAD_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      }>Leads</PageTitle>
      {error && <p className="text-destructive">Não foi possível carregar.</p>}
      {data && data.length === 0 && <Empty>Nenhum lead ainda.</Empty>}
      <ul className="space-y-2">
        {data?.map((l) => (
          <li key={l.id}>
            <Link to="/admin/leads/$id" params={{ id: l.id }} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-4 hover:border-primary">
              <div className="min-w-0">
                <p className="truncate font-semibold">{l.name} <span className="font-normal text-muted-foreground">· {l.public_code}</span></p>
                <p className="truncate text-sm text-muted-foreground">{l.city} — {l.neighborhood} · {l.unit_count} aparelho(s) · {fmtDate(l.created_at)}</p>
              </div>
              <StatusBadge status={l.status} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
