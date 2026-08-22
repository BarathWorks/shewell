import { z } from 'zod';

import { createTRPCRouter, adminProcedure } from '../trpc';
import { BookAppointmentStatus } from '@repo/database';
import { differenceInCalendarDays, endOfDay, formatISO, startOfDay, subDays } from 'date-fns';
import { db } from '../../db';
export const noOfOnlineAppointmentsRouter = createTRPCRouter({
  noOfOnlineAppointments: adminProcedure('appointment:read')
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date()
      })
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;
      const updatedStartDate = formatISO(startDate);
      const updatedEndDate = formatISO(endOfDay(endDate));

      /**
       * The preceding window of the same length, so the dashboard can show a real
       * "vs previous period" rather than the bare figures it showed before. A
       * one-week range compares against the week before it.
       */
      const spanDays = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1);
      const prevStart = formatISO(startOfDay(subDays(startDate, spanDays)));
      const prevEnd = formatISO(endOfDay(subDays(startDate, 1)));
      const prevWhere = {
        startingTime: { gte: prevStart },
        endingTime: { lte: prevEnd }
      };

      const appointmentDateWhere = {
        startingTime: { gte: updatedStartDate },
        endingTime:   { lte: updatedEndDate },
      };

      // Run all independent queries in parallel for maximum throughput
      const [
        totalDoctorsOnBoard,
        appointmentDataForTable,
        totalDoctorsOnBoardWithinDateRange,
        totalAppointmentsWithCountAndPrice,
        cancelledAppointments,
        newUsers,
        users,
        allTimeDoctorsOnBoard,
        prevAppointments,
        prevCancelled,
        prevNewDoctors,
        prevNewUsers,
      ] = await Promise.all([
        // Count only — no need to fetch entire rows
        db.professionalUser.count({
          where: { createdAt: { gte: updatedStartDate } },
        }),

        db.bookAppointment.findMany({
          select: {
            id: true,
            patient: {
              select: {
                firstName: true,
                email: true,
                additionalPatients: {
                  select: { firstName: true, email: true },
                },
              },
            },
            professionalUser: {
              select: {
                firstName: true,
                email: true,
                displayQualification: { select: { specialization: true } },
              },
            },
            priceInCents: true,
            startingTime: true,
            endingTime: true,
            planName: true,
          },
          where: appointmentDateWhere,
          orderBy: { startingTime: 'desc' },
          // Recent-appointments panel. Unbounded, this grew with the whole business
          // on the first screen an admin loads.
          take: 100,
        }),

        // BUG FIX: was missing the date filter entirely
        db.professionalUser.count({
          where: { createdAt: { gte: updatedStartDate, lte: updatedEndDate } },
        }),

        db.bookAppointment.aggregate({
          _sum:   { totalPriceInCents: true },
          _count: { id: true },
          where: {
            ...appointmentDateWhere,
            status: BookAppointmentStatus.PAYMENT_SUCCESSFUL,
          },
        }),

        // BUG FIX: JS `||` evaluated to a single string — use Prisma `in` instead
        db.bookAppointment.aggregate({
          _count: { id: true },
          where: {
            ...appointmentDateWhere,
            status: {
              in: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
        }),

        db.user.count({
          where: { createdAt: { lte: updatedEndDate, gte: updatedStartDate } },
        }),


        db.user.findMany({
          select: { id: true, name: true, email: true },
          where: { createdAt: { lte: updatedEndDate, gte: updatedStartDate } },
          orderBy: { createdAt: 'desc' },
          // The count beside this list comes from `newUsers`; this is only the
          // preview, so it does not need every signup in the range.
          take: 50,
        }),

        /**
         * A genuine all-time count.
         *
         * The card labelled "Total Doctors Onboard" was reading
         * `totalDoctorsOnBoard`, which is filtered by `createdAt >= startDate` —
         * so it was never a total, it was "onboarded since the range began", and
         * it moved every time the range changed.
         */
        db.professionalUser.count(),

        /* Preceding-period figures, for the deltas. */
        db.bookAppointment.aggregate({
          _sum: { totalPriceInCents: true },
          _count: { id: true },
          where: { ...prevWhere, status: BookAppointmentStatus.PAYMENT_SUCCESSFUL },
        }),
        db.bookAppointment.aggregate({
          _count: { id: true },
          where: {
            ...prevWhere,
            status: {
              in: [
                BookAppointmentStatus.CANCELLED,
                BookAppointmentStatus.CANCELLED_WITH_REFUND,
              ],
            },
          },
        }),
        db.professionalUser.count({
          where: { createdAt: { gte: prevStart, lte: prevEnd } },
        }),
        db.user.count({
          where: { createdAt: { gte: prevStart, lte: prevEnd } },
        }),
      ]);

      return {
        appointmentDataForTable,
        totalDoctorsOnBoard,
        totalAppointmentsWithCountAndPrice,
        cancelledAppointments,
        newUsers,
        users,
        totalDoctorsOnBoardWithinDateRange,

        allTimeDoctorsOnBoard,
        range: { spanDays },
        previous: {
          appointments: prevAppointments._count.id,
          revenueInCents: prevAppointments._sum.totalPriceInCents ?? 0,
          cancelled: prevCancelled._count.id,
          newDoctors: prevNewDoctors,
          newUsers: prevNewUsers,
        },
      };
    })
});
