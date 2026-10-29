import { describe, expect, it } from "vitest";
import { step1Schema, step2Schema, step3Schema } from "@/lib/lead-schema";

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
});
