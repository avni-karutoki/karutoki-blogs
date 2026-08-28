import Navbar from "../components/Navbar";
import HeroSlideshow from "@/components/HeroSlideshow";
import RecentWritings from "@/components/RecentWritings";
import ThemeToggle from "@/components/ThemeToggle";
import AboutPreview from "@/components/AboutPreview";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <HeroSlideshow />

      <RecentWritings />

      <AboutPreview />

      <ThemeToggle />
    </main>
  );
}