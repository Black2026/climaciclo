import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, LockKeyhole } from "lucide-react";
import { NotReadyBanner, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { privacyQuery } from "@/lib/queries";
import { submitLead } from "@/lib/public.functions";
import { SUBMIT_ERROR_MESSAGES, type SubmitError } from "@/lib/lead-logic";
import { setConfirmation } from "@/lib/confirmation-store";
import { PUBLIC_LEAD_SUBMISSION_RELEASED } from "@/lib/g2-release";
import {
  ENVIRONMENTS,
  FOLLOW_UPS,
  INTERESTS,
  UNIT_TYPES,
  emptyDraft,
  labelOf,
  step1Schema,
  step2Schema,
  step3Schema,
  type LeadDraft,
} from "@/lib/lead-schema";

export const Route = createFileRoute("/montar-plano")({
  head: () => ({
    meta: [
      { title: "Montar meu acompanhamento — ClimaCiclo" },
      {
        name: "description",
        content: "Conheça o configurador em três etapas do ClimaCiclo. Solicitações reais ainda estão em preparação.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(privacyQuery),
  component: MontarPlano,
});

const titles = ["Seus aparelhos", "Local e preferências", "Contato e revisão"] as const;
type Step = 1 | 2 | 3;
type Errors = Partial<Record<keyof LeadDraft, string>>;

const inputClass =
  "mt-2 block min-h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "block text-sm font-semibold text-foreground";

function MontarPlano() {
  const { data: privacy } = useSuspenseQuery(privacyQuery);
  const navigate = useNavigate();
  const submissionInFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [submissionKey, setSubmissionKey] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const canSend = PUBLIC_LEAD_SUBMISSION_RELEASED && privacy.readyForRealData;
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<LeadDraft>(() => ({
    ...emptyDraft,
    interests: [],
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [reviewed, setReviewed] = useState(false);

  // Release flag is OFF until G2 tests are complete; the server has its own independent gate.
  // The draft remains exclusively in component state and is lost after a refresh.
  function update<K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setReviewed(false);
    setSubmitError(null);
    setSubmissionKey(null); // changed data = new logical attempt; retries keep the key
  }

  function validateCurrentStep(): boolean {
    const parsed =
      step === 1
        ? step1Schema.safeParse(draft)
        : step === 2
          ? step2Schema.safeParse(draft)
          : step3Schema.safeParse(draft);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const next: Errors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof LeadDraft | undefined;
      if (key && !next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    if (step === 3) setReviewed(true);
    else setStep((current) => (current + 1) as Step);
  }

  function previousStep() {
    setErrors({});
    setReviewed(false);
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function sendRequest() {
    if (!canSend || !reviewed || pending || submissionInFlight.current) return;
    if (!validateCurrentStep()) return;
    submissionInFlight.current = true;
    setPending(true);
    setSubmitError(null);
    const key = submissionKey ?? crypto.randomUUID();
    setSubmissionKey(key);
    try {
      const result = await submitLead({ data: { ...draft, idempotency_key: key } });
      if (!result.ok) {
        setSubmitError(result.error);
        return; // Retry keeps the same idempotency key.
      }
      setConfirmation({ code: result.publicCode, summary: result.summary });
      await navigate({ to: "/solicitacao-recebida", search: { codigo: result.publicCode } });
    } catch {
      setSubmitError("server_error");
    } finally {
      submissionInFlight.current = false;
      setPending(false);
    }
  }

  function errorFor(field: keyof LeadDraft) {
    return errors[field] ? (
      <p id={`error-${field}`} role="alert" className="mt-1 text-sm text-destructive">
        {errors[field]}
      </p>
    ) : null;
  }

  return (
    <div className="min-h-screen">
      <SiteHeader cta={false} />
      <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar ao início
        </Link>
        <div className="mt-5">
          <span className="inline-flex rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Simulação do acompanhamento
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">Monte seu acompanhamento</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Conheça as três etapas para organizar o cuidado com seu ar-condicionado.
            {canSend ? "Revise os dados antes do envio." : "Nesta fase, o formulário funciona apenas como demonstração."}
          </p>
        </div>

        <div className="mt-6">
          <NotReadyBanner>
            {canSend
              ? "Revise os dados e confirme o consentimento antes de solicitar atendimento."
              : "Estamos testando a experiência. Use somente dados fictícios; o envio de solicitações permanece bloqueado."}
          </NotReadyBanner>
        </div>

        <nav aria-label="Etapas do formulário" className="mt-8 grid grid-cols-3 gap-2">
          {titles.map((title, index) => {
            const number = (index + 1) as Step;
            return (
              <div key={title} aria-current={step === number ? "step" : undefined}
                className={`rounded-xl border px-2 py-3 text-center text-xs sm:text-sm ${
                  number === step ? "border-primary bg-teal-soft text-secondary-foreground" : "bg-card text-muted-foreground"
                }`}>
                <span className="block font-bold">Etapa {number}</span>
                <span className="mt-1 block">{title}</span>
              </div>
            );
          })}
        </nav>

        <form noValidate onSubmit={(event) => { event.preventDefault(); nextStep(); }}
          className="mt-6 rounded-3xl border bg-card p-5 shadow-soft sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Etapa {step} de 3</p>
          <h2 className="mt-2 text-xl font-bold md:text-2xl">{titles[step - 1]}</h2>

          {step === 1 && (
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <fieldset className="md:col-span-2">
                <legend className={labelClass}>Onde estão os aparelhos? *</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {ENVIRONMENTS.map((option) => (
                    <label key={option.value}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        draft.environment_type === option.value ? "border-primary bg-teal-soft" : "border-border"
                      }`}>
                      <input type="radio" name="environment_type" value={option.value}
                        checked={draft.environment_type === option.value}
                        onChange={() => update("environment_type", option.value)}
                        className="h-4 w-4 accent-primary" />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errorFor("environment_type")}
              </fieldset>
              <div>
                <label className={labelClass} htmlFor="unit_count">Quantidade de aparelhos *</label>
                <input id="unit_count" className={inputClass} type="number" min={1} max={50} step={1}
                  value={draft.unit_count} onChange={(e) => update("unit_count", e.currentTarget.value)}
                  aria-invalid={!!errors.unit_count} aria-describedby={errors.unit_count ? "error-unit_count" : undefined} />
                {errorFor("unit_count")}
              </div>
              <div>
                <label className={labelClass} htmlFor="unit_type">Tipo de aparelho *</label>
                <select id="unit_type" className={inputClass} value={draft.unit_type}
                  onChange={(e) => update("unit_type", e.currentTarget.value)}
                  aria-invalid={!!errors.unit_type} aria-describedby={errors.unit_type ? "error-unit_type" : undefined}>
                  <option value="">Selecione uma opção</option>
                  {UNIT_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                {errorFor("unit_type")}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="city">Cidade *</label>
                <input id="city" className={inputClass} maxLength={80} autoComplete="address-level2"
                  placeholder="Ex.: Recife" value={draft.city}
                  onChange={(e) => update("city", e.currentTarget.value)}
                  aria-invalid={!!errors.city} aria-describedby={errors.city ? "error-city" : undefined} />
                {errorFor("city")}
              </div>
              <div>
                <label className={labelClass} htmlFor="neighborhood">Bairro *</label>
                <input id="neighborhood" className={inputClass} maxLength={80} autoComplete="address-level3"
                  placeholder="Ex.: Boa Viagem" value={draft.neighborhood}
                  onChange={(e) => update("neighborhood", e.currentTarget.value)}
                  aria-invalid={!!errors.neighborhood}
                  aria-describedby={errors.neighborhood ? "error-neighborhood" : undefined} />
                {errorFor("neighborhood")}
              </div>
              <div className="md:col-span-2">
                <label className={labelClass} htmlFor="follow_up_pref">Preferência de acompanhamento *</label>
                <select id="follow_up_pref" className={inputClass} value={draft.follow_up_pref}
                  onChange={(e) => update("follow_up_pref", e.currentTarget.value)}
                  aria-invalid={!!errors.follow_up_pref}
                  aria-describedby={errors.follow_up_pref ? "error-follow_up_pref" : undefined}>
                  <option value="">Selecione uma opção</option>
                  {FOLLOW_UPS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <p className="mt-2 text-xs text-muted-foreground">
                  Preferência informada pelo usuário; a periodicidade técnica depende de avaliação profissional.
                </p>
                {errorFor("follow_up_pref")}
              </div>
              <fieldset className="md:col-span-2">
                <legend className={labelClass}>Quais serviços você procura? *</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {INTERESTS.map((option) => (
                    <label key={option.value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3">
                      <input type="checkbox" className="h-4 w-4 accent-primary" value={option.value}
                        checked={draft.interests.includes(option.value)}
                        onChange={(e) => update("interests", e.currentTarget.checked
                          ? [...draft.interests, option.value]
                          : draft.interests.filter((item) => item !== option.value))} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {errorFor("interests")}
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="mt-7 space-y-6">
              <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                {canSend ? "Confira os dados para contato antes de enviar." : <>Use nome e contato <strong>fictícios</strong>. Nada será enviado.</>}
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="name">Nome *</label>
                  <input id="name" className={inputClass} value={draft.name} maxLength={100} autoComplete="off"
                    placeholder="Ex.: Cliente de teste" onChange={(e) => update("name", e.currentTarget.value)}
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? "error-name" : undefined} />
                  {errorFor("name")}
                </div>
                <div>
                  <label className={labelClass} htmlFor="whatsapp">WhatsApp com DDD *</label>
                  <input id="whatsapp" className={inputClass} type="tel" inputMode="tel"
                    autoComplete="off" placeholder="Ex.: (11) 91234-5678" value={draft.whatsapp}
                    onChange={(e) => update("whatsapp", e.currentTarget.value)}
                    aria-invalid={!!errors.whatsapp}
                    aria-describedby={errors.whatsapp ? "error-whatsapp" : undefined} />
                  {errorFor("whatsapp")}
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass} htmlFor="email">E-mail (opcional)</label>
                  <input id="email" className={inputClass} type="email" maxLength={255} autoComplete="off"
                    placeholder="Ex.: teste@exemplo.com" value={draft.email}
                    onChange={(e) => update("email", e.currentTarget.value)}
                    aria-invalid={!!errors.email} aria-describedby={errors.email ? "error-email" : undefined} />
                  {errorFor("email")}
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                <input type="checkbox" checked={draft.consent} onChange={(e) => update("consent", e.currentTarget.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-primary"
                  aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "error-consent" : undefined} />
                <span className="text-sm leading-relaxed">
                  Concordo com o uso dos dados informados para responder a uma solicitação, de acordo com a
                  {" "}<Link className="font-semibold text-primary underline" to="/privacidade">Política de Privacidade</Link>.
                  {!canSend && " Nesta demonstração, os dados ficam apenas nesta tela."}
                </span>
              </label>
              {errorFor("consent")}

              {reviewed && (
                <section role="status" className="rounded-2xl border border-primary/40 bg-teal-soft p-5">
                  <div className="flex items-center gap-2 font-semibold text-secondary-foreground">
                    <CheckCircle2 className="h-5 w-5" aria-hidden /> Dados de demonstração validados
                  </div>
                  <p className="mt-2 text-sm">Ambiente: {labelOf(ENVIRONMENTS, draft.environment_type)} · {draft.unit_count} aparelho(s)
                    · {labelOf(UNIT_TYPES, draft.unit_type)}</p>
                  <p className="mt-1 text-sm">Local: {draft.city} · {draft.neighborhood}</p>
                  <p className="mt-1 text-sm">Acompanhamento: {labelOf(FOLLOW_UPS, draft.follow_up_pref)}</p>
                  <p className="mt-1 text-sm">Interesses: {draft.interests.map((v) => labelOf(INTERESTS, v)).join(", ")}</p>
                  {!canSend && <p className="mt-3 text-sm font-semibold">Nenhuma solicitação foi enviada ou armazenada.</p>}
                </section>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <div>
              {step > 1 && (
                <button type="button" onClick={previousStep}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 font-semibold hover:bg-muted">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
                </button>
              )}
            </div>
            <button type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
              {step === 3 ? "Revisar dados" : "Continuar"}
              {step === 3 ? <ClipboardCheck className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </form>

        <section className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <LockKeyhole className="h-5 w-5 text-primary" aria-hidden />
            {canSend ? "Confirmação da solicitação" : "Envio de solicitação desativado durante o Gate G2"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {canSend
              ? "O pedido só será considerado recebido depois que o servidor confirmar a gravação."
              : "O fluxo de persistência está preparado, mas permanece bloqueado no aplicativo e no servidor até a conclusão dos testes e da privacidade."}
          </p>
          {submitError && (
            <p role="alert" className="mt-3 rounded-xl border border-destructive/40 p-3 text-sm text-destructive">
              {SUBMIT_ERROR_MESSAGES[submitError]}
            </p>
          )}
          <button type="button" onClick={() => void sendRequest()}
            disabled={!canSend || !reviewed || pending}
            className="mt-4 min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
            {pending ? "Confirmando recebimento..." : canSend ? "Enviar solicitação" : "Enviar solicitação — em breve"}
          </button>
          {!canSend && (
            <p className="mt-2 text-xs text-muted-foreground">
              A coleta real está desativada. O aceite da política de privacidade não libera sozinho o sistema.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
