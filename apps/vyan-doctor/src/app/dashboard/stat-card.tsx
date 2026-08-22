"use client";
import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * A single dashboard figure.
 *
 * Replaces `dashboard-card.tsx`, which had two problems beyond its appearance:
 *
 *  - It always rendered a delta chip. `change` was typed `number`, so "no
 *    comparison is available" and "flat at 0%" were indistinguishable, and a
 *    doctor with no prior-period data saw a confident "+0.0%".
 *  - It always rendered "N% of total" from a `percentage` prop that several call
 *    sites hard-coded (100 for Online Appointments, 0 for Pending).
 *
 * Here `deltaPct` is `number | null`: null renders "no prior data" rather than a
 * number. `footnote` is free text and only appears when given.
 *
 * `intent` picks the accent. It is deliberately not derived from the sign of the
 * delta — more cancellations is a rise, and it is not good news.
 */

type Intent = "neutral" | "brand" | "positive" | "warning" | "danger";

const INTENT: Record<Intent, { icon: string; ring: string }> = {
  neutral: { icon: "bg-slate-100 text-slate-600", ring: "ring-slate-200/70" },
  brand: { icon: "bg-primary-50 text-primary-600", ring: "ring-primary-200/70" },
  positive: { icon: "bg-success-50 text-secondary-600", ring: "ring-secondary-200/70" },
  warning: { icon: "bg-warning-50 text-warning-600", ring: "ring-warning-100" },
  danger: { icon: "bg-danger-50 text-danger-600", ring: "ring-danger-100" },
};

export function StatCard({
  label,
  value,
  deltaPct,
  deltaLabel = "vs previous period",
  footnote,
  icon: Icon,
  intent = "neutral",
  isLoading = false,
}: {
  label: string;
  value: string | number;
  deltaPct?: number | null;
  deltaLabel?: string;
  footnote?: string;
  icon?: React.ComponentType<{ className?: string }>;
  intent?: Intent;
  isLoading?: boolean;
}) {
  const tone = INTENT[intent];

  if (isLoading) {
    return (
      <div className="surface-card p-5">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton mt-4 h-9 w-24" />
        <div className="skeleton mt-4 h-4 w-36" />
      </div>
    );
  }

  const hasDelta = typeof deltaPct === "number" && Number.isFinite(deltaPct);
  const rising = hasDelta && deltaPct! > 0;
  const falling = hasDelta && deltaPct! < 0;

  return (
    <div className="surface-card flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon ? (
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ${tone.icon} ${tone.ring}`}
          >
            <Icon className="size-[18px]" />
          </span>
        ) : null}
      </div>

      <p className="tabular mt-3 text-3xl font-semibold leading-none text-ink">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-hairline pt-3.5">
        {hasDelta ? (
          <span
            className={[
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium tabular",
              rising
                ? "bg-success-50 text-secondary-700"
                : falling
                  ? "bg-danger-50 text-danger-700"
                  : "bg-slate-100 text-body",
            ].join(" ")}
          >
            {rising ? (
              <ArrowUpRight className="size-3.5" />
            ) : falling ? (
              <ArrowDownRight className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
            {Math.abs(deltaPct!).toFixed(1)}%
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-muted">
            No prior data
          </span>
        )}

        <span className="text-xs text-muted">{footnote ?? deltaLabel}</span>
      </div>
    </div>
  );
}

export default StatCard;
