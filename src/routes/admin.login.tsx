import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Entrar — ClimaCiclo" },
      { name: "description", content: "Acesso da equipe ClimaCiclo." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Entrar — ClimaCiclo" },
      { property: "og:description", content: "Acesso da equipe ClimaCiclo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

const creds = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres").max(72),
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const p = creds.safeParse({ email, password });
    if (!p.success) return setMsg({ kind: "error", text: p.error.issues[0].message });
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      setBusy(false);
      if (error) return setMsg({ kind: "error", text: "E-mail ou senha incorretos, ou e-mail ainda não confirmado." });
      navigate({ to: "/admin", replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({ ...p.data, options: { emailRedirectTo: `${window.location.origin}/admin/login` } });
      setBusy(false);
      if (error) return setMsg({ kind: "error", text: "Não foi possível criar a conta. Tente outro e-mail." });
      if (data.session) return navigate({ to: "/admin", replace: true });
      setMsg({ kind: "info", text: "Conta criada. Confirme pelo link enviado ao seu e-mail e depois entre." });
      setMode("in");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-calm px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="tablist">
            {(["in", "up"] as const).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setMsg(null); }}
                className={cn("h-10 rounded-lg text-sm font-semibold", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}>
                {m === "in" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">E-mail</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Senha</label>
              <input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            {msg && <p role={msg.kind === "error" ? "alert" : "status"} className={cn("text-sm", msg.kind === "error" ? "text-destructive" : "text-primary")}>{msg.text}</p>}
            <button type="submit" disabled={busy} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} {mode === "in" ? "Entrar" : "Criar conta"}
            </button>
          </form>
          {mode === "up" && (
            <p className="mt-4 text-xs text-muted-foreground">Contas novas não acessam o painel automaticamente. O acesso é liberado pelo responsável.</p>
          )}
        </div>
      </div>
    </div>
  );
}
