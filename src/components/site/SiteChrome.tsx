import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { AlertTriangle } from "lucide-react";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Logo />
        {cta && (
          <Link
            to="/montar-plano"
            className="inline-flex h-11 items-center rounded-lg bg-ink px-4 text-sm font-semibold text-ink-foreground hover:opacity-90"
          >
            <span className="hidden sm:inline">Montar meu acompanhamento</span>
            <span className="sm:hidden">Começar</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ClimaCiclo · Projeto em fase de teste.</p>
        <nav className="flex gap-5">
          <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
          <Link to="/admin/login" className="hover:text-foreground">Área do operador</Link>
        </nav>
      </div>
    </footer>
  );
}

export function NotReadyBanner({ children }: { children?: ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
      <div>
        <p className="font-semibold">Em preparação: ainda não recebemos solicitações.</p>
        <p className="mt-1 text-muted-foreground">
          {children ?? "Você pode conhecer o configurador, mas o envio será liberado em breve."}
        </p>
      </div>
    </div>
  );
}
