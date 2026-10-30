import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LEAD_STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  orcamento_enviado: "Orçamento enviado",
  convertido: "Convertido",
  descartado: "Descartado",
};
export const ORDER_STATUS_LABEL: Record<string, string> = {
  aberta: "Aberta",
  agendada_manual: "Combinada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
export const ORDER_KIND_LABEL: Record<string, string> = {
  limpeza: "Limpeza",
  revisao: "Revisão",
  orientacao: "Orientação",
  outro: "Outro",
};

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "novo" || status === "aberta"
      ? "bg-warning-soft text-foreground"
      : status === "convertido" || status === "concluida"
        ? "bg-teal-soft text-secondary-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", tone)}>
      {LEAD_STATUS_LABEL[status] ?? ORDER_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{children}</h1>
      {action}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5 shadow-soft", className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">{children}</p>;
}

export const inputCls =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
export const btnSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-card px-4 text-sm font-semibold hover:bg-accent disabled:opacity-50";

export const fmtDate = (s: string) => new Date(s).toLocaleDateString("pt-BR");
export const fmtPhone = (d: string) =>
  d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
