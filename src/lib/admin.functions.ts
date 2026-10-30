import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./require-admin";
import { normalizeBusinessWhatsapp } from "./lead-logic";

const uuid = z.string().uuid();
const LEAD_STATUS = ["novo", "em_contato", "orcamento_enviado", "convertido", "descartado"] as const;
const ORDER_KIND = ["limpeza", "revisao", "orientacao", "outro"] as const;
const ORDER_STATUS = ["aberta", "agendada_manual", "concluida", "cancelada"] as const;

function fail(error: { message: string } | null) {
  if (error) {
    console.error("admin query failed");
    throw new Error("Não foi possível concluir a operação.");
  }
}

/** Auth only (no role): lets the admin layout tell a signed-in non-admin they lack permission. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: data === true, email: (context.claims as { email?: string }).email ?? null };
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const today = new Date().toISOString().slice(0, 10);
    const [novos, total, clientes, ordens, lembretes, settings] = await Promise.all([
      db.from("leads").select("id", { count: "exact", head: true }).eq("status", "novo"),
      db.from("leads").select("id", { count: "exact", head: true }),
      db.from("customers").select("id", { count: "exact", head: true }),
      db.from("service_orders").select("id", { count: "exact", head: true }).in("status", ["aberta", "agendada_manual"]),
      db.from("reminders").select("id", { count: "exact", head: true }).eq("done", false).lte("due_date", today),
      db.from("app_settings").select("ready_for_real_data, whatsapp_enabled").eq("id", 1).maybeSingle(),
    ]);
    return {
      newLeads: novos.count ?? 0,
      totalLeads: total.count ?? 0,
      customers: clientes.count ?? 0,
      openOrders: ordens.count ?? 0,
      dueReminders: lembretes.count ?? 0,
      readyForRealData: !!settings.data?.ready_for_real_data,
      whatsappEnabled: !!settings.data?.whatsapp_enabled,
    };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i: { status?: string }) => z.object({ status: z.enum(LEAD_STATUS).optional() }).parse(i ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("leads")
      .select("id, public_code, name, city, neighborhood, environment_type, unit_count, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    fail(error);
    return rows ?? [];
  });

export const getLead = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i: { id: string }) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: lead, error } = await context.supabase.from("leads").select("*").eq("id", data.id).maybeSingle();
    fail(error);
    if (!lead) return null;
    const { phone_hash: _ph, idempotency_key: _ik, ...safe } = lead;
    const { data: customer } = await context.supabase.from("customers").select("id").eq("lead_id", data.id).maybeSingle();
    return { ...safe, customerId: customer?.id ?? null };
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(LEAD_STATUS).optional(),
        internal_notes: z.string().max(4000).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { id, status, internal_notes } = data;
    const patch = {
      ...(status !== undefined ? { status } : {}),
      ...(internal_notes !== undefined ? { internal_notes } : {}),
    };
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    fail(error);
    return { ok: true };
  });

export const convertLead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: { id: string }) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: customerId, error } = await context.supabase.rpc("convert_lead_to_customer", { p_lead_id: data.id });
    fail(error);
    return { customerId: customerId as string };
  });

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("customers")
      .select("id, name, whatsapp, city, neighborhood, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    fail(error);
    return data ?? [];
  });

export const getCustomer = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((i: { id: string }) => z.object({ id: uuid }).parse(i))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const [c, o, r] = await Promise.all([
      db.from("customers").select("*, leads(public_code)").eq("id", data.id).maybeSingle(),
      db.from("service_orders").select("*").eq("customer_id", data.id).order("created_at", { ascending: false }),
      db.from("reminders").select("*").eq("customer_id", data.id).order("due_date"),
    ]);
    fail(c.error ?? o.error ?? r.error);
    if (!c.data) return null;
    return { customer: c.data, orders: o.data ?? [], reminders: r.data ?? [] };
  });

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ id: uuid, notes: z.string().max(4000) }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("customers").update({ notes: data.notes }).eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("service_orders")
      .select("id, kind, status, scheduled_note, created_at, customer_id, customers(name, city)")
      .order("created_at", { ascending: false })
      .limit(500);
    fail(error);
    return data ?? [];
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        customer_id: uuid,
        kind: z.enum(ORDER_KIND),
        scheduled_note: z.string().trim().max(300).optional(),
        notes: z.string().trim().max(4000).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { customer_id, kind, scheduled_note, notes } = data;
    const { error } = await context.supabase.from("service_orders").insert({
      customer_id, kind,
      ...(scheduled_note !== undefined ? { scheduled_note } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });
    fail(error);
    return { ok: true };
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ id: uuid, status: z.enum(ORDER_STATUS) }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("service_orders").update({ status: data.status }).eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const listReminders = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reminders")
      .select("id, title, due_date, done, customer_id, customers(name)")
      .order("done")
      .order("due_date")
      .limit(500);
    fail(error);
    return data ?? [];
  });

export const createReminder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        customer_id: uuid,
        service_order_id: uuid.optional(),
        title: z.string().trim().min(2).max(150),
        due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { customer_id, service_order_id, title, due_date } = data;
    const { error } = await context.supabase.from("reminders").insert({
      customer_id, title, due_date,
      ...(service_order_id !== undefined ? { service_order_id } : {}),
    });
    fail(error);
    return { ok: true };
  });

export const toggleReminder = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) => z.object({ id: uuid, done: z.boolean() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reminders").update({ done: data.done }).eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    fail(error);
    return data;
  });

const optText = (max: number) => z.string().trim().max(max).transform((v) => (v === "" ? null : v));

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((i: unknown) =>
    z
      .object({
        whatsapp_number: z.string().trim().max(25),
        whatsapp_enabled: z.boolean(),
        display_name: z.string().trim().min(1).max(60),
        controller_name: optText(150),
        controller_document: optText(30),
        privacy_contact_channel: optText(200),
        retention_period: optText(200),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    let number: string | null = null;
    if (data.whatsapp_number) {
      number = normalizeBusinessWhatsapp(data.whatsapp_number);
      if (!number) throw new Error("Número de WhatsApp inválido. Use DDD + número.");
    }
    if (data.whatsapp_enabled && !number) throw new Error("Informe o número antes de ativar o WhatsApp.");
    const { error } = await context.supabase
      .from("app_settings")
      .update({
        ...data,
        whatsapp_number: number,
        privacy_updated_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("id", 1);
    fail(error);
    return { ok: true };
  });
