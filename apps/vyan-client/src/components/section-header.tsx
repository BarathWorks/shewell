import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * The heading block that opens a page section.
 *
 * Presentational only. Every home section previously rolled its own heading, and
 * they had drifted apart: five different size chains (`text-2xl sm:text-3xl
 * md:text-5xl xl:text-[48px]` in one, `text-3xl md:text-4xl` in another), three
 * different lead colours including a literal `text-[#33333399]`, and different
 * bottom margins. Sharing one component is what makes the page read as a single
 * document rather than a stack of unrelated blocks.
 */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "start";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}

      <h2
        className={cn(
          "text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl",
          eyebrow && "mt-3",
        )}
      >
        {title}
      </h2>

      {lead ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed text-body sm:text-lg",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {lead}
        </p>
      ) : null}

      {children}
    </div>
  );
}

export default SectionHeader;
