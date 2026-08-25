const roundUp = (value, step) => Math.ceil(value / step) * step;
const numberFrom = (value, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : fallback;
};
const known = (value) => value !== undefined && value !== null && value !== "" && !["unknown", "tidak_tahu"].includes(String(value).toLowerCase());
const tier = (name, multiplier, recommended, spec, difference) => ({ tier: name, recommended, difference, suggested_specification: spec(multiplier), configuration: Object.values(spec(multiplier)).join("; ") });

const PROFILES = {
  ARCA: [
    { id: "erp_database", label: "ERP & Database", match: /erp|database|sql|oracle|sap|odoo/i, cpuPerUser: 0.3, memoryBaseGb: 16, memoryPerUserGb: 0.2, storageBaseGb: 100, storageGrowthGbPerMonth: 0.2 },
    { id: "virtualization", label: "Virtualisasi", match: /\bvm\b|virtual|hypervisor|private cloud/i, cpuPerUser: 0.2, memoryBaseGb: 32, memoryPerUserGb: 0.5, storageBaseGb: 500, storageGrowthGbPerMonth: 2 },
    { id: "application_server", label: "Application/Web Server", match: /web|application|aplikasi|container|kubernetes/i, cpuPerUser: 0.15, memoryBaseGb: 16, memoryPerUserGb: 0.15, storageBaseGb: 200, storageGrowthGbPerMonth: 1 },
  ],
  STOR: [
    { id: "backup", label: "Backup Repository", match: /backup|repository|immutable/i, capacityBaseGb: 1000, capacityPerUserGb: 20, growthRate: 0.3 },
    { id: "archive", label: "Archive", match: /archive|arsip|retention/i, capacityBaseGb: 2000, capacityPerUserGb: 25, growthRate: 0.25 },
    { id: "file_sharing", label: "File Sharing", match: /file|sharing|nas|storage/i, capacityBaseGb: 500, capacityPerUserGb: 10, growthRate: 0.2 },
  ],
  AIX: [
    { id: "training", label: "AI Training/Fine-tuning", match: /train|fine.?tun/i, gpuVramGb: 48, gpuCount: 2, memoryGb: 256, storageGb: 4000 },
    { id: "computer_vision", label: "Computer Vision", match: /vision|camera|image|video analytics/i, gpuVramGb: 24, gpuCount: 1, memoryGb: 128, storageGb: 2000 },
    { id: "inference", label: "AI Inference/RAG", match: /inference|rag|llm|embedding|ai|machine learning/i, gpuVramGb: 24, gpuCount: 1, memoryGb: 128, storageGb: 1000 },
  ],
  WORX: [
    { id: "rendering", label: "Rendering/Video", match: /render|video|animation|dcc/i, cores: 16, memoryGb: 64, gpuVramGb: 16, storageGb: 2000 },
    { id: "cad_bim", label: "CAD/BIM", match: /cad|bim|revit|solidworks|desain|design/i, cores: 12, memoryGb: 32, gpuVramGb: 8, storageGb: 1000 },
    { id: "engineering", label: "Engineering/Data Science", match: /simulation|engineering|data science/i, cores: 16, memoryGb: 64, gpuVramGb: 12, storageGb: 1000 },
  ],
};

const fallbackProfile = {
  ARCA: { id: "general_compute", label: "General Compute", cpuPerUser: 0.2, memoryBaseGb: 16, memoryPerUserGb: 0.2, storageBaseGb: 200, storageGrowthGbPerMonth: 0.5 },
  STOR: { id: "general_storage", label: "General Storage", capacityBaseGb: 500, capacityPerUserGb: 10, growthRate: 0.2 },
  AIX: { id: "general_ai", label: "General AI Inference", gpuVramGb: 24, gpuCount: 1, memoryGb: 128, storageGb: 1000 },
  WORX: { id: "professional_workstation", label: "Professional Workstation", cores: 12, memoryGb: 32, gpuVramGb: 8, storageGb: 1000 },
};

export function selectWorkloadProfile(route, workload = "") {
  return (PROFILES[route] || []).find((profile) => profile.match.test(workload)) || fallbackProfile[route];
}

export function resolveWorkloadBaseline(route, answers = {}) {
  const profile = selectWorkloadProfile(route, answers.workload);
  const users = Math.max(1, numberFrom(answers.user_count, 1));
  const months = 36;
  let current;
  let spec;
  let formula;

  if (route === "ARCA") {
    const cores = roundUp(Math.max(8, users * profile.cpuPerUser), 4);
    const memoryGb = roundUp(Math.max(32, profile.memoryBaseGb + users * profile.memoryPerUserGb), 16);
    const storageGb = roundUp(profile.storageBaseGb + months * profile.storageGrowthGbPerMonth, 100);
    current = `${users} user; baseline ${cores} core, ${memoryGb} GB RAM, ${storageGb} GB usable`;
    formula = `${profile.cpuPerUser} core/user; RAM ${profile.memoryBaseGb} GB awal + ${profile.memoryPerUserGb} GB/user; storage ${profile.storageBaseGb} GB awal + ${profile.storageGrowthGbPerMonth} GB/bulan`;
    spec = (m) => ({ cpu: `${roundUp(cores * m, 4)} core server-grade`, ram: `${roundUp(memoryGb * m, 16)} GB ECC`, storage: `${roundUp(storageGb * m, 100)} GB usable enterprise SSD`, network: m >= 1.5 ? "Dual 25 GbE" : "Dual 10 GbE", availability: m >= 1.5 ? "2 node, HA-ready" : "1 node, redundant PSU/boot" });
  } else if (route === "STOR") {
    const capacityGb = roundUp(profile.capacityBaseGb + users * profile.capacityPerUserGb, 500);
    current = `${users} user; baseline ${capacityGb} GB usable`;
    formula = `${profile.capacityBaseGb} GB awal + ${profile.capacityPerUserGb} GB/user; proyeksi pertumbuhan ${Math.round(profile.growthRate * 100)}% selama 3 tahun`;
    spec = (m) => ({ cpu: `${roundUp(8 * m, 4)} core`, ram: `${roundUp(32 * m, 16)} GB ECC`, storage: `${roundUp(capacityGb * m, 500)} GB usable, dual-parity/RAID 6`, network: m >= 1.5 ? "Dual 25 GbE" : "Dual 10 GbE", availability: m >= 1.5 ? "Snapshot + immutable copy + replication-ready" : "Snapshot + separate backup copy" });
  } else if (route === "AIX") {
    current = `${profile.gpuCount} GPU, ${profile.gpuVramGb} GB VRAM/GPU, ${profile.memoryGb} GB system RAM, ${profile.storageGb} GB dataset storage`;
    formula = `Baseline ${profile.label}; jumlah GPU/VRAM akhir mengikuti model, precision, concurrency, dan ukuran dataset`;
    spec = (m) => ({ cpu: `${roundUp(24 * m, 8)} host core`, ram: `${roundUp(profile.memoryGb * m, 64)} GB ECC`, gpu: `${Math.max(1, Math.ceil(profile.gpuCount * m))} GPU, minimum ${profile.gpuVramGb} GB VRAM/GPU`, storage: `${roundUp(profile.storageGb * m, 500)} GB enterprise NVMe`, network: m >= 1.5 ? "Dual 100 GbE" : "Dual 25 GbE" });
  } else {
    current = `${profile.cores} core, ${profile.memoryGb} GB RAM, GPU ${profile.gpuVramGb} GB VRAM, ${profile.storageGb} GB local storage`;
    formula = `Baseline ${profile.label}; disesuaikan terhadap aplikasi ISV, ukuran scene/dataset, resolusi display, dan concurrency`;
    spec = (m) => ({ cpu: `${roundUp(profile.cores * m, 4)} high-frequency core`, ram: `${roundUp(profile.memoryGb * m, 16)} GB ECC`, gpu: `Professional GPU minimum ${roundUp(profile.gpuVramGb * m, 4)} GB VRAM`, storage: `${roundUp(profile.storageGb * m, 500)} GB NVMe`, network: m >= 1.5 ? "10 GbE" : "2.5 GbE" });
  }

  const alternatives = [
    tier("good", 1, false, spec, "Baseline awal dengan headroom minimum 20%"),
    tier("better", 1.5, true, spec, "Kapasitas 50% di atas Good untuk pertumbuhan dan operasional"),
    tier("best", 2, false, spec, "Kapasitas 2x baseline dan availability lebih tinggi"),
  ];
  return {
    profile_id: profile.id, profile_name: profile.label, source: "workload-baseline-v1", users, formula, current_demand: current,
    recommended_capacity: alternatives[1].configuration, projected_capacity: alternatives[2].configuration,
    components: alternatives[1].suggested_specification, alternatives,
    assumptions: [`Sizing menggunakan profil ${profile.label}`, `Baseline dihitung untuk proyeksi ${months} bulan`, `Nilai customer yang terukur harus menggantikan baseline ini`],
    input_quality: Object.values(answers).filter(known).length,
  };
}

export const WORKLOAD_PROFILES = PROFILES;
