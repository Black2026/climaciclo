import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Área do operador em preparação — ClimaCiclo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPlaceholder,
});

function AdminLoginPlaceholder() {
  return (
    <div className="min-h-screen">
      <SiteHeader cta={false} />
      <main className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          <ShieldAlert className="h-10 w-10 text-primary" aria-hidden />
          <h1 className="mt-5 text-2xl font-bold">Área do operador em preparação</h1>
          <p className="mt-3 text-muted-foreground">
            O acesso administrativo ainda não foi liberado. A autenticação e
            a verificação de permissões serão implementadas e testadas no Gate G3.
            Nenhuma informação privada está disponível nesta página.
          </p>
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-primary hover:underline">
            Voltar ao início
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
