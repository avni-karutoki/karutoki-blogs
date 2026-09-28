import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchProvider } from "@/components/SearchContext";
import SearchOverlay from "@/components/SearchOverlay";
import ScrollToTop from "@/components/ScrollToTop";
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
  title: "Karutoki — Words for the things left unsaid",
  description:
    "Poems, blogs and midnight thoughts by Avni Goel aka Karutoki. Words that were never said, left behind here instead.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#141118" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("karutoki-theme");
    var valid = ["cream", "moonlit", "blush", "lavender", "matcha", "honey", "ocean", "sakura"];
    var theme = valid.indexOf(saved) !== -1 ? saved : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "moonlit" : "cream";
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "cream");
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${caveat.variable} ${cormorant.variable} ${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <SearchProvider>
            <div className="vignette-veil" aria-hidden />
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
