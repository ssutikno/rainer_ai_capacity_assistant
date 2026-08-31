import { buildRecommendation, guardrailLint } from "./recommendation.js";

const routeRole = { ARCA: "Compute dan aplikasi", STOR: "Primary storage, backup, dan retensi", AIX: "AI/GPU acceleration", WORX: "Endpoint workstation profesional" };

function fallbackNetwork(products) {
  if (products.length < 2) return {
    topology: "Standalone dengan jaringan management dan workload terpisah secara logis",
    segments: ["Management", "Workload/production"], switching_requirements: "Switch managed redundant direkomendasikan untuk workload kritis; port dan model perlu validasi",
    resilience_strategy: "Dual NIC dan dual path bila platform mendukung", capacity_rationale: "Mengikuti bandwidth pada spesifikasi produk dengan headroom minimum 20%",
    expansion_triggers: ["Utilisasi link p95 melebihi 70%", "Port tersedia kurang dari 20%"],
  };
  return {
    topology: "Redundant leaf/access switching dengan jalur A/B antarproduk",
    segments: ["Management", "Workload/production", "Storage/data", "Backup/replication"],
    switching_requirements: "Sepasang switch managed; minimum dual 25 GbE per server/storage dan dual 100 GbE untuk fabric AIX scale-out, disesuaikan hasil validasi workload",
    resilience_strategy: "Dual-homing, multipathing, dan tidak ada single point of failure untuk trafik kritis",
    capacity_rationale: "Bandwidth agregat mengikuti baseline produk, concurrency, perpindahan data, dan pertumbuhan dengan headroom minimum 20%",
    expansion_triggers: ["Utilisasi link p95 melebihi 70% selama 30 hari", "Oversubscription workload kritis melebihi 3:1", "Port bebas kurang dari 20%"],
  };
}

function fallbackInterconnections(products) {
  const links = [];
  for (let index = 0; index < products.length - 1; index += 1) {
    const source = products[index], destination = products[index + 1];
    const aiFabric = source.family === "AIX" || destination.family === "AIX";
    links.push({
      source_product_id: source.solution_product_id, destination_product_id: destination.solution_product_id,
      purpose: destination.family === "STOR" ? "Akses dataset, data aplikasi, backup, atau replikasi" : "Pertukaran data workload dan layanan",
      traffic_class: destination.family === "STOR" ? "storage" : aiFabric ? "ai_fabric" : "production",
      protocol: destination.family === "STOR" ? "NFS/SMB/iSCSI atau FC setelah validasi" : "Ethernet/IP",
      estimated_bandwidth: aiFabric ? "Minimum 100 Gbps agregat untuk scale-out AIX; validasi profil komunikasi model" : "Minimum 25 Gbps agregat dengan 20% headroom",
      recommended_link: aiFabric ? "Dual 100 GbE atau fabric tervalidasi" : "Dual 25 GbE",
      quantity: Math.max(2, source.quantity * 2, destination.quantity * 2), redundancy: "Dual link per unit melalui jalur A/B dan perangkat terpisah", assumptions: ["Belum ada telemetry jaringan aktual"],
      validation_required: ["NIC/HBA, switch, transceiver, kabel, firmware, protocol, MTU, dan support matrix kedua endpoint"],
    });
  }
  return links;
}

export function buildSolutionRecommendation({ routes, answers, completeness, technical_level, versions, productInputs, networkResult }) {
  const products = productInputs.map(({ route, quantity = 1, aiResult, baseline }, index) => {
    const built = buildRecommendation({ route, answers, completeness, technical_level, versions, aiResult, baseline });
    return { solution_product_id: `product-${index + 1}`, family: route, role: routeRole[route], quantity, ...built.recommendation };
  });
  const network = networkResult?.network_architecture || fallbackNetwork(products);
  const interconnections = networkResult?.interconnections?.length ? networkResult.interconnections : fallbackInterconnections(products);
  const validation = [...new Set([...products.flatMap((product) => product.validation_required.map((item) => `${product.family}.${item.field}: ${item.reason}`)), ...interconnections.flatMap((link) => link.validation_required || [])])];
  const confidence = products.some((product) => product.confidence === "low") ? "low" : products.some((product) => product.confidence === "medium") || validation.length > 4 ? "medium" : "high";
  const primary = products[0];
  const recommendation = {
    version: 3, solution_type: products.length > 1 ? "multi_product" : "single_product", solution_name: `${routes.join(" + ")} Solution Architecture`,
    analysis_summary: networkResult?.analysis_summary || `Solusi ${routes.join(" + ")} disusun sebagai satu arsitektur dengan jaringan yang disizing terhadap workload, pertumbuhan, dan ketersediaan.`,
    routes, products, interconnections, network_architecture: network,
    solution_validation_required: validation.map((reason, index) => ({ field: `solution_validation_${index + 1}`, reason })), confidence,
    disclaimer: "Desain solusi awal, bukan quotation final. Model produk, harga, stok, lead time, NIC/HBA, switch, transceiver, kabel, firmware, QVL, fasilitas, dan kompatibilitas akhir memerlukan validasi tim Rainer.",
    provenance: { ...versions, model: networkResult?.provenance?.model || primary.provenance.model, network_design_source: networkResult ? "ai" : "deterministic-fallback", decision_trace: [{ step: "multi_route", value: routes }, { step: "products", value: products.map((p) => p.family) }, { step: "network_sizing", value: network.capacity_rationale }, { step: "confidence", value: confidence }] },
    // Compatibility projection for v1 clients.
    category: products.length > 1 ? "SOLUTION" : primary.category, config_name: products.length > 1 ? `${routes.join(" + ")} Solution Architecture` : primary.config_name,
    product_id: primary.product_id, components: primary.components, sizing: primary.sizing, scalability: primary.scalability, alternatives: primary.alternatives,
    workload_profile: primary.workload_profile, rationale: primary.rationale, assumptions: [...new Set(products.flatMap((p) => p.assumptions))], risks: [...new Set(products.flatMap((p) => p.risks))], validation_required: validation.map((reason, index) => ({ field: `solution_validation_${index + 1}`, reason })),
  };
  return { recommendation, lint: guardrailLint({ ...recommendation, disclaimer: "" }) };
}
