"use client";
import * as React from "react";
import { format } from "date-fns";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { api } from "~/trpc/react";
import { Panel, EmptyState } from "./panel";

/**
 * Earnings and withdrawable balance.
 *
 * The available balance was already real. The chart above it was not: a module
 * constant
 *
 *   [2400, 1398, 9800, 3908, 4800, 3800, 4300]
 *
 * commented "Sample chart data for visual display" — rendered directly beneath a
 * green "Live" badge. It never moved, and it implied a trend nobody had measured.
 *
 * The series now comes from `dashboardAnalytics.getDashboard`: one point per
 * settled appointment payment in the selected range, accumulated so the line
 * reads as earnings to date. With fewer than two payments there is no trend to
 * draw and the chart is replaced by a note. The "Live" badge is gone.
 */
export function Balance({
  series,
  earnedInRange,
  isLoading,
}: {
  series?: { date: string; amountInCents: number }[];
  earnedInRange?: number;
  isLoading?: boolean;
}) {
  const { data: earningsData, isLoading: balanceLoading } =
    api.earnings.getBalance.useQuery();

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const availableBalance = earningsData?.availableBalanceInCents ?? 0;

  // Cumulative, so the line shows earnings building over the range rather than
  // a sawtooth of individual payments.
  let running = 0;
  const points = (series ?? []).map((point) => {
    running += point.amountInCents;
    return {
      date: point.date,
      label: format(new Date(point.date), "d MMM"),
      cumulative: running / 100,
    };
  });

  return (
    <Panel title="Earnings">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="eyebrow">Available</p>
            {balanceLoading ? (
              <div className="skeleton mt-2 h-8 w-28" />
            ) : (
              <p className="tabular mt-2 text-2xl font-semibold leading-none text-ink">
                {formatCurrency(availableBalance)}
              </p>
            )}
            <p className="mt-1.5 text-xs text-muted">Ready to withdraw</p>
          </div>

          <div>
            <p className="eyebrow">This range</p>
            {isLoading ? (
              <div className="skeleton mt-2 h-8 w-28" />
            ) : (
              <p className="tabular mt-2 text-2xl font-semibold leading-none text-ink">
                {formatCurrency(earnedInRange ?? 0)}
              </p>
            )}
            <p className="mt-1.5 text-xs text-muted">Your share of bookings</p>
          </div>
        </div>

        <div className="h-28 border-t border-hairline pt-4">
          {isLoading ? (
            <div className="skeleton h-full w-full" />
          ) : points.length < 2 ? (
            <EmptyState
              message="Not enough payments to plot a trend"
              hint="A line appears once at least two payments settle inside the range."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={points}
                margin={{ top: 2, right: 2, bottom: 0, left: 2 }}
              >
                <defs>
                  <linearGradient id="earnings-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00898F" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#00898F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Tooltip
                  cursor={{ stroke: "#C6D3DD", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid #DFE7ED",
                    boxShadow: "0 6px 16px -4px rgb(13 22 30 / 0.09)",
                    fontSize: "0.8125rem",
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
                  formatter={(value: number) => [
                    new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    }).format(value),
                    "Earned to date",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#00898F"
                  strokeWidth={2}
                  fill="url(#earnings-fill)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Panel>
  );
}

export default Balance;
