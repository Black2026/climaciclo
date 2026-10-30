import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { NotReadyBanner, SiteHeader } from "@/components/site/SiteChrome";
import { privacyQuery } from "@/lib/queries";
import { submitLead } from "@/lib/public.functions";
import { SUBMIT_ERROR_MESSAGES } from "@/lib/lead-logic";
import { setConfirmation } from "@/lib/confirmation-store";
import {
  emptyDraft,
  ENVIRONMENTS,
  FOLLOW_UPS,
  INTERESTS,
  labelOf,
  step1Schema,
  step2Schema,
  step3Schema,
  UNIT_TYPES,
  type LeadDraft,
} from "@/lib/lead-schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/montar-plano")({
  head: () => ({
    meta: [
      { title: "Montar meu acompanhamento — ClimaCiclo" },
      { name: "description", content: "Conte sobre seus aparelhos de ar-condicionado em 3 passos e peça um orçamento sem compromisso." },
      { property: "og:title", content: "Montar meu acompanhamento — ClimaCiclo" },
      { property: "og:description", content: "Configurador em 3 passos para a manutenção do seu ar-condicionado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(privacyQuery),
  component: Configurator,
});

type Errors = Partial<Record<keyof LeadDraft, string>>;

function collect(result: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }): Errors {
  if (result.success) return {};
  const e: Errors = {};
  for (const i of result.error!.issues) {
    const k = i.path[0] as keyof LeadDraft;
    if (!e[k]) e[k] = i.message;
  }
  return e;
}

function Configurator() {
  const { data: privacy } = useSuspenseQuery(privacyQuery);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<LeadDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idemKey = useRef<string | null>(null);
  const send = useServerFn(submitLead);
  const navigate = useNavigate();

  const set = <K extends keyof LeadDraft>(k: K, v: LeadDraft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (n: number) => {
    const schema = n === 1 ? step1Schema : n === 2 ? step2Schema : step3Schema;
    const errs = collect(schema.safeParse(draft));
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step === 2 && !idemKey.current) idemKey.current = crypto.randomUUID();
    setStep((s) => s + 1);
    window.scrollTo({ top: 0 });
  };

  const submit = async () => {
    if (submitting) return;
    if (!validate(3) || !validate(1) || !validate(2)) return;
    if (!idemKey.current) idemKey.current = crypto.randomUUID();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await send({ data: { ...draft, idempotency_key: idemKey.current } });
      if (res.ok) {
        setConfirmation({ code: res.publicCode, summary: res.summary });
        navigate({ to: "/solicitacao-recebida", search: { codigo: res.publicCode }, replace: true });
        return;
      }
      setSubmitError(SUBMIT_ERROR_MESSAGES[res.error]);
    } catch {
      setSubmitError(SUBMIT_ERROR_MESSAGES.server_error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader cta={false} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Stepper step={step} />
        {!privacy.readyForRealData && <div className="mt-6"><NotReadyBanner /></div>}
        <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Seus aparelhos</h1>
              <Field label="Tipo de ambiente" error={errors.environment_type}>
                <Choices options={ENVIRONMENTS} value={draft.environment_type} onChange={(v) => set("environment_type", v)} name="environment_type" />
              </Field>
              <Field label="Quantos aparelhos?" error={errors.unit_count} htmlFor="unit_count">
                <input id="unit_count" type="number" inputMode="numeric" min={1} max={50} value={draft.unit_count}
                  onChange={(e) => set("unit_count", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Tipo de aparelho" error={errors.unit_type}>
                <Choices options={UNIT_TYPES} value={draft.unit_type} onChange={(v) => set("unit_type", v)} name="unit_type" />
              </Field>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Onde e como</h1>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cidade" error={errors.city} htmlFor="city">
                  <input id="city" value={draft.city} onChange={(e) => set("city", e.target.value)} maxLength={80} className={inputCls} autoComplete="address-level2" />
                </Field>
                <Field label="Bairro" error={errors.neighborhood} htmlFor="neighborhood">
                  <input id="neighborhood" value={draft.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} maxLength={80} className={inputCls} />
                </Field>
              </div>
              <Field label="Com que frequência quer acompanhamento?" error={errors.follow_up_pref}>
                <Choices options={FOLLOW_UPS} value={draft.follow_up_pref} onChange={(v) => set("follow_up_pref", v)} name="follow_up_pref" />
              </Field>
              <Field label="Interesse (pode marcar mais de um)" error={errors.interests}>
                <div className="grid gap-2 sm:grid-cols-3">
                  {INTERESTS.map((o) => {
                    const on = draft.interests.includes(o.value);
                    return (
                      <button key={o.value} type="button" aria-pressed={on}
                        onClick={() => set("interests", on ? draft.interests.filter((x) => x !== o.value) : [...draft.interests, o.value])}
                        className={cn(choiceCls, on && choiceOn)}>
                        {on && <Check className="h-4 w-4" />} {o.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Seu contato</h1>
              <Field label="Nome" error={errors.name} htmlFor="name">
                <input id="name" value={draft.name} onChange={(e) => set("name", e.target.value)} maxLength={100} className={inputCls} autoComplete="name" />
              </Field>
              <Field label="WhatsApp (com DDD)" error={errors.whatsapp} htmlFor="whatsapp">
                <input id="whatsapp" type="tel" inputMode="tel" placeholder="(11) 91234-5678" value={draft.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} maxLength={25} className={inputCls} autoComplete="tel" />
              </Field>
              <Field label="E-mail (opcional)" error={errors.email} htmlFor="email">
                <input id="email" type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} maxLength={255} className={inputCls} autoComplete="email" />
              </Field>

              <div className="rounded-xl bg-muted p-4 text-sm">
                <p className="font-semibold">Resumo</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>{labelOf(ENVIRONMENTS, draft.environment_type)} · {draft.unit_count} aparelho(s) · {labelOf(UNIT_TYPES, draft.unit_type)}</li>
                  <li>{draft.city} — {draft.neighborhood}</li>
                  <li>{labelOf(FOLLOW_UPS, draft.follow_up_pref)} · {draft.interests.map((i) => labelOf(INTERESTS, i)).join(", ")}</li>
                </ul>
              </div>

              <div>
                <label className="flex min-h-11 cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={draft.consent} onChange={(e) => set("consent", e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-primary" />
                  <span className="text-sm">
                    Autorizo o uso destes dados para responder à minha solicitação, conforme a{" "}
                    <Link to="/privacidade" target="_blank" className="font-semibold text-primary underline">página de privacidade</Link>.
                  </span>
                </label>
                {errors.consent && <p className="mt-1 text-sm text-destructive">{errors.consent}</p>}
              </div>

              {submitError && (
                <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                  {submitError}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} disabled={submitting} className={secondaryBtn}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            ) : <span />}
            {step < 3 ? (
              <button type="button" onClick={next} className={primaryBtn}>Continuar <ArrowRight className="h-4 w-4" /></button>
            ) : (
              <button type="button" onClick={submit} disabled={submitting || !privacy.readyForRealData} className={primaryBtn}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : submitError ? "Tentar novamente" : "Enviar solicitação"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const inputCls = "h-12 w-full rounded-xl border border-input bg-background px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";
const choiceCls = "flex min-h-12 items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const choiceOn = "border-primary bg-teal-soft text-secondary-foreground";
const primaryBtn = "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const secondaryBtn = "inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-6 font-semibold hover:bg-accent";

function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      {htmlFor ? <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">{label}</label> : <p className="mb-2 text-sm font-semibold">{label}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Choices({ options, value, onChange, name }: { options: readonly { value: string; label: string }[]; value: string; onChange: (v: string) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn(choiceCls, value === o.value && choiceOn)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Aparelhos", "Local", "Contato"];
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas">
      {labels.map((l, i) => {
        const n = i + 1;
        return (
          <li key={l} className="flex flex-1 items-center gap-2" aria-current={n === step ? "step" : undefined}>
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              n < step ? "bg-primary text-primary-foreground" : n === step ? "bg-ink text-ink-foreground" : "bg-muted text-muted-foreground")}>
              {n < step ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={cn("truncate text-sm font-medium", n === step ? "text-foreground" : "text-muted-foreground")}>{l}</span>
          </li>
        );
      })}
    </ol>
  );
}
