export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  description: string;
  tags: string[];
  /** Index used for decorative Citadel numbering */
  index: number;
}

/**
 * Hardcoded project data — Phase 4 will replace this with Supabase queries.
 * Fields mirror the Supabase `projects` table schema planned for Phase 4.
 */
export const projects: Project[] = [
  {
    id: "av-erp-001",
    slug: "enterprise-resource-system",
    title: "Enterprise Resource System",
    category: "Product Architecture",
    year: 2024,
    description:
      "Merancang dan memimpin pengembangan sistem ERP internal yang mengintegrasikan manajemen inventori, logistik, dan laporan keuangan lintas divisi.",
    tags: ["Architecture", "TypeScript", "PostgreSQL"],
    index: 1,
  },
  {
    id: "av-portal-002",
    slug: "client-intelligence-portal",
    title: "Client Intelligence Portal",
    category: "Interface Design",
    year: 2024,
    description:
      "Antarmuka analitik real-time untuk tim eksekutif — memvisualisasikan data operasional lintas entitas bisnis dalam satu dashboard terpadu.",
    tags: ["Dashboard", "Data Viz", "SSR"],
    index: 2,
  },
  {
    id: "av-supply-003",
    slug: "supply-chain-orchestration",
    title: "Supply Chain Orchestration",
    category: "Systems Engineering",
    year: 2023,
    description:
      "Mengotomatiskan alur rantai pasok dari pemesanan hingga pengiriman, mengurangi waktu siklus operasional hingga 40% melalui integrasi API vendor.",
    tags: ["Automation", "API Integration", "Node.js"],
    index: 3,
  },
  {
    id: "av-hrms-004",
    slug: "workforce-management-platform",
    title: "Workforce Management Platform",
    category: "Platform Development",
    year: 2023,
    description:
      "Platform HRMS yang menangani rekrutmen, onboarding digital, dan manajemen performa — dibangun di atas arsitektur modular yang siap skalasi.",
    tags: ["HRMS", "Modular", "React"],
    index: 4,
  },
  {
    id: "av-digital-005",
    slug: "digital-transformation-roadmap",
    title: "Digital Transformation",
    category: "Technical Leadership",
    year: 2022,
    description:
      "Memimpin peta jalan transformasi digital selama 18 bulan — dari audit infrastruktur hingga migrasi penuh ke cloud dan standarisasi alur kerja engineering.",
    tags: ["Leadership", "Cloud", "Strategy"],
    index: 5,
  },
];
