"use client";
import React from "react";
import { api } from "~/trpc/react";
import { Panel, EmptyState } from "./panel";

/**
 * Payout history.
 *
 * This widget was already reading real `earnings.getPayoutHistory` rows — only
 * its presentation changed, onto the shared panel and status tokens so its
 * status pills match the badges used elsewhere in the app.
 */

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: "border-warning-100 bg-warning-50 text-warning-600",
  APPROVED: "border-info-100 bg-info-50 text-info-600",
  REJECTED: "border-danger-100 bg-danger-50 text-danger-700",
  PAID: "border-success-100 bg-success-50 text-secondary-700",
};

const PayoutHistory = () => {
  const { data, isLoading } = api.earnings.getPayoutHistory.useQuery({ limit: 7 });

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Panel title="Payout history">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="skeleton h-9 w-28" />
              <div className="skeleton h-6 w-16" />
            </div>
          ))}
        </div>
      ) : data?.payouts && data.payouts.length > 0 ? (
        <ul className="flex flex-col divide-y divide-hairline">
          {data.payouts.map((payout) => (
            <li
              key={payout.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="tabular text-sm font-semibold text-ink">
                  {formatCurrency(payout.amountInCents)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatDate(payout.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-2xs font-medium ${
                  STATUS_STYLES[payout.status] ??
                  "border-hairline bg-slate-50 text-body"
                }`}
              >
                {payout.status}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          message="No payout requests yet"
          hint="Request a payout once you have a withdrawable balance."
        />
      )}
    </Panel>
  );
};

export default PayoutHistory;
