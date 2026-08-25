# Rainer AI Capacity Assistant Backend v1.3.0

Backend Node.js untuk Rainer AI Capacity Assistant v1.3.0. AI wajib menganalisis input untuk mengusulkan spesifikasi, sizing, headroom, proyeksi kapasitas, serta strategi scale-up/scale-out. Routing dan guardrail tetap deterministik, provenance model disimpan, dan klaim komersial atau kompatibilitas tanpa sumber diblokir.

Workload baseline v1.3.0 memastikan input customer yang masih dasar tetap menghasilkan suggested specification Good/Better/Best. Baseline deterministik tersedia untuk ARCA compute, STOR storage, AIX AI, dan WORX workstation; nilai customer yang terukur selalu mengalahkan baseline.

## Menjalankan lokal

```bash
cp .env.example .env
npm install
npm run dev
```

API tersedia di `http://localhost:4000`. Penyimpanan development menggunakan JSON atomik di `data/rainer.json`. Untuk production, pertahankan interface store dan ganti dengan PostgreSQL/D1; gunakan secret manager untuk `ADMIN_API_KEY`, provider email nyata, SSO/MFA untuk admin, dan reverse proxy TLS.

## LLM server wajib

Konfigurasikan endpoint yang kompatibel dengan `POST /v1/chat/completions`. URL dan API key dibaca langsung dari system environment variable dengan nama lowercase berikut:

```env
AI_REQUIRED=true
AI_MODEL=your-structured-output-model
AI_TIMEOUT_MS=30000
```

Contoh konfigurasi system environment variable di PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("ai_host_url", "http://localhost:11434/v1", "User")
[Environment]::SetEnvironmentVariable("ai_api_key", "your-secret-key", "User")
```

Restart terminal atau service backend setelah mengubah system environment variable. `ai_host_url` dapat menunjuk server lokal atau cloud. Model harus mendukung structured JSON output. Jika AI tidak terkonfigurasi, timeout, menghasilkan JSON tidak lengkap, headroom di bawah 20%, atau melanggar guardrail, generation gagal dan result URL tidak dibuat.

### Privasi payload AI

Entitas Lead tidak dikirim ke LLM. Sebelum request keluar, backend membuang field nama, perusahaan, email, telepon/WhatsApp, alamat, hostname, ID internal, token, dan secret. Pola sensitif yang mungkin tertulis di jawaban bebas—email, nomor telepon, alamat IP, hostname internal, dan identifier transaksi—diganti marker redaksi. Payload dibatasi pada route, level teknis, jawaban discovery, completeness, versi KB, dan guardrail. Provenance hasil mencatat versi sanitasi dan `pii_sent: false`.

## Alur customer

1. `POST /v1/leads` - identitas, email perusahaan, WhatsApp E.164, consent; mengembalikan resume token satu kali.
2. `PATCH /v1/sessions/:id/profile` - pilih `business`, `intermediate`, atau `expert`.
3. `PATCH /v1/sessions/:id/answers` - autosave goal dan jawaban; routing serta completeness dihitung ulang.
4. `POST /v1/sessions/:id/confirm` - customer mengonfirmasi jawaban minimum.
5. `POST /v1/sessions/:id/recommendations` - AI menganalisis input dan menghasilkan sizing, spesifikasi, scalability, Good/Better/Best, provenance, serta confidence; backend memvalidasi semuanya sebelum membuat opaque URL dan QR. Kirim `Idempotency-Key`.
6. `GET /v1/results/:token` - halaman hasil yang dapat expired/revoke.
7. `GET /v1/results/:token/qr.svg` dan `POST /v1/results/:token/email` - QR dari canonical URL dan delivery yang rate-limited.

Semua endpoint sesi memakai `Authorization: Bearer <resume_token>`. Token mentah tidak disimpan; backend hanya menyimpan SHA-256 hash.

## Endpoint internal

Endpoint berikut memakai header `X-Admin-API-Key` pada implementasi lokal:

- `GET /v1/admin/leads`
- `GET /v1/admin/results/:id`
- `PATCH /v1/admin/results/:id/review`
- `POST /v1/admin/results/:id/revoke`
- `GET /v1/admin/audit-events`

Status review: `new`, `in_review`, `needs_info`, `validated`, `contacted`, `won`, atau `lost`.

## Batas MVP yang disengaja

- AI wajib digunakan untuk suggestion, tetapi tidak boleh melewati routing, minimum headroom, lint guardrail, atau human review.
- Product ID dan field yang belum bersumber ditulis `TBD`; tidak ada harga, stok, lead time, part number, atau klaim kompatibilitas final.
- `EMAIL_MODE=console` mensimulasikan provider email. Tambahkan adapter provider sebelum production.
- JSON store cocok untuk demo/single process, bukan deployment multi-instance.
- API key admin adalah fallback development, bukan pengganti SSO/MFA production.

## Verifikasi

```bash
npm test
npm run check
```
