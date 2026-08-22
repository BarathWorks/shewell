"use client";
import * as React from "react";
import { Info } from "lucide-react";

/**
 * The panel every dashboard widget sits in.
 *
 * The widgets each repeated `rounded-2xl border border-gray-100 p-4 sm:p-6
 * xl:p-5 2xl:p-[26px] shadow-sm hover:shadow-md transition-shadow` and then set
 * their own header type — `text-sm ... lg:text-lg 2xl:text-2xl` in one,
 * `text-base ... lg:text-xl 2xl:text-2xl` in the next — so a row of panels had
 * headings at different sizes.
 *
 * `note` renders a small explanatory line under the title. It exists because
 * several of these figures need a caveat stated on the panel itself rather than
 * left for the reader to assume — for example that slot capacity comes from a
 * weekly availability template rather than dated openings.
 */
export function Panel({
  title,
  note,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`surface-card flex flex-col ${className ?? ""}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline p-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {note ? (
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
              <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              <span>{note}</span>
            </p>
          ) : null}
        </div>
        {action}
      </header>

      <div className={`min-w-0 flex-1 p-5 ${bodyClassName ?? ""}`}>{children}</div>
    </section>
  );
}

/**
 * What a panel shows when the query returned nothing.
 *
 * Every chart on this dashboard used to have a constant fallback, so an empty
 * range looked identical to a busy one. Showing nothing, and saying so, is the
 * only honest option.
 */
export function EmptyState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-1.5 text-center">
      <p className="text-sm font-medium text-body">{message}</p>
      {hint ? <p className="max-w-xs text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default Panel;
