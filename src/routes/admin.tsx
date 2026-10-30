import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess, getDashboard, listLeads } from "@/lib/admin.functions";
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome";

type Summary = Awaited<ReturnType<typeof getDashboard>>;
type Lead = Awaited<ReturnType<typeof listLeads>>[number];
export const Route = createFileRoute("/admin")({
  head: () => ({meta: [{title:"Painel do operador — ClimaCiclo"},{name:"robots",content:"noindex, nofollow"}]}),
  component: AdminPage,
});
function AdminPage() {
  const navigate=useNavigate();
  const [phase,setPhase]=useState<"loading"|"forbidden"|"ready"|"error">("loading");
  const [summary,setSummary]=useState<Summary|null>(null);
  const [leads,setLeads]=useState<Lead[]>([]);
  useEffect(()=>{
    let alive=true;
    async function load(){
      try {
        const {data:{session}}=await supabase.auth.getSession();
        if(!alive)return;
        if(!session){await navigate({to:"/admin/login"});return;}
        const access=await getMyAccess();
        if(!alive)return;
        if(!access.isAdmin){setPhase("forbidden");return;}
        const [counts,rows]=await Promise.all([getDashboard(),listLeads({data:{}})]);
        if(alive){setSummary(counts);setLeads(rows);setPhase("ready");}
      } catch {if(alive)setPhase("error");}
    }
    void load();
    return ()=>{alive=false;};
  },[navigate]);
  async function logout(){await supabase.auth.signOut();setSummary(null);setLeads([]);await navigate({to:"/admin/login"});}
  return <div className="min-h-screen"><SiteHeader cta={false}/><main className="mx-auto max-w-6xl px-4 py-12">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Painel do operador</h1><button onClick={()=>void logout()} className="min-h-11 rounded-lg border px-5 font-semibold">Sair da conta</button></div>
    {phase==="loading" && <p role="status" className="mt-8">Verificando autorização...</p>}
    {phase==="forbidden" && <p role="alert" className="mt-8">Sem permissão. Esta conta não possui acesso de administrador.</p>}
    {phase==="error" && <p role="alert" className="mt-8">Não foi possível carregar o painel. Confira a conexão e tente novamente.</p>}
    {phase==="ready" && summary && <div className="mt-8 space-y-8">
      <section aria-label="Indicadores reais" className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {([["Novos leads",summary.newLeads],["Leads",summary.totalLeads],["Clientes",summary.customers],["Atendimentos abertos",summary.openOrders],["Lembretes vencidos",summary.dueReminders]] as const).map(([name,total])=><div key={name} className="rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{name}</p><p className="mt-2 text-3xl font-bold tabular-nums">{total}</p></div>)}
      </section>
      <nav aria-label="Gestão administrativa" className="flex flex-wrap gap-3"><Link to="/admin/leads" className="rounded-lg border px-4 py-3 font-semibold text-primary">Gerenciar leads</Link><Link to="/admin/clientes" className="rounded-lg border px-4 py-3 font-semibold text-primary">Gerenciar clientes</Link></nav>
      <div className="rounded-xl border bg-card p-4 text-sm"><p>Recebimento de leads: <strong>{summary.readyForRealData?"configurado no banco (exige revisão final)":"bloqueado para dados reais"}</strong>.</p><p>WhatsApp comercial: {summary.whatsappEnabled?"habilitado":"desabilitado"}.</p></div>
      <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Leads cadastrados</h2><Link to="/admin/leads" className="rounded-lg border px-4 py-3 font-semibold text-primary">Gerenciar leads</Link></div><p className="mb-3 text-sm text-muted-foreground">Apenas registros reais do banco. Nenhum contador ou lead fictício é gerado.</p>
        <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-muted"><tr><th className="p-3">Código</th><th className="p-3">Nome</th><th className="p-3">Cidade</th><th className="p-3">Status</th><th className="p-3">Data</th></tr></thead>
        <tbody>{leads.length===0?<tr><td colSpan={5} className="p-4 text-muted-foreground">Nenhuma solicitação registrada.</td></tr>:leads.map(l=><tr key={l.id} className="border-t"><td className="p-3 font-semibold">{l.public_code}</td><td className="p-3">{l.name}</td><td className="p-3">{l.city}</td><td className="p-3">{l.status}</td><td className="p-3">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table></div>
      </section><p className="text-sm text-muted-foreground">Este primeiro painel é somente leitura. Conversão de leads, ordens e lembretes serão habilitados no Gate G4.</p>
    </div>}
    <Link to="/" className="mt-8 inline-block font-semibold text-primary">Voltar ao site</Link>
  </main><SiteFooter/></div>;
}
