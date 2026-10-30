import type { PublicSummary } from "./lead-schema";

type Confirmation = { code: string; summary: PublicSummary };

// Browser-only transient state. The server never stores one visitor's summary
// in a process-global variable shared with other requests.
let last: Confirmation | null = null;

export function setConfirmation(value: Confirmation) {
  if (typeof window === "undefined") return;
  last = value;
}

export function readConfirmation(code: string): Confirmation | null {
  if (typeof window === "undefined") return null;
  return last?.code === code ? last : null;
}
