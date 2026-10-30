import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, listCustomers, getCustomer, updateCustomer } from "@/lib/admin.functions";
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome";

type Customer = Awaited<ReturnType<typeof listCustomers>>[number];
type CustomerDetails = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;

export const Route = createFileRoute("/admin_/clientes")({
  head: () => ({ meta: [{ title: "Gestão de clientes — ClimaCiclo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"loading" | "ready" | "forbidden" | "error">("loading");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<CustomerDetails | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        if (!session) { await navigate({ to: "/admin/login" }); return; }
        const access = await getMyAccess();
        if (!active) return;
        if (!access.isAdmin) { setPhase("forbidden"); return; }
        const rows = await listCustomers();
        if (active) { setCustomers(rows); setPhase("ready"); }
      } catch { if (active) setPhase("error"); }
    }
    void load();
    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    if (!selectedId) { setDetails(null); setNotes(""); return; }
    let active = true;
    setDetails(null);
    setMessage("");
    async function loadDetails() {
      try {
        const result = await getCustomer({ data: { id: selectedId! } });
        if (active) {
          setDetails(result);
          setNotes(result?.customer.notes ?? "");
          if (!result) setMessage("Cliente não encontrado.");
        }
      } catch {
        if (active) setMessage("Não foi possível consultar os detalhes.");
      }
    }
    void loadDetails();
    return () => { active = false; };
  }, [selectedId]);

  async function saveNotes() {
    if (!details || busy || notes.length > 4000) return;
    setBusy(true);
    setMessage("");
    try {
      await updateCustomer({ data: { id: details.customer.id, notes } });
      const fresh = await getCustomer({ data: { id: details.customer.id } });
      setDetails(fresh);
      setNotes(fresh?.customer.notes ?? "");
      setMessage("Observações salvas com sucesso.");
    } catch { setMessage("Não foi possível salvar as observações."); }
    finally { setBusy(false); }
  }

  const filtered = customers.filter(c => [c.name, c.city, c.neighborhood].some(v => (v ?? "").toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))));
  return <div className="min-h-screen"><SiteHeader cta={false}/><main className="mx-auto max-w-6xl px-4 py-12">
    <Link to="/admin" className="font-semibold text-primary">Voltar ao painel</Link>
    <h1 className="mt-5 text-2xl font-bold">Gestão de clientes</h1>
    <p className="mt-2 text-sm text-muted-foreground">Clientes existentes no Lovable Cloud. Acesso restrito a administradores.</p>
    {phase === "loading" && <p role="status" className="mt-6">Verificando autorização...</p>}
    {phase === "forbidden" && <p role="alert" className="mt-6">Sem permissão para acessar clientes.</p>}
    {phase === "error" && <p role="alert" className="mt-6">Não foi possível carregar os clientes.</p>}
    {phase === "ready" && <div className="mt-8 space-y-6">
      <div><label htmlFor="customerSearch" className="block text-sm font-semibold">Buscar cliente por nome, cidade ou bairro</label>
        <input id="customerSearch" type="search" autoComplete="off" value={search} onChange={e => setSearch(e.target.value)} className="mt-2 min-h-11 w-full max-w-lg rounded-lg border bg-background px-3" placeholder="Pesquisar clientes cadastrados" />
      </div>
      <section aria-label="Lista de clientes" className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[660px] text-left text-sm"><thead className="bg-muted"><tr><th className="p-3">Nome</th><th className="p-3">Cidade</th><th className="p-3">Bairro</th><th className="p-3">Cadastro</th><th className="p-3">Ação</th></tr></thead>
        <tbody>{filtered.length === 0 ? <tr><td colSpan={5} className="p-4 text-muted-foreground">Nenhum cliente encontrado.</td></tr> : filtered.map(c => <tr className="border-t" key={c.id}><td className="p-3">{c.name}</td><td className="p-3">{c.city}</td><td className="p-3">{c.neighborhood}</td><td className="p-3">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td><td className="p-3"><button type="button" className="min-h-11 rounded-lg border px-3 font-semibold text-primary" onClick={() => setSelectedId(c.id)}>Ver detalhes</button></td></tr>)}</tbody>
        </table>
      </section>
      {selectedId && <section aria-label="Detalhes do cliente" className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Detalhes do cliente</h2><button type="button" className="min-h-11 rounded-lg border px-4" onClick={() => setSelectedId(null)}>Fechar detalhes</button></div>
        {!details && <p className="mt-4 text-sm text-muted-foreground">Consultando detalhes...</p>}
        {details && <div className="mt-4 space-y-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold">Nome</dt><dd>{details.customer.name}</dd></div>
            <div><dt className="font-semibold">Local</dt><dd>{details.customer.city} · {details.customer.neighborhood}</dd></div>
            <div><dt className="font-semibold">Origem</dt><dd>{details.customer.leads?.public_code ?? "Sem código"}</dd></div>
            <div><dt className="font-semibold">Atendimentos</dt><dd>{details.orders.length}</dd></div>
            <div><dt className="font-semibold">Lembretes</dt><dd>{details.reminders.length}</dd></div>
          </dl>
          <div><label htmlFor="customerNotes" className="block text-sm font-semibold">Observações internas</label><textarea id="customerNotes" value={notes} onChange={e=>setNotes(e.target.value)} maxLength={4000} rows={4} className="mt-2 w-full rounded-lg border bg-background p-3" /><p className="text-xs text-muted-foreground">{notes.length}/4000 caracteres. Não informe senhas ou dados sensíveis desnecessários.</p></div>
          <button type="button" disabled={busy || notes === (details.customer.notes ?? "")} onClick={() => void saveNotes()} className="min-h-11 rounded-lg bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50">{busy ? "Salvando..." : "Salvar observações"}</button>
        </div>}
      </section>}
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>}
  </main><SiteFooter/></div>;
}
