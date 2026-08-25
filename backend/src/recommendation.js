const PRODUCTS = {
  ARCA: { product_id: "ARCA-COMPUTE-TBD", config_name: "ARCA Compute Foundation", focus: "compute, ERP, database, dan virtualisasi", base: { chassis: "Rack server - TBD setelah validasi", cpu: "Enterprise CPU - sizing TBD", ram: "ECC RAM - sizing TBD", gpu: "Tidak diperlukan kecuali workload tervalidasi", boot: "Redundant boot media - TBD", data_storage: "Enterprise storage - sizing TBD", controller: "TBD", network: "Redundant network - speed TBD", psu: "Redundant PSU - validasi daya", management: "Dedicated remote management", software: "OS/hypervisor TBD", support: "TBD" } },
  STOR: { product_id: "STOR-STORAGE-TBD", config_name: "STOR Data Foundation", focus: "penyimpanan, backup, dan retensi data", base: { chassis: "STOR platform - model TBD", cpu: "TBD", ram: "TBD", gpu: "N/A", boot: "Redundant boot - TBD", data_storage: "Usable capacity + minimal 20% headroom", controller: "HBA/controller TBD", network: "Protocol dan speed TBD", psu: "Redundant PSU - validasi daya", management: "Remote management", software: "Storage software/license TBD", support: "TBD" } },
  AIX: { product_id: "AIX-GPU-TBD", config_name: "AIX AI Foundation", focus: "AI, GPU, training, dan inference", base: { chassis: "GPU-capable platform - TBD", cpu: "Host CPU sizing TBD", ram: "System memory TBD", gpu: "GPU/VRAM/count wajib divalidasi", boot: "Redundant boot - TBD", data_storage: "Dataset/checkpoint storage TBD", controller: "TBD", network: "Fabric/interconnect TBD", psu: "PSU dan input power wajib divalidasi", management: "Remote management", software: "Driver/framework/license TBD", support: "TBD" } },
  WORX: { product_id: "WORX-WORKSTATION-TBD", config_name: "WORX Professional Foundation", focus: "CAD, desain, rendering, dan aplikasi profesional", base: { chassis: "Desk/tower/rack - TBD", cpu: "Workstation CPU - sizing TBD", ram: "ECC RAM - sizing TBD", gpu: "Professional GPU/VRAM TBD", boot: "SSD boot - TBD", data_storage: "Local/shared storage TBD", controller: "TBD", network: "Network TBD", psu: "PSU sized after GPU validation", management: "TBD", software: "OS/ISV certification TBD", support: "TBD" } },
};
const forbiddenClaim = /(harga\s*(?:adalah|sebesar|mulai|:)?\s*rp\.?\s*[\d.]|diskon\s*\d+\s*%|stok\s*(?:tersedia|ready|ada\b)|lead\s*time\s*(?:adalah|:)?\s*\d+|part\s*number\s*(?:adalah|:)\s*[a-z0-9-]{4,}|kompatibel\s*(?:final|pasti)|zero\s*downtime|unlimited)/i;
export function guardrailLint(value) {
  const serialized = JSON.stringify(value);
  const violations = forbiddenClaim.test(serialized) ? ["Output mengandung klaim komersial atau kompatibilitas konkret yang memerlukan sumber resmi atau approval manusia"] : [];
  return { passed: violations.length === 0, violations };
}
const containsTbd = (value) => /\bTBD\b/i.test(String(value ?? ""));
const mergeBaselineComponents = (aiComponents, baseline) => {
  const result = { ...aiComponents };
  const mapping = { cpu: "cpu", ram: "ram", data_storage: "storage", network: "network", gpu: "gpu" };
  for (const [component, baselineKey] of Object.entries(mapping)) {
    if ((!result[component] || containsTbd(result[component])) && baseline.components[baselineKey]) result[component] = `${baseline.components[baselineKey]} (baseline workload)`;
  }
  return result;
};
export function buildRecommendation({ route, answers, completeness, technical_level, versions, aiResult, baseline }) {
  const product = PRODUCTS[route];
  const validation = [...completeness.missing.map((field) => ({ field, reason: "Data minimum belum tersedia" })), ...completeness.unknown.map((field) => ({ field, reason: "Customer memilih Tidak tahu" }))];
  if (route === "AIX") validation.push({ field: "platform_compatibility", reason: "GPU, BIOS, PSU, airflow, QVL, dan support matrix harus divalidasi" });
  const ai = aiResult.suggestion;
  const combinedValidation = [...validation, ...ai.validation_required].filter((item, index, items) => items.findIndex((x) => x.field === item.field && x.reason === item.reason) === index);
  const confidence = !completeness.minimum_met || completeness.known_data_score < 35 ? "low" : completeness.known_data_score < 80 || combinedValidation.length > 2 ? "medium" : "high";
  const recommendation = {
    version: 2, category: route, ...product, components: mergeBaselineComponents(ai.components, baseline),
    sizing: { ...ai.sizing, method: `${baseline.formula}; ${ai.sizing.method}`, current_demand: containsTbd(ai.sizing.current_demand) ? baseline.current_demand : ai.sizing.current_demand, recommended_capacity: containsTbd(ai.sizing.recommended_capacity) ? baseline.recommended_capacity : ai.sizing.recommended_capacity, projected_capacity: containsTbd(ai.sizing.projected_capacity) ? baseline.projected_capacity : ai.sizing.projected_capacity },
    scalability: ai.scalability, alternatives: baseline.alternatives,
    workload_profile: { id: baseline.profile_id, name: baseline.profile_name, source: baseline.source, formula: baseline.formula },
    analysis_summary: ai.analysis_summary,
    rationale: technical_level === "business" ? ai.analysis_summary : `${ai.analysis_summary} Metode sizing: ${ai.sizing.method}`,
    assumptions: [...new Set(["Capacity headroom minimal 20% kecuali override tercatat", ...baseline.assumptions, ...ai.assumptions])],
    risks: [...new Set(ai.risks)],
    validation_required: combinedValidation,
    confidence,
    disclaimer: "Rekomendasi awal, bukan quotation final. Harga, ketersediaan, lead time, dan kompatibilitas akhir memerlukan sumber resmi serta approval manusia.",
    provenance: { ...versions, model: aiResult.provenance.model, ai: aiResult.provenance, decision_trace: [{ step: "route", value: route }, { step: "workload_baseline", value: { profile_id: baseline.profile_id, source: baseline.source, formula: baseline.formula } }, { step: "ai_sizing", value: { headroom_percent: ai.sizing.headroom_percent, method: ai.sizing.method } }, { step: "completeness", value: { answered_score: completeness.answered_score, known_data_score: completeness.known_data_score } }, { step: "confidence", value: confidence }] },
  };
  const lint = guardrailLint({ ...recommendation, disclaimer: "" });
  return { recommendation, lint };
}
