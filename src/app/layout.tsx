import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Caveat, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchProvider } from "@/components/SearchContext";
import SearchOverlay from "@/components/SearchOverlay";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import CursorDog from "@/components/CursorDog";
import HangingMelody from "@/components/HangingMelody";
import AnnouncementBar from "@/components/AnnouncementBar";

/* Calligraphy — HEADINGS ONLY */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
  preload: true,
});

/* Serif — quotes / excerpts / long-form accents */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

/* Sans — body text & UI */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Karutoki Blogs",
  description:
    "Poems, blogs and midnight thoughts by Avni Goel aka Karutoki. Words that were never said, left behind here instead.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#141118" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${caveat.variable} ${cormorant.variable} ${inter.variable} font-sans antialiased`}
      >
        {/* Theme init must run before hydration to avoid a theme flash. Kept as
            an external file: React 19 warns on any <script> rendered inside a
            component (inline Script content included) — a src-based script is
            injected by next/script outside the React render path. */}
        <Script id="karutoki-theme-init" src="/theme-init.js" strategy="beforeInteractive" />
        <ThemeProvider>
          <SearchProvider>
            <div className="vignette-veil" aria-hidden />
            <ScrollProgressBar />
            <AnnouncementBar />
            <Navbar />
            <main className="min-h-[72vh]">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <SearchOverlay />
            <ScrollToTop />
            <HangingMelody />
            <CursorDog />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
