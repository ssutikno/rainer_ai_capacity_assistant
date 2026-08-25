import { getRecommendation } from "../../../lib/rainer-api";
import { ResultActions } from "./ResultActions";

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
    <section className="saved-result-hero"><div><span className="eyebrow"><i /> Rekomendasi customer</span><h1>{result.config_name}</h1><p>{result.analysis_summary}</p><div className="saved-meta"><span><small>CUSTOMER</small><b>{result.lead.name}</b></span><span><small>PERUSAHAAN</small><b>{result.lead.company}</b></span><span><small>JALUR</small><b>{result.category}</b></span><span><small>CONFIDENCE</small><b>{confidenceLabel}</b></span></div></div><ResultActions /></section>
    <section className="saved-content-grid"><div className="saved-main"><article className="saved-card"><small>RINGKASAN SIZING</small><h2>Kapasitas sesuai kebutuhan dan ruang pertumbuhan</h2>{result.workload_profile && <p><b>{result.workload_profile.name}</b> — {result.workload_profile.formula}</p>}<div className="saved-requirements"><span><small>Kebutuhan saat ini</small><b>{result.sizing.current_demand}</b></span><span><small>Kapasitas rekomendasi</small><b>{result.sizing.recommended_capacity}</b></span><span><small>Headroom</small><b>{result.sizing.headroom_percent}%</b></span><span><small>Proyeksi {result.sizing.projection_horizon_years} tahun</small><b>{result.sizing.projected_capacity}</b></span></div></article><article className="saved-card"><small>SPESIFIKASI AWAL</small><h2>Komponen yang direkomendasikan backend</h2><div className="spec-list"><span><i>CPU</i><b>{result.components.cpu}</b></span><span><i>RAM</i><b>{result.components.ram}</b></span><span><i>DATA</i><b>{result.components.data_storage}</b></span><span><i>NET</i><b>{result.components.network}</b></span></div></article><article className="saved-card"><small>GOOD / BETTER / BEST</small><h2>Suggested specification setiap level</h2>{result.alternatives?.map((option) => <section key={option.tier}><h3>{option.tier.toUpperCase()}{option.recommended ? " — Direkomendasikan" : ""}</h3><p>{option.difference}</p><div className="spec-list">{Object.entries(option.suggested_specification).map(([key, value]) => <span key={key}><i>{key.toUpperCase()}</i><b>{value}</b></span>)}</div></section>)}</article><article className="saved-card"><small>ASUMSI & VALIDASI</small><h2>Perlu dikonfirmasi sebelum finalisasi</h2><ul className="saved-validation">{validation.map((item, index) => <li key={`${item.field}-${index}`}><span>{index + 1}</span><b>{item.field}: {item.reason}</b></li>)}</ul></article></div>
      <aside className="qr-result-card"><span className="eyebrow"><i /> Hasil yang sama</span><h2>Buka melalui QR</h2><p>Scan QR untuk membuka hasil yang disimpan oleh backend.</p><img src={`/api/results/${id}/qr`} alt={`QR menuju hasil ${result.config_name}`} width="260" height="260" /><a href={`/api/results/${id}/qr`} download={`rainer-${result.result_id}.svg`}>Unduh QR SVG ↓</a><code>/result/{id}</code></aside>
    </section>
    <div className="saved-disclaimer"><b>Rekomendasi awal, bukan quotation final.</b> Harga, stok, lead time, dan kompatibilitas akhir memerlukan validasi tim Rainer.</div>
  </main>;
}
