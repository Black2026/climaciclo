import { describe, expect, it } from "vitest";
import {
  mapRpcError,
  prepareLead,
  toPrivacyInfo,
  toPublicContact,
} from "@/lib/lead-logic";
import { PUBLIC_LEAD_SUBMISSION_RELEASED } from "@/lib/g2-release";

const example = {
  idempotency_key: "5c59f16c-61d7-4a73-90ef-bf44f643b90c",
  environment_type: "residencial",
  unit_count: 2,
  unit_type: "split",
  city: "Recife",
  neighborhood: "Boa Viagem",
  follow_up_pref: "semestral",
  interests: ["limpeza"],
  name: "Cliente de teste",
  whatsapp: "(11) 91234-5678",
  email: "",
  consent: true,
};

describe("Gate G2 — verificacoes de logica sem acessar o Cloud", () => {
  it("mantem bloqueio de envio no cliente ate liberacao explicita", () => {
    expect(PUBLIC_LEAD_SUBMISSION_RELEASED).toBe(false);
  });

  it("prepara dados da RPC ignorando campos administrativos do cliente", () => {
    const result = prepareLead({
      ...example,
      status: "convertido",
      internal_notes: "nao aceitar",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.args.p_idempotency_key).toBe(example.idempotency_key);
    expect(result.args.p_whatsapp).toBe("11912345678");
    expect(result.args).not.toHaveProperty("status");
    expect(result.args).not.toHaveProperty("internal_notes");
    expect(result.args.p_consent).toBe(true);
    expect(result.summary).not.toHaveProperty("name");
    expect(result.summary).not.toHaveProperty("whatsapp");
  });

  it("bloqueia entrada sem consentimento", () => {
    expect(prepareLead({ ...example, consent: false })).toEqual({
      ok: false,
      error: "consent_required",
    });
  });

  it("rejeita UUID invalido", () => {
    expect(prepareLead({ ...example, idempotency_key: "invalido" })).toEqual({
      ok: false,
      error: "invalid",
    });
  });

  it("devolve erro generico para codigo inesperado", () => {
    expect(mapRpcError("not_ready")).toBe("not_ready");
    expect(mapRpcError("rate_limited")).toBe("rate_limited");
    expect(mapRpcError("pg_internal_error")).toBe("server_error");
  });

  it("oculta informacoes internas na consulta publica de WhatsApp", () => {
    const result = toPublicContact({
      whatsapp_enabled: true,
      whatsapp_number: "5511912345678",
      display_name: "ClimaCiclo",
      private_value: "segredo-ficticio",
    });
    expect(result).toEqual({
      whatsappEnabled: true,
      whatsappNumber: "5511912345678",
      displayName: "ClimaCiclo",
    });
    expect(result).not.toHaveProperty("private_value");
  });

  it("nao libera privacidade se nao houver configuracao", () => {
    expect(toPrivacyInfo(null).readyForRealData).toBe(false);
  });
});
