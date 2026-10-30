import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({ meta: [{ title: "Entrar — Operador ClimaCiclo" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error("Credenciais inválidas ou conta não confirmada.");
      const access = await getMyAccess();
      if (!access.isAdmin) {
        await supabase.auth.signOut();
        setError("Sem permissão: esta conta não possui o papel de administrador.");
        return;
      }
      await navigate({ to: "/admin" });
    } catch {
      await supabase.auth.signOut();
      setError("Não foi possível autenticar. Verifique as credenciais e a permissão do operador.");
    } finally { setBusy(false); setPassword(""); }
  }
  return <div className="min-h-screen"><SiteHeader cta={false}/><main className="mx-auto max-w-md px-4 py-16">
    <div className="rounded-3xl border bg-card p-7 shadow-soft">
      <h1 className="text-2xl font-bold">Área do operador</h1>
      <p className="mt-2 text-sm text-muted-foreground">Acesso exclusivo a contas autorizadas. Não existe cadastro público.</p>
      <form className="mt-6 space-y-4" onSubmit={signIn}>
        <div><label htmlFor="email" className="block text-sm font-semibold">E-mail</label><input id="email" type="email" autoComplete="username" required maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3"/></div>
        <div><label htmlFor="password" className="block text-sm font-semibold">Senha</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3"/></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button disabled={busy} className="min-h-11 w-full rounded-lg bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-50">{busy?"Verificando...":"Entrar"}</button>
      </form>
    </div><Link to="/" className="mt-6 inline-block font-semibold text-primary">Voltar ao início</Link>
  </main><SiteFooter/></div>;
}
