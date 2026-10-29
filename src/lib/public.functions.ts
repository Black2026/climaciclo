import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import {
  mapRpcError,
  prepareLead,
  sha256Hex,
  toPrivacyInfo,
  toPublicContact,
  type SubmitResult,
} from "./lead-logic";

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getPublicContact = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getAdminClient();
    const { data } = await db
      .from("app_settings")
      .select("whatsapp_enabled, whatsapp_number, display_name")
      .eq("id", 1)
      .maybeSingle();
    return toPublicContact(data);
  } catch {
    return toPublicContact(null);
  }
});

export const getPrivacyInfo = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getAdminClient();
    const { data } = await db
      .from("app_settings")
      .select(
        "controller_name, controller_document, privacy_contact_channel, retention_period, privacy_updated_at, ready_for_real_data",
      )
      .eq("id", 1)
      .maybeSingle();
    return toPrivacyInfo(data);
  } catch {
    return toPrivacyInfo(null);
  }
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }): Promise<SubmitResult> => {
    const prepared = prepareLead(data);
    if (!prepared.ok) return { ok: false, error: prepared.error };

    const salt = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "climaciclo";
    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;
    const [phoneHash, ipHash] = await Promise.all([
      sha256Hex(`phone:${salt}:${prepared.phone}`),
      ip ? sha256Hex(`ip:${salt}:${ip}`) : Promise.resolve(null),
    ]);

    try {
      const db = await getAdminClient();
      const { data: rows, error } = await db.rpc("submit_lead", {
        ...prepared.args,
        p_phone_hash: phoneHash,
        p_ip_hash: ipHash as string,
      });
      if (error) {
        console.error("submit_lead failed", error.code); // no PII in logs
        return { ok: false, error: "server_error" };
      }
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row || row.error || !row.public_code) {
        return { ok: false, error: mapRpcError(row?.error) };
      }
      return { ok: true, publicCode: row.public_code, summary: prepared.summary };
    } catch {
      console.error("submit_lead exception");
      return { ok: false, error: "server_error" };
    }
  });
