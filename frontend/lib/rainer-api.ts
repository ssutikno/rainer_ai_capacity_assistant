const backendUrl = () => (process.env.BACKEND_API_URL || "http://localhost:4000").replace(/\/$/, "");

export class RainerApiError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backendUrl()}${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers }, cache: "no-store" });
  } catch {
    throw new RainerApiError("Backend Rainer tidak dapat dihubungi. Pastikan backend berjalan di port 4000.", 503);
  }
  const body = await response.json().catch(() => ({})) as { message?: string; error?: string; details?: { message?: string }[] };
  if (!response.ok) throw new RainerApiError(body.details?.[0]?.message || body.message || body.error || "Permintaan ke backend gagal", response.status);
  return body as T;
}

export type CreateRecommendationInput = {
  name: string; company: string; email: string; whatsapp: string;
  technicalLevel: string; goalId: string; users: string; workload: string; priority: string;
  goalIds?: string[]; routes?: string[];
  productQuantities?: Record<string, number>;
  technicalAnswers?: Record<string, string>;
};

const levelMap: Record<string, string> = { Bisnis: "business", Menengah: "intermediate", Expert: "expert" };
const userCount = (value: string) => Number(value.match(/\d+/)?.[0] || 0) || "unknown";

export async function createRecommendation(input: CreateRecommendationInput) {
  const lead = await api<{ session: { session_id: string }; resume_token: string }>("/v1/leads", {
    method: "POST", body: JSON.stringify({ name: input.name, company: input.company, company_email: input.email, whatsapp: input.whatsapp, country_code: "+62", service_consent: true }),
  });
  const sessionId = lead.session.session_id;
  const auth = { authorization: `Bearer ${lead.resume_token}` };
  await api(`/v1/sessions/${sessionId}/profile`, { method: "PATCH", headers: auth, body: JSON.stringify({ technical_level: levelMap[input.technicalLevel] || "business", technical_mode_enabled: input.technicalLevel === "Expert" }) });

  const answers: Record<string, string | number> = {
    location: "unknown", user_count: userCount(input.users), workload: input.workload,
    criticality: input.priority, current_condition: "unknown", bottleneck: input.priority,
    growth_3_5_years: "unknown", timeline: "unknown", budget_range: "unknown",
  };
  for (const [field, value] of Object.entries(input.technicalAnswers || {})) {
    answers[field] = value === "Belum tahu" ? "unknown" : value;
  }
  const routeFields: Record<string, string[]> = {
    compute: ["vm_count_or_size", "hypervisor", "cpu_need", "ram_peak", "ha_reserve", "network", "rack"],
    storage: ["usable_capacity_tb", "growth", "retention", "snapshot", "free_space_target", "performance_target", "protocol", "backup_immutable"],
    ai: ["model_framework", "ai_mode", "precision", "concurrency", "dataset", "vram", "gpu_count", "power_cooling"],
    workstation: ["application_isv", "scene_dataset", "gpu_vram", "display", "noise", "form_factor", "os", "storage"],
    unsure: ["vm_count_or_size", "hypervisor", "cpu_need", "ram_peak", "ha_reserve", "network", "rack"],
  };
  for (const goal of input.goalIds?.length ? input.goalIds : [input.goalId]) for (const field of routeFields[goal] || routeFields.compute) if (!(field in answers)) answers[field] = "unknown";
  await api(`/v1/sessions/${sessionId}/answers`, { method: "PATCH", headers: auth, body: JSON.stringify({ goal: input.goalId, goals: input.goalIds?.length ? input.goalIds : [input.goalId], product_quantities: input.productQuantities || {}, answers }) });
  await api(`/v1/sessions/${sessionId}/confirm`, { method: "POST", headers: auth, body: "{}" });
  return api<{ result_id: string; result_url: string }>(`/v1/sessions/${sessionId}/recommendations`, {
    method: "POST", headers: { ...auth, "idempotency-key": crypto.randomUUID() }, body: "{}",
  });
}

export type BackendResult = {
  result: {
    result_id: string; category: string; config_name: string; solution_name?: string; routes?: string[]; confidence: "low" | "medium" | "high"; analysis_summary: string;
    lead: { name: string; company: string }; components: Record<string, string>;
    sizing: { current_demand: string; recommended_capacity: string; headroom_percent: number; projected_capacity: string; projection_horizon_years: number };
    validation_required: Array<{ field: string; reason: string }>; assumptions: string[]; risks: string[];
    workload_profile?: { id: string; name: string; source: string; formula: string };
    alternatives?: Array<{ tier: "good" | "better" | "best"; recommended: boolean; difference: string; suggested_specification: Record<string, string> }>;
    products?: Array<{ solution_product_id: string; family: string; role: string; quantity: number; config_name: string; components: Record<string, string>; sizing: { current_demand: string; recommended_capacity: string; headroom_percent: number; projected_capacity: string; projection_horizon_years: number }; confidence: "low" | "medium" | "high" }>;
    interconnections?: Array<{ source_product_id: string; destination_product_id: string; purpose: string; traffic_class: string; protocol: string; estimated_bandwidth: string; recommended_link: string; quantity: number; redundancy: string; validation_required: string[] }>;
    network_architecture?: { topology: string; segments: string[]; switching_requirements: string; resilience_strategy: string; capacity_rationale: string; expansion_triggers: string[] };
  };
  share: { expires_at: string };
};

export const getRecommendation = (token: string) => api<BackendResult>(`/v1/results/${encodeURIComponent(token)}`);
export const getBackendQrUrl = (token: string) => `${backendUrl()}/v1/results/${encodeURIComponent(token)}/qr.svg`;
