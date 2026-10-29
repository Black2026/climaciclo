import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect width="40" height="40" rx="12" className="fill-ink" />
      <path
        d="M29 14.5a10 10 0 1 0 1.6 9"
        fill="none"
        className="stroke-teal"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M31.5 19.5l-1 4.4-4.2-1.6" fill="none" className="stroke-teal" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 18h9a2.5 2.5 0 1 0-2.5-2.5" fill="none" className="stroke-ink-foreground" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 22.5h12a2.5 2.5 0 1 1-2.5 2.5" fill="none" className="stroke-ink-foreground" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ to = "/", className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5 font-display", className)} aria-label="ClimaCiclo, página inicial">
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">
        Clima<span className="text-primary">Ciclo</span>
      </span>
    </Link>
  );
}
