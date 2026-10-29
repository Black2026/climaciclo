import { describe, expect, it } from "vitest";
import { step1Schema, step2Schema, step3Schema, leadSchema } from "@/lib/lead-schema";

describe("Gate G1 — validação de formulário", () => {
  it("rejeita primeira etapa sem tipo de ambiente", () => {
    expect(step1Schema.safeParse({ environment_type: "", unit_count: "1", unit_type: "split" }).success).toBe(false);
  });
  it("aceita quantidade válida da primeira etapa", () => {
    expect(step1Schema.safeParse({ environment_type: "residencial", unit_count: "2", unit_type: "split" }).success).toBe(true);
  });
  it("requer localização e interesse na etapa 2", () => {
    expect(step2Schema.safeParse({ city: "Recife", neighborhood: "Boa Viagem", follow_up_pref: "anual", interests: [] }).success).toBe(false);
  });
  it("aceita etapa 2 preenchida", () => {
    expect(step2Schema.safeParse({ city: "Recife", neighborhood: "Boa Viagem", follow_up_pref: "anual", interests: ["limpeza"] }).success).toBe(true);
  });
  it("não aceita consentimento desmarcado na etapa 3", () => {
    const example = { name: "Cliente de teste", whatsapp: "(11) 91234-5678", email: "", consent: false };
    expect(step3Schema.safeParse(example).success).toBe(false);
    expect(step3Schema.safeParse({ ...example, consent: true }).success).toBe(true);
  });
  it("rejeita telefone sem DDD", () => {
    expect(step3Schema.safeParse({ name: "Cliente de teste", whatsapp: "12345", email: "", consent: true }).success).toBe(false);
  });
  it("preserva mensagem de consentimento na migração Zod 4", () => {
    const result = step3Schema.safeParse({
      name: "Cliente de teste", whatsapp: "(11) 91234-5678", email: "", consent: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("É preciso aceitar para enviar");
  });
  it("rejeita entradas grandes e interesses acima do máximo", () => {
    const result = step2Schema.safeParse({
      city: "Recife", neighborhood: "Boa Viagem", follow_up_pref: "anual",
      interests: Array(25).fill("limpeza"),
    });
    expect(result.success).toBe(false);
  });
  it("validacao completa rejeita payload com UUID invalido", () => {
    expect(leadSchema.safeParse({
      environment_type: "residencial", unit_count: "2", unit_type: "split",
      city: "Recife", neighborhood: "Boa Viagem", follow_up_pref: "anual",
      interests: ["limpeza"], name: "Cliente de teste", whatsapp: "(11) 91234-5678",
      email: "", consent: true, idempotency_key: "nao-e-uuid",
    }).success).toBe(false);
  });
});
