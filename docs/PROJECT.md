# Ringkasan Proyek

**Nama:** Rainer AI Capacity Assistant  
**Versi aplikasi:** 1.3.0  
**Versi knowledge base:** 1.3.0  
**Versi rules:** 1.3.0

## Tujuan

Aplikasi membantu calon customer memilih fondasi infrastruktur Rainer berdasarkan kebutuhan bisnis maupun teknis. Sistem melakukan discovery adaptif, menentukan jalur produk, memakai baseline workload ketika data aktual belum tersedia, lalu meminta AI menghasilkan rekomendasi terstruktur yang diperiksa kembali oleh guardrail deterministik.

## Jalur produk

| Jalur | Fokus |
|---|---|
| ARCA | Compute, ERP, database, dan virtualisasi |
| STOR | Storage, backup, dan retensi data |
| AIX | AI, GPU, training, dan inference |
| WORX | Workstation, CAD, desain, dan rendering |

## Alur customer

1. Customer memasukkan identitas dan consent.
2. Customer memilih level bisnis, intermediate, atau expert.
3. Discovery menentukan jalur produk dan kelengkapan data.
4. Customer mengonfirmasi jawaban minimum.
5. AI menghasilkan sizing, komponen, skalabilitas, asumsi, risiko, dan kebutuhan validasi.
6. Backend menerapkan baseline, confidence scoring, dan guardrail.
7. Sistem membuat URL hasil opaque, QR, dan opsi pengiriman email.
8. Tim internal meninjau lead melalui dashboard.

## Batasan versi 1.3.0

- Hasil merupakan rekomendasi awal, bukan quotation final.
- Harga, stok, lead time, part number, dan kompatibilitas final harus divalidasi manusia.
- JSON store dan admin API key hanya ditujukan untuk development.
- Adapter email default hanya mensimulasikan delivery melalui console.
