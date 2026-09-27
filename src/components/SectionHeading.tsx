import type { ReactNode } from "react";
import Swirl from "./Swirl";

export default function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  sub?: string | ReactNode;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      <p className={`eyebrow ${centered ? "mx-auto" : ""}`}>{eyebrow}</p>
      <h2 className="mt-2 text-balance">{title}</h2>
      {sub && (
        <p className={`lead mt-3 max-w-xl ${centered ? "mx-auto" : ""}`}>{sub}</p>
      )}
      <Swirl className={`mt-4 text-[var(--accent)] ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
