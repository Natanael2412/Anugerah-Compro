export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  publishedAt: string; // ISO date string
  readingTime: number; // minutes
  tags: string[];
  is_av_published: boolean;
}

/**
 * Hardcoded placeholder articles — Phase 4 will replace with Supabase queries.
 * Fields mirror the Supabase `articles` table schema.
 */
export const articles: Article[] = [
  {
    id: "art-001",
    slug: "technical-leadership-vs-management",
    title: "Technical Leadership vs. Technical Management: Garis yang Sering Tertukar",
    excerpt:
      "Banyak organisasi mengangkat engineer terbaik mereka menjadi manager — dan kehilangan keduanya. Ini bukan tentang hierarki, ini tentang di mana energi Anda menghasilkan leverage tertinggi.",
    publishedAt: "2024-10-15",
    readingTime: 7,
    tags: ["Leadership", "Engineering", "Organization"],
    is_av_published: true,
    content_md: `
## Masalah yang Tidak Pernah Diakui

Setiap perusahaan teknologi pada titik tertentu membuat keputusan yang sama: *engineer terbaiknya dipromosikan menjadi manager*. Keputusan ini terasa logis dari luar. Reward progression. Pipeline kepemimpinan. Retensi talent.

Tetapi dalam praktik, ini sering menghasilkan dua kerugian sekaligus: satu engineer luar biasa yang hilang, dan satu manager yang tidak pernah sepenuhnya siap.

## Apa yang Sebenarnya Dibutuhkan Organisasi

Technical Leadership dan Technical Management adalah dua disiplin yang berbeda — bukan satu spektrum linear.

**Technical Leader** menyelesaikan masalah dengan *pengaruh teknis*. Mereka mendefinisikan arsitektur, menentukan standar, memandu keputusan teknis yang berdampak lintas tim. Mereka tidak harus mengelola manusia — mereka mengelola sistem dan keputusan.

**Technical Manager** menyelesaikan masalah dengan *memaksimalkan kapasitas tim*. Mereka menghilangkan hambatan, mengalokasikan prioritas, membangun psikologis aman, dan memastikan individu di tim mereka berkembang. Mereka bisa saja tidak menulis satu baris kode pun dalam seminggu — dan itu valid.

## Leverage yang Berbeda

Bayangkan sebuah persamaan sederhana:

> *Output tim = kapasitas individual × efektivitas kolaborasi × kualitas keputusan teknis*

Technical Manager mengoptimalkan faktor pertama dan kedua. Technical Leader mengoptimalkan faktor ketiga.

Organisasi yang sehat membutuhkan keduanya secara simultan — bukan memilih satu di antara keduanya.

## Implikasi untuk Karir

Jika Anda adalah seorang engineer yang diminta menjadi manager: pertanyaan yang perlu dijawab bukan "haruskah saya menerima ini?" tetapi "apa yang sebenarnya dioptimalkan dari perubahan ini?"

Jika jawabannya adalah *kapasitas tim dan pengembangan orang* — maka itu adalah Manager yang dibutuhkan.

Jika jawabannya adalah *kualitas keputusan teknis dan arsitektur* — maka Staff Engineer atau Principal Engineer adalah jalur yang lebih tepat.

Keduanya adalah kepemimpinan. Keduanya membutuhkan keberanian. Bedanya hanya di mana energi Anda menghasilkan nilai tertinggi.
    `.trim(),
  },
  {
    id: "art-002",
    slug: "erp-migration-lessons",
    title: "18 Bulan Migrasi ERP: Pelajaran yang Tidak Ada di Buku Teks",
    excerpt:
      "Migrasi sistem ERP lintas divisi adalah salah satu proyek paling berisiko dalam portofolio enterprise. Ini bukan soal teknologi — ini soal perubahan cara orang bekerja.",
    publishedAt: "2024-08-03",
    readingTime: 10,
    tags: ["ERP", "Enterprise", "Change Management"],
    is_av_published: true,
    content_md: `
## Mengapa ERP Selalu Lebih Sulit dari Perkiraan

Tidak ada yang pernah berhasil mengimplementasikan ERP tepat waktu dan tepat anggaran pada percobaan pertama. Ini bukan exaggerasi — ini konsensus industri yang tidak pernah dipublikasikan secara resmi karena tidak ada vendor yang ingin mengakuinya.

Masalahnya bukan teknis. Stack modern sudah cukup matur. API sudah tersedia. Tim engineering biasanya kompeten.

Masalahnya adalah **impedansi antara model data sistem dengan cara divisi benar-benar bekerja**.

## Temuan Paling Mengejutkan: Data Tidak Konsisten

Ketika kami mulai audit data di tiga divisi sebelum migrasi, kami menemukan bahwa definisi "produk" berbeda di setiap divisi. Satu divisi mendefinisikan produk per SKU. Satu lagi per batch produksi. Satu lagi per kontrak klien.

Tiga sistem, tiga realitas, satu database baru yang harus merekonsiliasi semuanya.

Ini bukan masalah teknis — ini adalah masalah *ontologi bisnis* yang tidak pernah didokumentasikan karena tidak ada yang pernah membutuhkannya sebelum migrasi ini.

## Apa yang Benar-benar Berhasil

**1. Domain Expert sebagai Warga Kelas Satu**

Kami menghentikan praktik di mana engineer mewawancarai domain expert sekali lalu membangun sendiri. Setiap sprint review melibatkan setidaknya satu domain expert dari operasional.

**2. Shadow Running Selama 3 Bulan**

Sistem baru berjalan paralel dengan sistem lama selama 90 hari. Bukan untuk validasi teknis — tapi untuk membangun kepercayaan pengguna secara gradual.

**3. Rollback Plan Diperlakukan Seserius Rollout Plan**

Setiap fase migrasi memiliki rollback plan yang sudah diuji, bukan hanya didokumentasikan. Ini mengubah psikologi tim dari "jangan sampai gagal" menjadi "kita siap untuk semua skenario."

## Pelajaran untuk Proyek Berikutnya

Investasi terbesar dalam ERP bukan di lisensi software atau infrastruktur. Investasi terbesar ada di fase *discovery* — memahami dengan presisi bagaimana bisnis sebenarnya beroperasi, bukan bagaimana buku prosedur mengatakan mereka seharusnya beroperasi.

Dua hal ini hampir selalu berbeda.
    `.trim(),
  },
  {
    id: "art-003",
    slug: "zero-cost-infrastructure-thesis",
    title: "Zero-Cost Infrastructure: Tesis untuk Startup dan Operasi Lean",
    excerpt:
      "Vercel + Supabase + Cloudflare bukan hanya pilihan murah — ini adalah pilihan strategis yang mengalokasikan kapital ke tempat yang menghasilkan nilai bisnis tertinggi.",
    publishedAt: "2024-06-20",
    readingTime: 6,
    tags: ["Infrastructure", "Startup", "Strategy"],
    is_av_published: true,
    content_md: `
## Premis

Ada momen dalam perjalanan setiap tim teknologi ketika seseorang mengusulkan membangun infrastruktur sendiri — Kubernetes cluster, self-hosted database, custom CDN layer. Argumennya selalu sama: *kontrol, fleksibilitas, dan penghematan biaya jangka panjang*.

Argumen ini, dalam sembilan dari sepuluh kasus, salah.

## Biaya Tersembunyi dari "Kontrol Penuh"

Self-hosted infrastructure bukan gratis. Biaya riilnya adalah:

- **Engineering time** yang digunakan untuk maintain infrastruktur, bukan membangun produk
- **Operational risk** — siapa yang on-call ketika database crash jam 3 pagi?
- **Knowledge concentration** — apa yang terjadi ketika satu-satunya engineer yang mengerti setup Kubernetes resign?

Ini adalah biaya yang tidak muncul di invoice AWS, tapi sangat nyata di income statement.

## Stack Zero-Cost sebagai Pilihan Strategis

Ketika kami memilih Vercel + Supabase + Cloudflare, keputusannya bukan soal gratis tier. Keputusannya adalah *di mana kita ingin tim engineering kita menghabiskan energinya*.

**Vercel** menghilangkan seluruh lapisan DevOps untuk deployment dan CDN. Preview deployments per branch. Automatic scaling. Edge functions. Semua sudah ada.

**Supabase** memberikan PostgreSQL yang fully managed, Row Level Security yang proper, Auth bawaan, dan Storage — dengan API yang langsung bisa dikonsumsi dari frontend tanpa backend tambahan.

**Cloudflare** adalah lapisan keamanan dan DNS yang setara dengan solusi enterprise seharga ratusan dolar per bulan, tersedia di free tier untuk traffic normal.

## Kapan Ini Tidak Berlaku

Zero-cost infrastructure adalah keputusan yang tepat untuk:
- Tim kecil (1–10 engineer) yang perlu bergerak cepat
- Produk di fase discovery/validation
- Operasi yang tidak memiliki kebutuhan compliance khusus (SOC2, HIPAA)

Ketika skala sudah cukup besar, ketika kebutuhan compliance muncul, ketika traffic sudah di level yang membuat managed service lebih mahal dari self-hosted — *itu saat yang tepat untuk renegosiasi*. Bukan sebelumnya.

## Alokasikan Kapital ke Nilai Tertinggi

Setiap rupiah yang dihemat dari infrastruktur adalah rupiah yang bisa dialokasikan ke hal yang benar-benar membedakan bisnis: riset pengguna, pengembangan fitur, atau talent yang tepat.

Infrastruktur adalah enabler, bukan differentiator.
    `.trim(),
  },
];
