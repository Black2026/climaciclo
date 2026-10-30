import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createOrder, createReminder, getCustomer, toggleReminder, updateCustomer, updateOrder } from "@/lib/admin.functions";
import { Card, ORDER_KIND_LABEL, ORDER_STATUS_LABEL, PageTitle, btnPrimary, btnSecondary, fmtDate, fmtPhone, inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/_authenticated/admin/clientes/$id")({ component: CustomerDetail });

function CustomerDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const get = useServerFn(getCustomer);
  const updC = useServerFn(updateCustomer);
  const newO = useServerFn(createOrder);
  const updO = useServerFn(updateOrder);
  const newR = useServerFn(createReminder);
  const togR = useServerFn(toggleReminder);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "customer", id], queryFn: () => get({ data: { id } }) });
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(data?.customer.notes ?? ""), [data?.customer.notes]);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const m = <T,>(fn: (v: T) => Promise<unknown>, ok = "Salvo") =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMutation({ mutationFn: fn, onSuccess: () => { toast.success(ok); refresh(); }, onError: () => toast.error("Não foi possível salvar") });

  const saveNotes = m(() => updC({ data: { id, notes } }));
  const addOrder = m((v: { kind: string; scheduled_note: string }) => newO({ data: { customer_id: id, ...v } }), "Atendimento criado");
  const setOrder = m((v: { id: string; status: string }) => updO({ data: v }));
  const addRem = m((v: { title: string; due_date: string; service_order_id?: string }) => newR({ data: { customer_id: id, ...v } }), "Lembrete criado");
  const tog = m((v: { id: string; done: boolean }) => togR({ data: v }));

  const [kind, setKind] = useState("limpeza");
  const [sched, setSched] = useState("");
  const [rTitle, setRTitle] = useState("");
  const [rDate, setRDate] = useState("");

  if (isLoading) return <p className="text-muted-foreground">Carregando…</p>;
  if (!data) return <p>Cliente não encontrado.</p>;
  const { customer: c, orders, reminders } = data;
  const leadCode = (c.leads as { public_code?: string } | null)?.public_code;

  const onOrder = (e: FormEvent) => { e.preventDefault(); addOrder.mutate({ kind, scheduled_note: sched }); setSched(""); };
  const onRem = (e: FormEvent) => {
    e.preventDefault();
    if (rTitle.trim().length < 2 || !rDate) return toast.error("Informe título e data");
    addRem.mutate({ title: rTitle, due_date: rDate }); setRTitle(""); setRDate("");
  };

  return (
    <div className="max-w-3xl space-y-4">
      <Link to="/admin/clientes" className="text-sm text-primary">← Clientes</Link>
      <PageTitle>{c.name}</PageTitle>
      <Card>
        <p className="text-sm">{fmtPhone(c.whatsapp)} · {c.email ?? "sem e-mail"} · {c.city} — {c.neighborhood}</p>
        <p className="mt-1 text-sm text-muted-foreground">Origem: lead {leadCode ?? "—"} · cliente desde {fmtDate(c.created_at)}</p>
        <label htmlFor="cnotes" className="mb-1 mt-4 block text-sm font-semibold">Notas</label>
        <textarea id="cnotes" rows={3} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-input bg-background p-3 text-sm" />
        <button className={`${btnSecondary} mt-2`} onClick={() => saveNotes.mutate(undefined)}>Salvar notas</button>
      </Card>

      <Card>
        <h2 className="font-semibold">Atendimentos</h2>
        <form onSubmit={onOrder} className="mt-3 grid gap-2 sm:grid-cols-[160px_1fr_auto]">
          <select aria-label="Tipo" value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
            {Object.entries(ORDER_KIND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input aria-label="Combinado" placeholder="O que foi combinado (opcional)" maxLength={300} value={sched} onChange={(e) => setSched(e.target.value)} className={inputCls} />
          <button className={btnPrimary} disabled={addOrder.isPending}>Criar</button>
        </form>
        <ul className="mt-4 space-y-2">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
              <span><strong>{ORDER_KIND_LABEL[o.kind]}</strong> · {fmtDate(o.created_at)}{o.scheduled_note ? ` · ${o.scheduled_note}` : ""}</span>
              <select aria-label="Status do atendimento" value={o.status} onChange={(e) => setOrder.mutate({ id: o.id, status: e.target.value })} className={`${inputCls} w-auto`}>
                {Object.entries(ORDER_STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </li>
          ))}
          {orders.length === 0 && <li className="text-sm text-muted-foreground">Nenhum atendimento.</li>}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">Lembretes</h2>
        <form onSubmit={onRem} className="mt-3 grid gap-2 sm:grid-cols-[1fr_170px_auto]">
          <input aria-label="Título" placeholder="Ex.: Próxima limpeza" maxLength={150} value={rTitle} onChange={(e) => setRTitle(e.target.value)} className={inputCls} />
          <input aria-label="Data" type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} className={inputCls} />
          <button className={btnPrimary} disabled={addRem.isPending}>Criar</button>
        </form>
        <ul className="mt-4 space-y-2">
          {reminders.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
              <input type="checkbox" aria-label="Concluído" checked={r.done} onChange={(e) => tog.mutate({ id: r.id, done: e.target.checked })} className="h-5 w-5 accent-primary" />
              <span className={r.done ? "line-through text-muted-foreground" : ""}>{r.title} · {fmtDate(r.due_date + "T12:00:00")}</span>
            </li>
          ))}
          {reminders.length === 0 && <li className="text-sm text-muted-foreground">Nenhum lembrete.</li>}
        </ul>
      </Card>
    </div>
  );
}
