"use client";

type Product = { solution_product_id: string; family: string; role: string; quantity: number; config_name: string };
type Link = { source_product_id: string; destination_product_id: string; purpose: string; traffic_class: string; estimated_bandwidth: string; recommended_link: string; redundancy: string };
const colors: Record<string, string> = { ARCA: "#dbeafe", STOR: "#dcfce7", AIX: "#f3e8ff", WORX: "#ffedd5" };
const strokes: Record<string, string> = { ARCA: "#2563eb", STOR: "#16a34a", AIX: "#9333ea", WORX: "#ea580c" };
const canvasWidth = 900, boxWidth = 190, boxHeight = 112;

function mermaidSource(products: Product[], links: Link[]) {
  const safe = (value: string) => value.replace(/["\[\]{}|]/g, " ").replace(/\s+/g, " ").trim();
  const lines = ["flowchart LR"];
  for (const product of products) lines.push(`  ${product.solution_product_id.replace(/-/g, "_")}["${safe(`${product.family} · ${product.config_name} · Qty ${product.quantity}`)}"]`);
  for (const link of links) lines.push(`  ${link.source_product_id.replace(/-/g, "_")} -->|"${safe(`${link.traffic_class} · ${link.recommended_link} · ${link.estimated_bandwidth}`)}"| ${link.destination_product_id.replace(/-/g, "_")}`);
  lines.push("  classDef arca fill:#dbeafe,stroke:#2563eb,stroke-width:2px", "  classDef stor fill:#dcfce7,stroke:#16a34a,stroke-width:2px", "  classDef aix fill:#f3e8ff,stroke:#9333ea,stroke-width:2px", "  classDef worx fill:#ffedd5,stroke:#ea580c,stroke-width:2px");
  for (const product of products) lines.push(`  class ${product.solution_product_id.replace(/-/g, "_")} ${product.family.toLowerCase()}`);
  return lines.join("\n");
}

function layout(products: Product[]) {
  const gap = products.length > 1 ? Math.min(90, (canvasWidth - 80 - products.length * boxWidth) / (products.length - 1)) : 0;
  return new Map(products.map((product, index) => [product.solution_product_id, { x: products.length === 1 ? (canvasWidth - boxWidth) / 2 : 40 + index * (boxWidth + gap), y: 90 }]));
}

function excalidrawScene(products: Product[], links: Link[]) {
  const positions = layout(products), elements: Record<string, unknown>[] = [], timestamp = Date.now();
  for (const product of products) {
    const point = positions.get(product.solution_product_id)!;
    const text = `${product.family}\n${product.config_name}\nQty ${product.quantity} · ${product.role}`;
    elements.push({ id: product.solution_product_id, type: "rectangle", x: point.x, y: point.y, width: boxWidth, height: boxHeight, angle: 0, strokeColor: strokes[product.family] || "#334155", backgroundColor: colors[product.family] || "#f1f5f9", fillStyle: "solid", strokeWidth: 2, roughness: 1, opacity: 100, groupIds: [], frameId: null, roundness: { type: 3 }, seed: 1000 + elements.length, version: 1, versionNonce: 1, isDeleted: false, boundElements: [{ id: `${product.solution_product_id}-label`, type: "text" }], updated: timestamp, link: null, locked: false });
    elements.push({ id: `${product.solution_product_id}-label`, type: "text", x: point.x + 12, y: point.y + 18, width: boxWidth - 24, height: 70, angle: 0, strokeColor: "#0f172a", backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 1, roughness: 1, opacity: 100, groupIds: [], frameId: null, seed: 2000 + elements.length, version: 1, versionNonce: 1, isDeleted: false, boundElements: null, updated: timestamp, link: null, locked: false, text, fontSize: 16, fontFamily: 1, textAlign: "center", verticalAlign: "middle", containerId: product.solution_product_id, originalText: text, lineHeight: 1.25 });
  }
  for (const [index, link] of links.entries()) {
    const from = positions.get(link.source_product_id), to = positions.get(link.destination_product_id); if (!from || !to) continue;
    const distance = to.x - from.x - boxWidth;
    elements.push({ id: `link-${index + 1}`, type: "arrow", x: from.x + boxWidth, y: from.y + boxHeight / 2, width: distance, height: 0, angle: 0, strokeColor: "#475569", backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 2, roughness: 1, opacity: 100, groupIds: [], frameId: null, seed: 3000 + index, version: 1, versionNonce: 1, isDeleted: false, boundElements: [], updated: timestamp, link: null, locked: false, points: [[0, 0], [distance, 0]], lastCommittedPoint: null, startBinding: { elementId: link.source_product_id, focus: 0, gap: 1 }, endBinding: { elementId: link.destination_product_id, focus: 0, gap: 1 }, startArrowhead: null, endArrowhead: "arrow", elbowed: false });
  }
  return { type: "excalidraw", version: 2, source: "https://github.com/yctimlin/mcp_excalidraw", elements, appState: { gridSize: 20, viewBackgroundColor: "#ffffff" }, files: {}, rainer: { generator: "mermaid-to-excalidraw", mcp_tool: "create_from_mermaid", mermaid: mermaidSource(products, links) } };
}

export function SolutionDiagram({ products, links, resultId }: { products: Product[]; links: Link[]; resultId: string }) {
  const positions = layout(products);
  function download() {
    const blob = new Blob([JSON.stringify(excalidrawScene(products, links), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url; anchor.download = `rainer-${resultId}-interconnection.excalidraw`; anchor.click(); URL.revokeObjectURL(url);
  }
  function downloadMermaid() {
    const blob = new Blob([mermaidSource(products, links)], { type: "text/plain" });
    const url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url; anchor.download = `rainer-${resultId}-interconnection.mmd`; anchor.click(); URL.revokeObjectURL(url);
  }
  return <article className="saved-card solution-diagram-card"><div className="section-head"><div><small>MERMAID → MCP_EXCALIDRAW</small><h2>Gambar koneksi produk yang diusulkan</h2></div><div className="diagram-downloads"><button type="button" onClick={downloadMermaid}>Mermaid .mmd ↓</button><button type="button" onClick={download}>Excalidraw ↓</button></div></div><p>Mermaid menjadi sumber topology yang konsisten. Scene Excalidraw menyertakan source tersebut untuk tool <code>create_from_mermaid</code>, kemudian mempertahankan produk, bandwidth, dan redundancy dari desain AI.</p><div className="solution-diagram-scroll"><svg viewBox={`0 0 ${canvasWidth} 360`} role="img" aria-label="Diagram interconnection produk Rainer">
    <defs><marker id="solution-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#475569" /></marker></defs>
    {links.map((link, index) => { const from = positions.get(link.source_product_id), to = positions.get(link.destination_product_id); if (!from || !to) return null; const x1=from.x+boxWidth, x2=to.x, y=from.y+boxHeight/2; return <g key={`${link.source_product_id}-${link.destination_product_id}-${index}`}><path d={`M ${x1} ${y} C ${x1+40} ${y}, ${x2-40} ${y}, ${x2} ${y}`} fill="none" stroke="#475569" strokeWidth="3" markerEnd="url(#solution-arrow)" /><rect x={(x1+x2)/2-92} y={y+18} width="184" height="58" rx="10" fill="#fff" stroke="#cbd5e1" /><text x={(x1+x2)/2} y={y+38} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">{link.traffic_class.toUpperCase()}</text><text x={(x1+x2)/2} y={y+55} textAnchor="middle" fontSize="11" fill="#475569">{link.recommended_link}</text><text x={(x1+x2)/2} y={y+69} textAnchor="middle" fontSize="10" fill="#64748b">{link.estimated_bandwidth}</text></g> })}
    {products.map((product) => { const point=positions.get(product.solution_product_id)!; return <g key={product.solution_product_id}><rect x={point.x} y={point.y} width={boxWidth} height={boxHeight} rx="16" fill={colors[product.family] || "#f1f5f9"} stroke={strokes[product.family] || "#334155"} strokeWidth="3" /><text x={point.x+boxWidth/2} y={point.y+28} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">{product.family}</text><text x={point.x+boxWidth/2} y={point.y+52} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">{product.config_name}</text><text x={point.x+boxWidth/2} y={point.y+73} textAnchor="middle" fontSize="11" fill="#475569">Qty {product.quantity} · {product.role}</text><text x={point.x+boxWidth/2} y={point.y+94} textAnchor="middle" fontSize="10" fill="#64748b">{product.solution_product_id}</text></g> })}
    <text x="450" y="325" textAnchor="middle" fontSize="12" fill="#64748b">Final NIC/HBA, switch, transceiver, cable, port, firmware, dan QVL memerlukan validasi Rainer.</text>
  </svg></div></article>;
}
