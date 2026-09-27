import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchProvider } from "@/components/SearchContext";
import SearchOverlay from "@/components/SearchOverlay";
import ScrollToTop from "@/components/ScrollToTop";
import CursorRabbit from "@/components/CursorRabbit";

/* Calligraphy — HEADINGS ONLY */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

/* Serif — quotes / excerpts / long-form accents */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

/* Sans — body text & UI */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Karutoki — Words for the things left unsaid",
  description:
    "Poems, blogs and midnight thoughts by Avni Goel aka Karutoki. Words that were never said, left behind here instead.",
};

const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("karutoki-theme");
    var valid = ["cream", "moonlit", "blush", "lavender"];
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
            <Navbar />
            <main className="min-h-[72vh]">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <SearchOverlay />
            <ScrollToTop />
            <CursorRabbit />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
