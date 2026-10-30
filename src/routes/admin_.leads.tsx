import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, listLeads, updateLead, convertLead } from "@/lib/admin.functions";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/admin_/leads")({
  head: () => ({ meta: [{ title: "Gestão de leads — ClimaCiclo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LeadsPage,
});

type Lead = Awaited<ReturnType<typeof listLeads>>[number];
const statuses = ["novo", "em_contato", "orcamento_enviado", "convertido", "descartado"] as const;

function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [phase, setPhase] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [filter, setFilter] = useState("todos");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function refresh() {
    setLeads(await listLeads({ data: {} }));
  }
  useEffect(() => {
    let alive = true;
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!alive) return;
        if (!session) { await navigate({ to: "/admin/login" }); return; }
        const access = await getMyAccess();
        if (!alive) return;
        if (!access.isAdmin) { setPhase("forbidden"); return; }
        const rows = await listLeads({ data: {} });
        if (alive) { setLeads(rows); setPhase("ready"); }
      } catch { if (alive) setPhase("error"); }
    }
    void init();
    return () => { alive = false; };
  }, [navigate]);
  async function saveStatus(id: string, status: typeof statuses[number]) {
    setBusyId(id); setMessage("");
    try { await updateLead({ data: { id, status } }); await refresh(); setMessage("Status salvo com sucesso."); }
    catch { setMessage("Não foi possível salvar o status."); }
    finally { setBusyId(null); }
  }
  async function convert(id: string) {
    if (!window.confirm("Converter este lead em cliente? A ação será registrada no banco.")) return;
    setBusyId(id); setMessage("");
    try { await convertLead({ data: { id } }); await refresh(); setMessage("Lead convertido em cliente."); }
    catch { setMessage("Não foi possível converter o lead."); }
    finally { setBusyId(null); }
  }
  const visible = filter === "todos" ? leads : leads.filter(l => l.status === filter);
  return <div className="min-h-screen"><SiteHeader cta={false}/><main className="mx-auto max-w-6xl px-4 py-12">
    <Link to="/admin" className="font-semibold text-primary">Voltar ao painel</Link>
    <h1 className="mt-5 text-2xl font-bold">Gestão de leads</h1>
    <p className="mt-2 text-sm text-muted-foreground">Acesso exclusivo do administrador. Somente registros existentes no Lovable Cloud.</p>
    {phase === "loading" && <p role="status" className="mt-6">Verificando autorização...</p>}
    {phase === "forbidden" && <p role="alert" className="mt-6">Sem permissão para acessar leads.</p>}
    {phase === "error" && <p role="alert" className="mt-6">Não foi possível carregar os leads.</p>}
    {phase === "ready" && <section className="mt-8">
      <label htmlFor="statusFilter" className="mr-3 text-sm font-semibold">Filtrar status</label>
      <select id="statusFilter" value={filter} onChange={e => setFilter(e.target.value)} className="min-h-11 rounded-lg border bg-background px-3">
        <option value="todos">Todos</option>{statuses.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
      </select>
      {message && <p role="status" className="my-3 text-sm">{message}</p>}
      <div className="mt-5 overflow-x-auto rounded-xl border"><table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted"><tr><th className="p-3">Código</th><th className="p-3">Nome</th><th className="p-3">Cidade</th><th className="p-3">Status</th><th className="p-3">Ação</th></tr></thead>
        <tbody>{visible.length === 0 ? <tr><td className="p-4 text-muted-foreground" colSpan={5}>Nenhum lead encontrado.</td></tr> :
          visible.map(lead => <tr key={lead.id} className="border-t">
            <td className="p-3 font-semibold">{lead.public_code}</td><td className="p-3">{lead.name}</td><td className="p-3">{lead.city}</td>
            <td className="p-3"><select aria-label={`Status de ${lead.public_code}`} disabled={busyId !== null} value={lead.status} onChange={e => void saveStatus(lead.id, e.target.value as typeof statuses[number])} className="min-h-11 rounded border bg-background px-2">{statuses.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></td>
            <td className="p-3"><button type="button" disabled={busyId !== null || lead.status === "convertido" || lead.status === "descartado"} onClick={() => void convert(lead.id)} className="min-h-11 rounded border px-3 font-semibold disabled:opacity-50">Converter em cliente</button></td>
          </tr>)}</tbody>
      </table></div>
    </section>}
  </main><SiteFooter/></div>;
}
