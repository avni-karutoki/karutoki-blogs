"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    background:
      "linear-gradient(135deg, #33243f 0%, #6b4b73 45%, #c5a77d 100%)",
  },
  {
    background:
      "linear-gradient(135deg, #15111d 0%, #342345 50%, #75618c 100%)",
  },
  {
    background:
      "linear-gradient(135deg, #453047 0%, #806477 50%, #d0b895 100%)",
  },
  {
    background:
      "linear-gradient(135deg, #21182b 0%, #503765 50%, #b99b68 100%)",
  },
];

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="relative flex min-h-[65vh] items-center justify-center overflow-hidden rounded-2xl transition-all duration-700 sm:min-h-[68vh]"
        style={{ background: slide.background }}
      >
        {/* Decorative glow */}
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

        {/* Explore button */}
        <a
          href="/writings"
          className="absolute bottom-6 right-6 z-20 rounded-full border border-white/40 bg-black/20 px-6 py-2.5 text-sm font-medium tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20"
        >
          Explore →
        </a>

        {/* Slide indicators */}
        <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-7 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
