import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { BookAppointmentStatus, AppointmentType } from "@repo/database";
import {
  differenceInCalendarDays,
  eachWeekOfInterval,
  endOfDay,
  endOfWeek,
  startOfDay,
  subDays,
} from "date-fns";
import { getServerAuthSession } from "~/server/auth";

/**
 * Dashboard analytics.
 *
 * Every number this returns is derived from a query. That is the point of the
 * module: the dashboard previously rendered a mixture of real values and
 * invented ones, and there was no way to tell them apart by looking —
 *
 *   - the "Visitors Analytics" donut was a constant with a slice labelled
 *     "Tablet", left over from the shadcn browser-share demo;
 *   - the "Booked vs Vacant Slots" bar chart was four hard-coded weeks;
 *   - "Total / Offline / Online / Completed Appointments" were the literals
 *     165,736 / 12,109 / 132,645 / 145,109;
 *   - the Balance sparkline was a constant array sitting under a "Live" badge;
 *   - "Offline Appointments" was hard-coded to 0 and "Online Appointments"
 *     re-used the total, so the two always matched.
 *
 * Where a figure genuinely cannot be derived it is not returned, and the UI says
 * so, rather than showing a plausible-looking number.
 *
 * Deltas compare the selected range against the immediately preceding range of
 * equal length — the comparison the cards were implying but not making: they
 * subtracted an all-time total from a range total, so a doctor with any history
 * always saw a large negative "change".
 */

/** Percentage change from `previous` to `current`, or null when undefined. */
function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

const PENDING_STATUSES = [
  BookAppointmentStatus.PAYMENT_PENDING,
  BookAppointmentStatus.PAYMENT_SUCCESSFUL,
];

const CANCELLED_STATUSES = [
  BookAppointmentStatus.CANCELLED,
  BookAppointmentStatus.CANCELLED_WITH_REFUND,
];

export const dashboardAnalyticsRouter = createTRPCRouter({
  getDashboard: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const session = await getServerAuthSession();
      if (!session?.user?.email) {
        throw new Error("Unauthorised");
      }

      const professionalUser = await db.professionalUser.findFirst({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!professionalUser) {
        throw new Error("Professional user does not exist");
      }
      const doctorId = professionalUser.id;

      const from = startOfDay(input.startDate);
      const to = endOfDay(input.endDate);

      // The preceding window of the same length, so "vs previous period" means
      // something. A one-day range compares against the day before, a month
      // against the month before.
      const spanDays = Math.max(differenceInCalendarDays(to, from) + 1, 1);
      const prevTo = endOfDay(subDays(from, 1));
      const prevFrom = startOfDay(subDays(from, spanDays));

      const inRange = (a: Date, b: Date) => ({
        professionalUserId: doctorId,
        startingTime: { gte: a, lte: b },
      });

      /* ---- Appointment counts -------------------------------------------- */

      const [
        total,
        completed,
        cancelled,
        pending,
        online,
        offline,
        prevTotal,
        prevCompleted,
        prevOnline,
      ] = await Promise.all([
        db.bookAppointment.count({ where: inRange(from, to) }),
        db.bookAppointment.count({
          where: { ...inRange(from, to), status: BookAppointmentStatus.COMPLETED },
        }),
        db.bookAppointment.count({
          where: { ...inRange(from, to), status: { in: CANCELLED_STATUSES } },
        }),
        db.bookAppointment.count({
          where: { ...inRange(from, to), status: { in: PENDING_STATUSES } },
        }),
        db.bookAppointment.count({
          where: { ...inRange(from, to), serviceType: AppointmentType.ONLINE },
        }),
        db.bookAppointment.count({
          where: { ...inRange(from, to), serviceType: AppointmentType.OFFLINE },
        }),
        db.bookAppointment.count({ where: inRange(prevFrom, prevTo) }),
        db.bookAppointment.count({
          where: {
            ...inRange(prevFrom, prevTo),
            status: BookAppointmentStatus.COMPLETED,
          },
        }),
        db.bookAppointment.count({
          where: { ...inRange(prevFrom, prevTo), serviceType: AppointmentType.ONLINE },
        }),
      ]);

      /* ---- Earnings ------------------------------------------------------- */

      const [rangeEarnings, prevEarnings, lifetimeEarnings, paymentRows] =
        await Promise.all([
          db.appointmentPayment.aggregate({
            _sum: { doctorShareInCents: true },
            where: { doctorId, appointment: { startingTime: { gte: from, lte: to } } },
          }),
          db.appointmentPayment.aggregate({
            _sum: { doctorShareInCents: true },
            where: {
              doctorId,
              appointment: { startingTime: { gte: prevFrom, lte: prevTo } },
            },
          }),
          db.appointmentPayment.aggregate({
            _sum: { doctorShareInCents: true },
            where: { doctorId },
          }),
          // Row-level, so the sparkline plots actual earnings over the range
          // rather than a decorative curve.
          db.appointmentPayment.findMany({
            where: { doctorId, appointment: { startingTime: { gte: from, lte: to } } },
            select: {
              doctorShareInCents: true,
              appointment: { select: { startingTime: true } },
            },
            orderBy: { appointment: { startingTime: "asc" } },
          }),
        ]);

      const earningsInRange = rangeEarnings._sum.doctorShareInCents ?? 0;
      const earningsPrevious = prevEarnings._sum.doctorShareInCents ?? 0;
      const earningsLifetime = lifetimeEarnings._sum.doctorShareInCents ?? 0;

      /* ---- Weekly booked vs capacity -------------------------------------- */

      // The availability template is weekly and stores times only (`@db.Time()`),
      // so capacity is "slots offered in a normal week", not dated openings.
      // Booked is exact. Both are labelled as such in the UI.
      const availability = await db.availability.findMany({
        where: { professionalUserId: doctorId, available: true },
        select: { _count: { select: { availableTimings: true } } },
      });
      const weeklyCapacity = availability.reduce(
        (sum, day) => sum + day._count.availableTimings,
        0,
      );

      const weekStarts = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
      const weekly = await Promise.all(
        weekStarts.map(async (weekStart) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          const windowStart = weekStart < from ? from : weekStart;
          const windowEnd = weekEnd > to ? to : weekEnd;

          const booked = await db.bookAppointment.count({
            where: {
              professionalUserId: doctorId,
              startingTime: { gte: windowStart, lte: windowEnd },
              status: { notIn: CANCELLED_STATUSES },
            },
          });

          return {
            weekStart: weekStart.toISOString(),
            booked,
            capacity: weeklyCapacity,
          };
        }),
      );

      /* ---- Consultations by speciality ------------------------------------ */

      // Grouped from the booking's own speciality rather than a constant. Only
      // categories with at least one booking appear; an empty range yields an
      // empty array and the chart says it has nothing to show.
      const categoryRows = await db.bookAppointment.findMany({
        where: { ...inRange(from, to), status: { notIn: CANCELLED_STATUSES } },
        select: {
          planName: true,
          professionalUser: {
            select: {
              displayQualification: {
                select: {
                  specialization: true,
                  ProfessionalSpecializationParentCategory: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      });

      const categoryCounts = new Map<string, number>();
      for (const row of categoryRows) {
        const q = row.professionalUser.displayQualification;
        const name =
          q?.ProfessionalSpecializationParentCategory?.name ??
          q?.specialization ??
          row.planName ??
          "Unspecified";
        categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
      }
      const categoryBreakdown = [...categoryCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      /* ---- Ratings --------------------------------------------------------- */

      const ratings = await db.professionalUserRating.aggregate({
        _avg: { rating: true },
        _count: { rating: true },
        where: {
          professionalUserId: doctorId,
          bookAppointment: { startingTime: { gte: from, lte: to } },
        },
      });

      const satisfiedInRange = await db.professionalUserRating.count({
        where: {
          professionalUserId: doctorId,
          rating: { gte: 4 },
          bookAppointment: { startingTime: { gte: from, lte: to } },
        },
      });
      const satisfiedPrevious = await db.professionalUserRating.count({
        where: {
          professionalUserId: doctorId,
          rating: { gte: 4 },
          bookAppointment: { startingTime: { gte: prevFrom, lte: prevTo } },
        },
      });

      return {
        range: { from: from.toISOString(), to: to.toISOString(), spanDays },
        previousRange: {
          from: prevFrom.toISOString(),
          to: prevTo.toISOString(),
        },

        appointments: {
          total,
          completed,
          cancelled,
          pending,
          online,
          offline,
          totalChangePct: pctChange(total, prevTotal),
          completedChangePct: pctChange(completed, prevCompleted),
          onlineChangePct: pctChange(online, prevOnline),
        },

        earnings: {
          inRangeInCents: earningsInRange,
          previousInCents: earningsPrevious,
          lifetimeInCents: earningsLifetime,
          changePct: pctChange(earningsInRange, earningsPrevious),
          series: paymentRows.map((row) => ({
            date: row.appointment.startingTime.toISOString(),
            amountInCents: row.doctorShareInCents,
          })),
        },

        weekly,
        weeklyCapacity,
        categoryBreakdown,

        ratings: {
          average: ratings._avg.rating,
          count: ratings._count.rating,
          satisfied: satisfiedInRange,
          satisfiedChangePct: pctChange(satisfiedInRange, satisfiedPrevious),
        },
      };
    }),
});
