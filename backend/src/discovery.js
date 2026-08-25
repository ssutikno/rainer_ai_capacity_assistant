export const TECHNICAL_LEVELS = new Set(["business", "intermediate", "expert"]);
export const ROUTES = new Set(["ARCA", "STOR", "AIX", "WORX"]);

const common = ["location", "user_count", "workload", "criticality", "current_condition", "bottleneck", "growth_3_5_years", "timeline", "budget_range"];
const routeFields = {
  ARCA: ["vm_count_or_size", "hypervisor", "cpu_need", "ram_peak", "ha_reserve", "network", "rack"],
  STOR: ["usable_capacity_tb", "growth", "retention", "snapshot", "free_space_target", "performance_target", "protocol", "backup_immutable"],
  AIX: ["model_framework", "ai_mode", "precision", "concurrency", "dataset", "vram", "gpu_count", "power_cooling"],
  WORX: ["application_isv", "scene_dataset", "gpu_vram", "display", "noise", "form_factor", "os", "storage"]
};
export const routeRequirement = (goal, answers = {}) => {
  if (goal === "workstation" || Number(answers.user_count) === 1 && /cad|render|desain/i.test(answers.workload || "")) return { route: "WORX", rule_id: "route-workstation" };
  if (goal === "storage" || /backup|file|storage|arsip/i.test(answers.workload || "")) return { route: "STOR", rule_id: "route-storage" };
  if (goal === "ai" || /gpu|training|inference|machine learning|ai/i.test(answers.workload || "")) return { route: "AIX", rule_id: "route-ai" };
  return { route: "ARCA", rule_id: goal === "unsure" ? "route-unsure-default" : "route-compute" };
};
export const discoverySchema = (route, level = "business") => ({
  route, level,
  required: [...common, ...(routeFields[route] || [])],
  optionalTechnical: level === "expert" ? ["rto_rpo", "redundancy", "security", "license", "remote_management", "power_facility_constraints"] : [],
  unknownAllowed: true,
});
export function completeness(route, answers = {}) {
  const fields = discoverySchema(route).required;
  const answered = fields.filter((field) => answers[field] !== undefined && answers[field] !== "" && answers[field] !== null);
  const unknown = answered.filter((field) => ["unknown", "tidak_tahu"].includes(String(answers[field]).toLowerCase()));
  const known = answered.filter((field) => !unknown.includes(field));
  return { score: Math.round((answered.length / fields.length) * 100), answered_score: Math.round((answered.length / fields.length) * 100), known_data_score: Math.round((known.length / fields.length) * 100), missing: fields.filter((field) => !answered.includes(field)), unknown, minimum_met: common.every((field) => answered.includes(field)) };
}
