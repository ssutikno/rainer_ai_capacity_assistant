"use client";

import { useMemo, useState } from "react";

type Step = "landing" | "identity" | "level" | "goal" | "discovery" | "review" | "processing" | "result";
type Level = "Bisnis" | "Menengah" | "Expert";
type DetailQuestion = { key: string; title: string; options: string[] };

const steps: Step[] = ["identity", "level", "goal", "discovery", "review", "processing", "result"];

const levelOptions: { id: Level; eyebrow: string; title: string; text: string; example: string }[] = [
  { id: "Bisnis", eyebrow: "Sederhana & terpandu", title: "Awam / Bisnis", text: "Saya ingin menjelaskan kebutuhan bisnis dan belum terbiasa memilih spesifikasi server.", example: "Contoh: Saya tahu jumlah pengguna dan aplikasi, tetapi belum tahu kebutuhan RAM." },
  { id: "Menengah", eyebrow: "Seimbang", title: "Menengah", text: "Saya memahami komponen dasar seperti CPU, RAM, storage, GPU, dan network.", example: "Contoh: Saya punya perkiraan kapasitas dan ingin membandingkan beberapa opsi." },
  { id: "Expert", eyebrow: "Kontrol lebih rinci", title: "Teknis / Expert", text: "Saya terbiasa melakukan sizing, arsitektur, atau pengadaan infrastruktur.", example: "Contoh: Saya ingin memasukkan IOPS, topologi, dan constraint platform." },
];

const goals = [
  { id: "compute", icon: "▦", title: "Menjalankan aplikasi bisnis", text: "ERP, database, virtualisasi, dan layanan internal", route: "ARCA" },
  { id: "storage", icon: "▤", title: "Menyimpan & melindungi data", text: "File sharing, backup, arsip, dan data bertumbuh", route: "STOR" },
  { id: "ai", icon: "✦", title: "AI, GPU & komputasi intensif", text: "Training, inference, rendering, dan simulasi", route: "AIX" },
  { id: "workstation", icon: "▰", title: "Workstation profesional", text: "CAD, desain, video, dan kebutuhan single-user", route: "WORX" },
  { id: "unsure", icon: "?", title: "Belum yakin", text: "Ceritakan kebutuhan Anda, kami bantu arahkan", route: "ARCA" },
];

const intermediateQuestions: Record<string, DetailQuestion[]> = {
  ARCA: [
    { key: "vm_count_or_size", title: "Berapa banyak VM atau instance yang direncanakan?", options: ["1–5 VM", "6–15 VM", "16–30 VM", "> 30 VM", "Belum tahu"] },
    { key: "hypervisor", title: "Platform virtualisasi yang digunakan?", options: ["VMware", "Hyper-V", "Proxmox", "Bare metal", "Belum tahu"] },
    { key: "growth_3_5_years", title: "Perkiraan pertumbuhan dalam 3–5 tahun?", options: ["< 20%", "20–40%", "40–70%", "> 70%", "Belum tahu"] },
  ],
  STOR: [
    { key: "usable_capacity_tb", title: "Berapa kapasitas data terpakai saat ini?", options: ["< 5 TB", "5–20 TB", "21–50 TB", "> 50 TB", "Belum tahu"] },
    { key: "growth", title: "Seberapa cepat data bertumbuh per tahun?", options: ["< 20%", "20–40%", "40–70%", "> 70%", "Belum tahu"] },
    { key: "retention", title: "Berapa lama data perlu disimpan?", options: ["< 1 tahun", "1–3 tahun", "3–5 tahun", "> 5 tahun", "Belum tahu"] },
  ],
  AIX: [
    { key: "ai_mode", title: "Jenis pekerjaan AI yang paling dominan?", options: ["Inference", "Fine-tuning", "Training", "Rendering/simulasi", "Belum tahu"] },
    { key: "model_framework", title: "Framework atau aplikasi yang digunakan?", options: ["PyTorch", "TensorFlow", "LLM lokal", "Aplikasi khusus", "Belum tahu"] },
    { key: "concurrency", title: "Berapa banyak job atau pengguna bersamaan?", options: ["1–5", "6–20", "21–50", "> 50", "Belum tahu"] },
  ],
  WORX: [
    { key: "application_isv", title: "Aplikasi profesional utama yang digunakan?", options: ["AutoCAD/Revit", "SolidWorks", "Adobe/DaVinci", "3D/rendering", "Belum tahu"] },
    { key: "gpu_vram", title: "Kelas kebutuhan GPU yang diperkirakan?", options: ["Entry", "Mid-range", "High-end", "Multi-GPU", "Belum tahu"] },
    { key: "storage", title: "Kapasitas penyimpanan kerja lokal?", options: ["< 1 TB", "1–2 TB", "2–4 TB", "> 4 TB", "Belum tahu"] },
  ],
};

const expertQuestions: Record<string, DetailQuestion[]> = {
  ARCA: [
    { key: "cpu_need", title: "Baseline utilisasi atau kebutuhan CPU?", options: ["≤ 16 core", "17–32 core", "33–64 core", "> 64 core", "Belum tahu"] },
    { key: "ram_peak", title: "Working set RAM saat peak?", options: ["≤ 128 GB", "256 GB", "512 GB", "≥ 1 TB", "Belum tahu"] },
    { key: "ha_reserve", title: "Target high availability reserve?", options: ["Tanpa HA", "N+1", "N+2", "Cluster aktif-aktif", "Belum tahu"] },
    { key: "network", title: "Kebutuhan network antarsistem?", options: ["1 GbE", "10 GbE", "25 GbE", "≥ 100 GbE", "Belum tahu"] },
    { key: "rack", title: "Kesiapan rack dan fasilitas?", options: ["Rack tersedia", "Tower/non-rack", "Perlu site survey", "Colocation", "Belum tahu"] },
  ],
  STOR: [
    { key: "performance_target", title: "Target performa storage?", options: ["Capacity-first", "< 20K IOPS", "20K–100K IOPS", "> 100K IOPS", "Belum tahu"] },
    { key: "protocol", title: "Protokol akses utama?", options: ["SMB/NFS", "iSCSI", "Fibre Channel", "Object/S3", "Belum tahu"] },
    { key: "snapshot", title: "Kebutuhan snapshot dan replikasi?", options: ["Snapshot lokal", "Replikasi async", "Replikasi sync", "Multi-site", "Belum tahu"] },
    { key: "backup_immutable", title: "Apakah backup immutable diperlukan?", options: ["Wajib", "Diutamakan", "Tidak", "Sudah tersedia", "Belum tahu"] },
  ],
  AIX: [
    { key: "precision", title: "Precision komputasi utama?", options: ["INT8/FP8", "FP16/BF16", "FP32", "Mixed precision", "Belum tahu"] },
    { key: "dataset", title: "Ukuran dataset aktif?", options: ["< 1 TB", "1–10 TB", "11–50 TB", "> 50 TB", "Belum tahu"] },
    { key: "vram", title: "Target total VRAM?", options: ["≤ 24 GB", "48–80 GB", "81–160 GB", "> 160 GB", "Belum tahu"] },
    { key: "gpu_count", title: "Jumlah GPU per node?", options: ["1 GPU", "2 GPU", "4 GPU", "8 GPU", "Belum tahu"] },
    { key: "power_cooling", title: "Kesiapan daya dan pendinginan GPU?", options: ["Sudah tervalidasi", "Perlu audit", "Ada batas daya", "Liquid cooling", "Belum tahu"] },
  ],
  WORX: [
    { key: "scene_dataset", title: "Ukuran scene atau dataset aktif?", options: ["< 10 GB", "10–50 GB", "51–200 GB", "> 200 GB", "Belum tahu"] },
    { key: "display", title: "Konfigurasi display?", options: ["1× FHD", "2× QHD", "2× 4K", "3+ display", "Belum tahu"] },
    { key: "form_factor", title: "Form factor yang dibutuhkan?", options: ["Full tower", "Compact tower", "Rack workstation", "Mobile", "Belum tahu"] },
    { key: "os", title: "Sistem operasi utama?", options: ["Windows 11 Pro", "Windows for Workstations", "Linux", "Dual boot", "Belum tahu"] },
  ],
};

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [level, setLevel] = useState<Level>("Bisnis");
  const [goal, setGoal] = useState("compute");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [users, setUsers] = useState("51–100 pengguna");
  const [workload, setWorkload] = useState("ERP & database");
  const [priority, setPriority] = useState("Stabilitas & kemudahan pengelolaan");
  const [technicalAnswers, setTechnicalAnswers] = useState<Record<string, string>>({});
  const [openSpec, setOpenSpec] = useState(false);
  const [modal, setModal] = useState<"help" | "privacy" | null>(null);
  const [generateError, setGenerateError] = useState("");

  const currentIndex = step === "landing" ? -1 : steps.indexOf(step);
  const progress = currentIndex < 0 ? 0 : Math.min(100, ((currentIndex + 1) / 6) * 100);
  const selectedGoal = useMemo(() => goals.find((item) => item.id === goal) ?? goals[0], [goal]);

  function next(nextStep: Step) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    const map: Record<Step, Step> = { landing: "landing", identity: "landing", level: "identity", goal: "level", discovery: "goal", review: "discovery", processing: "review", result: "review" };
    next(map[step]);
  }

  async function generate() {
    next("processing");
    setGenerateError("");
    try {
      const response = await fetch("/api/results", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, company, email, whatsapp: `+62${whatsapp.replace(/\D/g, "")}`, technicalLevel: level, goalId: selectedGoal.id, route: selectedGoal.route, users, workload, priority, technicalAnswers }) });
      const data = await response.json() as { result?: { url: string }; error?: string };
      if (!response.ok || !data.result) throw new Error(data.error || "Gagal membuat rekomendasi");
      window.location.assign(data.result.url);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Gagal membuat rekomendasi");
      next("review");
    }
  }

  return (
    <main className={`app-shell ${step === "landing" ? "landing-shell" : ""}`}>
      <header className="topbar">
        <button className="brand" onClick={() => next("landing")} aria-label="Kembali ke halaman awal">
          <img src="/rainer-logo.png" alt="Rainer Dynamic Server Solution" />
        </button>
        {step !== "landing" && step !== "result" && (
          <div className="progress-wrap" aria-label={`Progress ${Math.round(progress)} persen`}>
            <div className="progress-meta"><span>Konfigurasi Anda</span><strong>{Math.min(currentIndex + 1, 6)} dari 6</strong></div>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        <button className="help-button" onClick={() => setModal("help")}><span>?</span> Bantuan</button>
      </header>

      {step === "landing" && <Landing onStart={() => next("identity")} />}

      {step === "identity" && (
        <WizardFrame kicker="Langkah 1" title="Mari mulai dari perkenalan" subtitle="Informasi ini membantu tim Rainer menyiapkan rekomendasi dan mengirimkan hasil kepada Anda.">
          <div className="form-grid">
            <Field label="Nama lengkap" value={name} onChange={setName} placeholder="Contoh: Budi Santoso" />
            <Field label="Nama perusahaan" value={company} onChange={setCompany} placeholder="Contoh: PT Nusantara Digital" />
            <Field label="Email perusahaan" value={email} onChange={setEmail} placeholder="nama@perusahaan.co.id" type="email" />
            <label className="field"><span>Nomor WhatsApp</span><div className="phone-input"><b>🇮🇩 +62</b><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="812 3456 7890" aria-label="Nomor WhatsApp" /></div><small>Digunakan untuk tindak lanjut konsultasi, bukan pesan promosi.</small></label>
          </div>
          <label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>Saya menyetujui pemrosesan data untuk menerima rekomendasi dan tindak lanjut dari Rainer. <button type="button" className="inline-link" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModal("privacy"); }}>Lihat kebijakan privasi</button></span></label>
          <WizardActions onBack={back} onNext={() => next("level")} disabled={!name || !company || !email || !whatsapp || !consent} />
        </WizardFrame>
      )}

      {step === "level" && (
        <WizardFrame kicker="Langkah 2" title="Seberapa teknis Anda ingin berdiskusi?" subtitle="Tidak ada jawaban benar atau salah. Pilih tingkat detail yang paling nyaman—Anda bisa mengubahnya kapan saja.">
          <div className="level-grid">
            {levelOptions.map((item) => <button key={item.id} className={`choice-card level-card ${level === item.id ? "selected" : ""}`} onClick={() => { setLevel(item.id); if (item.id === "Bisnis") setTechnicalAnswers({}); }}><span className="radio" /><small>{item.eyebrow}</small><h3>{item.title}</h3><p>{item.text}</p><em>{item.example}</em></button>)}
          </div>
          <div className="info-note"><span>i</span><p><strong>Pengalaman akan menyesuaikan pilihan Anda.</strong><br />Bahasa, jumlah pertanyaan, dan tingkat detail hasil akan dibuat senyaman mungkin.</p></div>
          <WizardActions onBack={back} onNext={() => next("goal")} />
        </WizardFrame>
      )}

      {step === "goal" && (
        <WizardFrame kicker="Langkah 3" title="Apa yang ingin Anda capai?" subtitle="Pilih kebutuhan yang paling mendekati. Anda tidak perlu mengetahui nama produk atau spesifikasi teknisnya.">
          <div className="goal-grid">
            {goals.map((item) => <button key={item.id} className={`choice-card goal-card ${goal === item.id ? "selected" : ""}`} onClick={() => { setGoal(item.id); setTechnicalAnswers({}); }}><span className="goal-icon">{item.icon}</span><span><h3>{item.title}</h3><p>{item.text}</p></span><span className="radio" /></button>)}
          </div>
          <WizardActions onBack={back} onNext={() => next("discovery")} />
        </WizardFrame>
      )}

      {step === "discovery" && (
        <WizardFrame kicker={`Langkah 4 · Jalur ${selectedGoal.route}`} title="Ceritakan kebutuhan operasional Anda" subtitle={level === "Expert" ? "Masukkan baseline teknis yang tersedia. Nilai yang belum diketahui dapat ditandai untuk divalidasi bersama." : "Jawab berdasarkan kondisi bisnis sehari-hari. Tidak apa-apa jika Anda belum mengetahui detail teknisnya."}>
          <div className="question-stack">
            <ChoiceQuestion number="01" title="Berapa banyak pengguna yang akan dilayani?" value={users} onChange={setUsers} options={["1–25 pengguna", "26–50 pengguna", "51–100 pengguna", "> 100 pengguna", "Belum tahu"]} />
            <ChoiceQuestion number="02" title="Beban kerja utama yang akan dijalankan?" value={workload} onChange={setWorkload} options={["ERP & database", "Virtual machine", "File & aplikasi internal", "Analitik data", "Lainnya"]} />
            <ChoiceQuestion number="03" title="Apa prioritas terpenting bagi bisnis Anda?" value={priority} onChange={setPriority} options={["Stabilitas & kemudahan pengelolaan", "Performa tertinggi", "Ruang pertumbuhan", "Efisiensi biaya"]} />
            {level !== "Bisnis" && <SkillQuestions level={level} route={selectedGoal.route} answers={technicalAnswers} onChange={(key, value) => setTechnicalAnswers((current) => ({ ...current, [key]: value }))} />}
          </div>
          <WizardActions onBack={back} onNext={() => next("review")} />
        </WizardFrame>
      )}

      {step === "review" && (
        <WizardFrame kicker="Langkah 5" title="Pastikan semuanya sudah sesuai" subtitle="Kami akan menggunakan jawaban ini untuk membuat rekomendasi awal yang paling relevan.">
          <div className="review-layout">
            <div className="review-list">
              <ReviewCard title="Profil Anda" onEdit={() => next("identity")} rows={[["Nama", name], ["Perusahaan", company], ["Mode pengalaman", level]]} />
              <ReviewCard title="Kebutuhan utama" onEdit={() => next("goal")} rows={[["Tujuan", selectedGoal.title], ["Jalur produk", selectedGoal.route], ["Jumlah pengguna", users], ["Workload", workload], ["Prioritas", priority]]} />
              {level !== "Bisnis" && <ReviewCard title={`Baseline ${level}`} onEdit={() => next("discovery")} rows={Object.entries(technicalAnswers).map(([key, value]) => [questionLabel(selectedGoal.route, key), value])} />}
            </div>
            <aside className="readiness"><span className="score">88<small>%</small></span><h3>Data Anda siap diproses</h3><p>Informasi inti sudah lengkap. Beberapa detail teknis akan dikonfirmasi oleh tim Rainer.</p><div className="mini-bar"><span /></div><ul><li>Profil & kebutuhan lengkap</li><li>2 item perlu validasi</li></ul></aside>
          </div>
          <div className="warning-note"><span>!</span><p>Hasil merupakan rekomendasi awal, bukan quotation atau jaminan kompatibilitas final. Tim Rainer akan melakukan validasi teknis dan komersial.</p></div>
          {generateError && <div className="error-note" role="alert">{generateError}</div>}
          <WizardActions onBack={back} onNext={generate} nextLabel="Buat rekomendasi" />
        </WizardFrame>
      )}

      {step === "processing" && <Processing />}
      {step === "result" && <ResultPageInteractive name={name} company={company} level={level} goal={selectedGoal} openSpec={openSpec} setOpenSpec={setOpenSpec} onChangeLevel={() => next("level")} />}
      {modal === "help" && <Modal title="Butuh bantuan?" onClose={() => setModal(null)}><p>Ikuti satu pertanyaan per layar. Pilih <b>Belum tahu</b> jika detail teknis belum tersedia—tim Rainer akan membantu memvalidasinya.</p><div className="modal-contact"><span>WhatsApp konsultasi</span><strong>+62 21 555 0188</strong></div></Modal>}
      {modal === "privacy" && <Modal title="Ringkasan privasi" onClose={() => setModal(null)}><p>Data identitas digunakan untuk menyimpan sesi, mengirimkan hasil rekomendasi, dan memungkinkan tindak lanjut konsultasi. Persetujuan pemasaran bersifat terpisah dan tidak otomatis aktif.</p><p className="modal-muted">Mockup ini tidak mengirim atau menyimpan data ke sistem eksternal.</p></Modal>}
    </main>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return <section className="landing">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <div className="hero-copy"><span className="eyebrow"><i /> Rainer AI Assistant</span><h1>Infrastruktur yang tepat,<br /><em>dimulai dari kebutuhan Anda.</em></h1><p>Ceritakan tantangan bisnis Anda. Kami bantu menerjemahkannya menjadi rekomendasi server dan infrastruktur Rainer yang mudah dipahami.</p><div className="hero-actions"><button className="primary big" onClick={onStart}>Mulai konfigurasi <span>→</span></button><span><b>± 8 menit</b> · Tanpa istilah rumit</span></div><div className="trust-row"><span>✓ Gratis & tanpa komitmen</span><span>✓ Rekomendasi dapat dibagikan</span><span>✓ Ditinjau tim Rainer</span></div></div>
    <div className="hero-visual"><div className="orb"><div className="orb-core">R</div><i className="orbit one" /><i className="orbit two" /><i className="dot d1" /><i className="dot d2" /></div><div className="float-card card-a"><small>KEBUTUHAN ANDA</small><strong>ERP & Database</strong><span>80 pengguna · Growth 30%</span></div><div className="float-card card-b"><span className="spark">✦</span><div><small>REKOMENDASI CERDAS</small><strong>Disesuaikan otomatis</strong></div></div></div>
    <div className="how"><span>01 <b>Ceritakan kebutuhan</b></span><i /><span>02 <b>Dapatkan rekomendasi</b></span><i /><span>03 <b>Konsultasikan bersama kami</b></span></div>
  </section>;
}

function WizardFrame({ kicker, title, subtitle, children }: { kicker: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="wizard"><div className="wizard-heading"><span>{kicker}</span><h1>{title}</h1><p>{subtitle}</p></div>{children}<div className="autosave">✓ Jawaban tersimpan otomatis</div></section>;
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function WizardActions({ onBack, onNext, nextLabel = "Lanjutkan", disabled = false }: { onBack: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return <div className="wizard-actions"><button className="back-button" onClick={onBack}>← Kembali</button><button className="primary" onClick={onNext} disabled={disabled}>{nextLabel} <span>→</span></button></div>;
}

function ChoiceQuestion({ number, title, value, onChange, options }: { number: string; title: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="question"><div className="question-title"><span>{number}</span><h3>{title}</h3></div><div className="chips">{options.map((option) => <button key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}>{option}<i /></button>)}</div></div>;
}

function routeQuestions(route: string, level: Level) {
  const normalizedRoute = route === "ARCA" || route === "STOR" || route === "AIX" || route === "WORX" ? route : "ARCA";
  const middle = intermediateQuestions[normalizedRoute] || [];
  return level === "Expert" ? [...middle, ...(expertQuestions[normalizedRoute] || [])] : middle;
}

function questionLabel(route: string, key: string) {
  return [...(intermediateQuestions[route] || []), ...(expertQuestions[route] || [])].find((item) => item.key === key)?.title || key;
}

function SkillQuestions({ level, route, answers, onChange }: { level: Level; route: string; answers: Record<string, string>; onChange: (key: string, value: string) => void }) {
  const questions = routeQuestions(route, level);
  return <div className="technical-panel"><div><span>{level === "Expert" ? "MODE EXPERT" : "MODE MENENGAH"}</span><h3>{level === "Expert" ? "Baseline sizing & constraint teknis" : "Baseline teknis utama"}</h3><p>{level === "Expert" ? "Parameter ini membantu backend membuat sizing yang lebih presisi. Pilih Belum tahu jika data belum tersedia." : "Pertanyaan tambahan disesuaikan dengan jalur produk yang Anda pilih."}</p></div><div className="question-stack">{questions.map((question, index) => <ChoiceQuestion key={question.key} number={String(index + 4).padStart(2, "0")} title={question.title} value={answers[question.key] || ""} onChange={(value) => onChange(question.key, value)} options={question.options} />)}</div></div>;
}

function ReviewCard({ title, rows, onEdit }: { title: string; rows: string[][]; onEdit: () => void }) {
  return <div className="review-card"><div className="review-head"><h3>{title}</h3><button onClick={onEdit}>Ubah</button></div>{rows.map(([label, value]) => <div className="review-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function Processing() {
  return <section className="processing"><div className="processing-mark"><span>R</span><i /><i /><i /></div><span className="eyebrow"><i /> Rainer Intelligence</span><h1>Menyusun rekomendasi Anda…</h1><p>Kami mencocokkan kebutuhan, kapasitas, dan ruang pertumbuhan dengan knowledge base produk Rainer.</p><div className="process-list"><span className="done">✓ <b>Memahami kebutuhan</b></span><span className="active"><i /> <b>Mencocokkan produk & konfigurasi</b></span><span>○ <b>Memeriksa risiko & asumsi</b></span></div></section>;
}

function ResultPageInteractive({ name, company, level, goal, openSpec, setOpenSpec, onChangeLevel }: { name: string; company: string; level: Level; goal: { id: string; title: string; route: string }; openSpec: boolean; setOpenSpec: (v: boolean) => void; onChangeLevel: () => void }) {
  const [tab, setTab] = useState<"summary" | "spec" | "options" | "validation" | "next">("summary");
  const [notice, setNotice] = useState<"contact" | "share" | null>(null);
  const recommendations: Record<string, { family: string; product: string; description: string; focus: string }> = {
    ARCA: { family: "ARCA COMPUTE", product: "Rainer ARCA CX-220", description: "Konfigurasi compute yang siap menangani ERP, database, dan virtualisasi dengan ruang pertumbuhan yang terukur.", focus: "ERP, database, dan virtualisasi" },
    STOR: { family: "STOR STORAGE", product: "Rainer STOR SX-240", description: "Platform penyimpanan terukur untuk file sharing, backup, dan pertumbuhan data dengan perlindungan berlapis.", focus: "penyimpanan, backup, dan retensi data" },
    AIX: { family: "AIX AI & GPU", product: "Rainer AIX GX-420", description: "Platform GPU yang fleksibel untuk inference, training, dan komputasi intensif dengan jalur peningkatan yang jelas.", focus: "AI, GPU, dan komputasi intensif" },
    WORX: { family: "WORX WORKSTATION", product: "Rainer WORX WX-90", description: "Workstation profesional bertenaga untuk CAD, desain, rendering, dan pekerjaan visual single-user.", focus: "workstation dan aplikasi profesional" },
  };
  const recommendation = recommendations[goal.route] ?? recommendations.ARCA;
  function chooseTab(nextTab: typeof tab) { setTab(nextTab); if (nextTab === "spec") setOpenSpec(true); }
  async function shareResult() { try { await navigator.clipboard.writeText(window.location.href); } catch {} setNotice("share"); }
  return <section className="result-page">
    <div className="result-top"><div><span className="eyebrow"><i /> Rekomendasi siap</span><h1>Fondasi yang kuat untuk<br />pertumbuhan <em>{company}</em>.</h1><p>Halo {name.split(" ")[0]}, berdasarkan kebutuhan Anda, konfigurasi berikut memberi keseimbangan terbaik antara stabilitas, performa, dan ruang pertumbuhan.</p></div><div className="result-actions"><button className="ghost" onClick={shareResult}>↗ Bagikan</button><button className="primary" onClick={() => setNotice("contact")}>Hubungi Rainer →</button></div></div>
    <div className="recommendation-card"><div className="product-main"><div className="match"><span>Kecocokan kuat</span><b>92%</b></div><small>REKOMENDASI UTAMA · {recommendation.family}</small><h2>{recommendation.product}</h2><p>{recommendation.description}</p><div className="business-benefits"><span><i>↗</i><b>Siap bertumbuh</b><small>Headroom kapasitas 30%</small></span><span><i>◈</i><b>Lebih tenang</b><small>Redundansi komponen kritis</small></span><span><i>◎</i><b>Mudah dikelola</b><small>Remote management terintegrasi</small></span></div></div><div className="product-visual"><div className="server"><span>RAINER</span><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="rack-shadow" /></div></div>
    <nav className="result-tabs" aria-label="Bagian hasil"><button className={tab === "summary" ? "active" : ""} onClick={() => chooseTab("summary")}>Ringkasan</button><button className={tab === "spec" ? "active" : ""} onClick={() => chooseTab("spec")}>Spesifikasi</button><button className={tab === "options" ? "active" : ""} onClick={() => chooseTab("options")}>Opsi</button><button className={tab === "validation" ? "active" : ""} onClick={() => chooseTab("validation")}>Asumsi & validasi <span>2</span></button><button className={tab === "next" ? "active" : ""} onClick={() => chooseTab("next")}>Langkah berikutnya</button></nav>
    {(tab === "summary" || tab === "spec") && <div className="result-grid"><div className="spec-card"><div className="section-head"><div><small>KONFIGURASI AKTUAL</small><h3>Dirancang untuk {recommendation.focus}</h3></div><button onClick={() => setOpenSpec(!openSpec)}>{openSpec ? "Sembunyikan" : "Lihat detail"}</button></div><div className="spec-list"><span><i>CPU</i><b>2× Enterprise CPU<br /><small>32 cores total</small></b></span><span><i>RAM</i><b>512 GB ECC<br /><small>Upgradeable</small></b></span><span><i>DATA</i><b>7.6 TB usable<br /><small>Enterprise SSD</small></b></span><span><i>NET</i><b>Dual 10 GbE<br /><small>Redundant</small></b></span></div>{openSpec && <div className="expanded-spec"><span>Boot: 2× 960 GB SSD RAID 1</span><span>Controller: Hardware RAID + cache protection</span><span>Power: Dual hot-swap redundant PSU</span><span>Management: Dedicated remote management</span></div>}</div><aside className="validation-card"><small>PERLU DIKONFIRMASI</small><h3>2 hal sebelum finalisasi</h3><ul><li><span>1</span><p><b>Baseline beban kerja saat ini</b><small>Untuk memastikan ruang pertumbuhan 3–5 tahun.</small></p></li><li><span>2</span><p><b>Lingkungan rack & daya</b><small>Tim Rainer akan memeriksa kesiapan lokasi.</small></p></li></ul><button onClick={() => setNotice("contact")}>Jadwalkan konsultasi →</button></aside></div>}
    {tab === "options" && <div className="tab-panel"><div className="option-card"><small>GOOD</small><h3>Efisien untuk kebutuhan saat ini</h3><p>Kapasitas inti dengan ruang peningkatan terencana.</p></div><div className="option-card featured"><small>BETTER · DIREKOMENDASIKAN</small><h3>{recommendation.product}</h3><p>Keseimbangan terbaik antara performa, resiliency, dan pertumbuhan.</p></div><div className="option-card"><small>BEST</small><h3>Siap untuk ekspansi lebih cepat</h3><p>Headroom lebih besar dan redundansi yang ditingkatkan.</p></div></div>}
    {tab === "validation" && <div className="content-panel"><small>ASUMSI & VALIDASI</small><h3>Hal yang mendasari rekomendasi</h3><ul><li>Pertumbuhan kapasitas diasumsikan 30% dalam tiga tahun.</li><li>Kompatibilitas akhir, daya, airflow, dan support matrix perlu ditinjau tim Rainer.</li><li>Harga, stok, dan lead time belum termasuk dalam rekomendasi awal ini.</li></ul></div>}
    {tab === "next" && <div className="content-panel next-panel"><small>LANGKAH BERIKUTNYA</small><h3>Validasi bersama solution architect Rainer</h3><p>Jadwalkan sesi 30 menit untuk memeriksa baseline, lingkungan pemasangan, serta opsi implementasi.</p><button className="primary" onClick={() => setNotice("contact")}>Jadwalkan konsultasi →</button></div>}
    <div className="result-footer-note"><span>i</span><p><b>Rekomendasi awal, bukan quotation final.</b> Harga, ketersediaan, lead time, dan kompatibilitas akhir akan dikonfirmasi oleh tim Rainer setelah validasi.</p><div className="qr"><span>▦</span><small>Scan untuk<br />buka hasil</small></div></div>
    <div className="personalization">Tampilan disesuaikan untuk mode <b>{level}</b> · <button onClick={onChangeLevel}>Ubah tingkat detail</button></div>
    {notice === "share" && <Modal title="Link hasil disalin" onClose={() => setNotice(null)}><p>Link mockup telah disalin ke clipboard dan siap dibagikan.</p></Modal>}
    {notice === "contact" && <Modal title="Jadwalkan konsultasi" onClose={() => setNotice(null)}><p>Tim Rainer akan menghubungi Anda melalui email perusahaan atau WhatsApp yang telah diisi.</p><div className="modal-contact"><span>Referensi rekomendasi</span><strong>{goal.route}-MOCKUP-001</strong></div><button className="primary modal-primary" onClick={() => setNotice(null)}>Selesai</button></Modal>}
  </section>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Tutup">×</button><span className="eyebrow"><i /> Rainer AI Assistant</span><h2>{title}</h2>{children}</section></div>;
}
