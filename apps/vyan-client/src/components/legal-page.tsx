import * as React from "react";

/**
 * Shell for the four policy documents.
 *
 * Each of `/terms`, `/privacy-policy`, `/refund-policy` and `/return-policy`
 * opened with the same `<div className="mt-10"><div className="container mx-auto
 * max-w-full text-justify">` and then set its own heading sizes. They share this
 * now; the body of each page is untouched and simply sits inside `.prose-legal`.
 *
 * `max-w-none` is deliberately absent: legal text is the one place on the site
 * where a measure really matters, and `max-w-full` on a 1440px screen gave these
 * pages the longest lines in the app.
 */
export function LegalPage({
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
    <div className="bg-canvas">
      <div className="border-b border-hairline bg-surface">
        <div className="container-page py-10 md:py-14">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-ink sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base text-body">{subtitle}</p>
          ) : null}
          {effectiveDate ? (
            <p className="mt-4 inline-flex items-center rounded-md border border-hairline bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-muted">
              Effective {effectiveDate}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container-page py-10 md:py-14">
        <article className="surface-card mx-auto max-w-prose px-6 py-8 sm:px-10 sm:py-10">
          <div className="prose-legal">{children}</div>
        </article>
      </div>
    </div>
  );
}

export default LegalPage;
