import { z } from "zod";

export const CONSENT_TEXT_VERSION = "v1-2026-10";

export const ENVIRONMENTS = [
  { value: "residencial", label: "Residencial" },
  { value: "comercial", label: "Comercial" },
] as const;

export const UNIT_TYPES = [
  { value: "split", label: "Split (parede)" },
  { value: "janela", label: "Janela" },
  { value: "cassete", label: "Cassete" },
  { value: "piso_teto", label: "Piso-teto" },
  { value: "portatil", label: "Portátil" },
  { value: "nao_sei", label: "Não sei" },
] as const;

export const FOLLOW_UPS = [
  { value: "trimestral", label: "A cada 3 meses" },
  { value: "semestral", label: "A cada 6 meses" },
  { value: "anual", label: "Uma vez por ano" },
  { value: "nao_sei", label: "Quero orientação" },
] as const;

export const INTERESTS = [
  { value: "limpeza", label: "Limpeza" },
  { value: "revisao", label: "Revisão" },
  { value: "orientacao", label: "Orientação" },
] as const;

const vals = <T extends readonly { value: string }[]>(a: T) =>
  a.map((x) => x.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

/** Normaliza telefone BR para só dígitos com DDD (10 ou 11 dígitos), sem o 55. */
export function normalizeBrPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (d.length === 11 && d[2] !== "9") return null;
  return d;
}

const text = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} é obrigatório`).max(max, `${label}: máximo ${max} caracteres`);

export const step1Schema = z.object({
  environment_type: z.enum(vals(ENVIRONMENTS), { error: "Escolha o ambiente" }),
  unit_count: z.coerce.number({ error: "Informe a quantidade" }).int("Use um número inteiro").min(1, "Mínimo 1 aparelho").max(50, "Máximo 50 aparelhos"),
  unit_type: z.enum(vals(UNIT_TYPES), { error: "Escolha o tipo" }),
});

export const step2Schema = z.object({
  city: text(2, 80, "Cidade"),
  neighborhood: text(2, 80, "Bairro"),
  follow_up_pref: z.enum(vals(FOLLOW_UPS), { error: "Escolha uma preferência" }),
  interests: z.array(z.enum(vals(INTERESTS))).min(1, "Escolha pelo menos um interesse").max(3),
});

export const step3Schema = z.object({
  name: text(2, 100, "Nome"),
  whatsapp: z
    .string()
    .trim()
    .max(25)
    .refine((v) => normalizeBrPhone(v) !== null, "WhatsApp inválido. Use DDD + número, ex.: (11) 91234-5678"),
  email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido"),
  consent: z.literal(true, { error: "É preciso aceitar para enviar" }),
});

export const leadSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .extend({ idempotency_key: z.string().uuid() });

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadDraft = {
  environment_type: string;
  unit_count: string;
  unit_type: string;
  city: string;
  neighborhood: string;
  follow_up_pref: string;
  interests: string[];
  name: string;
  whatsapp: string;
  email: string;
  consent: boolean;
};

export const emptyDraft: LeadDraft = {
  environment_type: "",
  unit_count: "1",
  unit_type: "",
  city: "",
  neighborhood: "",
  follow_up_pref: "",
  interests: [],
  name: "",
  whatsapp: "",
  email: "",
  consent: false,
};

export type PublicSummary = {
  environment: string;
  unitCount: number;
  unitType: string;
  city: string;
  followUp: string;
  interests: string[];
};

export const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;

export function buildSummaryText(code: string, s: PublicSummary) {
  return [
    `Olá! Fiz uma solicitação no ClimaCiclo.`,
    `Código: ${code}`,
    `Ambiente: ${s.environment} · ${s.unitCount} aparelho(s) · ${s.unitType}`,
    `Cidade: ${s.city}`,
    `Acompanhamento: ${s.followUp}`,
    `Interesse: ${s.interests.join(", ")}`,
  ].join("\n");
}
