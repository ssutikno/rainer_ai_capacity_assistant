# Rainer Product Knowledge Base v1.3.0

> **Tujuan:** referensi produk untuk Rainer AI Assistant dalam melakukan discovery kebutuhan, memilih keluarga produk, menyusun konfigurasi awal, dan menghasilkan proposal penawaran.
>
> **Versi data:** 1.3.0 — 25 Agustus 2026  
> **Status:** working knowledge base; bukan price list atau datasheet final.

## Aturan penggunaan data

- Nama keluarga dan model bertanda **Resmi** ditemukan pada situs Rainer Server.
- Spesifikasi bertanda **Baseline modern** adalah rancangan konfigurasi yang mengikuti kelas produk server/workstation terkini pada umumnya. Baseline ini bukan klaim bahwa semua opsi telah tersedia atau tersertifikasi oleh Rainer.
- Sebelum proposal menjadi quotation/PO, AI wajib meminta tim product/sales mengonfirmasi: part number, generasi CPU, kompatibilitas motherboard/BIOS, jumlah GPU dan dayanya, jenis backplane, HBA/RAID, NIC, PSU, lisensi, garansi, stok, lead time, serta harga.
- Jangan menjanjikan kapasitas maksimum semua komponen secara bersamaan. Batas CPU, RAM, GPU, PCIe, drive, pendinginan, dan PSU saling bergantung.
- Gunakan istilah **hingga** untuk batas maksimum dan tampilkan konfigurasi aktual secara eksplisit di proposal.

## Taksonomi utama

| Kode | Kategori | Peran utama | Pilih ketika |
|---|---|---|---|
| `ARCA` | Server Compute | Menjalankan aplikasi, VM, container, database, HCI, HPC CPU | Beban kerja dominan CPU/RAM dan layanan bersama |
| `STOR` | Server Storage | NAS/SAN, file sharing, backup, archive, object storage | Kapasitas, integritas data, IOPS, atau throughput menjadi prioritas |
| `AIX` | Server AI | Training, fine-tuning, inference, VDI/render berbasis GPU | Beban kerja membutuhkan GPU accelerator dan fabric berkecepatan tinggi |
| `WORX` | Workstation | CAD, DCC, engineering, data science, AI lokal | Sistem dipakai satu pengguna/tim kecil dan ditempatkan dekat pengguna |

---

# 1. Server Compute — Rainer ARCA

## Ringkasan pemilihan

| Model/famili | Status | Bentuk | Kelas | Sasaran utama |
|---|---|---:|---|---|
| ARCA EVT | Resmi | Tower | Entry single-socket | File/app server kantor, AD, POS, backup kecil |
| ARCA EVT-A | Resmi | Tower | Entry AMD single-socket | SMB compute dengan core/value lebih tinggi |
| ARCA EVR | Resmi | Tower/2U | Entry dual-socket | Virtualisasi ringan, web, security appliance |
| ARCA EVR-A | Resmi | Tower/2U | Entry AMD single-socket | SMB modern, virtualisasi dan aplikasi bisnis |
| ARCA MRI | Resmi | 1U/2U | Mainstream Intel dual-socket | Database, virtualisasi, ERP, private cloud |
| ARCA MRA | Resmi pada materi situs | 1U/2U | Mainstream AMD dual-socket | VM density, analytics, database, HPC CPU |
| ARCA HDX/HDXi | Resmi | 2U multi-node | High density | Cloud, HCI, HPC, cluster compute |

## ARCA EVT — Entry Tower Intel

- `product_id`: `ARCA-EVT`
- `source_status`: resmi; baseline situs masih menyebut Intel Xeon E dan DDR4.
- `recommended_positioning`: server pertama untuk kantor/cabang dengan kebutuhan reliabilitas ECC dan manajemen terpusat.
- `avoid_when`: butuh HA tanpa node kedua, RAM sangat besar, GPU multi-slot, atau pertumbuhan VM tinggi.

### Spesifikasi komponen utama

| Komponen | Baseline resmi/warisan | Baseline modern yang disarankan untuk refresh |
|---|---|---|
| CPU | 1× Intel Xeon E, hingga kelas 6 core pada halaman lama | 1× Intel Xeon E-2400 series atau platform entry server penerus yang tersedia |
| Memori | ECC DDR4 hingga 64 GB pada halaman situs | 4× DIMM ECC UDIMM DDR5, target 32–128 GB |
| Boot | SATA/NVMe | 2× M.2 NVMe RAID 1 bila platform mendukung |
| Data drive | SATA HDD/SSD; opsi NVMe | 4–8× 3.5/2.5-inch hot-swap SATA/SAS; opsi 2× NVMe |
| RAID/HBA | Opsional | Software RAID untuk entry; hardware RAID cache-protected untuk database/VM |
| Network | Gigabit Ethernet | 2× 1GbE minimum; 2.5/10GbE opsional |
| Management | Tergantung platform | Dedicated BMC/IPMI/KVM-over-IP sangat disarankan |
| PSU | Single/opsional redundant | 500–800 W 80 PLUS, redundant bila uptime kritis |
| OS | Windows Server/Linux | Windows Server atau Linux tervalidasi sesuai aplikasi |

### Paket konfigurasi awal

- **Office Essential:** 4–8 core, 32 GB ECC, 2× 960 GB SSD RAID 1, dual 1GbE.
- **Branch Business:** 6–8 core, 64 GB ECC, 2× boot SSD RAID 1 + 4× HDD RAID 10, dual 10GbE opsional.
- **Small Virtualization:** 8 core, 128 GB ECC, mirrored boot, 4× enterprise SSD RAID 10, 10GbE; sarankan dua server bila perlu HA.

## ARCA EVT-A / EVR-A — Entry AMD

- `product_id`: `ARCA-EVT-A` / `ARCA-EVR-A`
- `source_status`: resmi; situs menyebut AMD EPYC 4004.
- `recommended_positioning`: entry server modern dengan efisiensi biaya, core, dan I/O yang baik.

| Komponen | Baseline modern |
|---|---|
| CPU | 1× AMD EPYC 4004/4005-class, pilih core dan clock sesuai aplikasi |
| Memori | ECC UDIMM DDR5, 32–192 GB tergantung platform tervalidasi |
| Storage | 2× M.2 NVMe boot; 4–8× SATA/SAS; opsi U.2/U.3 NVMe |
| Network | Dual 1/2.5GbE; opsi 10/25GbE PCIe |
| Expansion | PCIe Gen5 sesuai platform; satu GPU single/double-slot bila chassis/PSU mendukung |
| Management | BMC dengan IPMI/Redfish/KVM-over-IP |
| PSU | 600–1000 W; redundant untuk rack/layanan kritis |

## ARCA EVR — Entry Rack/Tower Dual Socket

- `product_id`: `ARCA-EVR`
- `source_status`: resmi; spesifikasi situs: dual Intel Xeon Scalable Gen 2, 16 DIMM DDR4, PCIe Gen3, dual 10GBase-T, M.2 dan OCuLink NVMe.
- `recommended_positioning`: ekspansi dan kapasitas lebih besar dari entry single-socket; gunakan untuk kebutuhan legacy atau tender yang mensyaratkan konfigurasi tersebut.
- `refresh_guidance`: untuk pembelian baru, prioritaskan ARCA MRI/MRA atau EVR-A modern karena platform EVR publik merupakan generasi lama.

| Komponen | Baseline situs |
|---|---|
| CPU | Hingga 2× Intel Xeon Scalable Gen 2, TDP maksimum 205 W |
| Memori | 16× DDR4 RDIMM/LRDIMM |
| Expansion | Hingga 6× PCIe Gen3; semua slot memerlukan dua CPU |
| Storage | SATA, 2× M.2, hingga 4× direct-attach NVMe via OCuLink |
| Network | 2× 10GBase-T + 1× management GbE |
| Chassis | Tower convertible 4U atau rackmount 2U |
| Management/security | IPMI 2.0 BMC, TPM 2.0 opsional, VT-d, Intel TXT |

## ARCA MRI — Mainstream Intel

- `product_id`: `ARCA-MRI`
- `source_status`: resmi; halaman publik menyebut dual Intel Xeon Scalable Gen 3, 32 DIMM, PCIe Gen4, dan opsi 12/24 drive 2.5-inch.
- `recommended_positioning`: platform general-purpose untuk virtualisasi, database, e-commerce, ERP/CRM, analytics, dan HCI.

| Komponen | Baseline situs | Baseline modern untuk konfigurasi baru |
|---|---|---|
| CPU | 2× Intel Xeon Scalable Gen 3 | 1–2× Intel Xeon 6 P-core/E-core platform, sesuai kebutuhan lisensi dan workload |
| Memori | 32× DDR4 RDIMM, publik menyebut hingga 8 TB | DDR5 ECC RDIMM; target 256 GB–4 TB, kapasitas maksimum sesuai CPU/platform |
| Expansion | Hingga 9× PCIe Gen4 | PCIe Gen5 + OCP NIC 3.0 |
| Boot | 2× M.2 SATA/PCIe | Dual M.2 NVMe mirrored dengan modul boot hot-plug bila tersedia |
| Front storage | 12/24× 2.5-inch NVMe/SAS/SATA | 8–24× U.2/U.3 NVMe/SAS/SATA sesuai backplane |
| Network | Dual 10GbE + management | Dual 10/25GbE default; 100/200GbE untuk storage/HPC |
| Management | ASMB10-iKVM/AST2600 | BMC Redfish/IPMI, KVM, telemetry, secure boot, TPM 2.0 |
| PSU | Redundant 1600/2400 W | Redundant 1+1 80 PLUS Platinum/Titanium, sizing aktual |

### Paket konfigurasi awal

- **Virtualization Balanced:** 2× CPU 24–32 core, 512 GB RAM, dual M.2 boot, 8× 3.84 TB NVMe, dual 25GbE.
- **Database Performance:** CPU high-frequency, 512 GB–2 TB RAM, mirrored boot, 8–16× enterprise NVMe, RAID/HBA sesuai database, dual 25/100GbE.
- **Application/ERP:** 1–2× CPU 16–32 core, 256–512 GB RAM, RAID 1 boot + RAID 10 data, dual 10/25GbE.

## ARCA MRA — Mainstream AMD

- `product_id`: `ARCA-MRA`
- `source_status`: resmi pada artikel/katalog situs; situs menyebut AMD EPYC 7003 hingga 64 core.
- `recommended_positioning`: VM density tinggi, analytics, database besar, dan HPC berbasis CPU.

| Komponen | Baseline modern |
|---|---|
| CPU | 1–2× AMD EPYC 9005-class; opsi high-frequency, high-core-count, atau dense compute |
| Memori | DDR5 ECC RDIMM, 12 channel per socket pada platform sekelas ini; target 512 GB–6 TB+ |
| Expansion | PCIe Gen5; CXL sesuai CPU/platform; OCP NIC 3.0 |
| Storage | Dual M.2 boot; 8–24× NVMe/SAS/SATA hot-swap |
| Network | 25GbE baseline; 100/200/400GbE untuk HPC/storage fabric |
| Management | Dedicated BMC, Redfish/IPMI, KVM-over-IP, TPM 2.0 |
| PSU | Redundant Platinum/Titanium, hitung dari CPU/NIC/drive/GPU aktual |

## ARCA HDX / HDXi — High-Density Multi-Node

- `product_id`: `ARCA-HDXI`
- `source_status`: resmi.
- `recommended_positioning`: banyak node compute dalam ruang rack minimum untuk cloud, HCI, render farm, HPC, dan cluster aplikasi.

| Komponen | Baseline situs |
|---|---|
| Chassis | 2U multi-node |
| CPU per node | 2× Intel Xeon Scalable Gen 3; materi katalog juga menyebut opsi Intel/AMD |
| Memory per node | 16 DIMM DDR4; materi publik menyebut hingga 8 TB per node |
| Storage | 8× 2.5-inch hot-swap NVMe/SATA/SAS per kelompok konfigurasi + 2× M.2 |
| Expansion | 1× PCIe Gen4 x16 + 1× OCP 3.0 per node |
| Network | OCP 3.0 hingga kelas 200Gbps, tergantung NIC |
| Management | ASMB10-iKVM/AST2600 |
| PSU | Redundant 3000 W 80 PLUS Titanium |

---

# 2. Server Storage — Rainer STOR

## Ringkasan pemilihan

| Model | Status | Bentuk | Sasaran utama |
|---|---|---:|---|
| STOR DSX-MT | Resmi | Desktop/tower NAS | File sharing kantor, backup, surveillance kecil |
| STOR RNQ-5112 | Resmi | 2U 12-bay | NAS/SAN performa dan kapasitas menengah |
| STOR RNQ-8112 | Resmi | 2U 12-bay | Storage enterprise, HA/scale-up sesuai opsi tervalidasi |

> Angka `5112/8112` tidak boleh diterjemahkan otomatis menjadi kapasitas atau performa tanpa datasheet final. Situs mengidentifikasi keduanya sebagai keluarga 2U 12-bay 3.5-inch.

## STOR DSX-MT — Compact NAS

- `product_id`: `STOR-DSX-MT`
- `source_status`: resmi; situs menyebut NAS desktop ringkas dan 4th Gen Intel Xeon pada ringkasan produk.
- `recommended_positioning`: SMB file server, local backup repository, shared project storage, dan NVR ringan.

| Komponen | Baseline modern |
|---|---|
| CPU | 1× server CPU 8–24 core; pilih clock tinggi untuk SMB/NFS dan core lebih banyak untuk compression/dedup |
| Memori | 32–256 GB ECC; tambah RAM untuk ZFS/cache/metadata sesuai dataset |
| Drive bay | 4–12× 3.5/2.5-inch hot-swap SATA/SAS |
| Cache/special device | 2× enterprise NVMe mirrored untuk metadata/cache hanya bila software storage mendukung |
| Boot | 2× SSD/M.2 mirrored, terpisah dari data pool |
| Network | Dual 2.5/10GbE; opsi 25GbE |
| Data protection | ZFS/RAIDZ atau hardware RAID; snapshot; replication; UPS integration |
| PSU | Redundant bila tersedia; otherwise sarankan UPS dan spare PSU |

## STOR RNQ-5112 — 2U 12-Bay Storage

- `product_id`: `STOR-RNQ-5112`
- `source_status`: resmi; situs menyebut 2U 12-bay dan dual AMD EPYC 7003 pada ringkasan.
- `recommended_positioning`: backup repository besar, NAS/SAN bersama, video archive, dan storage virtualisasi.

| Komponen | Baseline modern |
|---|---|
| CPU | 1–2× AMD EPYC, 16–48 core total umumnya cukup; naikkan untuk inline services/dedup |
| Memori | 128 GB–1 TB ECC RDIMM |
| Front bays | 12× 3.5-inch hot-swap SAS/SATA; 2.5-inch SSD via carrier |
| Rear/boot | 2× M.2/U.2 boot mirror; opsi rear hot-swap SSD |
| Controller | HBA SAS 12/24G untuk software-defined storage atau cache-protected RAID controller |
| Network | Dual 10/25GbE; opsi 100GbE untuk throughput/cluster |
| Expansion | PCIe Gen4/Gen5 tergantung platform; NIC/HBA tambahan |
| PSU | Redundant 1+1 80 PLUS Platinum |

## STOR RNQ-8112 — Enterprise 2U 12-Bay Storage

- `product_id`: `STOR-RNQ-8112`
- `source_status`: resmi; detail publik terbatas.
- `recommended_positioning`: storage layanan penting dengan RAM, jaringan, dan opsi redundansi lebih tinggi.

| Komponen | Baseline modern |
|---|---|
| CPU | 1–2× server CPU generasi terkini, 24–64 core total sesuai storage services |
| Memori | 256 GB–2 TB ECC RDIMM; sizing berdasarkan metadata, dedup, dan jumlah client |
| Drive bays | 12× 3.5-inch hot-swap SAS/SATA; opsi all-flash/hybrid hanya setelah backplane dikonfirmasi |
| Cache/metadata | Mirrored enterprise NVMe dengan power-loss protection |
| Network | Dual 25GbE baseline; 100/200GbE opsional; FC 32/64G opsional bila SAN |
| Availability | Redundant PSU/fan; dual controller hanya jika SKU dan software secara resmi mendukung |
| Protocol | SMB, NFS, iSCSI; S3/FC/NVMe-oF bergantung software dan lisensi |

### Aturan sizing storage

1. Kumpulkan `usable_capacity`, bukan hanya raw capacity.
2. Tanyakan pertumbuhan per tahun, masa retensi, rasio snapshot, dan target headroom. Default desain: sisakan 15–25% ruang bebas.
3. Tanyakan profil I/O: sequential/random, read/write ratio, block size, IOPS, throughput, latency, jumlah concurrent user/VM.
4. Jangan menyamakan RAID dengan backup. Untuk data penting wajib ada salinan terpisah dan idealnya off-site/immutable.
5. Gunakan drive enterprise dengan workload rating dan endurance yang sesuai; hindari mixing drive tanpa validasi.
6. Untuk HDD besar, prioritaskan skema dual-parity/RAID 6/RAIDZ2; RAID 10 untuk latency dan write-heavy workload.

---

# 3. Server AI — Rainer AIX

## Identitas keluarga

- `family_id`: `RAINER-AIX`
- `source_status`: keluarga Arca AIX/AI Server tercantum di situs. Halaman kategori lama juga memuat nama ARCA HRK dan CANDI HD3; perlakukan nama tersebut sebagai legacy sampai tim produk mengonfirmasi mapping terkini.
- `recommended_positioning`: GPU compute untuk inference, fine-tuning, training, computer vision, generative AI, VDI, dan rendering.

## Profil konfigurasi (bukan SKU resmi)

| Profil | GPU | Bentuk tipikal | Sasaran |
|---|---:|---:|---|
| AIX Edge/Inference | 1–2 | 2U/4U | Vision, RAG inference, model serving departemen |
| AIX G4 | hingga 4 | 4U/5U | Fine-tuning, render, multi-user inference |
| AIX G8 | hingga 8 | 6U–10U | Training dan HPC GPU skala enterprise |
| AIX HGX-Class | 8 accelerator SXM | 8U–10U | Training model besar dan fabric GPU berbandwidth tinggi |

## AIX Edge/Inference

| Komponen | Baseline modern |
|---|---|
| CPU | 1–2× Intel Xeon 6 atau AMD EPYC 9005-class, 24–64 core total |
| GPU | 1–2× accelerator datacenter low/full-height sesuai model, VRAM 24–96 GB per GPU |
| Memory | 256 GB–1 TB ECC DDR5 |
| Storage | Dual M.2 boot; 2–8× enterprise NVMe untuk model/cache/data |
| Network | Dual 25GbE; 100GbE bila terhubung ke shared storage/cluster |
| PSU | Redundant Platinum/Titanium; kalkulasi terhadap GPU TDP dan power cap |
| Use case | LLM inference, embedding, reranking, computer vision, VDI |

## AIX G4 — Four-GPU Server

| Komponen | Baseline modern |
|---|---|
| CPU | 2× Intel Xeon 6 atau AMD EPYC 9005-class |
| GPU | Hingga 4× NVIDIA RTX PRO/accelerator datacenter PCIe atau AMD Instinct PCIe yang tervalidasi |
| Memory | 512 GB–2 TB ECC DDR5 |
| GPU interconnect | PCIe Gen5; peer-to-peer/NVLink hanya bila GPU dan platform mendukung |
| Storage | 2× boot mirror + 4–8× NVMe Gen4/Gen5 enterprise |
| Network | Dual 100GbE/200GbE atau InfiniBand untuk cluster; 25GbE untuk standalone |
| PSU/cooling | Redundant high-efficiency 2–3 kW class; cek 220–240 V, konektor, airflow, dan rack density |
| Use case | Fine-tuning, batch inference, rendering, simulation, data science bersama |

## AIX G8 / HGX-Class — Eight-GPU Server

| Komponen | Baseline modern |
|---|---|
| CPU | 2× high-core-count server CPU; jaga lane PCIe dan NUMA balance |
| GPU | 8× accelerator PCIe atau 8× SXM/HGX platform; seri/generasi ditentukan saat quotation |
| GPU memory | Ditentukan model: utamakan total VRAM, bandwidth, precision, dan model fit |
| System memory | 1–4 TB ECC DDR5; lebih tinggi untuk data preprocessing dan large dataset cache |
| Local storage | Mirrored boot + 8–16× enterprise NVMe; pisahkan OS, scratch, dan dataset bila perlu |
| Fabric | 200/400/800GbE atau InfiniBand sesuai skala cluster dan generasi NIC |
| Management | BMC/Redfish, GPU telemetry, secure boot/TPM, remote console |
| Power/cooling | Redundant Titanium; fasilitas 3-phase/liquid cooling mungkin diperlukan pada accelerator generasi terbaru |
| Use case | LLM training, multimodal training, HPC AI, foundation-model fine-tuning besar |

### Pertanyaan wajib sizing AI

- Nama model, parameter count, framework, precision (`FP32/TF32/BF16/FP16/FP8/INT8/INT4`), training atau inference.
- Target tokens/second, requests/second, concurrency, latency, batch size, context length, dan SLA.
- Full training, fine-tuning/LoRA, atau inference saja; single node atau scale-out.
- Dataset size, ingestion rate, preprocessing CPU/RAM, scratch space, checkpoint frequency, dan retensi.
- Kebutuhan VRAM per model setelah quantization/KV cache; jangan memilih GPU hanya dari TOPS/FLOPS.
- Daya per rack, tegangan, konektor PDU, pendinginan udara/cairan, berat rack, dan kebisingan.
- Software stack dan lisensi: driver, CUDA/ROCm, container runtime, orchestrator, AI Enterprise/support, OS.

---

# 4. Workstation — Rainer WORX

## Ringkasan pemilihan

| Model | Status | Kelas | Sasaran utama |
|---|---|---|---|
| WORX WRXi E-Class | Resmi | Mainstream workstation | CAD, desain, editing, development, data science ringan |
| WORX WRXi W-Class | Resmi | Enterprise workstation | Multi-GPU, AI lokal, rendering, simulasi, dataset besar |

## WORX WRXi E-Class

- `product_id`: `WORX-WRXI-E`
- `source_status`: resmi; publik saat ini menyebut Intel Core Gen 12/13, DDR4 hingga 128 GB, PCIe 5.0, 2.5GbE/Wi-Fi 6E, dan PSU 1200 W.
- `recommended_positioning`: pengguna profesional tunggal yang mengutamakan clock tinggi, GPU profesional, dan kemudahan upgrade.

| Komponen | Baseline modern untuk refresh |
|---|---|
| CPU | Intel Core Ultra desktop/workstation-class atau AMD Ryzen 9000-class, 12–24 core sesuai aplikasi |
| Memory | 64–192 GB DDR5; ECC bila CPU/platform mendukung dan workflow kritis |
| GPU | 1× NVIDIA RTX PRO/GeForce RTX atau AMD Radeon Pro/Radeon yang tersertifikasi untuk aplikasi |
| GPU memory | 16–32 GB untuk CAD/DCC umum; 32–96 GB untuk AI, 8K, scene besar |
| Storage | 1–2 TB NVMe OS/apps + 2–8 TB NVMe project/scratch + HDD/backup opsional |
| Network | 2.5GbE + Wi-Fi 6E/7; opsi 10GbE |
| PSU | 850–1600 W 80 PLUS Gold/Platinum sesuai GPU |
| OS | Windows 11 Pro; Linux bila workflow mendukung |

### Paket konfigurasi awal

- **CAD Pro:** CPU high-frequency, 64 GB RAM, GPU professional 16 GB, 1 TB OS + 2 TB project NVMe.
- **Content Creator:** 16–24 core CPU, 128 GB RAM, GPU 24–32 GB, 2 TB OS + 4 TB scratch NVMe, 10GbE opsional.
- **Local AI Developer:** 128–192 GB RAM, GPU 32–96 GB VRAM, 2 TB OS + 4–8 TB dataset NVMe, 10GbE.

## WORX WRXi W-Class

- `product_id`: `WORX-WRXI-W`
- `source_status`: resmi; situs menyebut Intel Xeon W-2400/W-3400, 8 DIMM DDR5 ECC hingga 2 TB, hingga empat GPU, 8 hot-swap bay, 10GbE + 2.5GbE, dan PSU 800–2000 W.
- `recommended_positioning`: workstation enterprise untuk AI, render, simulation, engineering, dan visualisasi besar.

| Komponen | Baseline situs | Baseline modern untuk refresh |
|---|---|---|
| CPU | Intel Xeon W-2400/W-3400 | Intel Xeon W-2500/W-3500-class atau penerus yang tersedia |
| Memory | 8× DDR5 ECC RDIMM, hingga 2 TB | 128 GB–2 TB ECC RDIMM, channel population seimbang |
| GPU | Hingga 4× NVIDIA RTX/Quadro | 1–4× NVIDIA RTX PRO atau accelerator PCIe tervalidasi |
| Expansion | Hingga 5× PCIe Gen5 | PCIe Gen5; validasi lane bifurcation, spacing, dan thermals |
| Storage | M.2, SlimSAS, 4× SATA; 8 hot-swap expandable 12 | Dual NVMe OS + NVMe scratch + hot-swap data/backup |
| Network | 10GbE + 2.5GbE | 10GbE baseline; 25/100GbE untuk shared dataset |
| PSU | 800/1200/1600/2000 W | 1600–2000 W+ redundant/CRPS bila multi-GPU dan chassis mendukung |
| OS | Windows 10/11 Pro 64-bit | Windows 11 Pro for Workstations atau Linux tervalidasi |

---

# 5. Decision Logic untuk Rainer AI Assistant

## Routing awal

1. Jika perangkat untuk satu pengguna dan harus berada di meja/studio → `WORX`.
2. Jika tujuan utama menyediakan file, backup, archive, NAS/SAN/object storage → `STOR`.
3. Jika GPU wajib untuk training/inference/render multi-user → `AIX`.
4. Selain itu, untuk VM, database, aplikasi, web, ERP, HCI, atau HPC CPU → `ARCA`.

## Faktor pemilihan model

| Sinyal kebutuhan | Rekomendasi awal |
|---|---|
| 5–50 user, layanan kantor dasar | ARCA EVT/EVT-A |
| Entry tetapi perlu bay/PCIe/rack lebih fleksibel | ARCA EVR/EVR-A |
| VM, database, ERP, aplikasi enterprise | ARCA MRI/MRA |
| Banyak node identik dan rack space terbatas | ARCA HDXi |
| NAS/backup kantor | STOR DSX-MT |
| 12-bay shared storage/backup | STOR RNQ-5112 |
| Storage kritis dengan network/RAM/availability tinggi | STOR RNQ-8112, setelah validasi opsi HA |
| AI inference 1–2 GPU | AIX Edge/Inference |
| Fine-tuning/render 2–4 GPU | AIX G4 |
| Training besar/8 GPU | AIX G8 atau HGX-Class |
| CAD/editing single GPU | WORX E-Class |
| AI/render/simulation multi-GPU | WORX W-Class |

## Data discovery minimum

AI harus mengumpulkan paling sedikit:

- Profil organisasi, lokasi pemasangan, jumlah user, aplikasi/workload, dan criticality.
- Kondisi saat ini, bottleneck, target performa, pertumbuhan 3–5 tahun, dan jadwal implementasi.
- CPU: core/thread, clock sensitivity, socket/licensing constraint.
- RAM: pemakaian puncak, working set, ECC, dan target headroom.
- Storage: usable TB, IOPS/throughput/latency, retention, growth, RAID, backup, dan protocol.
- GPU: model/framework/precision/VRAM/concurrency atau aplikasi ISV dan sertifikasinya.
- Network: jumlah port, speed, media copper/fiber, switch existing, VLAN/RDMA/FC/IB.
- Availability: SLA, redundancy, clustering, RTO/RPO, backup, DR, dan management remote.
- Fasilitas: rack depth/U, daya, PDU/plug, UPS, cooling, suhu, suara, dan berat.
- Software: OS, hypervisor, database, CAL/subscription, support, dan security requirement.
- Komersial: kisaran anggaran, preferensi CAPEX/OPEX, garansi, SLA support, lokasi, dan lead time.

## Aturan konfigurasi

- Targetkan CPU rata-rata 50–70% pada beban normal dan sediakan headroom untuk peak/growth.
- Untuk virtualisasi, hitung seluruh VM plus hypervisor overhead, HA reserve, dan memory growth; jangan hanya menjumlahkan vCPU.
- Populasikan DIMM seimbang per memory channel dan CPU.
- Gunakan enterprise SSD dengan power-loss protection untuk workload write-intensive.
- Pisahkan boot, data, scratch, dan backup bila risiko atau performa menuntut.
- Gunakan redundant PSU/NIC/boot untuk layanan penting; redundancy end-to-end termasuk switch, listrik, dan storage path.
- Pada multi-socket/multi-GPU, perhatikan NUMA locality, PCIe topology, peer-to-peer support, dan CPU-to-GPU ratio.
- Sertakan minimal 20% capacity headroom kecuali customer menyetujui desain berbeda.

---

# 6. Struktur output proposal

Proposal yang dibuat AI sebaiknya memiliki bagian berikut:

1. Ringkasan kebutuhan dan asumsi.
2. Produk Rainer yang direkomendasikan dan alasan pemilihan.
3. Bill of Materials tingkat konfigurasi: chassis, CPU, RAM, GPU, boot, data storage, RAID/HBA, NIC/transceiver, PSU, rail kit, OS/lisensi, support.
4. Tabel spesifikasi konfigurasi aktual—bukan hanya kapasitas maksimum platform.
5. Arsitektur singkat dan integrasi dengan lingkungan customer.
6. Kapasitas/performa yang ditargetkan dan metode validasi/benchmark.
7. Opsi Good/Better/Best dengan perbedaan yang terukur.
8. Layanan implementasi, migrasi, training, warranty, dan support.
9. Asumsi, dependency, pengecualian, risiko, dan item yang perlu dikonfirmasi.
10. Harga, pajak, masa berlaku, lead time, dan syarat pembayaran dari sistem komersial—bukan dikarang oleh LLM.

## Template data konfigurasi untuk backend

```yaml
recommendation:
  category: ARCA | STOR | AIX | WORX
  product_id: ""
  configuration_name: ""
  quantity: 1
  workload_summary: ""
  assumptions: []
  components:
    chassis: {form_factor: "", drive_bays: ""}
    cpu: {model: "TBD", sockets_populated: 0, quantity: 0, cores_total: 0}
    memory: {type: "ECC", capacity_gb: 0, dimm_layout: "TBD"}
    gpu: {model: "TBD/None", quantity: 0, vram_total_gb: 0}
    boot: {device: "", quantity: 0, protection: "RAID1/mirror"}
    data_storage: {device: "", quantity: 0, raw_tb: 0, usable_tb_estimate: 0}
    controller: {type: "HBA/RAID/software-defined", cache_protection: ""}
    network: {ports: 0, speed_gbps: 0, media: "RJ45/SFP/QSFP"}
    psu: {quantity: 0, watts_each: 0, redundancy: ""}
    management: {bmc: true, protocol: "IPMI/Redfish"}
    software: {os: "TBD", licenses: []}
    support: {term_years: 0, sla: "TBD"}
  validation_required: []
  alternatives: []
```

---

# 7. Guardrails LLM

- Jangan membuat harga, diskon, stok, lead time, sertifikasi, benchmark, atau part number tanpa sumber internal yang aktif.
- Jangan mengklaim GPU tertentu kompatibel sebelum chassis, motherboard, BIOS, power cable, PSU, airflow, dan vendor support matrix diverifikasi.
- Jangan mengklaim `HA`, `zero downtime`, `lossless`, atau `unlimited` tanpa desain dan SLA yang mendukung.
- Jika data resmi dan baseline modern berbeda, tampilkan keduanya dan minta konfirmasi apakah customer membutuhkan platform existing atau refresh.
- Jika requirement belum lengkap, keluarkan rekomendasi bersyarat dan daftar pertanyaan; jangan menyamarkan asumsi sebagai fakta.
- Quotation final harus melalui approval manusia dari sales/product/solution architect.

---

# 8. Sumber publik utama

- Situs utama: https://rainerserver.net/
- ARCA entry: https://rainerserver.net/entry
- ARCA EVR: https://rainerserver.net/products/P0002
- ARCA MRI: https://rainerserver.net/mainstream/mri
- ARCA mainstream: https://rainerserver.net/category/C02
- Rainer STOR: https://rainerserver.net/stor dan https://www.rainerserver.net/category/C06
- Rainer WORX: https://rainerserver.net/worx
- WORX E-Class: https://rainerserver.net/worx/e-class
- WORX W-Class: https://rainerserver.net/worx/w-class
- AI Server/AIX: https://rainerserver.net/category/C03
- Artikel ARCA HDXi: https://rainerserver.net/articles/mengoptimalkan-performa-data-center-dengan-solusi-server-high-density
- Katalog publik: https://rainerserver.net/storage/books/Rainer-Catalogue%20Rainer-Catalogue.pdf

# 9. Referensi Publik Produsen Komponen

## Fungsi dan batasan referensi

Daftar berikut adalah sumber primer produsen untuk membantu Rainer AI Assistant mencari spesifikasi teknis, status produk, driver, firmware, dan dokumen kompatibilitas. Keberadaan suatu komponen pada situs produsen **tidak berarti** komponen tersebut otomatis tersedia, didukung, atau tersertifikasi pada produk Rainer.

Urutan validasi komponen untuk proposal:

1. Datasheet dan compatibility matrix resmi Rainer untuk SKU/chassis yang dipilih.
2. Qualified Vendor List (`QVL`) motherboard/system, daftar GPU tervalidasi, serta support matrix controller/backplane.
3. Product brief, datasheet, driver, firmware, dan lifecycle notice dari produsen komponen.
4. Validasi fisik dan elektrik: form factor, socket, BIOS, TDP, DIMM topology, PCIe lane, slot width, kabel, connector, airflow, PSU, dan input power.
5. Persetujuan tim product/solution architect Rainer sebelum quotation final.

## 9.1 Processor dan platform CPU

| Produsen | Keluarga relevan | Digunakan untuk | Sumber resmi |
|---|---|---|---|
| Intel | Xeon 6 | ARCA mainstream/high-density, AIX, dan server storage modern | [Intel Xeon 6](https://www.intel.com/content/www/us/en/products/details/processors/xeon/xeon6.html) |
| Intel | Xeon Scalable legacy/current archive | Validasi ARCA EVR, MRI, HDXi, dan platform publik generasi terdahulu | [Intel ARK — Xeon Scalable](https://ark.intel.com/content/www/us/en/ark/products/series/125191/intel-xeon-scalable-processors.html) |
| Intel | Xeon E | ARCA EVT entry server | [Intel ARK — Xeon E](https://ark.intel.com/content/www/us/en/ark/products/series/134861/intel-xeon-e-processor.html) |
| Intel | Xeon W | WORX W-Class | [Intel Xeon W](https://www.intel.com/content/www/us/en/products/details/processors/xeon/w.html) |
| Intel | Core Ultra desktop | WORX E-Class modern | [Intel Core Ultra desktop processors](https://www.intel.com/content/www/us/en/products/details/processors/core-ultra/desktop.html) |
| AMD | EPYC 9006 | Kandidat server AMD generasi terbaru; gunakan hanya bila platform Rainer telah divalidasi | [AMD EPYC 9006](https://www.amd.com/en/products/processors/server/epyc/9006-series.html) |
| AMD | EPYC 9005 | ARCA MRA/AIX/STOR mainstream modern | [AMD EPYC 9005](https://www.amd.com/en/products/processors/server/epyc/9005-series.html) |
| AMD | EPYC 9004 | Platform DDR5/PCIe Gen5 yang masih relevan | [AMD EPYC 9004](https://www.amd.com/en/products/processors/server/epyc/9004-series.html) |
| AMD | EPYC 8004/8005 | Single-socket, edge, storage, dan compute efisien | [AMD EPYC 8004](https://www.amd.com/en/products/processors/server/epyc/8004-series.html) |
| AMD | EPYC 7003 | Validasi ARCA MRA dan RNQ-5112 generasi publik | [AMD EPYC 7003](https://www.amd.com/en/products/processors/server/epyc/7003-series.html) |
| AMD | EPYC 4004/4005 | ARCA EVT-A/EVR-A entry server | [AMD EPYC server processors](https://www.amd.com/en/products/processors/server/epyc.html) |
| AMD | Ryzen Threadripper PRO | WORX W-Class berbasis AMD | [AMD Ryzen Threadripper PRO](https://www.amd.com/en/products/processors/workstations/ryzen-threadripper.html) |
| AMD | Ryzen desktop | WORX E-Class berbasis AMD | [AMD Ryzen desktop processors](https://www.amd.com/en/products/processors/desktops/ryzen.html) |

### Atribut CPU yang harus diambil AI

- Exact model/SKU, socket, jumlah socket yang didukung, core/thread, base/boost clock, cache, TDP/cTDP.
- Memory generation, channel count, maksimum speed/capacity, ECC/RDIMM/UDIMM support, dan DIMM-per-channel rule.
- PCIe generation/lane count, CXL support, accelerator features, security features, dan OS/hypervisor support.
- Status lifecycle dan tanggal dokumen. Jangan mencampur spesifikasi antargenerasi atau menganggap semua fitur CPU diaktifkan motherboard.

## 9.2 GPU dan accelerator

| Produsen | Keluarga relevan | Digunakan untuk | Sumber resmi |
|---|---|---|---|
| NVIDIA | Data Center GPU, HGX, MGX | AIX training/inference/HPC | [NVIDIA Data Center products](https://www.nvidia.com/en-us/data-center/products/) |
| NVIDIA | RTX PRO | WORX dan AIX PCIe untuk visual computing, inference, fine-tuning, render | [NVIDIA RTX PRO](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/) |
| NVIDIA | RTX PRO 6000 Blackwell family | Kandidat GPU profesional/server 96 GB; pilih varian Server/Workstation yang benar | [RTX PRO 6000 Blackwell Series](https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000-family/) |
| NVIDIA | Certified Systems | Referensi sistem/GPU yang telah melalui program validasi NVIDIA | [NVIDIA-Certified Systems](https://docs.nvidia.com/certification-programs/latest/nvidia-certified-systems.html) |
| AMD | Instinct accelerators | AIX training, inference, dan HPC berbasis ROCm | [AMD Instinct](https://www.amd.com/en/products/accelerators/instinct.html) |
| AMD | Radeon PRO workstation | WORX CAD, DCC, engineering, dan visualization | [AMD Radeon PRO](https://www.amd.com/en/products/graphics/workstations/radeon-pro.html) |
| AMD | Radeon AI PRO | WORX AI lokal; perhatikan bahwa varian tertentu tidak direkomendasikan untuk data center | [AMD Radeon AI PRO](https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro.html) |
| Intel | Data Center GPU Flex/Max | Media, VDI, inference, dan HPC pada sistem yang tervalidasi | [Intel Data Center GPU](https://www.intel.com/content/www/us/en/products/details/discrete-gpus/data-center-gpu.html) |
| Intel | Arc Pro | WORX workstation entry/mainstream pada aplikasi yang didukung | [Intel Arc Pro Graphics](https://www.intel.com/content/www/us/en/products/details/discrete-gpus/arc/workstations.html) |

### Atribut GPU yang harus diambil AI

- Exact model dan varian: active/passive cooling, server/workstation edition, PCIe/SXM/OAM, full-height/low-profile, slot width, panjang, dan berat.
- VRAM usable, memory bandwidth, ECC, supported precision, codec/media engine, partitioning/vGPU, peer-to-peer, dan interconnect.
- Board power/TDP, connector, minimum PSU, airflow direction, inlet temperature, serta jumlah GPU maksimum yang tervalidasi.
- Driver, CUDA/ROCm/oneAPI version, framework support, OS support, licensing, dan application/ISV certification.
- Untuk server, kartu desktop/open-air tidak boleh diasumsikan cocok digunakan 24/7 atau pada chassis passive-airflow.

## 9.3 Motherboard, barebone, dan platform server

Rainer dapat menggunakan desain motherboard/barebone yang berbeda antar-revisi. Vendor berikut adalah **referensi ekosistem**, bukan pernyataan bahwa semua motherboard tersebut dipakai Rainer.

| Produsen | Fokus referensi | Sumber resmi |
|---|---|---|
| ASUS | Server motherboard, server system, GPU server; relevan karena halaman Rainer menyebut ASMB10-iKVM/AST2600 pada beberapa model | [ASUS Server Motherboards](https://servers.asus.com/products/Servers/Server-Motherboards) |
| ASRock Rack | Server motherboard, barebone, storage, workstation, dan GPU server | [ASRock Rack](https://www.asrockrack.com/) |
| GIGABYTE Enterprise | Server motherboard, rack server, GPU server, dan high-density platform | [GIGABYTE Enterprise Servers](https://www.gigabyte.com/Enterprise) |
| Supermicro | Server motherboard/system matrices, GPU, storage, dan multi-node reference | [Supermicro Product Matrices](https://www.supermicro.com/en/support/product-matrices) |
| Tyan | Server/workstation motherboards dan barebones | [Tyan Products](https://www.tyan.com/Motherboards) |

### Data motherboard/platform yang wajib dicatat

- Manufacturer, exact model, PCB revision, BIOS/BMC version, socket, chipset, CPU support list, dan maximum CPU TDP.
- DIMM count/topology, supported memory type/capacity/speed, QVL, serta batas saat 1DPC/2DPC.
- PCIe slot map per CPU, generation, electrical width, physical width, bifurcation, shared lanes, OCP slot, dan CXL.
- SATA/SAS/NVMe connectors, SlimSAS/MCIO/OCuLink pinout, backplane compatibility, M.2 key/length, dan boot RAID support.
- Onboard NIC/BMC/TPM, management protocol, fan header/zoning, chassis compatibility, dan OS certification.

## 9.4 Network adapter, DPU, InfiniBand, dan Fibre Channel

| Produsen | Keluarga relevan | Sumber resmi |
|---|---|---|
| Intel | I210/I350, X550/X710, E810/E830/E835, PCIe dan OCP NIC | [Intel Ethernet Products](https://www.intel.com/content/www/us/en/products/details/ethernet.html) |
| NVIDIA Networking | ConnectX/SuperNIC, BlueField DPU, Spectrum-X Ethernet, Quantum InfiniBand | [NVIDIA Networking](https://www.nvidia.com/en-us/networking/) |
| AMD Pensando | DPU dan infrastructure accelerator | [AMD Pensando](https://www.amd.com/en/products/accelerators/pensando.html) |
| Broadcom | NetXtreme Ethernet adapters/controllers | [Broadcom Ethernet Network Adapters](https://www.broadcom.com/products/ethernet-connectivity/network-adapters) |
| Marvell | FastLinQ Ethernet dan QLogic Fibre Channel HBA | [Marvell Fibre Channel adapters](https://www.marvell.com/products/fibre-channel-adapters-and-controllers.html) |
| Marvell | Driver dan firmware QLogic/FastLinQ | [Marvell adapter support](https://www.marvell.com/support/fibre-channel-adapters.html) |

### Atribut network yang harus diambil AI

- Exact adapter, PCIe/OCP form factor, port count/speed, media, connector, supported optics/DAC/AOC, dan PCIe bandwidth.
- Ethernet offloads, SR-IOV, RDMA/RoCE/iWARP, PTP, DPDK, boot-from-SAN/PXE, virtualization support, serta OS/hypervisor driver.
- Untuk InfiniBand/RDMA: topology, fabric generation, switch compatibility, subnet manager, cable reach, dan end-to-end lossless configuration.
- Untuk Fibre Channel: 16/32/64G class, SFP compatibility, switch/storage interoperability, multipath driver, dan zoning.

## 9.5 Storage controller, HBA, RAID, dan SAS expander

| Produsen | Keluarga relevan | Sumber resmi |
|---|---|---|
| Broadcom | MegaRAID hardware RAID dan Tri-Mode | [Broadcom MegaRAID controllers](https://www.broadcom.com/products/storage/raid-controllers) |
| Broadcom | 9500-series SAS/SATA/NVMe Tri-Mode reference | [MegaRAID 9500 product brief](https://docs.broadcom.com/doc/MegaRAID-9500-Tri-Mode-Storage-Adapters) |
| Broadcom | HBA/SAS controller untuk software-defined storage | [Broadcom Host Bus Adapters](https://www.broadcom.com/products/storage/host-bus-adapters) |
| Microchip Adaptec | SmartRAID hardware RAID | [Adaptec SmartRAID](https://www.microchip.com/en-us/products/storage/adaptec-smartraid-raid-adapters) |
| Microchip Adaptec | SmartHBA/HBA untuk SAS/SATA | [Adaptec SmartHBA](https://www.microchip.com/en-us/products/storage/adaptec-smarthba-hba-adapters) |

### Aturan validasi controller

- Cocokkan exact controller firmware dengan motherboard BIOS/BMC, backplane, expander, kabel, connector, dan drive compatibility report.
- Jangan menganggap label `Tri-Mode` berarti semua bay dapat menggunakan NVMe/SAS/SATA sekaligus; telusuri lane mapping dan backplane design.
- Hardware RAID dengan write-back cache harus menggunakan cache/flash backup yang valid dan kebijakan battery/capacitor health.
- Untuk ZFS/Ceph/software-defined storage, prioritaskan HBA/JBOD mode yang direkomendasikan software; hindari hardware RAID di bawahnya kecuali arsitektur mensyaratkan.

## 9.6 SSD dan HDD enterprise

| Produsen | Keluarga/fokus | Sumber resmi |
|---|---|---|
| Samsung Semiconductor | Enterprise NVMe/SAS SSD | [Samsung Enterprise SSD](https://semiconductor.samsung.com/ssd/enterprise-ssd/) |
| Micron | Data center NVMe/SATA SSD | [Micron Data Center SSD](https://www.micron.com/products/storage/ssd/data-center-ssd) |
| Solidigm | Data center SSD | [Solidigm Data Center SSD](https://www.solidigm.com/products/data-center.html) |
| KIOXIA | Enterprise/data-center NVMe/SAS SSD | [KIOXIA Enterprise SSD](https://americas.kioxia.com/en-us/business/ssd/enterprise-ssd.html) |
| Seagate | Exos HDD dan Nytro SSD | [Seagate Enterprise Drives](https://www.seagate.com/products/enterprise-drives/) |
| Western Digital | Ultrastar data-center HDD/SSD | [Western Digital Data Center Drives](https://www.westerndigital.com/solutions/data-center/data-center-drives) |
| Toshiba | MG enterprise capacity HDD | [Toshiba Enterprise HDD](https://storage.toshiba.com/enterprise-hdd) |

### Atribut drive yang harus diambil AI

- Exact part number, capacity, interface/protocol, form factor/height, sector format, endurance (`DWPD/TBW`), workload rating, dan power-loss protection.
- Sequential/random performance pada workload yang relevan, latency/QoS, power, thermal envelope, MTBF/AFR, warranty, dan firmware.
- SED/FIPS support, sanitize/secure erase, dual-port SAS/NVMe bila dibutuhkan, hot-plug support, dan controller/backplane compatibility.
- Untuk HDD: CMR/SMR technology, vibration specification, rebuild behavior, sector size, dan suitability untuk RAID.
- Untuk SSD: jangan membandingkan hanya kapasitas dan peak bandwidth; perhatikan sustained write, endurance, over-provisioning, dan steady-state QoS.

## 9.7 Memory server/workstation

| Produsen | Fokus | Sumber resmi |
|---|---|---|
| Micron | DDR5 RDIMM/MRDIMM, ECC server memory | [Micron Server Memory](https://www.micron.com/products/memory/dram-components/server-memory) |
| Samsung Semiconductor | Server DRAM modules | [Samsung DRAM Modules](https://semiconductor.samsung.com/dram/module/) |
| SK hynix | Server DRAM dan memory products | [SK hynix DRAM](https://product.skhynix.com/products/dram/dram.go) |
| Kingston | Server Premier dan system-specific memory | [Kingston Server Memory](https://www.kingston.com/en/memory/server-premier) |

### Aturan validasi memory

- Exact module part number harus tercantum di QVL atau disetujui vendor/platform integrator.
- Jangan mencampur RDIMM, LRDIMM, MRDIMM, UDIMM, ECC/non-ECC, speed grade, rank, capacity, atau vendor lot tanpa validasi.
- Populasikan channel secara simetris per CPU dan ikuti population rule motherboard; kapasitas maksimum sering menurunkan memory speed.

## 9.8 Power supply, chassis, cooling, dan rack

| Organisasi/produsen | Fokus | Sumber resmi |
|---|---|---|
| 80 PLUS | Verifikasi level efisiensi PSU berdasarkan model | [80 PLUS Certified Power Supplies](https://www.clearesult.com/80plus/manufacturers/80plus-power-supplies) |
| Intel | ATX/PSU design guidance | [Intel Power Supply Design Guides](https://www.intel.com/content/www/us/en/design/products-and-solutions/processors-and-chipsets/platform-design/power-supply-design-guide.html) |
| Delta | Server/data-center power dan cooling | [Delta Data Center Power Solutions](https://www.deltaww.com/en-US/products/Data-Center/ALL/) |
| Schneider Electric APC | Rack, UPS, PDU, cooling, dan sizing tools | [APC Data Center and Facility 3 Phase UPS](https://www.apc.com/us/en/product-category/88976-data-center-and-facility-3-phase-ups/) |

### Aturan sizing power/cooling

- Catat rated/peak power setiap komponen, redundancy mode, input voltage, phase, amperage, plug, PDU outlet, dan derating.
- Untuk GPU server, hitung steady-state dan transient load; validasi airflow static pressure serta facility heat rejection.
- Label 80 PLUS hanya menunjukkan efisiensi pada kondisi uji tertentu, bukan jaminan kapasitas, kualitas, redundancy, atau kompatibilitas.

## 9.9 Software, firmware, dan compatibility ecosystem

| Ekosistem | Digunakan untuk | Sumber resmi |
|---|---|---|
| Microsoft Windows Server | OS, hardware certification, dan lifecycle | [Windows Server](https://www.microsoft.com/en-us/windows-server) |
| Microsoft Windows Hardware Compatibility | Verifikasi komponen/sistem Windows | [Windows Compatible Products List](https://learn.microsoft.com/en-us/windows-hardware/drivers/dashboard/hardware-certification-submissions) |
| Red Hat | RHEL hardware ecosystem | [Red Hat Ecosystem Catalog](https://catalog.redhat.com/) |
| Ubuntu | Certified server hardware | [Ubuntu Certified Hardware](https://ubuntu.com/certified) |
| VMware | Compatibility guide untuk server, I/O, storage, dan device | [Broadcom Compatibility Guide](https://compatibilityguide.broadcom.com/) |
| NVIDIA | NGC containers, frameworks, dan AI software | [NVIDIA NGC Catalog](https://catalog.ngc.nvidia.com/) |
| AMD | ROCm compatibility dan documentation | [AMD ROCm Documentation](https://rocm.docs.amd.com/) |
| Intel | oneAPI toolkit dan GPU/accelerator software | [Intel oneAPI](https://www.intel.com/content/www/us/en/developer/tools/oneapi/overview.html) |

## 9.10 Skema metadata sumber komponen

Setiap komponen yang dimasukkan ke knowledge base terstruktur sebaiknya mempunyai metadata berikut:

```yaml
component_source:
  component_type: cpu | gpu | motherboard | nic | hba | raid | ssd | hdd | memory | psu
  manufacturer: ""
  family: ""
  exact_model: ""
  manufacturer_part_number: ""
  official_product_url: ""
  datasheet_url: ""
  support_url: ""
  driver_firmware_url: ""
  lifecycle_status: current | legacy | eol | unknown
  source_published_at: null
  last_verified_at: null
  rainer_supported_products: []
  rainer_validation_status: unverified | lab-tested | qualified | production-approved
  compatibility_evidence: []
  restrictions: []
  notes: ""
```

## Catatan pemeliharaan

- Review triwulanan atau setiap ada perubahan katalog.
- Simpan `last_verified_at`, `verified_by`, dan URL sumber per SKU pada versi database berikutnya.
- Versi produksi sebaiknya memecah dokumen ini menjadi record per produk/configuration profile agar retrieval tidak mencampur batas maksimum antar-SKU.
- Hubungkan price list, inventory, warranty matrix, dan compatibility matrix dari sumber terstruktur internal; jangan menaruh data dinamis tersebut secara manual di knowledge base statis.
