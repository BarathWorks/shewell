"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";

/**
 * Page furniture, shared across the practitioner app.
 *
 * Every screen outside the dashboard laid itself out from scratch: `container
 * mx-auto` with a different padding chain each time, headings ranging from
 * `text-lg font-semibold` to `text-[28px] leading-[38px]`, and section spacing
 * expressed as `gap-[42px] md:gap-[50px] xl:gap-[56px] 2xl:gap-[72px]`. The
 * result was that no two pages agreed on where a title sits or how wide the
 * content is.
 *
 * The dashboard already settled these questions — `container-page` for the
 * gutter, `surface-card` for panels, `text-ink`/`text-body`/`text-muted` for
 * type. This file just makes the same answers reusable so the rest of the app can
 * stop reinventing them.
 */

/* -------------------------------------------------------------------------- */
/* Page shell                                                                  */
/* -------------------------------------------------------------------------- */

export function PageShell({
  children,
  className,
  /** `wide` matches the dashboard; `narrow` suits reading and single forms. */
  width = "wide",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "wide" | "narrow";
}) {
  return (
    <div className="min-h-full bg-canvas">
      <div
        className={`container-page py-6 md:py-8 ${
          width === "narrow" ? "max-w-4xl" : ""
        } ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page header                                                                 */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex flex-col gap-4 ${className ?? ""}`}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-slate-300"
                    />
                  ) : null}

                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="rounded transition-colors duration-200 hover:text-ink"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={isLast ? "font-medium text-body" : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * A titled card. The dashboard's `Panel` in a form that server components can
 * also render, plus an optional footer for form actions.
 */
export function Section({
  title,
  note,
  action,
  footer,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  note?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`surface-card flex flex-col ${className ?? ""}`}>
      {title ? (
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
      ) : null}

      <div className={`min-w-0 flex-1 p-5 ${bodyClassName ?? ""}`}>{children}</div>

      {footer ? (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-hairline bg-canvas px-5 py-4">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                 */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className ?? ""}`}
    >
      {Icon ? (
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-muted"
        >
          <Icon className="size-5" />
        </span>
      ) : null}

      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status pill                                                                 */
/* -------------------------------------------------------------------------- */

const PILL_TONE = {
  neutral: "bg-slate-100 text-body ring-slate-200/70",
  brand: "bg-primary-50 text-primary-800 ring-primary-200/70",
  success: "bg-success-50 text-secondary-700 ring-secondary-200/70",
  warning: "bg-warning-50 text-warning-600 ring-warning-100",
  danger: "bg-danger-50 text-danger-700 ring-danger-100",
  info: "bg-info-50 text-info-600 ring-info-100",
} as const;

export function StatusPill({
  tone = "neutral",
  icon: Icon,
  children,
  className,
}: {
  tone?: keyof typeof PILL_TONE;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PILL_TONE[tone]} ${className ?? ""}`}
    >
      {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
      {children}
    </span>
  );
}
