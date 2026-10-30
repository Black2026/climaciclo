import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, listReminders, listCustomers, createReminder, toggleReminder } from "@/lib/admin.functions";
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome";

type Reminder = Awaited<ReturnType<typeof listReminders>>[number];
type Customer = Awaited<ReturnType<typeof listCustomers>>[number];

export const Route = createFileRoute("/admin_/lembretes")({
  head: () => ({ meta: [{ title: "Gestão de lembretes — ClimaCiclo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: RemindersPage,
});

function RemindersPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("pendentes");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function refresh() { setReminders(await listReminders()); }

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
        const [rows, people] = await Promise.all([listReminders(), listCustomers()]);
        if (active) { setReminders(rows); setCustomers(people); setPhase("ready"); }
      } catch { if (active) setPhase("error"); }
    }
    void init();
    return () => { active = false; };
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !customerId || !customers.some(c => c.id === customerId) || title.trim().length < 2 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return;
    setBusy(true); setMessage("");
    try {
      await createReminder({ data: { customer_id: customerId, title: title.trim(), due_date: dueDate } });
      await refresh();
      setTitle(""); setDueDate(""); setMessage("Lembrete cadastrado com sucesso.");
    } catch { setMessage("Não foi possível cadastrar o lembrete."); }
    finally { setBusy(false); }
  }
  async function setDone(id: string, done: boolean) {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      await toggleReminder({ data: { id, done } });
      await refresh();
      setMessage(done ? "Lembrete concluído." : "Lembrete reaberto.");
    } catch { setMessage("Não foi possível atualizar o lembrete."); }
    finally { setBusy(false); }
  }

  const visible = reminders.filter(r => filter === "todos" || (filter === "pendentes" ? !r.done : r.done));
  return <div className="min-h-screen"><SiteHeader cta={false}/><main className="mx-auto max-w-6xl px-4 py-12">
    <Link to="/admin" className="font-semibold text-primary">Voltar ao painel</Link>
    <h1 className="mt-5 text-2xl font-bold">Gestão de lembretes</h1>
    <p className="mt-2 text-sm text-muted-foreground">Lembretes manuais para acompanhamento preventivo. Não são enviados automaticamente.</p>
    {phase === "loading" && <p role="status" className="mt-6">Verificando autorização...</p>}
    {phase === "forbidden" && <p role="alert" className="mt-6">Sem permissão para acessar lembretes.</p>}
    {phase === "error" && <p role="alert" className="mt-6">Não foi possível carregar os lembretes.</p>}
    {phase === "ready" && <div className="mt-8 space-y-8">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="text-xl font-bold">Novo lembrete</h2>
        {customers.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum cliente cadastrado. Não é possível criar lembretes sem um cliente existente.</p> :
        <form onSubmit={e => void submit(e)} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="reminderCustomer" className="block text-sm font-semibold">Cliente *</label>
            <select id="reminderCustomer" required value={customerId} onChange={e => setCustomerId(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3">
              <option value="">Selecione um cliente</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
            </select>
          </div>
          <div><label htmlFor="reminderDate" className="block text-sm font-semibold">Data prevista *</label>
            <input id="reminderDate" type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3" />
          </div>
          <div className="sm:col-span-2"><label htmlFor="reminderTitle" className="block text-sm font-semibold">Descrição *</label>
            <input id="reminderTitle" required minLength={2} maxLength={150} value={title} onChange={e => setTitle(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3" placeholder="Ex.: revisar manutenção preventiva" />
          </div>
          <div className="sm:col-span-2"><button type="submit" disabled={busy || !customerId || title.trim().length < 2 || !dueDate} className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Salvando..." : "Cadastrar lembrete"}</button></div>
        </form>}
      </section>
      <section><h2 className="text-xl font-bold">Lembretes cadastrados</h2>
        <div className="mt-4"><label htmlFor="reminderFilter" className="mr-3 text-sm font-semibold">Filtrar</label><select id="reminderFilter" value={filter} onChange={e => setFilter(e.target.value)} className="min-h-11 rounded-lg border bg-background px-3"><option value="pendentes">Pendentes</option><option value="concluidos">Concluídos</option><option value="todos">Todos</option></select></div>
        <div className="mt-4 overflow-x-auto rounded-xl border bg-card"><table className="w-full min-w-[670px] text-left text-sm">
          <thead className="bg-muted"><tr><th className="p-3">Cliente</th><th className="p-3">Descrição</th><th className="p-3">Data prevista</th><th className="p-3">Situação</th><th className="p-3">Ação</th></tr></thead>
          <tbody>{visible.length === 0 ? <tr><td colSpan={5} className="p-4 text-muted-foreground">Nenhum lembrete encontrado.</td></tr> :
            visible.map(r => <tr key={r.id} className="border-t"><td className="p-3">{r.customers?.name ?? "Cliente não disponível"}</td><td className="p-3">{r.title}</td><td className="p-3">{r.due_date.split("-").reverse().join("/")}</td><td className="p-3">{r.done ? "Concluído" : "Pendente"}</td><td className="p-3"><button type="button" disabled={busy} className="min-h-11 rounded-lg border px-3 font-semibold text-primary disabled:opacity-50" onClick={() => void setDone(r.id, !r.done)}>{r.done ? "Reabrir" : "Concluir"}</button></td></tr>)}</tbody>
        </table></div>
      </section>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>}
  </main><SiteFooter/></div>;
}
