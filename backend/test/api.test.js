import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { MemoryStore } from "../src/store.js";
import { resolveWorkloadBaseline } from "../src/workload-baseline.js";

const config = { appVersion: "1.3.0", port: 0, publicBaseUrl: "http://127.0.0.1", resultTtlHours: 168, resumeTtlHours: 72, adminApiKey: "test-admin-key", emailMode: "console", freeEmailPolicy: "warn", rateLimitPerMinute: 1000, aiRequired: true, versions: { kb: "1.3.0", rules: "1.3.0", prompt: "ai-sizing-v2" } };
const aiSuggestion = {
  analysis_summary: "Kebutuhan ERP 80 pengguna memerlukan kapasitas seimbang dengan ruang tumbuh tiga tahun.",
  sizing: { method: "Baseline workload ditambah growth dan 25% operational headroom", current_demand: "12 VM dan 80 pengguna", recommended_capacity: "16 VM setara, 32 core, 256 GB ECC RAM, 4 TB usable", headroom_percent: 25, projected_capacity: "20 VM setara dan 5 TB usable", projection_horizon_years: 3 },
  components: { chassis: "Rack server TBD", cpu: "32 core total - generasi TBD", ram: "256 GB ECC, slot ekspansi tersedia", gpu: "N/A", boot: "2x SSD RAID 1 - kapasitas TBD", data_storage: "4 TB usable dengan proteksi TBD", controller: "TBD setelah workload storage tervalidasi", network: "Dual 10 GbE", psu: "Dual redundant PSU - wattage TBD", management: "Dedicated remote management", software: "Hypervisor TBD", support: "TBD" },
  scalability: { scale_up: ["RAM dapat ditingkatkan hingga kebutuhan tervalidasi"], scale_out: ["Tambah host ketika utilisasi berkelanjutan melewati trigger"], triggers: ["CPU p95 > 70% selama 30 hari", "RAM p95 > 75%"], constraints: ["Lisensi, rack, daya, dan network harus diperiksa"] },
  alternatives: [{ tier: "good", configuration: "24 core, 192 GB RAM", difference: "20% headroom untuk baseline", recommended: false }, { tier: "better", configuration: "32 core, 256 GB RAM", difference: "25% headroom dan redundant network", recommended: true }, { tier: "best", configuration: "2 host masing-masing 32 core, 256 GB RAM", difference: "Scale-out dan HA setelah validasi", recommended: false }],
  assumptions: ["Profil VM belum tersedia"], risks: ["Sizing dapat berubah setelah pengukuran utilisasi"], validation_required: [{ field: "hypervisor", reason: "Customer memilih Tidak tahu" }]
};

async function setup() {
  const store = new MemoryStore(); await store.init();
  const ai = { isConfigured: () => true, suggest: async () => ({ suggestion: structuredClone(aiSuggestion), provenance: { provider: "test", model: "test-sizing-model", request_id: "ai-test-1", usage: { total_tokens: 100 } } }) };
  const app = createApp({ store, config, ai, email: { sendResult: async () => ({ provider_id: "test", status: "accepted" }) } });
  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${app.address().port}`;
  return { store, base, close: () => new Promise((resolve) => app.close(resolve)) };
}
const request = (base, path, options = {}) => fetch(base + path, { ...options, headers: { "content-type": "application/json", ...options.headers }, body: options.body && JSON.stringify(options.body) });

test("alur customer lengkap menghasilkan result opaque dan QR", async (t) => {
  const ctx = await setup(); t.after(ctx.close);
  let response = await request(ctx.base, "/v1/leads", { method: "POST", body: { name: "Budi Santoso", company: "Nusantara Logistik", company_email: "budi@nusantara.co.id", whatsapp: "081234567890", country_code: "+62", service_consent: true } });
  assert.equal(response.status, 201); const created = await response.json();
  const auth = { authorization: `Bearer ${created.resume_token}` };
  response = await request(ctx.base, `/v1/sessions/${created.session.session_id}/profile`, { method: "PATCH", headers: auth, body: { technical_level: "business" } });
  assert.equal(response.status, 200);
  const answers = { location: "Jakarta", user_count: 80, workload: "ERP dan database", criticality: "high", current_condition: "server lama", bottleneck: "lambat", growth_3_5_years: "30%", timeline: "Q4", budget_range: "perlu diskusi", vm_count_or_size: "12 VM", hypervisor: "unknown", cpu_need: "unknown", ram_peak: "unknown", ha_reserve: "N+1", network: "10GbE", rack: "available" };
  response = await request(ctx.base, `/v1/sessions/${created.session.session_id}/answers`, { method: "PATCH", headers: auth, body: { goal: "compute", answers } });
  assert.equal(response.status, 200); assert.equal((await response.json()).route.route, "ARCA");
  response = await request(ctx.base, `/v1/sessions/${created.session.session_id}/confirm`, { method: "POST", headers: auth, body: {} });
  assert.equal(response.status, 200);
  response = await request(ctx.base, `/v1/sessions/${created.session.session_id}/recommendations`, { method: "POST", headers: { ...auth, "idempotency-key": "case-1" }, body: {} });
  assert.equal(response.status, 201); const generated = await response.json();
  assert.match(generated.result_url, /\/v1\/results\/[A-Za-z0-9_-]{32,}/);
  const resultPath = new URL(generated.result_url).pathname;
  response = await request(ctx.base, resultPath); assert.equal(response.status, 200);
  const result = await response.json(); assert.equal(result.result.category, "ARCA"); assert.ok(result.result.validation_required.length > 0);
  assert.equal(result.result.sizing.headroom_percent, 25); assert.equal(result.result.provenance.model, "test-sizing-model");
  assert.ok(result.result.scalability.triggers.length > 0);
  assert.equal(result.result.workload_profile.id, "erp_database");
  assert.deepEqual(result.result.alternatives.map((item) => item.tier), ["good", "better", "best"]);
  assert.ok(result.result.alternatives.every((item) => Object.keys(item.suggested_specification).length >= 5));
  assert.doesNotMatch(result.result.components.cpu, /TBD/i);
  response = await request(ctx.base, `${resultPath}/qr.svg`); assert.equal(response.status, 200); assert.match(await response.text(), /<svg/);
});

test("validator menolak suggestion AI dengan headroom di bawah guardrail", async () => {
  const { validateAiSuggestion } = await import("../src/ai.js");
  const unsafe = structuredClone(aiSuggestion); unsafe.sizing.headroom_percent = 10;
  assert.throws(() => validateAiSuggestion(unsafe), /minimum 20%/);
});

test("payload LLM menyamarkan PII dan identifier internal", async () => {
  const { sanitizeForAi } = await import("../src/ai.js");
  const sanitized = sanitizeForAi({
    name: "Budi Santoso", company: "PT Rahasia", company_email: "budi@rahasia.co.id",
    answers: { workload: "Hubungi budi@rahasia.co.id atau +62 812-3456-7890; server 10.20.30.40", hostname: "erp01.corp", notes: "session_12345678-abcd-1234-abcd-123456789012" }
  });
  assert.equal("name" in sanitized, false); assert.equal("company" in sanitized, false); assert.equal("company_email" in sanitized, false);
  assert.match(sanitized.answers.workload, /REDACTED_EMAIL/); assert.match(sanitized.answers.workload, /REDACTED_PHONE/); assert.match(sanitized.answers.workload, /REDACTED_IP/);
  assert.equal("hostname" in sanitized.answers, false); assert.match(sanitized.answers.notes, /REDACTED_ID/);
});

test("validasi lead dan proteksi admin", async (t) => {
  const ctx = await setup(); t.after(ctx.close);
  let response = await request(ctx.base, "/v1/leads", { method: "POST", body: { name: "", company_email: "invalid" } });
  assert.equal(response.status, 422);
  response = await request(ctx.base, "/v1/admin/leads"); assert.equal(response.status, 401);
  response = await request(ctx.base, "/v1/admin/leads", { headers: { "x-admin-api-key": "test-admin-key" } }); assert.equal(response.status, 200);
});

test("empat jalur produk memiliki routing deterministik", async () => {
  const { routeRequirement, routeRequirements } = await import("../src/discovery.js");
  assert.equal(routeRequirement("compute", {}).route, "ARCA");
  assert.equal(routeRequirement("storage", {}).route, "STOR");
  assert.equal(routeRequirement("ai", {}).route, "AIX");
  assert.equal(routeRequirement("workstation", {}).route, "WORX");
  assert.equal(routeRequirement("unsure", { workload: "backup dan arsip" }).route, "STOR");
  assert.deepEqual(routeRequirements(["compute", "storage", "ai"], {}).routes, ["ARCA", "STOR", "AIX"]);
});

test("solusi multi-produk menghasilkan product blocks dan interconnection yang cukup", async (t) => {
  const ctx = await setup(); t.after(ctx.close);
  let response = await request(ctx.base, "/v1/leads", { method: "POST", body: { name: "Sari Wijaya", company: "Digital Industri", company_email: "sari@digital.co.id", whatsapp: "081298765432", country_code: "+62", service_consent: true } });
  const created = await response.json(), auth = { authorization: `Bearer ${created.resume_token}` }, sessionId = created.session.session_id;
  await request(ctx.base, `/v1/sessions/${sessionId}/profile`, { method: "PATCH", headers: auth, body: { technical_level: "expert" } });
  const answers = { location: "Jakarta", user_count: 80, workload: "ERP, database, backup, dan AI inference", criticality: "high", current_condition: "existing", bottleneck: "network dan storage", growth_3_5_years: "40%", timeline: "Q4", budget_range: "discussion" };
  for (const field of ["vm_count_or_size","hypervisor","cpu_need","ram_peak","ha_reserve","network","rack","usable_capacity_tb","growth","retention","snapshot","free_space_target","performance_target","protocol","backup_immutable","model_framework","ai_mode","precision","concurrency","dataset","vram","gpu_count","power_cooling"]) answers[field] ||= "unknown";
  response = await request(ctx.base, `/v1/sessions/${sessionId}/answers`, { method: "PATCH", headers: auth, body: { goals: ["compute", "storage", "ai"], product_quantities: { ARCA: 3, STOR: 2, AIX: 1 }, answers } });
  assert.equal(response.status, 200); const saved = await response.json(); assert.deepEqual(saved.routes, ["ARCA", "STOR", "AIX"]); assert.deepEqual(saved.product_quantities, { ARCA: 3, STOR: 2, AIX: 1 });
  await request(ctx.base, `/v1/sessions/${sessionId}/confirm`, { method: "POST", headers: auth, body: {} });
  response = await request(ctx.base, `/v1/sessions/${sessionId}/recommendations`, { method: "POST", headers: { ...auth, "idempotency-key": "multi-1" }, body: {} });
  assert.equal(response.status, 201); const generated = await response.json();
  assert.equal(generated.products.length, 3); assert.ok(generated.interconnections.length >= 2);
  assert.deepEqual(generated.products.map((product) => product.quantity), [3, 2, 1]);
  assert.match(generated.network_architecture.capacity_rationale, /bandwidth|headroom/i);
  assert.ok(generated.interconnections.every((link) => link.quantity >= 4));
  response = await request(ctx.base, new URL(generated.result_url).pathname); const result = (await response.json()).result;
  assert.equal(result.version, 3); assert.equal(result.solution_type, "multi_product"); assert.equal(result.provenance.network_design_source, "deterministic-fallback");
});

test("semua jalur memiliki suggested specification Good Better Best", () => {
  const cases = [
    ["ARCA", { user_count: 51, workload: "ERP & database" }, "erp_database"],
    ["STOR", { user_count: 50, workload: "backup repository" }, "backup"],
    ["AIX", { user_count: 10, workload: "LLM inference dan RAG" }, "inference"],
    ["WORX", { user_count: 1, workload: "CAD dan BIM" }, "cad_bim"],
  ];
  for (const [route, answers, profile] of cases) {
    const baseline = resolveWorkloadBaseline(route, answers);
    assert.equal(baseline.profile_id, profile);
    assert.deepEqual(baseline.alternatives.map((item) => item.tier), ["good", "better", "best"]);
    for (const item of baseline.alternatives) {
      assert.ok(Object.keys(item.suggested_specification).length >= 5);
      assert.doesNotMatch(item.configuration, /TBD/i);
    }
  }
});

test("baseline ERP 51 user mengikuti rumus customer", () => {
  const baseline = resolveWorkloadBaseline("ARCA", { user_count: 51, workload: "ERP" });
  assert.match(baseline.formula, /0\.3 core\/user/);
  assert.match(baseline.current_demand, /16 core/);
  assert.match(baseline.current_demand, /32 GB RAM/);
  assert.match(baseline.current_demand, /200 GB usable/);
});

test("completeness membedakan field terjawab dan data nyata", async () => {
  const { completeness } = await import("../src/discovery.js");
  const fields = { location: "unknown", user_count: 51, workload: "ERP", criticality: "high", current_condition: "unknown", bottleneck: "unknown", growth_3_5_years: "unknown", timeline: "unknown", budget_range: "unknown", vm_count_or_size: "unknown", hypervisor: "unknown", cpu_need: "unknown", ram_peak: "unknown", ha_reserve: "unknown", network: "unknown", rack: "unknown" };
  const result = completeness("ARCA", fields);
  assert.equal(result.answered_score, 100);
  assert.ok(result.known_data_score < 35);
  assert.equal(result.minimum_met, true);
});

test("guardrail mengizinkan catatan validasi tetapi memblokir klaim harga konkret", async () => {
  const { guardrailLint } = await import("../src/recommendation.js");
  assert.equal(guardrailLint({ note: "Harga, stok, lead time, dan part number perlu validasi tim Rainer" }).passed, true);
  assert.equal(guardrailLint({ note: "Harga Rp 125.000.000 dan stok tersedia" }).passed, false);
});
