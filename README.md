# Rainer AI Capacity Assistant

Versi **2.0.0**

Rainer AI Capacity Assistant adalah solution designer berbasis AI yang menerjemahkan kebutuhan customer menjadi arsitektur satu atau beberapa produk Rainer ARCA, STOR, AIX, dan WORX. Versi 2.0.0 menghasilkan sizing per produk, headroom, proyeksi pertumbuhan, strategi scale-up/scale-out, serta topology dan interconnection yang cukup untuk workload.

## Struktur repository

- `frontend/` — configurator customer, halaman hasil, dan dashboard internal.
- `backend/` — API, routing discovery, integrasi AI, guardrail, audit, dan penyimpanan development.
- `backend/knowledge-base/` — baseline workload dan aturan solution composition aktif versi 2.0.0.
- `docs/` — dokumentasi produk, arsitektur, API, dan panduan deployment.

## Prasyarat

- Node.js 22.13 atau lebih baru.
- Endpoint AI yang kompatibel dengan `POST /v1/chat/completions` dan structured JSON output.

## Menjalankan secara lokal

Untuk menjalankan frontend dan backend sekaligus dari root project:

```bash
npm run dev
```

Perintah ini membuka frontend di `http://localhost:4001` dan backend di `http://localhost:4000`. Tekan `Ctrl+C` untuk menghentikan keduanya.

Untuk menjalankan masing-masing service secara terpisah:

```bash
git clone https://github.com/<owner>/rainer_ai_capacity_assistant.git
cd rainer_ai_capacity_assistant/backend
npm install
cp .env.example .env
npm run dev
```

Perintah `npm run dev` menjalankan backend melalui supervisor. Jika koneksi AI gagal tiga kali berturut-turut, backend keluar secara terkontrol dan supervisor menjalankannya kembali dengan exponential backoff. Batasnya lima restart dalam lima menit untuk mencegah restart loop. Gunakan `GET /health/ai` untuk pemeriksaan koneksi nyata backend ke AI Server; `GET /health` hanya memeriksa proses dan konfigurasi.

Pada terminal lain:

```bash
cd rainer_ai_capacity_assistant/frontend
npm install
npm run dev
```

Backend tersedia di `http://localhost:4000` dan frontend di `http://localhost:4001`. Konfigurasikan `AI_MODEL` pada `backend/.env`; `ai_host_url` dan `ai_api_key` dibaca dari system environment variable agar kredensial tidak masuk repository.

## Menjalankan production

Buat build frontend, lalu jalankan backend dan frontend production dari root project:

```bash
npm run build
npm start
```

Frontend production mendengarkan pada `0.0.0.0:4001` dan backend pada port `4000`. Perintah `npm start` menetapkan `NODE_ENV=production` dan menghentikan kedua service bersama-sama saat salah satunya gagal atau proses dihentikan.

## Verifikasi

```bash
npm test
npm run check
```

## Status production readiness

Versi ini sesuai untuk demo dan pengembangan single-process. Sebelum production, ganti JSON store dengan database production, gunakan provider email nyata, lindungi dashboard dengan SSO/MFA, simpan secret melalui secret manager, dan gunakan TLS/reverse proxy.

Lihat [ringkasan proyek](docs/PROJECT.md), [arsitektur](docs/ARCHITECTURE.md), [kontrak API](docs/API.md), dan [knowledge base](docs/KNOWLEDGE_BASE.md).
