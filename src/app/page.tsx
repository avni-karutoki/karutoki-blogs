import HeroSlideshow from "@/components/HeroSlideshow";
import RecentWritings from "@/components/RecentWritings";
import AboutPreview from "@/components/AboutPreview";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSlideshow />

      <RecentWritings />

      <AboutPreview />
    </main>
  );
}
