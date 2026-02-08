"use client";
import React from "react";
import { api } from "~/trpc/react";

const statusColors: Record<string, { bg: string; text: string }> = {
  REQUESTED: { bg: "bg-yellow-100", text: "text-yellow-700" },
  APPROVED: { bg: "bg-blue-100", text: "text-blue-700" },
  REJECTED: { bg: "bg-red-100", text: "text-red-700" },
  PAID: { bg: "bg-green-100", text: "text-green-700" },
};

const PayoutHistory = () => {
  const { data, isLoading } = api.earnings.getPayoutHistory.useQuery({ limit: 7 });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 xl:p-5 2xl:p-[26px] shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between 2xl:mb-[14px]">
        <div className="font-inter text-base font-semibold text-active lg:text-xl 2xl:text-2xl">
          Payout History
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span>Payouts</span>
        </div>
      </div>

      {/* Payout List */}
      <div className="flex flex-col divide-y divide-gray-100">
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
            const colors = statusColors[payout.status] || { bg: "bg-gray-100", text: "text-gray-700" };
            return (
              <div key={payout.id} className="flex items-center justify-between py-3">
                <div className="flex flex-col">
                  <span className="font-inter text-sm font-medium text-gray-900">
                    {formatCurrency(payout.requestedAmountInCents)}
                  </span>
                  <span className="font-inter text-xs text-gray-500">
                    {formatDate(payout.createdAt)}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                  {payout.status}
                </span>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-center text-gray-500">
            No payout requests yet
          </div>
        )}
      </div>

      {/* View All Link */}
      {/* {data?.payouts && data.payouts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button className="w-full text-center text-sm text-[#2AA852] hover:text-[#238F46] font-medium transition-colors">
            View All Payouts →
          </button>
        </div>
      )} */}
    </div>
  );
};

export default PayoutHistory;
