"use client";

import { useEffect, useMemo, useState } from "react";

type Transaction = {
  session_id: string;
  result_id: string | null;
  lead: { lead_id: string; name: string; company: string; company_email: string; whatsapp_e164: string; created_at: string };
  route: "ARCA" | "STOR" | "AIX" | "WORX" | null;
  completeness: number;
  confidence: "high" | "medium" | "low" | null;
  delivery_status: string | null;
  review_status: string;
};

type ResultDetail = {
  recommendation?: { result_id: string; config_name: string; category: string; confidence: string; sizing?: { current_demand: string; recommended_capacity: string; headroom_percent: number; projected_capacity: string }; scalability?: { scale_up: string[]; scale_out: string[]; triggers: string[] }; validation_required?: { field: string; reason: string }[] };
  requirement?: { technical_level: string; answers: Record<string, unknown> };
};

const statusLabels: Record<string, string> = { new: "Baru", in_review: "Ditinjau", needs_info: "Perlu Info", validated: "Tervalidasi", contacted: "Dihubungi", won: "Won", lost: "Lost" };
const routeNames: Record<string, string> = { ARCA: "Compute", STOR: "Storage", AIX: "AI & GPU", WORX: "Workstation" };

export default function DashboardPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:4000");
  const [adminKey, setAdminKey] = useState("");
  const [items, setItems] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [detail, setDetail] = useState<ResultDetail | null>(null);

  useEffect(() => {
    setApiUrl(sessionStorage.getItem("rainer_api_url") || "http://localhost:4000");
    setAdminKey(sessionStorage.getItem("rainer_admin_key") || "");
  }, []);

  async function load() {
    if (!adminKey) { setError("Masukkan admin API key untuk membuka data transaksi."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/v1/admin/leads`, { headers: { "x-admin-api-key": adminKey } });
      if (!response.ok) throw new Error(response.status === 401 ? "Admin API key tidak valid." : `Backend merespons HTTP ${response.status}.`);
      const payload = await response.json();
      setItems(payload.items || []); setLastUpdated(new Date());
      sessionStorage.setItem("rainer_api_url", apiUrl); sessionStorage.setItem("rainer_admin_key", adminKey);
    } catch (err) { setError(err instanceof Error ? err.message : "Tidak dapat mengambil transaksi."); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => items.filter((item) => {
    const text = `${item.lead.name} ${item.lead.company} ${item.lead.company_email} ${item.session_id}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (route === "all" || item.route === route) && (status === "all" || item.review_status === status);
  }), [items, query, route, status]);

  const metrics = useMemo(() => ({
    total: items.length,
    generated: items.filter((x) => x.confidence).length,
    qualified: items.filter((x) => x.completeness >= 80).length,
    attention: items.filter((x) => x.confidence === "low" || x.review_status === "needs_info").length,
  }), [items]);

  async function changeStatus(item: Transaction, next: string) {
    const resultId = await findResultId(item);
    if (!resultId) { setError("Transaksi ini belum memiliki recommendation result."); return; }
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/v1/admin/results/${resultId}/review`, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-api-key": adminKey }, body: JSON.stringify({ status: next, reviewer_id: "dashboard" }) });
    if (!response.ok) { setError("Status belum dapat diperbarui."); return; }
    setItems((current) => current.map((x) => x.session_id === item.session_id ? { ...x, review_status: next } : x));
  }

  async function findResultId(item: Transaction) {
    return item.result_id;
  }

  async function openDetail(item: Transaction) {
    setError(""); const resultId = await findResultId(item);
    if (!resultId) { setError("Detail rekomendasi belum tersedia untuk transaksi ini."); return; }
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/v1/admin/results/${resultId}`, { headers: { "x-admin-api-key": adminKey } });
    if (!response.ok) { setError("Detail rekomendasi tidak dapat dibuka."); return; }
    setDetail(await response.json());
  }

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-logo" href="/"><span>R</span><div><b>RAINER</b><small>AI ASSISTANT</small></div></a>
      <nav><a className="active" href="/dashboard"><i>◫</i> Overview</a><a href="#transactions"><i>↗</i> Transaksi</a><a href="#pipeline"><i>◇</i> Pipeline Review</a></nav>
      <div className="admin-sidebar-note"><small>KNOWLEDGE BASE</small><b>Rainer KB v1.3.0</b><span><i /> Aktif</span></div>
      <a className="admin-back" href="/">← Kembali ke configurator</a>
    </aside>

    <section className="admin-main">
      <header className="admin-header"><div><span>INTERNAL WORKSPACE</span><h1>Transaction Intelligence</h1><p>Pantau lead, kualitas discovery, dan kesiapan rekomendasi dalam satu tampilan.</p></div><div className="admin-header-actions"><span>{lastUpdated ? `Diperbarui ${lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : "Belum disinkronkan"}</span><button onClick={load} disabled={loading}>{loading ? "Mengambil data…" : "↻ Sinkronkan"}</button></div></header>

      <section className="admin-connect"><label>Backend URL<input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} /></label><label>Admin API key<input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Masukkan key" /></label><button onClick={load}>Hubungkan dashboard</button><small>Key hanya disimpan selama tab ini terbuka.</small></section>
      {error && <div className="admin-error">! {error}</div>}

      <section className="admin-metrics">
        <article><span>Total transaksi</span><strong>{metrics.total}</strong><small>Seluruh sesi customer</small></article>
        <article><span>Rekomendasi siap</span><strong>{metrics.generated}</strong><small>{metrics.total ? Math.round(metrics.generated / metrics.total * 100) : 0}% dari transaksi</small></article>
        <article><span>Qualified leads</span><strong>{metrics.qualified}</strong><small>Completeness ≥ 80%</small></article>
        <article className="attention"><span>Perlu perhatian</span><strong>{metrics.attention}</strong><small>Confidence rendah / needs info</small></article>
      </section>

      <section className="admin-panel" id="transactions">
        <div className="admin-panel-head"><div><span>LIVE TRANSACTIONS</span><h2>Aktivitas configurator</h2></div><div className="admin-filters"><input aria-label="Cari transaksi" placeholder="Cari nama, perusahaan, email…" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="Filter jalur" value={route} onChange={(e) => setRoute(e.target.value)}><option value="all">Semua jalur</option>{Object.keys(routeNames).map((key) => <option key={key}>{key}</option>)}</select><select aria-label="Filter status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Semua status</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></div>
        <div className="admin-table-wrap"><table><thead><tr><th>Customer</th><th>Jalur</th><th>Kelengkapan</th><th>Confidence</th><th>Delivery</th><th>Status review</th><th /></tr></thead><tbody>
          {filtered.map((item) => <tr key={item.session_id}><td><b>{item.lead.name}</b><span>{item.lead.company}</span><small>{item.lead.company_email}</small></td><td>{item.route ? <span className={`route-badge route-${item.route.toLowerCase()}`}>{item.route}<small>{routeNames[item.route]}</small></span> : <span className="muted">Belum dipilih</span>}</td><td><div className="completion"><b>{item.completeness}%</b><i><span style={{ width: `${item.completeness}%` }} /></i></div></td><td><span className={`confidence confidence-${item.confidence || "none"}`}><i />{item.confidence === "high" ? "Tinggi" : item.confidence === "medium" ? "Sedang" : item.confidence === "low" ? "Rendah" : "Belum ada"}</span></td><td><span className="delivery">{item.delivery_status === "accepted" ? "✓ Email accepted" : item.delivery_status || "Belum dikirim"}</span></td><td><select value={item.review_status} onChange={(e) => changeStatus(item, e.target.value)} aria-label={`Status ${item.lead.name}`}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td><td><button className="row-action" onClick={() => openDetail(item)}>Lihat →</button></td></tr>)}
          {!filtered.length && <tr><td colSpan={7}><div className="admin-empty"><span>◎</span><b>{items.length ? "Tidak ada transaksi yang cocok" : "Belum ada data transaksi"}</b><p>{items.length ? "Ubah filter atau kata pencarian." : "Hubungkan dashboard atau selesaikan transaksi dari configurator."}</p></div></td></tr>}
        </tbody></table></div>
      </section>

      <section className="admin-insight-grid" id="pipeline"><article><span>PIPELINE HEALTH</span><h3>Kualitas discovery</h3><div className="pipeline-chart">{["ARCA","STOR","AIX","WORX"].map((key) => { const count = items.filter((x) => x.route === key).length; const pct = items.length ? Math.max(8, count / items.length * 100) : 8; return <div key={key}><b>{key}</b><i><span style={{ width: `${pct}%` }} /></i><strong>{count}</strong></div> })}</div></article><article className="review-focus"><span>REVIEW FOCUS</span><h3>Prioritas hari ini</h3><strong>{metrics.attention}</strong><p>transaksi membutuhkan validasi atau informasi tambahan sebelum ditindaklanjuti.</p></article></section>
    </section>

    {detail && <div className="admin-modal-backdrop" onMouseDown={() => setDetail(null)}><section className="admin-detail" onMouseDown={(e) => e.stopPropagation()}><button onClick={() => setDetail(null)}>×</button><span>RECOMMENDATION DETAIL</span><h2>{detail.recommendation?.config_name}</h2><div className="detail-meta"><b>{detail.recommendation?.category}</b><b>{detail.recommendation?.confidence} confidence</b><b>{detail.requirement?.technical_level}</b></div>{detail.recommendation?.sizing && <div className="detail-sizing"><article><small>Demand saat ini</small><p>{detail.recommendation.sizing.current_demand}</p></article><article><small>Rekomendasi</small><p>{detail.recommendation.sizing.recommended_capacity}</p></article><article><small>Headroom</small><strong>{detail.recommendation.sizing.headroom_percent}%</strong></article><article><small>Proyeksi</small><p>{detail.recommendation.sizing.projected_capacity}</p></article></div>}<h3>Trigger skalabilitas</h3><ul>{detail.recommendation?.scalability?.triggers?.map((item) => <li key={item}>{item}</li>) || <li>Belum tersedia</li>}</ul><h3>Perlu validasi</h3><ul>{detail.recommendation?.validation_required?.map((item) => <li key={`${item.field}-${item.reason}`}><b>{item.field}</b> — {item.reason}</li>) || <li>Tidak ada item</li>}</ul></section></div>}
  </main>;
}
