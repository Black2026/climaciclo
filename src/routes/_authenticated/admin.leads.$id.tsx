import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { convertLead, getLead, updateLead } from "@/lib/admin.functions";
import { Card, LEAD_STATUS_LABEL, PageTitle, StatusBadge, btnPrimary, btnSecondary, fmtDate, fmtPhone, inputCls } from "@/components/admin/ui";
import { ENVIRONMENTS, FOLLOW_UPS, INTERESTS, UNIT_TYPES, labelOf } from "@/lib/lead-schema";

export const Route = createFileRoute("/_authenticated/admin/leads/$id")({ component: LeadDetail });

function LeadDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const get = useServerFn(getLead);
  const upd = useServerFn(updateLead);
  const conv = useServerFn(convertLead);
  const { data: lead, isLoading } = useQuery({ queryKey: ["admin", "lead", id], queryFn: () => get({ data: { id } }) });
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(lead?.internal_notes ?? ""), [lead?.internal_notes]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const save = useMutation({
    mutationFn: (patch: { status?: string; internal_notes?: string }) => upd({ data: { id, ...(patch as object) } }),
    onSuccess: () => { toast.success("Salvo"); refresh(); },
    onError: () => toast.error("Não foi possível salvar"),
  });
  const convert = useMutation({
    mutationFn: () => conv({ data: { id } }),
    onSuccess: (r) => { toast.success("Cliente pronto"); refresh(); navigate({ to: "/admin/clientes/$id", params: { id: r.customerId } }); },
    onError: () => toast.error("Não foi possível converter"),
  });

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!lead) return <p>Lead não encontrado. <Link to="/admin/leads" className="text-primary underline">Voltar</Link></p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/leads" className="text-sm text-primary">← Leads</Link>
      <PageTitle action={<StatusBadge status={lead.status} />}>{lead.name}</PageTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Contato</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div>WhatsApp: <a className="text-primary underline" href={`https://wa.me/55${lead.whatsapp}`} target="_blank" rel="noopener noreferrer">{fmtPhone(lead.whatsapp)}</a></div>
            <div>E-mail: {lead.email ?? "—"}</div>
            <div>{lead.city} — {lead.neighborhood}</div>
            <div className="text-muted-foreground">Código {lead.public_code} · {fmtDate(lead.created_at)}</div>
            <div className="text-muted-foreground">Aceite em {fmtDate(lead.consent_at)} ({lead.consent_text_version})</div>
          </dl>
        </Card>
        <Card>
          <h2 className="font-semibold">Pedido</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div>{labelOf(ENVIRONMENTS, lead.environment_type)} · {lead.unit_count} aparelho(s)</div>
            <div>{labelOf(UNIT_TYPES, lead.unit_type)}</div>
            <div>{labelOf(FOLLOW_UPS, lead.follow_up_pref)}</div>
            <div>{lead.interests.map((i) => labelOf(INTERESTS, i)).join(", ")}</div>
          </dl>
        </Card>
      </div>
      <Card className="mt-4 space-y-4">
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-semibold">Status</label>
          <select id="status" value={lead.status} disabled={save.isPending || lead.status === "convertido"}
            onChange={(e) => save.mutate({ status: e.target.value })} className={inputCls}>
            {Object.entries(LEAD_STATUS_LABEL).filter(([v]) => v !== "convertido" || lead.status === "convertido").map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-semibold">Notas internas</label>
          <textarea id="notes" rows={4} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <button className={`${btnSecondary} mt-2`} disabled={save.isPending} onClick={() => save.mutate({ internal_notes: notes })}>Salvar notas</button>
        </div>
        <div className="border-t pt-4">
          {lead.customerId ? (
            <Link to="/admin/clientes/$id" params={{ id: lead.customerId }} className={btnPrimary}>Abrir cliente</Link>
          ) : (
            <button className={btnPrimary} disabled={convert.isPending} onClick={() => convert.mutate()}>Converter em cliente</button>
          )}
        </div>
      </Card>
    </div>
  );
}
