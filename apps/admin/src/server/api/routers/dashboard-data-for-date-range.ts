import { z } from 'zod';

import { createTRPCRouter, adminProcedure } from '../trpc';
import { BookAppointmentStatus } from '@repo/database';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
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
      ]);

      return {
        appointmentDataForTable,
        totalDoctorsOnBoard,
        totalAppointmentsWithCountAndPrice,
        cancelledAppointments,
        newUsers,
        users,
        totalDoctorsOnBoardWithinDateRange,
      };
    })
});
