import type { PublicSummary } from "./lead-schema";

/** In-memory only (lost on reload by design): non-sensitive summary handed to the confirmation page. */
let last: { code: string; summary: PublicSummary } | null = null;

export function setConfirmation(v: { code: string; summary: PublicSummary }) {
  last = v;
}
export function readConfirmation(code: string) {
  return last && last.code === code ? last : null;
}
