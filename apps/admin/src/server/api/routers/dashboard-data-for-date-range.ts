import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '../trpc';
import { getServerSession } from 'next-auth';
import { BookAppointmentStatus, OrderStatus } from '@repo/database';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { db } from '../../db';
export const noOfOnlineAppointmentsRouter = createTRPCRouter({
  noOfOnlineAppointments: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date()
      })
    )
    .query(async ({ input }) => {
      const { startDate, endDate } = input;
      const session = await getServerSession();
      console.log('session', session);
      if (!session) {
        throw new Error('Unauthorised');
      }
      if (!session.user.email) {
        throw new Error('Unauthorised');
      }

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
        productCardAvg,
        newUsers,
        orders,
        users,
        reviews,
        payouts,
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

        db.order.aggregate({
          where: {
            orderPlaced: { lte: updatedEndDate, gte: updatedStartDate },
            status: { in: [OrderStatus.PAYMENT_SUCCESSFUL, OrderStatus.DELIVERED] },
          },
          _avg: { totalInCent: true },
        }),

        db.user.count({
          where: { createdAt: { lte: updatedEndDate, gte: updatedStartDate } },
        }),

        db.order.findMany({
          select: {
            id: true,
            status: true,
            totalInCent: true,
            orderPlaced: true,
            address: true,
            lineItems: {
              select: {
                id: true,
                quantity: true,
                perUnitPriceInCent: true,
                totalInCent: true,
                productVariant: {
                  select: {
                    id: true,
                    name: true,
                    priceInCents: true,
                    product: {
                      select: {
                        id: true,
                        name: true,
                        media: {
                          select: {
                            mediaId: true,
                            imageAltText: true,
                            comment: true,
                            media: { select: { id: true, fileKey: true, fileUrl: true } },
                          },
                          take: 1,
                          orderBy: { order: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          take: 10,
          orderBy: { orderPlaced: 'desc' },
          where: {
            orderPlaced: { lte: updatedEndDate, gte: updatedStartDate },
            status: { in: [OrderStatus.DELIVERED, OrderStatus.PAYMENT_SUCCESSFUL] },
          },
        }),

        db.user.findMany({
          select: { id: true, name: true, email: true },
          where: { createdAt: { lte: updatedEndDate, gte: updatedStartDate } },
        }),

        db.review.findMany({
          select: { rating: true },
          where: { createdAt: { lte: updatedEndDate, gte: updatedStartDate } },
        }),

        db.payout.findMany({
          select: { amountInCents: true, status: true },
          where: { createdAt: { lte: updatedEndDate, gte: updatedStartDate } },
        }),
      ]);

      return {
        appointmentDataForTable,
        totalDoctorsOnBoard,
        totalAppointmentsWithCountAndPrice,
        cancelledAppointments,
        productCardAvg,
        newUsers,
        orders,
        users,
        totalDoctorsOnBoardWithinDateRange,
        reviews,
        payouts,
      };
    })
});
