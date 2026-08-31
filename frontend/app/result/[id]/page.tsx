import { getRecommendation } from "../../../lib/rainer-api";
import { ResultActions } from "./ResultActions";
import { SolutionDiagram } from "./SolutionDiagram";

export const dynamic = "force-dynamic";

export default async function SavedResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let payload;
  try { payload = await getRecommendation(id); } catch { payload = null; }
  if (!payload) return <main className="expired-result"><span>R</span><h1>Hasil tidak tersedia</h1><p>Link mungkin sudah kedaluwarsa, tidak valid, atau backend sedang tidak dapat dihubungi.</p><a href="/">Buat konfigurasi baru →</a></main>;

  const result = payload.result;
  const validation = result.validation_required || [];
  const expires = new Date(payload.share.expires_at).toLocaleDateString("id-ID", { dateStyle: "long" });
  const confidenceLabel = { low: "Rendah", medium: "Sedang", high: "Tinggi" }[result.confidence] || result.confidence;
  return <main className="saved-result-page">
    <header className="saved-result-header"><a className="brand" href="/" aria-label="Kembali ke halaman awal"><img src="/rainer-logo.png" alt="Rainer Dynamic Server Solution" /></a><span>Hasil backend · Berlaku hingga {expires}</span></header>
    <section className="saved-result-hero"><div><span className="eyebrow"><i /> Desain solusi customer</span><h1>{result.solution_name || result.config_name}</h1><p>{result.analysis_summary}</p><div className="saved-meta"><span><small>CUSTOMER</small><b>{result.lead.name}</b></span><span><small>PERUSAHAAN</small><b>{result.lead.company}</b></span><span><small>PRODUK SOLUSI</small><b>{result.routes?.join(" + ") || result.category}</b></span><span><small>CONFIDENCE</small><b>{confidenceLabel}</b></span></div></div><ResultActions /></section>
    <section className="saved-content-grid"><div className="saved-main">
      {result.network_architecture && <article className="saved-card"><small>ARSITEKTUR NETWORK AI</small><h2>{result.network_architecture.topology}</h2><p>{result.network_architecture.capacity_rationale}</p><div className="saved-requirements"><span><small>Segmen</small><b>{result.network_architecture.segments.join(" · ")}</b></span><span><small>Switching</small><b>{result.network_architecture.switching_requirements}</b></span><span><small>Resilience</small><b>{result.network_architecture.resilience_strategy}</b></span></div></article>}
      {result.products?.length ? <SolutionDiagram products={result.products} links={result.interconnections || []} resultId={result.result_id} /> : null}
      {result.products?.map((product) => <article className="saved-card" key={product.solution_product_id}><small>{product.family} · {product.role} · QTY {product.quantity}</small><h2>{product.config_name}</h2><div className="saved-requirements"><span><small>Kebutuhan saat ini</small><b>{product.sizing.current_demand}</b></span><span><small>Kapasitas rekomendasi</small><b>{product.sizing.recommended_capacity}</b></span><span><small>Headroom</small><b>{product.sizing.headroom_percent}%</b></span><span><small>Proyeksi</small><b>{product.sizing.projected_capacity}</b></span></div><div className="spec-list">{Object.entries(product.components).map(([key, value]) => <span key={key}><i>{key.toUpperCase()}</i><b>{value}</b></span>)}</div></article>)}
      {result.interconnections?.length ? <article className="saved-card"><small>INTERCONNECTION</small><h2>Hubungan antarproduk yang disizing untuk workload</h2>{result.interconnections.map((link, index) => <section key={`${link.source_product_id}-${link.destination_product_id}-${index}`}><h3>{link.source_product_id} → {link.destination_product_id}</h3><p>{link.purpose}</p><div className="saved-requirements"><span><small>Traffic / Protocol</small><b>{link.traffic_class} · {link.protocol}</b></span><span><small>Bandwidth</small><b>{link.estimated_bandwidth}</b></span><span><small>Link</small><b>{link.quantity}× {link.recommended_link}</b></span><span><small>Redundancy</small><b>{link.redundancy}</b></span></div></section>)}</article> : null}
      {!result.products?.length && <><article className="saved-card"><small>RINGKASAN SIZING</small><h2>Kapasitas sesuai kebutuhan dan ruang pertumbuhan</h2><div className="saved-requirements"><span><small>Kebutuhan saat ini</small><b>{result.sizing.current_demand}</b></span><span><small>Kapasitas rekomendasi</small><b>{result.sizing.recommended_capacity}</b></span><span><small>Headroom</small><b>{result.sizing.headroom_percent}%</b></span><span><small>Proyeksi</small><b>{result.sizing.projected_capacity}</b></span></div></article></>}
      <article className="saved-card"><small>ASUMSI & VALIDASI</small><h2>Perlu dikonfirmasi sebelum finalisasi</h2><ul className="saved-validation">{validation.map((item, index) => <li key={`${item.field}-${index}`}><span>{index + 1}</span><b>{item.field}: {item.reason}</b></li>)}</ul></article></div>
      <aside className="qr-result-card"><span className="eyebrow"><i /> Hasil yang sama</span><h2>Buka melalui QR</h2><p>Scan QR untuk membuka hasil yang disimpan oleh backend.</p><img src={`/api/results/${id}/qr`} alt={`QR menuju hasil ${result.config_name}`} width="260" height="260" /><a href={`/api/results/${id}/qr`} download={`rainer-${result.result_id}.svg`}>Unduh QR SVG ↓</a><code>/result/{id}</code></aside>
    </section>
    <div className="saved-disclaimer"><b>Desain solusi awal, bukan quotation final.</b> Harga, stok, lead time, NIC/HBA, switch, transceiver, kabel, firmware, QVL, fasilitas, dan kompatibilitas akhir memerlukan validasi tim Rainer.</div>
  </main>;
}
