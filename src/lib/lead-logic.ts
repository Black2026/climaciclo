import {
  CONSENT_TEXT_VERSION,
  ENVIRONMENTS,
  FOLLOW_UPS,
  INTERESTS,
  UNIT_TYPES,
  labelOf,
  leadSchema,
  normalizeBrPhone,
  type PublicSummary,
} from "./lead-schema";

/** Pure helpers shared by server functions; kept free of IO so they can be unit-tested. */

export type SubmitError = "invalid" | "consent_required" | "not_ready" | "rate_limited" | "server_error";

export type SubmitResult =
  | { ok: true; publicCode: string; summary: PublicSummary }
  | { ok: false; error: SubmitError };

export const SUBMIT_ERROR_MESSAGES: Record<SubmitError, string> = {
  invalid: "Alguns dados estão inválidos. Revise e tente novamente.",
  consent_required: "É preciso aceitar o uso dos dados para enviar.",
  not_ready: "Ainda não estamos recebendo solicitações. Volte em breve.",
  rate_limited: "Recebemos muitas solicitações deste contato. Tente novamente mais tarde.",
  server_error: "Não conseguimos confirmar o envio. Tente novamente.",
};

/** Validate raw input and build the exact RPC args. Server-controlled fields are never taken from input. */
export function prepareLead(raw: unknown) {
  if (!raw || typeof raw !== "object" || (raw as { consent?: unknown }).consent !== true) {
    return { ok: false as const, error: "consent_required" as const };
  }
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "invalid" as const };
  const d = parsed.data;
  const phone = normalizeBrPhone(d.whatsapp)!;
  return {
    ok: true as const,
    phone,
    args: {
      p_idempotency_key: d.idempotency_key,
      p_environment_type: d.environment_type,
      p_unit_count: d.unit_count,
      p_unit_type: d.unit_type,
      p_city: d.city,
      p_neighborhood: d.neighborhood,
      p_follow_up_pref: d.follow_up_pref,
      p_interests: Array.from(new Set(d.interests)),
      p_name: d.name,
      p_whatsapp: phone,
      p_email: d.email ? d.email.toLowerCase() : "",
      p_consent: true,
      p_consent_text_version: CONSENT_TEXT_VERSION,
    },
    summary: {
      environment: labelOf(ENVIRONMENTS, d.environment_type),
      unitCount: d.unit_count,
      unitType: labelOf(UNIT_TYPES, d.unit_type),
      city: d.city,
      followUp: labelOf(FOLLOW_UPS, d.follow_up_pref),
      interests: d.interests.map((i) => labelOf(INTERESTS, i)),
    } satisfies PublicSummary,
  };
}

export function mapRpcError(code: string | null | undefined): SubmitError {
  if (code === "consent_required" || code === "not_ready" || code === "rate_limited") return code;
  return "server_error";
}

/** Only these fields may ever leave the server for anonymous visitors. */
export function toPublicContact(row: {
  whatsapp_enabled?: boolean | null;
  whatsapp_number?: string | null;
  display_name?: string | null;
  [k: string]: unknown;
} | null) {
  const enabled = !!row?.whatsapp_enabled && !!row?.whatsapp_number;
  return {
    whatsappEnabled: enabled,
    whatsappNumber: enabled ? (row!.whatsapp_number as string) : null,
    displayName: row?.display_name || "ClimaCiclo",
  };
}

export function toPrivacyInfo(row: {
  controller_name?: string | null;
  controller_document?: string | null;
  privacy_contact_channel?: string | null;
  retention_period?: string | null;
  privacy_updated_at?: string | null;
  ready_for_real_data?: boolean | null;
  [k: string]: unknown;
} | null) {
  return {
    controllerName: row?.controller_name ?? null,
    controllerDocument: row?.controller_document ?? null,
    contactChannel: row?.privacy_contact_channel ?? null,
    retentionPeriod: row?.retention_period ?? null,
    updatedAt: row?.privacy_updated_at ?? null,
    readyForRealData: !!row?.ready_for_real_data,
  };
}

/** Normalize an admin-entered WhatsApp number to 55+DDD+number. */
export function normalizeBusinessWhatsapp(input: string): string | null {
  const local = normalizeBrPhone(input);
  return local ? `55${local}` : null;
}

export async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
