import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * The wrapper for Terms, Privacy and Refunds.
 *
 * All three were a `container mx-auto max-w-full text-justify` block with sizes
 * set per element — `text-sm lg:text-base` on paragraphs, `text-base xl:text-lg`
 * on one heading level, `text-lg xl:text-2xl` on another — repeated a few hundred
 * times between them. Two consequences:
 *
 *  - `max-w-full` means the measure is the window. On a wide monitor a paragraph
 *    ran past 200 characters per line, which is roughly three times the length at
 *    which the eye reliably finds the start of the next one. The measure is capped
 *    here at about 75 characters.
 *  - `text-justify` without hyphenation opens rivers of whitespace inside lines,
 *    and it is worst exactly where the lines are longest. Left-aligned.
 *
 * Element styling is applied from here with descendant selectors, so a policy
 * page is now just its prose — no per-element classes to keep in sync across
 * three files.
 */
export default function LegalPage({
  title,
  subtitle,
  effectiveDate,
  children,
}: {
  title: string;
  subtitle?: string;
  effectiveDate?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-canvas">
      <div className="container-page max-w-3xl py-8 md:py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to dashboard
        </Link>

        <header className="mt-5 border-b border-hairline pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          ) : null}

          {effectiveDate ? (
            <p className="mt-4 inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-body">
              Effective {effectiveDate}
            </p>
          ) : null}
        </header>

        {/*
          One place that sets type for the whole document. `[&_x]` compiles to a
          descendant selector, so the pages below stay plain semantic markup.
        */}
        <article
          className={[
            "mt-8 text-sm leading-relaxed text-body",
            "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
            "[&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
            "[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-ink",
            "[&_p]:mb-4",
            "[&_ul]:mb-4 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5",
            "[&_ol]:mb-4 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1.5",
            "[&_li]:pl-1",
            "[&_strong]:font-semibold [&_strong]:text-ink",
            "[&_a]:font-medium [&_a]:text-primary-700 [&_a]:underline-offset-4 hover:[&_a]:underline",
            "[&_table]:my-4 [&_table]:w-full [&_table]:text-left",
            "[&_th]:border-b [&_th]:border-hairline [&_th]:py-2 [&_th]:pr-4 [&_th]:font-semibold [&_th]:text-ink",
            "[&_td]:border-b [&_td]:border-hairline [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top",
            "[&_hr]:my-8 [&_hr]:border-hairline",
          ].join(" ")}
        >
          {children}
        </article>

        <footer className="mt-12 border-t border-hairline pt-6">
          <p className="text-xs text-muted">
            Questions about this policy? Contact us at{" "}
            <a
              href="mailto:support@shewellcare.com"
              className="font-medium text-primary-700 underline-offset-4 hover:underline"
            >
              support@shewellcare.com
            </a>
            .
          </p>

          <nav aria-label="Policies" className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/terms"
              className="text-xs text-muted transition-colors duration-200 hover:text-ink"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs text-muted transition-colors duration-200 hover:text-ink"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund-policy"
              className="text-xs text-muted transition-colors duration-200 hover:text-ink"
            >
              Refund Policy
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
