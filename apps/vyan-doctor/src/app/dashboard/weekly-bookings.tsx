"use client";
import * as React from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, EmptyState } from "./panel";

/**
 * Bookings per week against weekly capacity.
 *
 * Replaces the "Booked vs Vacant Slots" chart, whose dataset was four literal
 * weeks (186/80, 305/200, 237/120, 73/190) and never changed regardless of the
 * date range, the doctor, or whether any appointments existed. The same file
 * also carried an unused `data` array of the recharts "Page A / Page B" demo.
 *
 * Booked is an exact count. Capacity is the number of slots in the practitioner's
 * weekly availability template — `AvailabilityTimings` stores times only
 * (`@db.Time()`), so it describes a normal week rather than dated openings. That
 * distinction is stated on the panel instead of being quietly presented as
 * "vacant slots", which the previous chart claimed and could not know.
 */
export function WeeklyBookings({
  data,
  weeklyCapacity,
  isLoading,
}: {
  data?: { weekStart: string; booked: number; capacity: number }[];
  weeklyCapacity?: number;
  isLoading?: boolean;
}) {
  const rows = (data ?? []).map((row) => ({
    ...row,
    label: format(new Date(row.weekStart), "d MMM"),
  }));

  const hasCapacity = (weeklyCapacity ?? 0) > 0;

  return (
    <Panel
      title="Bookings per week"
      note={
        hasCapacity
          ? `Booked is an exact count. Capacity is the ${weeklyCapacity} slots in your weekly availability template, shown for reference.`
          : "Booked is an exact count. Set your weekly availability to see it compared against capacity."
      }
    >
      {isLoading ? (
        <div className="skeleton h-64 w-full" />
      ) : rows.length === 0 ? (
        <EmptyState
          message="No weeks in this range"
          hint="Pick a range that covers at least one week."
        />
      ) : (
        // `min-w-0` and `overflow-hidden`: recharts sizes its legend wrapper from
        // the chart's content rather than its container, and inside a grid track
        // that let the legend push the whole page ~270px past a 375px viewport.
        <div className="h-64 w-full min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid vertical={false} stroke="#EFF3F7" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71889B", fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#71889B", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#F7F9FB" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  border: "1px solid #DFE7ED",
                  boxShadow: "0 6px 16px -4px rgb(13 22 30 / 0.09)",
                  fontSize: "0.8125rem",
                }}
                labelFormatter={(label) => `Week of ${label}`}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "0.8125rem", paddingTop: 8, width: "100%" }}
              />
              <Bar
                dataKey="booked"
                name="Booked"
                fill="#00898F"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              {hasCapacity ? (
                <Bar
                  dataKey="capacity"
                  name="Weekly capacity"
                  fill="#DFE7ED"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ) : null}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}

export default WeeklyBookings;
