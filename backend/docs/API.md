# Kontrak API Ringkas v1.3.0

Semua body dan respons menggunakan JSON, kecuali endpoint QR yang mengembalikan SVG. Error memiliki bentuk `{ "error": "CODE", "message": "...", "details": [] }`.

## Contoh membuat lead

```json
{
  "name": "Budi Santoso",
  "company": "Nusantara Logistik",
  "company_email": "budi@nusantara.co.id",
  "country_code": "+62",
  "whatsapp": "081234567890",
  "service_consent": true,
  "marketing_consent": false,
  "consent_version": "2026-08-16",
  "locale": "id-ID"
}
```

## Contoh menyimpan discovery

```json
{
  "goal": "compute",
  "answers": {
    "location": "Jakarta",
    "user_count": 80,
    "workload": "ERP dan database",
    "criticality": "high",
    "current_condition": "server lama",
    "bottleneck": "respons lambat",
    "growth_3_5_years": "30%",
    "timeline": "Q4",
    "budget_range": "perlu diskusi",
    "vm_count_or_size": "12 VM",
    "hypervisor": "unknown"
  }
}
```

Field minimum tambahan mengikuti route: ARCA, STOR, AIX, atau WORX. Nilai `unknown` diperbolehkan dan otomatis menjadi `validation_required`.

Completeness dibagi menjadi `answered_score` (field sudah dijawab, termasuk `unknown`) dan `known_data_score` (hanya nilai nyata). Input dasar tetap dapat menghasilkan rekomendasi melalui workload baseline, tetapi confidence diturunkan ketika `known_data_score` rendah.

## Hasil analisis AI

Respons recommendation dan result memuat:

- `analysis_summary`
- `sizing.current_demand`, `recommended_capacity`, `headroom_percent`, `projected_capacity`, dan `projection_horizon_years`
- `components` untuk chassis, CPU, RAM, GPU, boot, storage, controller, network, PSU, management, software, dan support
- `scalability.scale_up`, `scale_out`, `triggers`, dan `constraints`
- tiga `alternatives`: Good, Better, Best; masing-masing memiliki `suggested_specification`
- `workload_profile` berisi profil, sumber baseline, dan formula sizing
- `provenance.ai` berisi model, request ID, dan usage

AI yang gagal divalidasi menghasilkan respons 502/422 dan tidak membuat recommendation.
