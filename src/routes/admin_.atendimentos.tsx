import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, listOrders, listCustomers, createOrder, updateOrder } from "@/lib/admin.functions";
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome";

type Order = Awaited<ReturnType<typeof listOrders>>[number];
type Customer = Awaited<ReturnType<typeof listCustomers>>[number];
const kinds = ["limpeza", "revisao", "orientacao", "outro"] as const;
const statuses = ["aberta", "agendada_manual", "concluida", "cancelada"] as const;

export const Route = createFileRoute("/admin_/atendimentos")({
  head: () => ({ meta: [{ title: "Gestão de atendimentos — ClimaCiclo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ServiceOrdersPage,
});

function ServiceOrdersPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [kind, setKind] = useState<typeof kinds[number]>("limpeza");
  const [scheduledNote, setScheduledNote] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("todos");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function refresh() { setOrders(await listOrders()); }

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (!session) { await navigate({ to: "/admin/login" }); return; }
        const access = await getMyAccess();
        if (!active) return;
        if (!access.isAdmin) { setPhase("forbidden"); return; }
        const [rows, people] = await Promise.all([listOrders(), listCustomers()]);
        if (active) { setOrders(rows); setCustomers(people); setPhase("ready"); }
      } catch { if (active) setPhase("error"); }
    }
    void init();
    return () => { active = false; };
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !customerId || !customers.some(c => c.id === customerId)) return;
    setBusy(true); setMessage("");
    try {
      await createOrder({ data: { customer_id: customerId, kind, scheduled_note: scheduledNote, notes } });
      await refresh();
      setScheduledNote(""); setNotes(""); setMessage("Atendimento registrado com sucesso.");
    } catch { setMessage("Não foi possível registrar o atendimento."); }
    finally { setBusy(false); }
  }
  async function changeStatus(id: string, status: typeof statuses[number]) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      await updateOrder({ data: { id, status } });
      await refresh();
      setMessage("Status do atendimento atualizado.");
    } catch { setMessage("Não foi possível atualizar o atendimento."); }
    finally { setBusy(false); }
  }

  const visible = filter === "todos" ? orders : orders.filter(o => o.status === filter);
  return <div className="min-h-screen"><SiteHeader cta={false}/><main className="mx-auto max-w-6xl px-4 py-12">
    <Link to="/admin" className="font-semibold text-primary">Voltar ao painel</Link>
    <h1 className="mt-5 text-2xl font-bold">Gestão de atendimentos</h1>
    <p className="mt-2 text-sm text-muted-foreground">Ordens de serviço registradas manualmente. Acesso exclusivo de administradores.</p>
    {phase === "loading" && <p role="status" className="mt-6">Verificando autorização...</p>}
    {phase === "forbidden" && <p role="alert" className="mt-6">Sem permissão para acessar atendimentos.</p>}
    {phase === "error" && <p role="alert" className="mt-6">Não foi possível carregar os atendimentos.</p>}
    {phase === "ready" && <div className="mt-8 space-y-8">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-xl font-bold">Novo atendimento</h2>
        {customers.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum cliente cadastrado. A criação de atendimentos estará disponível depois que houver um cliente legítimo no banco.</p> :
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={e => void submit(e)}>
          <div><label htmlFor="orderCustomer" className="block text-sm font-semibold">Cliente *</label><select id="orderCustomer" required value={customerId} onChange={e => setCustomerId(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3"><option value="">Selecione o cliente</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}</select></div>
          <div><label htmlFor="orderKind" className="block text-sm font-semibold">Tipo de atendimento *</label><select id="orderKind" value={kind} onChange={e => setKind(e.target.value as typeof kinds[number])} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3">{kinds.map(k => <option key={k} value={k}>{k.replaceAll("_", " ")}</option>)}</select></div>
          <div><label htmlFor="scheduledNote" className="block text-sm font-semibold">Agendamento manual (opcional)</label><input id="scheduledNote" value={scheduledNote} onChange={e => setScheduledNote(e.target.value)} maxLength={300} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3" placeholder="Combinado com o cliente, sem agenda integrada" /></div>
          <div><label htmlFor="orderNotes" className="block text-sm font-semibold">Observações internas (opcional)</label><textarea id="orderNotes" value={notes} onChange={e => setNotes(e.target.value)} maxLength={4000} rows={3} className="mt-2 w-full rounded-lg border bg-background p-3" /></div>
          <div className="sm:col-span-2"><button type="submit" disabled={busy || !customerId} className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Registrando..." : "Registrar atendimento"}</button></div>
        </form>}
      </section>
      <section><h2 className="text-xl font-bold">Atendimentos cadastrados</h2>
        <div className="mt-4"><label htmlFor="orderFilter" className="mr-3 text-sm font-semibold">Filtrar status</label><select id="orderFilter" value={filter} onChange={e => setFilter(e.target.value)} className="min-h-11 rounded-lg border bg-background px-3"><option value="todos">Todos</option>{statuses.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></div>
        <div className="mt-4 overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-muted"><tr><th className="p-3">Cliente</th><th className="p-3">Serviço</th><th className="p-3">Agendamento</th><th className="p-3">Data</th><th className="p-3">Status</th></tr></thead>
        <tbody>{visible.length === 0 ? <tr><td className="p-4 text-muted-foreground" colSpan={5}>Nenhum atendimento encontrado.</td></tr> : visible.map(o => <tr key={o.id} className="border-t"><td className="p-3">{o.customers?.name ?? "Cliente não disponível"}</td><td className="p-3">{o.kind}</td><td className="p-3">{o.scheduled_note || "Não definido"}</td><td className="p-3">{new Date(o.created_at).toLocaleDateString("pt-BR")}</td><td className="p-3"><select aria-label={`Status de atendimento de ${o.customers?.name ?? "cliente"}`} disabled={busy} value={o.status} onChange={e=>void changeStatus(o.id,e.target.value as typeof statuses[number])} className="min-h-11 rounded-lg border bg-background px-2">{statuses.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody></table></div>
      </section>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>}
  </main><SiteFooter/></div>;
}
