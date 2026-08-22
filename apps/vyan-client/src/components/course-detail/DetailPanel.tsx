import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * The titled panel used throughout the session detail page.
 *
 * Session Overview, Who is it for, What You'll Learn, Terms and Support each
 * hand-rolled the same shape: a `#e6eff1` header strip, a 4-6px white spacer
 * standing in for a divider, and a `bg-gray-50` body. They had drifted — five
 * different padding chains, header text ranging from `text-sm` to `text-xl`
 * across breakpoints, and two different corner radii — so a page stacking four of
 * them showed four slightly different panels.
 *
 * One component, one shape. `as` sets the heading level so the page keeps a valid
 * outline (h2 for top-level panels, h3 for the ones nested in a two-column row).
 */
export function DetailPanel({
  title,
  as: Heading = "h2",
  className,
  children,
}: {
  title: string;
  as?: "h2" | "h3";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("surface-card overflow-hidden", className)}>
      <div className="border-b border-hairline bg-slate-50 px-5 py-3.5 sm:px-6">
        <Heading className="text-sm font-semibold tracking-tight text-ink sm:text-base">
          {title}
        </Heading>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

/**
 * The bulleted list those panels hold. A teal check reads better than a disc for
 * "what you get" content, and `list-inside` discs were wrapping under themselves.
 */
export function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-body sm:text-[15px]">
          <span
            aria-hidden="true"
            className="mt-[0.4rem] size-1.5 shrink-0 rounded-full bg-primary-500"
          />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default DetailPanel;
