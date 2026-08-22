"use client";
import * as React from "react";
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel, EmptyState } from "./panel";

/**
 * Consultations by speciality.
 *
 * Replaces the "Visitors Analytics" donut, which rendered a four-entry constant:
 *
 *   Child issue 275 · Relationship Issues 200 · Tablet 287 · Unknown 173
 *
 * "Tablet" gives it away — that dataset came from the shadcn browser-share demo,
 * and its `chartConfig` still declared Chrome, Safari, Firefox and Edge. It was
 * also titled "Visitors", which this product does not measure: nothing tracks
 * page visits. What it can count is bookings, grouped by the speciality they
 * were booked under, which is what this shows.
 *
 * Colours come from the shared `chart.N` tokens so a category keeps its colour
 * across renders and across the other charts.
 */

// Resolved eagerly: recharts writes colours into inline SVG attributes, where a
// CSS custom property defined on :root does not resolve.
const PALETTE = [
  "#00898F",
  "#2C6BB8",
  "#008F4E",
  "#C77700",
  "#7C5CBF",
  "#B0566F",
];

export function ConsultationsByCategory({
  data,
  isLoading,
}: {
  data?: { name: string; count: number }[];
  isLoading?: boolean;
}) {
  const rows = data ?? [];
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <Panel
      title="Consultations by speciality"
      note="Bookings in the selected range, excluding cancellations, grouped by the speciality each was booked under."
    >
      {isLoading ? (
        <div className="flex min-h-[16rem] items-center justify-center">
          <div className="skeleton size-48 rounded-full" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          message="No consultations in this range"
          hint="Widen the date range, or check back once bookings come in."
        />
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative h-56 w-full min-w-0 overflow-hidden lg:w-56 lg:shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={rows.length > 1 ? 2 : 0}
                  strokeWidth={0}
                >
                  {rows.map((row, i) => (
                    <Cell key={row.name} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null;
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-ink text-2xl font-semibold"
                          >
                            {total.toLocaleString("en-IN")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 20}
                            className="fill-muted text-xs"
                          >
                            consultations
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid #DFE7ED",
                    boxShadow: "0 6px 16px -4px rgb(13 22 30 / 0.09)",
                    fontSize: "0.8125rem",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString("en-IN")} (${((value / total) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend as a readable table rather than floating labels. */}
          <ul className="flex min-w-0 flex-1 flex-col divide-y divide-hairline">
            {rows.map((row, i) => (
              <li
                key={row.name}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-body">
                  {row.name}
                </span>
                <span className="tabular text-sm font-semibold text-ink">
                  {row.count.toLocaleString("en-IN")}
                </span>
                <span className="tabular w-12 text-right text-xs text-muted">
                  {((row.count / total) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

export default ConsultationsByCategory;
