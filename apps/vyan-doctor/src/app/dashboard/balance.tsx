"use client";
import * as React from "react";
import { useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { api } from "~/trpc/react";
import RequestPayoutModal from "./request-payout-modal";

// Sample chart data for visual display
const chartData = [
  { value: 2400 },
  { value: 1398 },
  { value: 9800 },
  { value: 3908 },
  { value: 4800 },
  { value: 3800 },
  { value: 4300 },
];

const Balance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch real earnings data
  const { data: earningsData, isLoading, refetch } = api.earnings.getBalance.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const availableBalance = earningsData?.availableBalanceInCents ?? 0;
  const totalEarnings = earningsData?.totalEarningsInCents ?? 0;
  const totalPayouts = earningsData?.totalPayoutsInCents ?? 0;

  return (
    <>
      <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 xl:p-5 2xl:p-[26px] w-full shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="mb-3 flex justify-between items-center 2xl:mb-4">
          <div className="font-inter text-sm font-medium text-active lg:text-lg 2xl:text-2xl">
            Earnings
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Live</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex flex-col gap-3 2xl:gap-4">
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer className="w-full aspect-[229/71]">
              <LineChart width={500} height={200} data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2AA852" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Available Balance (main display) */}
            <div className="text-black font-inter text-2xl font-semibold mt-3 mb-1">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded h-8 w-32 inline-block"></span>
              ) : (
                formatCurrency(availableBalance)
              )}
            </div>
            <div className="text-inactive text-center font-inter text-sm font-normal mb-4">
              Available for withdrawal
            </div>

            {/* Earnings breakdown */}
            <div className="w-full border-t border-gray-100 pt-3 mt-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Total Earned</span>
                <span className="font-medium text-gray-700">
                  {isLoading ? "..." : formatCurrency(totalEarnings)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paid Out</span>
                <span className="font-medium text-gray-700">
                  {isLoading ? "..." : formatCurrency(totalPayouts)}
                </span>
              </div>
            </div>

            {/* Request Payout Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={availableBalance < 100 || isLoading}
              className="mt-4 w-full bg-[#2AA852] hover:bg-[#238F46] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              Request Payout
            </button>
            {availableBalance < 100 && !isLoading && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                Minimum ₹1 required for payout
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Request Payout Modal */}
      <RequestPayoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBalance={availableBalance}
        onSuccess={() => {
          refetch();
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default Balance;
