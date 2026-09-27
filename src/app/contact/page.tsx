import ContactForm from "@/components/ContactForm";
import Swirl from "@/components/Swirl";
import Reveal from "@/components/Reveal";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Reveal>
        <div className="text-center">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-2">Let&apos;s talk, shall we?</h1>
          <p className="lead mx-auto mt-3 max-w-md">
            Have a thought, a question, or just something you want to say? My inbox is open.
          </p>
          <div className="mt-4 flex justify-center">
            <Swirl className="text-[var(--accent)]" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mt-10">
          <ContactForm />
        </div>
      </Reveal>

      <p className="mt-12 text-center font-serif text-lg italic text-[var(--text-muted)]">
        Words are better, when they&apos;re shared.
      </p>
    </div>
  );
}
