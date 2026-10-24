import type { ReactNode } from "react";

/**
 * Minimal inline markdown: **bold** and *italic*.
 * Everything else is rendered as plain text.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-[var(--text-heading)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <span key={key}>{part}</span>;
  });
}

/** First markdown block of a bio, with any heading marker stripped. */
export function firstTextBlock(md: string): string {
  const first =
    md
      .split(/\n\n+/)
      .map((b) => b.trim())
      .find((b) => b !== "" && b !== ".") ?? "";
  return first.replace(/^#+\s*/, "");
}

/** Just the inline text (no wrapping element) — for dropping into a styled parent. */
export function InlineText({ text }: { text: string }) {
  return <>{renderInline(text, "inline")}</>;
}

/**
 * Render a multi-paragraph bio written in light markdown:
 * - `### heading` blocks become script subheadings with an accent underline
 * - blocks that are entirely bold become standout script statements (pull-quotes)
 * - blocks that are entirely italic become centered script sign-offs
 * - everything else becomes a serif paragraph
 */
export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter((b) => b !== "" && b !== ".");

  return (
    <div className={className}>
      {blocks.map((block, i) => {
        if (/^###\s+/.test(block)) {
          const title = block.replace(/^###\s+/, "");
          return (
            <div key={i} className="mt-12 first:mt-0">
              <h3 className="whitespace-pre-line font-script text-[1.9rem] leading-snug text-[var(--text-heading)]">
                {renderInline(title, `h${i}`)}
              </h3>
              <div aria-hidden className="mt-2 h-px w-16 rounded-full bg-[var(--accent)] opacity-60" />
            </div>
          );
        }

        // Entire block bolded → a standout statement.
        if (/^\*\*[^*]+\*\*$/.test(block)) {
          return (
            <p
              key={i}
              className="mt-10 whitespace-pre-line font-script text-[1.7rem] leading-snug text-[var(--accent)] first:mt-0"
            >
              {block.slice(2, -2)}
            </p>
          );
        }

        // Entire block italic → a centered sign-off.
        if (/^\*[^*]+\*$/.test(block)) {
          return (
            <p
              key={i}
              className="mx-auto mt-10 max-w-fit whitespace-pre-line font-script text-3xl text-[var(--text-heading)]"
            >
              {block.slice(1, -1)}
            </p>
          );
        }

        return (
          <p
            key={i}
            className="mt-6 whitespace-pre-line font-serif text-[1.04rem] leading-[1.9] text-[var(--text-muted)] first:mt-0"
          >
            {renderInline(block, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}
