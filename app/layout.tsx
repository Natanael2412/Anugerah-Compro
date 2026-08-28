import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

import GrainShaderClient from "@/components/canvas/GrainShaderClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ui/ToastProvider";


/* ============================================================
   FONT LOADING
   - Inter = primary Helvetica substitute (body + headings)
   - Playfair Display = Citadel placeholder (accent/decorative)
   ============================================================ */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-loaded",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-loaded",
  display: "swap",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

/* ============================================================
   ROOT METADATA
   ============================================================ */
export const metadata: Metadata = {
  title: {
    default: "Anugerah Ventures",
    template: "%s — Anugerah Ventures",
  },
  description:
    "Anugerah Ventures — Bespoke digital experiences, strategic technology leadership, and enterprise product development.",
  keywords: [
    "Anugerah Ventures",
    "digital experience",
    "product development",
    "technology leadership",
    "enterprise software",
    "Jakarta",
  ],
  authors: [{ name: "Anugerah Ventures" }],
  creator: "Anugerah Ventures",
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    siteName: "Anugerah Ventures",
    title: "Anugerah Ventures",
    description:
      "Bespoke digital experiences, strategic technology leadership, and enterprise product development.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anugerah Ventures",
    description:
      "Bespoke digital experiences, strategic technology leadership, and enterprise product development.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/* ============================================================
   ROOT LAYOUT
   ============================================================ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Google Fonts CDN for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ToastProvider>
          {/*
            Layer 0: WebGL grain shader — position:fixed, z-index:-1
            Loaded dynamically (client-only), falls back to CSS base color (#0C1F20) during SSR.
          */}
          <GrainShaderClient />

          {/* Global navigation */}
          <Navbar />

          {/* Page content */}
          <main id="main-content" role="main">
            {children}
          </main>

          {/* Global footer */}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
