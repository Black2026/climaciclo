import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, ClipboardList, LayoutDashboard, Loader2, LogOut, Settings, ShieldAlert, Users, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel — ClimaCiclo" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/atendimentos", label: "Atendimentos", icon: ClipboardList },
  { to: "/admin/lembretes", label: "Lembretes", icon: Bell },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AdminLayout() {
  const access = useServerFn(getMyAccess);
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin", "access"], queryFn: () => access() });
  const qc = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (isError || !data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border bg-card p-6 text-center shadow-soft">
          <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
          <h1 className="mt-4 text-xl font-bold">Sem permissão</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta{data?.email ? ` (${data.email})` : ""} ainda não tem acesso ao painel. Peça ao responsável para liberar.
          </p>
          <button onClick={signOut} className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold hover:bg-accent">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b bg-sidebar text-sidebar-foreground md:min-h-screen md:border-b-0">
        <div className="flex items-center justify-between px-4 py-4 [&_span]:text-sidebar-foreground">
          <Logo to="/admin" />
          <button onClick={signOut} aria-label="Sair" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-sidebar-accent md:hidden">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:px-3">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }}
              className="flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium opacity-80 hover:bg-sidebar-accent hover:opacity-100"
              activeProps={{ className: "bg-sidebar-accent opacity-100 text-sidebar-primary" }}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-3 md:block">
          <p className="truncate px-3 text-xs opacity-60">{data.email}</p>
          <button onClick={signOut} className="mt-2 flex h-11 w-full items-center gap-2 rounded-lg px-3 text-sm opacity-80 hover:bg-sidebar-accent">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
