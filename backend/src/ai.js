const COMPONENT_KEYS = ["chassis", "cpu", "ram", "gpu", "boot", "data_storage", "controller", "network", "psu", "management", "software", "support"];
const MAX_AI_TEXT_LENGTH = 1000;
const sensitiveKey = /(^|_)(name|full_name|company|email|phone|whatsapp|mobile|contact|address|street|lead_id|session_id|result_id|token|api_key|password|secret|hostname)($|_)/i;
const redactText = (value) => String(value)
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
  .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]")
  .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[REDACTED_PHONE]")
  .replace(/\b(?:[a-z0-9-]+\.)+(?:local|internal|corp|lan)\b/gi, "[REDACTED_HOST]")
  .replace(/\b(?:lead|session|result)_[0-9a-f-]{8,}\b/gi, "[REDACTED_ID]")
  .slice(0, MAX_AI_TEXT_LENGTH);

export function sanitizeForAi(value, key = "") {
  if (sensitiveKey.test(key)) return "[REDACTED]";
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => sanitizeForAi(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([childKey]) => !sensitiveKey.test(childKey)).map(([childKey, childValue]) => [childKey, sanitizeForAi(childValue, childKey)]));
  return value;
}

const SYSTEM_PROMPT = `Anda adalah solution sizing assistant untuk produk infrastruktur Rainer.
Analisis kebutuhan customer dan usulkan spesifikasi aktual, sizing, headroom, serta jalur skalabilitas.
Aturan mutlak:
- Jangan mengarang harga, stok, lead time, part number, sertifikasi, benchmark, garansi, SLA, atau kompatibilitas final.
- Jika data customer tidak cukup, gunakan workload_baseline yang diberikan dan catat sebagai asumsi; gunakan TBD hanya untuk validasi vendor, fasilitas, lisensi, atau kompatibilitas final.
- Bedakan kapasitas kebutuhan saat ini, kapasitas yang disarankan, headroom, dan kapasitas proyeksi.
- Headroom minimum 20% kecuali ada override customer yang eksplisit.
- Produk/komponen harus tetap generik apabila knowledge base tidak memberi model resmi.
- GPU, drive, NIC, controller, PSU, dan chassis wajib dianggap belum tervalidasi sampai support matrix/QVL/fasilitas diperiksa.
- Good/Better/Best harus memiliki perbedaan kuantitatif atau constraint yang jelas.
- Gunakan Bahasa Indonesia dan hanya keluarkan JSON.`;

const schema = {
  name: "rainer_infrastructure_suggestion",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    required: ["analysis_summary", "sizing", "components", "scalability", "alternatives", "assumptions", "risks", "validation_required"],
    properties: {
      analysis_summary: { type: "string" },
      sizing: {
        type: "object", additionalProperties: false,
        required: ["method", "current_demand", "recommended_capacity", "headroom_percent", "projected_capacity", "projection_horizon_years"],
        properties: {
          method: { type: "string" }, current_demand: { type: "string" }, recommended_capacity: { type: "string" },
          headroom_percent: { type: "number" }, projected_capacity: { type: "string" }, projection_horizon_years: { type: "number" }
        }
      },
      components: { type: "object", additionalProperties: false, required: COMPONENT_KEYS, properties: Object.fromEntries(COMPONENT_KEYS.map((key) => [key, { type: "string" }])) },
      scalability: {
        type: "object", additionalProperties: false, required: ["scale_up", "scale_out", "triggers", "constraints"],
        properties: { scale_up: { type: "array", items: { type: "string" } }, scale_out: { type: "array", items: { type: "string" } }, triggers: { type: "array", items: { type: "string" } }, constraints: { type: "array", items: { type: "string" } } }
      },
      alternatives: { type: "array", minItems: 3, maxItems: 3, items: { type: "object", additionalProperties: false, required: ["tier", "configuration", "difference", "recommended"], properties: { tier: { type: "string", enum: ["good", "better", "best"] }, configuration: { type: "string" }, difference: { type: "string" }, recommended: { type: "boolean" } } } },
      assumptions: { type: "array", items: { type: "string" } }, risks: { type: "array", items: { type: "string" } },
      validation_required: { type: "array", items: { type: "object", additionalProperties: false, required: ["field", "reason"], properties: { field: { type: "string" }, reason: { type: "string" } } } }
    }
  }
};

export class AiSuggestionService {
  constructor(config) {
    this.baseUrl = config.aiBaseUrl?.replace(/\/$/, "");
    this.apiKey = config.aiApiKey;
    this.model = config.aiModel;
    this.timeoutMs = config.aiTimeoutMs;
    this.required = config.aiRequired !== false;
  }
  isConfigured() { return Boolean(this.baseUrl && this.model); }
  async suggest(context) {
    if (!this.isConfigured()) {
      const error = new Error("AI suggestion wajib tetapi system environment variable ai_host_url atau AI_MODEL belum dikonfigurasi");
      error.code = "AI_NOT_CONFIGURED"; error.status = 503; throw error;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const sanitizedContext = sanitizeForAi(context);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST", signal: controller.signal,
        headers: { "content-type": "application/json", ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}) },
        body: JSON.stringify({ model: this.model, temperature: 0.1, max_tokens: 6000, chat_template_kwargs: { enable_thinking: false }, response_format: { type: "json_object" }, messages: [{ role: "system", content: `${SYSTEM_PROMPT}\nStruktur JSON harus mengikuti schema ini: ${JSON.stringify(schema.schema)}` }, { role: "user", content: JSON.stringify(sanitizedContext) }] })
      });
      if (!response.ok) throw new Error(`AI server merespons ${response.status}: ${(await response.text()).slice(0, 300)}`);
      const payload = await response.json();
      const message = payload.choices?.[0]?.message;
      const content = message?.content ?? message?.reasoning_content ?? message?.provider_specific_fields?.reasoning_content;
      const jsonText = typeof content === "string" ? content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim() : content;
      const result = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
      validateAiSuggestion(result);
      return { suggestion: result, provenance: { provider: "openai-compatible", model: payload.model || this.model, request_id: response.headers.get("x-request-id") || payload.id || null, usage: payload.usage || null, privacy: { pii_sent: false, sanitization: "pattern-redaction-v1" } } };
    } catch (error) {
      const failure = error.name === "AbortError" ? new Error(`AI server timeout setelah ${this.timeoutMs} ms`) : error;
      failure.code ||= "AI_GENERATION_FAILED"; failure.status ||= 502; throw failure;
    } finally { clearTimeout(timeout); }
  }
}

export function validateAiSuggestion(value) {
  if (!value || typeof value !== "object") throw new Error("Respons AI bukan object");
  for (const key of ["analysis_summary", "sizing", "components", "scalability", "alternatives", "assumptions", "risks", "validation_required"]) if (!(key in value)) throw new Error(`Respons AI tidak memiliki ${key}`);
  if (!Number.isFinite(value.sizing?.headroom_percent) || value.sizing.headroom_percent < 20) throw new Error("Headroom hasil AI kurang dari minimum 20%");
  if (!COMPONENT_KEYS.every((key) => typeof value.components?.[key] === "string")) throw new Error("Struktur components hasil AI tidak lengkap");
  const tiers = value.alternatives?.map((x) => x.tier);
  if (tiers?.length !== 3 || !["good", "better", "best"].every((tier) => tiers.includes(tier))) throw new Error("Alternatif AI harus Good/Better/Best");
  return value;
}
