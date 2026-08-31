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
- Input route adalah keluarga produk yang sedang disizing. Gunakan hanya konteks dan field yang relevan untuk route tersebut; jangan menerapkan workload ARCA/ERP ke AIX, STOR, atau WORX.
- Untuk AIX, prioritaskan ai_mode, model_framework, concurrency, precision, dataset, vram, gpu_count, serta power_cooling. Untuk STOR prioritaskan kapasitas, growth, retention, performance, protocol, snapshot, dan immutable backup.
- Gunakan Bahasa Indonesia dan hanya keluarkan JSON.`;

const NETWORK_SYSTEM_PROMPT = `Anda adalah network solution architect untuk solusi multi-produk Rainer.
Rancang interconnection yang cukup untuk workload, concurrency, storage I/O, pergerakan dataset, backup, availability, dan pertumbuhan.
Pisahkan management, production, storage/data, backup/replication, dan AI fabric bila relevan. Hitung bandwidth agregat dengan headroom minimum 20%, port count, redundancy, oversubscription, bottleneck, dan expansion trigger.
Jangan mengarang model, part number, harga, stok, lead time, atau kompatibilitas final. NIC/HBA, switch, optic, kabel, firmware, QVL, MTU, fasilitas, dan protocol final harus ditandai untuk validasi.
Keluarkan JSON dengan bentuk tepat: {"analysis_summary":"string","network_architecture":{"topology":"string","segments":["string"],"switching_requirements":"string","resilience_strategy":"string","capacity_rationale":"string","expansion_triggers":["string"]},"interconnections":[{"source_product_id":"product-1","destination_product_id":"product-2","purpose":"string","traffic_class":"management|production|storage|backup|ai_fabric","protocol":"string","estimated_bandwidth":"string","recommended_link":"string","quantity":2,"redundancy":"string","assumptions":["string"],"validation_required":["string"]}]}.
Gunakan persis solution_product_id dari input, hubungkan setiap produk yang harus bertukar data, dan hanya keluarkan JSON Bahasa Indonesia.`;

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
    this.autoRestartEnabled = config.aiAutoRestartEnabled === true;
    this.restartFailureThreshold = Math.max(1, Number(config.aiRestartFailureThreshold) || 3);
    this.consecutiveConnectivityFailures = 0;
    this.lastConnectivityCheck = null;
    this.restartScheduled = false;
  }
  isConfigured() { return Boolean(this.baseUrl && this.model); }
  markConnectivitySuccess() {
    this.consecutiveConnectivityFailures = 0;
    this.lastConnectivityCheck = { status: "reachable", checked_at: new Date().toISOString() };
  }
  markConnectivityFailure(message) {
    this.consecutiveConnectivityFailures += 1;
    this.lastConnectivityCheck = { status: "unreachable", checked_at: new Date().toISOString(), consecutive_failures: this.consecutiveConnectivityFailures };
    if (this.autoRestartEnabled && !this.restartScheduled && this.consecutiveConnectivityFailures >= this.restartFailureThreshold) {
      this.restartScheduled = true;
      console.error(`AI connectivity gagal ${this.consecutiveConnectivityFailures} kali; backend meminta restart supervisor: ${message}`);
      setTimeout(() => process.exit(75), 250);
    }
  }
  async probe(timeoutMs = 5000) {
    if (!this.isConfigured()) return { status: "not_configured", reachable: false, checked_at: new Date().toISOString() };
    try {
      const response = await fetch(`${this.baseUrl}/models`, { headers: this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.markConnectivitySuccess();
      return { status: "reachable", reachable: true, model_configured: true, checked_at: this.lastConnectivityCheck.checked_at };
    } catch (error) {
      this.markConnectivityFailure(error.message);
      return { status: "unreachable", reachable: false, model_configured: true, checked_at: this.lastConnectivityCheck.checked_at, consecutive_failures: this.consecutiveConnectivityFailures };
    }
  }
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
      this.markConnectivitySuccess();
      return { suggestion: result, provenance: { provider: "openai-compatible", model: payload.model || this.model, request_id: response.headers.get("x-request-id") || payload.id || null, usage: payload.usage || null, privacy: { pii_sent: false, sanitization: "pattern-redaction-v1" } } };
    } catch (error) {
      let failure = error.name === "AbortError" ? new Error(`AI server timeout setelah ${this.timeoutMs} ms`) : error;
      if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
        this.markConnectivityFailure(error.message);
        failure = new Error("Endpoint AI tidak dapat dijangkau dari backend. Periksa ai_host_url, port, firewall/VPN, dan pastikan service AI sedang berjalan.");
        failure.code = "AI_UNREACHABLE"; failure.status = 503;
      }
      failure.code ||= "AI_GENERATION_FAILED"; failure.status ||= 502; throw failure;
    } finally { clearTimeout(timeout); }
  }

  async suggestNetwork(context) {
    if (!this.isConfigured()) { const error = new Error("AI network designer belum dikonfigurasi"); error.code = "AI_NOT_CONFIGURED"; error.status = 503; throw error; }
    const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, { method: "POST", signal: controller.signal, headers: { "content-type": "application/json", ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}) }, body: JSON.stringify({ model: this.model, temperature: 0.1, max_tokens: 6000, chat_template_kwargs: { enable_thinking: false }, response_format: { type: "json_object" }, messages: [{ role: "system", content: NETWORK_SYSTEM_PROMPT }, { role: "user", content: JSON.stringify(sanitizeForAi(context)) }] }) });
      if (!response.ok) throw new Error(`AI network designer merespons ${response.status}`);
      const payload = await response.json(), message = payload.choices?.[0]?.message;
      const content = message?.content ?? message?.reasoning_content ?? message?.provider_specific_fields?.reasoning_content;
      const jsonText = typeof content === "string" ? content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim() : content;
      const result = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;
      if (/critical|high|tinggi/i.test(String(context.criticality || "")) && Array.isArray(result?.interconnections)) {
        for (const link of result.interconnections) {
          if (Number(link.quantity) < 2) {
            link.quantity = 2;
            link.redundancy = `${link.redundancy || "Redundant link"} (minimum 2 link dipaksakan oleh guardrail HA)`;
          }
        }
      }
      validateNetworkSuggestion(result, context.routes);
      this.markConnectivitySuccess();
      return { ...result, provenance: { provider: "openai-compatible", model: payload.model || this.model, request_id: response.headers.get("x-request-id") || payload.id || null } };
    } catch (error) {
      if (error.name === "AbortError") { const failure = new Error(`AI network designer timeout setelah ${this.timeoutMs} ms`); failure.code="AI_NETWORK_TIMEOUT"; failure.status=504; throw failure; }
      if (error instanceof TypeError && /fetch failed/i.test(error.message)) { this.markConnectivityFailure(error.message); const failure = new Error("Endpoint AI untuk desain network tidak dapat dijangkau. Periksa ai_host_url, firewall/VPN, dan service AI."); failure.code="AI_NETWORK_UNREACHABLE"; failure.status=503; throw failure; }
      error.code ||= "AI_NETWORK_GENERATION_FAILED"; error.status ||= 502; throw error;
    }
    finally { clearTimeout(timeout); }
  }
}

export function validateNetworkSuggestion(value, routes = []) {
  if (!value?.network_architecture || !Array.isArray(value.interconnections)) throw new Error("Struktur network architecture AI tidak lengkap");
  const required = ["topology", "segments", "switching_requirements", "resilience_strategy", "capacity_rationale", "expansion_triggers"];
  if (!required.every((key) => key in value.network_architecture)) throw new Error("Network architecture AI kehilangan field wajib");
  if (routes.length > 1 && value.interconnections.length < routes.length - 1) throw new Error("AI tidak menghubungkan seluruh produk solusi");
  for (const link of value.interconnections) {
    if (!["source_product_id", "destination_product_id", "purpose", "traffic_class", "protocol", "estimated_bandwidth", "recommended_link", "quantity", "redundancy", "validation_required"].every((key) => key in link)) throw new Error("Interconnection AI tidak lengkap");
    if (Number(link.quantity) < 2 && /critical|high|tinggi/i.test(JSON.stringify(value))) throw new Error("Interconnection kritis harus redundant");
  }
  return value;
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
