"use client";
import React from "react";
import { api } from "~/trpc/react";

const statusColors: Record<string, { bg: string; text: string }> = {
  REQUESTED: { bg: "bg-amber-50 text-amber-700 border-amber-100", text: "text-amber-700" },
  APPROVED: { bg: "bg-blue-50 text-blue-700 border-blue-100", text: "text-blue-700" },
  REJECTED: { bg: "bg-red-50 text-red-700 border-red-100", text: "text-red-700" },
  PAID: { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", text: "text-emerald-700" },
};

const PayoutHistory = () => {
  const { data, isLoading } = api.earnings.getPayoutHistory.useQuery({ limit: 4 });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl custom-shadow p-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-lg">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Payout History</h3>
        <button className="icon-badge bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px]">sync_alt</span>
        </button>
      </div>

      {/* Payout List */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-outline font-bold uppercase tracking-widest pb-2 border-b border-outline-variant/10">
          <span>Date</span>
          <span>Amount</span>
        </div>

        {isLoading ? (
          <div className="py-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : data?.payouts && data.payouts.length > 0 ? (
          data.payouts.map((payout) => {
            const colors = statusColors[payout.status] || { bg: "bg-gray-100 text-gray-700 border-gray-200", text: "text-gray-700" };
            return (
              <div
                key={payout.id}
                className="flex justify-between items-center py-3 border-b border-outline-variant/5 hover:bg-surface-container-low/50 px-1 -mx-1 rounded transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-body-md font-medium text-on-surface">
                    {formatDate(payout.createdAt)}
                  </span>
                  <span className={`w-fit mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${colors.bg}`}>
                    {payout.status}
                  </span>
                </div>
                <span className="text-body-md font-bold tabular-nums text-on-surface">
                  {formatCurrency(payout.amountInCents)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-body-sm text-outline">
            No payout requests yet
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutHistory;
