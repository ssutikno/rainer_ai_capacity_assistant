# Rainer AI Capacity Assistant Frontend v2.0.0

Frontend React/TypeScript untuk configurator customer, halaman hasil rekomendasi, dan dashboard internal Rainer AI Capacity Assistant.

## Menjalankan lokal

Prasyarat: Node.js 22.13 atau lebih baru dan backend aktif di port 4000.

```bash
npm install
npm run dev
```

Frontend tersedia di `http://localhost:4001`. Gunakan `BACKEND_API_URL` untuk mengganti alamat backend default `http://localhost:4000`.

## Perintah

- `npm run dev` — menjalankan development server pada `0.0.0.0:4001`.
- `npm run build` — membuat production build.
- `npm start` — menjalankan production build pada `0.0.0.0:4001`.
- `npm test` — membangun aplikasi dan menjalankan pengujian HTML/integrasi.
- `npm run lint` — menjalankan pemeriksaan lint.
- `npm run db:generate` — membuat migrasi Drizzle setelah schema berubah.

## Deployment

Proyek memiliki konfigurasi OpenAI Sites/Cloudflare dan binding D1 opsional. Identitas ChatGPT bersifat opsional; endpoint publik tetap dapat digunakan secara anonim. Untuk production, lindungi dashboard internal dengan kebijakan akses dan autentikasi yang sesuai.
