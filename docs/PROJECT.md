# Ringkasan Proyek

**Nama:** Rainer AI Capacity Assistant  
**Versi aplikasi:** 2.0.0
**Versi knowledge base:** 2.0.0
**Versi rules:** 2.0.0

## Tujuan

Aplikasi membantu calon customer merancang solusi infrastruktur Rainer berdasarkan kebutuhan bisnis maupun teknis. Sistem melakukan discovery adaptif, menentukan satu atau beberapa keluarga produk, memakai baseline workload ketika data aktual belum tersedia, lalu meminta AI menghasilkan spesifikasi produk serta network/interconnection terstruktur yang diperiksa kembali oleh guardrail deterministik.

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
3. Customer memilih satu atau beberapa kebutuhan; discovery menentukan keluarga produk dan kelengkapan data.
4. Customer mengonfirmasi jawaban minimum.
5. AI menghasilkan sizing per produk, topology, traffic segmentation, bandwidth, redundancy, port/link requirement, skalabilitas, asumsi, risiko, dan kebutuhan validasi.
6. Backend menerapkan baseline, confidence scoring, dan guardrail.
7. Sistem membuat URL hasil opaque, QR, dan opsi pengiriman email.
8. Tim internal meninjau lead melalui dashboard.

## Batasan versi 2.0.0

- Hasil merupakan desain solusi awal, bukan quotation final.
- Model NIC/HBA, switch, optic/transceiver, kabel, firmware, QVL, MTU, fasilitas, dan kompatibilitas endpoint wajib divalidasi tim Rainer.
- Harga, stok, lead time, part number, dan kompatibilitas final harus divalidasi manusia.
- JSON store dan admin API key hanya ditujukan untuk development.
- Adapter email default hanya mensimulasikan delivery melalui console.
